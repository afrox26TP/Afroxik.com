// 3D odezva na kurzor (jen počítač s plnými efekty a bez omezených animací).
//
// [data-tilt="N"] – karta se za kurzorem natočí až o N stupňů a po odjetí se na pružině zhoupne zpátky.
//   Proměnné se zapisují na nenatočený obal (ten se i měří, takže se náklon nerozkmitá) a CSS je použije
//   na potomka: --rx/--ry (úhly), --tx/--ty (-1…1, posun stínu a paralaxa obsahu), --gx/--gy (odlesk
//   u kurzoru, v %). Obal pod kurzorem má třídu is-tilting.
// [data-parallax] – scéna dostane --px/--py (-0.5…0.5) podle polohy kurzoru v okně, plynule dotažené.
const STIFFNESS = 140;
const DAMPING = 15;
const PARALLAX_RATE = 6; // za sekundu – jak rychle scéna dohání kurzor
const TILT_VARS = ["--rx", "--ry", "--tx", "--ty"];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function initPointer3d() {
  const springs = new Map();
  const scenes = [...document.querySelectorAll("[data-parallax]")].map((el) => ({ el, x: 0, y: 0, visible: true }));
  const sceneObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const scene = scenes.find((item) => item.el === entry.target);
      if (scene) scene.visible = entry.isIntersecting;
    }
  });
  scenes.forEach((scene) => sceneObserver.observe(scene.el));

  let hovered = null;
  let pointer = null; // poslední poloha myši v px
  let aim = { x: 0, y: 0 }; // cíl paralaxy (-0.5…0.5)
  let measure = false;
  let raf = 0;
  let last = 0;

  function springFor(el) {
    let spring = springs.get(el);
    if (!spring) {
      spring = { x: 0, y: 0, vx: 0, vy: 0, aimX: 0, aimY: 0 };
      springs.set(el, spring);
    }
    return spring;
  }

  // Třída se doplňuje při každém měření: React ji smaže, když kartě přepíše className (třeba po odhalení).
  function setHovered(el) {
    if (el !== hovered) hovered?.classList.remove("is-tilting");
    hovered = el;
    el?.classList.add("is-tilting");
  }

  // Co je pod kurzorem, se zjišťuje až ve snímku – funguje tak i při scrollu bez pohybu myši.
  function measureHover() {
    measure = false;
    const hit = pointer && document.elementFromPoint(pointer.x, pointer.y);
    const el = hit?.closest("[data-tilt]") ?? null;
    setHovered(el);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = clamp((pointer.x - rect.left) / rect.width, 0, 1);
    const ny = clamp((pointer.y - rect.top) / rect.height, 0, 1);
    const spring = springFor(el);
    spring.aimX = nx * 2 - 1;
    spring.aimY = ny * 2 - 1;
    el.style.setProperty("--gx", `${(nx * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${(ny * 100).toFixed(1)}%`);
  }

  function frame(now) {
    raf = 0;
    const dt = clamp((now - last) / 1000, 0.001, 0.034);
    last = now;
    if (measure) measureHover();

    let busy = false;
    for (const [el, spring] of springs) {
      const aimX = el === hovered ? spring.aimX : 0;
      const aimY = el === hovered ? spring.aimY : 0;
      spring.vx += ((aimX - spring.x) * STIFFNESS - spring.vx * DAMPING) * dt;
      spring.vy += ((aimY - spring.y) * STIFFNESS - spring.vy * DAMPING) * dt;
      spring.x += spring.vx * dt;
      spring.y += spring.vy * dt;
      const settled =
        Math.abs(aimX - spring.x) < 0.002 &&
        Math.abs(aimY - spring.y) < 0.002 &&
        Math.abs(spring.vx) < 0.02 &&
        Math.abs(spring.vy) < 0.02;
      if (settled && el !== hovered) {
        TILT_VARS.forEach((name) => el.style.removeProperty(name));
        springs.delete(el);
        continue;
      }
      if (!settled) busy = true;
      const max = Number(el.dataset.tilt) || 6;
      el.style.setProperty("--rx", `${(-spring.y * max).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(spring.x * max).toFixed(2)}deg`);
      el.style.setProperty("--tx", spring.x.toFixed(3));
      el.style.setProperty("--ty", spring.y.toFixed(3));
    }

    const ease = 1 - Math.exp(-dt * PARALLAX_RATE);
    for (const scene of scenes) {
      if (!scene.visible) continue;
      const dx = aim.x - scene.x;
      const dy = aim.y - scene.y;
      if (Math.abs(dx) < 0.0004 && Math.abs(dy) < 0.0004) continue;
      scene.x += dx * ease;
      scene.y += dy * ease;
      scene.el.style.setProperty("--px", scene.x.toFixed(4));
      scene.el.style.setProperty("--py", scene.y.toFixed(4));
      busy = true;
    }

    if (busy) wake();
  }

  function wake() {
    if (raf) return;
    if (!last || performance.now() - last > 100) last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  const onMove = (event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;
    pointer = { x: event.clientX, y: event.clientY };
    aim = { x: event.clientX / window.innerWidth - 0.5, y: event.clientY / window.innerHeight - 0.5 };
    measure = true;
    wake();
  };
  const onScroll = () => {
    if (!pointer) return;
    measure = true;
    wake();
  };
  // Kurzor opustil okno nebo vjel do iframe se hrou – karta se pustí a scéna se vrátí doprostřed.
  const onLeave = (event) => {
    if (event.relatedTarget) return;
    pointer = null;
    aim = { x: 0, y: 0 };
    setHovered(null);
    wake();
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("pointerout", onLeave);
  window.addEventListener("blur", onLeave);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("pointerout", onLeave);
    window.removeEventListener("blur", onLeave);
    sceneObserver.disconnect();
    setHovered(null);
    for (const el of springs.keys()) TILT_VARS.forEach((name) => el.style.removeProperty(name));
    for (const { el } of scenes) {
      el.style.removeProperty("--px");
      el.style.removeProperty("--py");
    }
  };
}
