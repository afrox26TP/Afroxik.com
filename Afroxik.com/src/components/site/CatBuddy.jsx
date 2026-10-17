import { useEffect, useRef, useState } from "react";
import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";
import { CAT_HOME_SELECTOR, CAT_POSTER_SRC } from "../../lib/cat";
import { PREFERS_REDUCED_MOTION } from "../../lib/device";
import { useT } from "../../lib/i18n";

const VIDEO_SRC = "/media/damdam-cat.mp4";
const AUDIO_SRC = "/media/damdam.m4a";
const HINT_KEY = "afrox-cat-hint";
// Jak daleko od kurzoru se kočka zastaví (px).
const FOLLOW_RADIUS = 120;

const vertex = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Greenscreen (RGB 1, 252, 16) se klíčuje přímo na GPU, okraje se zbaví zeleného nádechu.
const fragment = /* glsl */ `
precision mediump float;
uniform sampler2D tMap;
varying vec2 vUv;
void main() {
  vec3 color = texture2D(tMap, vUv).rgb;
  float green = color.g - max(color.r, color.b);
  float alpha = 1.0 - smoothstep(0.12, 0.32, green);
  color.g -= max(green, 0.0) * 0.9;
  gl_FragColor = vec4(color * alpha, alpha);
}
`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Zmenšená kočka (v logu) dostane i menší plátno, jinak by ho kompozitor zmenšoval zubatě.
// Úrovně po √2, takže se plátno během letu přealokuje jen párkrát.
function bufferLevelFor(scale) {
  return Math.min(1, Math.SQRT2 ** Math.ceil(Math.log2(scale) * 2));
}

/**
 * Létající kamarád (inspirace maskotem na Lepshee): kočka z „Dam dam didi didi“.
 * mode="follow" – sedí na nápisu a pak létá za myší, mode="dock" – sedí na nápisu nebo v rohu.
 * home – schovaná kočka odletí do loga v navigaci a tancuje tam.
 * Klik pustí písničku synchronizovanou s videem.
 */
export default function CatBuddy({ mode = "follow", animate = true, home = false }) {
  const t = useT();
  const rootRef = useRef(null);
  const tiltRef = useRef(null);
  const hostRef = useRef(null);
  const controlsRef = useRef(null);
  const modeRef = useRef(mode);
  const animateRef = useRef(animate);
  const homeRef = useRef(home);
  const [playing, setPlaying] = useState(false);
  const [hint, setHint] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    modeRef.current = mode;
    animateRef.current = animate;
    homeRef.current = home;
    controlsRef.current?.sync();
  }, [mode, animate, home]);

  // Jednorázová nápověda „klikni na mě“ (jednou za návštěvu).
  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(HINT_KEY) === "1";
    } catch {
      // Storage může být zablokovaná.
    }
    if (seen) return undefined;
    const show = window.setTimeout(() => {
      setHint(true);
      try {
        window.sessionStorage.setItem(HINT_KEY, "1");
      } catch {
        // Storage může být zablokovaná.
      }
    }, 4200);
    const hide = window.setTimeout(() => setHint(false), 8500);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const tiltEl = tiltRef.current;
    const host = hostRef.current;
    if (!root || !tiltEl || !host) return undefined;

    let raf = 0;
    let frameHandle = 0;
    let last = performance.now();
    let x = 0;
    let y = 0;
    let scale = 1;
    let tilt = 0;
    let width = root.offsetWidth;
    let height = root.offsetHeight;
    let bufferLevel = 1;
    let lastTarget = null;
    let pointer = null;
    let perched = true;
    let positioned = false;
    let landed = false;
    let leaving = false;
    let frameDirty = true;
    let isPlaying = false;
    let audio = null;
    let disposed = false;

    // Video běží skrytě a do WebGL se kopírují jen jeho snímky.
    const video = document.createElement("video");
    video.className = "cat-buddy__video";
    video.src = VIDEO_SRC;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("playsinline", "");
    host.appendChild(video);

    let renderer = null;
    let texture = null;
    let mesh = null;
    try {
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      texture = new Texture(gl, {
        // Mipmapy drží kočku hladkou i zmenšenou v logu (WebGL1 je u NPOT videa sám vypne).
        generateMipmaps: true,
        minFilter: gl.LINEAR_MIPMAP_LINEAR,
        magFilter: gl.LINEAR,
        wrapS: gl.CLAMP_TO_EDGE,
        wrapT: gl.CLAMP_TO_EDGE,
      });
      const program = new Program(gl, { vertex, fragment, uniforms: { tMap: { value: texture } } });
      mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
      gl.canvas.className = "cat-buddy__gl";
      host.appendChild(gl.canvas);
      resizeBuffer();
    } catch {
      renderer = null;
      queueMicrotask(() => {
        if (!disposed) setFallback(true);
      });
    }

    function wake() {
      if (raf || disposed || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }

    function resizeBuffer() {
      if (!renderer) return;
      renderer.setSize(width * bufferLevel, height * bufferLevel);
      // OGL nastaví i CSS rozměry – plátno ale vždy vyplní box kočky, zmenšuje se transformací.
      renderer.gl.canvas.style.width = "";
      renderer.gl.canvas.style.height = "";
      frameDirty = true;
    }

    function titleRect() {
      return document.querySelector(".hero__name")?.getBoundingClientRect() ?? null;
    }

    function homeRect() {
      const rect = document.querySelector(CAT_HOME_SELECTOR)?.getBoundingClientRect();
      return rect && rect.width > 0 ? rect : null;
    }

    function overlapsNav() {
      const nav = document.querySelector(".site-nav__inner")?.getBoundingClientRect();
      if (!nav) return false;
      const halfW = (width * scale) / 2;
      const halfH = (height * scale) / 2;
      return x + halfW > nav.left && x - halfW < nav.right && y + halfH > nav.top && y - halfH < nav.bottom;
    }

    // Kočka „sedí“ na písmenu X. Tlapky jsou ve spodních ~4 % videa a písmena
    // začínají zhruba 15 % pod horní hranou boxu nadpisu (výška řádku).
    function perchPoint(rect) {
      return { x: rect.right - rect.width * 0.12, y: rect.top - height * 0.46 + rect.height * 0.12 };
    }

    // V rohu jen vykukuje hlavička; při písničce se vysune celá.
    function dockPoint() {
      const margin = window.innerWidth < 640 ? 10 : 22;
      const peek = isPlaying ? 0 : height * 0.4;
      return { x: window.innerWidth - width / 2 - margin, y: window.innerHeight - height / 2 - margin + peek };
    }

    // Na úzkém displeji by kočka na nápisu zakrývala text, tak sedí rovnou v rohu.
    function canPerch() {
      return window.innerWidth >= 700;
    }

    function keepInViewport(point) {
      return {
        x: clamp(point.x, width / 2 + 6, window.innerWidth - width / 2 - 6),
        y: clamp(point.y, height / 2 + 6, window.innerHeight - height / 2 - 6),
      };
    }

    function tick(now) {
      raf = 0;
      if (disposed) return;
      const dt = clamp((now - last) / 1000, 0.001, 0.05);
      last = now;
      const currentMode = modeRef.current;
      const homeSlot = homeRef.current ? homeRect() : null;

      let target;
      let targetScale = 1;
      let snap = false;
      if (homeSlot) {
        // Schovaná kočka se zmenší přesně na šedou siluetu v logu a po přistání se jí drží.
        target = { x: homeSlot.left + homeSlot.width / 2, y: homeSlot.top + homeSlot.height / 2 };
        targetScale = homeSlot.width / width;
        if (!landed && positioned) {
          landed = Math.hypot(target.x - x, target.y - y) < 1.5 && Math.abs(targetScale - scale) < 0.01;
        }
        snap = landed;
      } else {
        landed = false;
        let rect = null;
        if (perched || currentMode === "dock") {
          rect = canPerch() ? titleRect() : null;
          const titleVisible = Boolean(rect) && rect.bottom > 60 && rect.top < window.innerHeight - 40;
          if (currentMode === "dock") perched = titleVisible;
        }

        if (perched && rect) {
          target = perchPoint(rect);
          // Jakmile přistane, drží se nápisu i při scrollu.
          snap = positioned && Math.hypot(target.x - x, target.y - y) < 6;
        } else if (currentMode === "follow" && pointer) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.hypot(dx, dy) || 1;
          target =
            distance > FOLLOW_RADIUS
              ? keepInViewport({
                  x: pointer.x + (dx / distance) * FOLLOW_RADIUS,
                  y: pointer.y + (dy / distance) * FOLLOW_RADIUS,
                })
              : { x, y };
        } else {
          target = dockPoint();
        }
      }

      if (!positioned) {
        x = target.x;
        y = target.y;
        scale = targetScale;
        positioned = true;
      }
      // Cíl se může hýbat sám (navigace vyjíždí, nápis se posouvá) – smyčka pak běží dál.
      const targetMoved = Boolean(lastTarget) && Math.hypot(target.x - lastTarget.x, target.y - lastTarget.y) > 0.1;
      lastTarget = target;

      const instant = snap || PREFERS_REDUCED_MOTION;
      const ease = instant ? 1 : 1 - Math.exp(-dt / 0.32);
      const nextX = x + (target.x - x) * ease;
      const nextY = y + (target.y - y) * ease;
      const velocityX = (nextX - x) / dt;
      x = nextX;
      y = nextY;
      scale += (targetScale - scale) * ease;
      const tiltTarget = instant ? 0 : clamp(velocityX * 0.018, -14, 14);
      tilt += (tiltTarget - tilt) * (1 - Math.exp(-dt / 0.12));

      root.style.transform = `translate3d(${(x - width / 2).toFixed(1)}px, ${(y - height / 2).toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
      tiltEl.style.setProperty("--tilt", `${tilt.toFixed(2)}deg`);
      // U horního okraje by bublinu zakryla navigace, u bočních by přetekla – zarovná se podle okraje.
      const edgeY = y - height / 2 < 120 ? "top" : "";
      const edgeX = x + 95 > window.innerWidth ? "right" : x - 95 < 0 ? "left" : "";
      if (root.dataset.edgeY !== edgeY) root.dataset.edgeY = edgeY;
      if (root.dataset.edgeX !== edgeX) root.dataset.edgeX = edgeX;
      // Do loga a zpátky letí nad navigací; pod její sklo se vrátí, až když ji opustí.
      if (homeSlot) leaving = true;
      else if (leaving) leaving = overlapsNav();
      const layer = homeSlot || leaving ? "top" : "";
      if (root.dataset.layer !== layer) root.dataset.layer = layer;

      const level = bufferLevelFor(scale);
      if (level !== bufferLevel) {
        bufferLevel = level;
        resizeBuffer();
      }

      if (!frameHandle && !video.paused) frameDirty = true;
      if (frameDirty && renderer && texture.image) {
        texture.needsUpdate = true;
        renderer.render({ scene: mesh });
        frameDirty = false;
      }

      const moving =
        targetMoved ||
        Math.abs(target.x - x) > 0.3 ||
        Math.abs(target.y - y) > 0.3 ||
        Math.abs(targetScale - scale) > 0.002 ||
        Math.abs(tilt) > 0.05;
      if (moving || !video.paused || frameDirty) raf = requestAnimationFrame(tick);
    }

    function onVideoFrame() {
      frameDirty = true;
      wake();
      frameHandle = video.requestVideoFrameCallback(onVideoFrame);
    }
    if (typeof video.requestVideoFrameCallback === "function") {
      frameHandle = video.requestVideoFrameCallback(onVideoFrame);
    }

    function playVideo() {
      video.play().catch(() => {});
    }

    function setPlayingState(next) {
      isPlaying = next;
      setPlaying(next);
      wake();
    }

    function stopMusic() {
      audio?.pause();
      setPlayingState(false);
      if (!animateRef.current) video.pause();
    }

    function toggleMusic() {
      if (isPlaying) {
        stopMusic();
        return;
      }
      if (!audio) {
        audio = new Audio(AUDIO_SRC);
        audio.preload = "auto";
        audio.volume = 0.7;
        audio.addEventListener("ended", stopMusic);
      }
      // Písnička i video začínají spolu, takže kočka kýve do rytmu.
      audio.currentTime = 0;
      video.currentTime = 0;
      playVideo();
      audio.play().then(
        () => setPlayingState(true),
        () => setPlayingState(false),
      );
      setHint(false);
      wake();
    }

    function sync() {
      // Schovaná kočka v logu tancuje potichu.
      if (homeRef.current && isPlaying) stopMusic();
      if (animateRef.current || isPlaying) playVideo();
      else video.pause();
      if (modeRef.current === "follow" && !pointer) perched = true;
      wake();
    }

    controlsRef.current = { toggleMusic, sync };

    function onLoadedData() {
      if (texture) texture.image = video;
      // První snímek zachytí kočku ve výskoku; jako statický obrázek je hezčí snímek s tlapkami dole.
      if (!animateRef.current && video.currentTime === 0) video.currentTime = 0.5;
      frameDirty = true;
      wake();
    }

    function onSeeked() {
      frameDirty = true;
      wake();
    }

    function onVideoError() {
      setFallback(true);
    }

    function onPointerMove(event) {
      if (event.pointerType === "touch") return;
      pointer = { x: event.clientX, y: event.clientY };
      if (modeRef.current === "follow") perched = false;
      wake();
    }

    function onVisibilityChange() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
        if (!isPlaying) video.pause();
      } else {
        if (animateRef.current || isPlaying) playVideo();
        wake();
      }
    }

    // Navigace po načtení vyjíždí shora – kočka schovaná v logu jede s ní.
    function onNavTransition(event) {
      if (homeRef.current && event.target instanceof Element && event.target.classList.contains("site-nav")) wake();
    }

    const resizeObserver = new ResizeObserver(() => {
      width = root.offsetWidth;
      height = root.offsetHeight;
      resizeBuffer();
      wake();
    });
    resizeObserver.observe(root);

    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onVideoError);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("transitionstart", onNavTransition);
    document.addEventListener("transitionend", onNavTransition);

    if (animateRef.current) playVideo();
    wake();

    return () => {
      disposed = true;
      controlsRef.current = null;
      cancelAnimationFrame(raf);
      if (frameHandle && typeof video.cancelVideoFrameCallback === "function") {
        video.cancelVideoFrameCallback(frameHandle);
      }
      resizeObserver.disconnect();
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onVideoError);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("transitionstart", onNavTransition);
      document.removeEventListener("transitionend", onNavTransition);
      if (audio) {
        audio.removeEventListener("ended", stopMusic);
        audio.pause();
      }
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.remove();
      if (renderer) {
        renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
        renderer.gl.canvas.remove();
      }
    };
  }, []);

  return (
    <button
      ref={rootRef}
      type="button"
      className={`cat-buddy${home ? " is-home" : ""}${playing ? " is-playing" : ""}${hint && !home ? " show-hint" : ""}`}
      aria-label={t.cat.label}
      aria-pressed={playing}
      // V logu je jen ozdoba – klik propadne na odkaz loga pod ní.
      inert={home}
      onClick={() => controlsRef.current?.toggleMusic()}
    >
      <span ref={tiltRef} className="cat-buddy__tilt" aria-hidden="true">
        <span className="cat-buddy__scale">
          <span ref={hostRef} className="cat-buddy__canvas" />
          {fallback && <img className="cat-buddy__poster" src={CAT_POSTER_SRC} alt="" />}
        </span>
      </span>
      <span className="cat-buddy__notes" aria-hidden="true">
        <i>♪</i>
        <i>♫</i>
        <i>♪</i>
      </span>
      <span className="cat-buddy__bubble" aria-hidden="true">
        {playing ? "dam dam didi didi ♪" : t.cat.hint}
      </span>
    </button>
  );
}
