import { useEffect, useMemo, useRef, useState } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0.35, 0.66, 1.0];
  return [
    Number.parseInt(result[1], 16) / 255,
    Number.parseInt(result[2], 16) / 255,
    Number.parseInt(result[3], 16) / 255,
  ];
}

const vertex = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;

  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);

  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;

  for (vec2 r = iResolution.xy, Q; ++i < 60.; O += o.w / d * o.xyz) {
    p = z * normalize(vec3(C - .5 * r, r.y));
    p.z -= 4.;
    S = p;
    d = p.y - T;

    p.x += .4 * (1. + p.y) * sin(d + p.x * 0.1) * cos(.34 * d + p.x * 0.05);
    Q = p.xz *= mat2(cos(p.y + vec4(0, 11, 33, 0) - T));
    z += d = abs(sqrt(length(Q * Q)) - .25 * (5. + S.y)) / 3. + 8e-4;
    o = 1. + sin(S.y + p.z * .5 + S.z - length(S - p) + vec4(2, 1, 0, 8));
  }

  o.xyz = tanh(O / 1e4);
}

bool finite1(float x) { return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c) {
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);

  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));

  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}
`;

export default function PlasmaBackground({
  color = "#59a8ff",
  speed = 0.6,
  direction = "forward",
  scale = 1.1,
  opacity = 0.8,
  mouseInteractive = true,
  lowEnd = false,
  onReady,
}) {
  const containerRef = useRef(null);
  const [isSupported, setIsSupported] = useState(true);

  const directionMultiplier = useMemo(() => {
    if (direction === "reverse") return -1;
    return 1;
  }, [direction]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const customColorRgb = hexToRgb(color);
    let raf = 0;
    let cleanupResize = () => {};
    let width = 0;
    let height = 0;
    let rectLeft = 0;
    let rectTop = 0;

    let renderer;
    let program;
    let handleMouseMove;
    let isPaused = document.hidden;

    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, lowEnd ? 1.1 : 1.8),
      });
    } catch {
      setIsSupported(false);
      return undefined;
    }

    const gl = renderer.gl;
    if (!gl) {
      setIsSupported(false);
      return undefined;
    }

    const canvas = gl.canvas;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    container.appendChild(canvas);

    const geometry = new Triangle(gl);

    program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uCustomColor: { value: new Float32Array(customColorRgb) },
        uUseCustomColor: { value: color ? 1 : 0 },
        uSpeed: { value: speed * 0.4 },
        uDirection: { value: directionMultiplier },
        uScale: { value: scale },
        uOpacity: { value: opacity },
        uMouse: { value: new Float32Array([0, 0]) },
        uMouseInteractive: { value: mouseInteractive ? 1 : 0 },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    handleMouseMove = (event) => {
      if (!mouseInteractive || !container) return;
      const mouse = program.uniforms.uMouse.value;
      mouse[0] = event.clientX - rectLeft;
      mouse[1] = event.clientY - rectTop;
    };

    if (mouseInteractive) {
      container.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    const setSize = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.floor(rect.width));
      const nextHeight = Math.max(1, Math.floor(rect.height));
      rectLeft = rect.left;
      rectTop = rect.top;
      if (nextWidth === width && nextHeight === height) return;
      width = nextWidth;
      height = nextHeight;
      renderer.setSize(width, height);
      const res = program.uniforms.iResolution.value;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
    };

    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(container);
    cleanupResize = () => resizeObserver.disconnect();
    setSize();

    const t0 = performance.now();
    let readyFired = false;
    const loop = (now) => {
      raf = 0;
      if (isPaused) return;

      if (!container.isConnected) return;

      const timeValue = (now - t0) * 0.001;

      if (direction === "pingpong") {
        program.uniforms.uDirection.value = Math.sin(timeValue * 0.5) * directionMultiplier;
      }

      program.uniforms.iTime.value = timeValue;
      renderer.render({ scene: mesh });
      if (!readyFired) {
        readyFired = true;
        onReady?.();
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const handleVisibilityChange = () => {
      isPaused = document.hidden;
      if (isPaused) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        raf = requestAnimationFrame(loop);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      cleanupResize();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (mouseInteractive && handleMouseMove) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
      try {
        container.removeChild(canvas);
      } catch {
        // ignore
      }
    };
  }, [color, direction, directionMultiplier, lowEnd, mouseInteractive, opacity, scale, speed]);

  if (!isSupported) {
    return <div className="fx-shader-fallback" />;
  }

  return <div ref={containerRef} className="fx-shader" />;
}
