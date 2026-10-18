// Tekutý kov ve WebGL2: odrazové pruhy světlo/tma, zakřivení, plynoucí šum a barevný rozptyl jako u chromu.
// Převzato z nativního shaderu knihovny Argent (https://github.com/seangeng/argent), upraveno do JS.
// Simplex noise: Ashima Arts / Stefan Gustavson (webgl-noise), MIT.
//
// MIT License
//
// Copyright (c) 2026 Sean Geng
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const VERT = `#version 300 es
void main() {
  vec2 pos = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_light;
uniform vec3 u_dark;
uniform float u_rep;
uniform float u_angle;
uniform float u_soft;
uniform float u_disp;
uniform float u_dist;
uniform float u_scale;
out vec4 outColor;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float stripe(float coord) {
  float f = fract(coord);
  float tri = abs(f * 2.0 - 1.0);
  return smoothstep(0.5 - u_soft, 0.5 + u_soft, tri);
}

void main() {
  vec2 uv = (gl_FragCoord.xy / u_res - 0.5);
  uv.x *= u_res.x / u_res.y;
  uv /= max(u_scale, 0.001);
  float t = u_time;
  float d = length(uv);
  float bulge = 1.0 - 0.45 * d * d;
  float n = snoise(uv * 0.9 + vec2(0.0, -t * 0.28));
  n += 0.35 * snoise(uv * 1.8 + vec2(t * 0.1, -t * 0.45));
  float c = cos(u_angle), s = sin(u_angle);
  vec2 ruv = mat2(c, -s, s, c) * uv;
  float coord = ruv.y * bulge * u_rep + n * u_dist * 2.2 - t * 0.22;
  float r = stripe(coord + u_disp);
  float g = stripe(coord);
  float b = stripe(coord - u_disp);
  vec3 col = vec3(mix(u_dark.r, u_light.r, r), mix(u_dark.g, u_light.g, g), mix(u_dark.b, u_light.b, b));
  col *= 0.94 + 0.14 * smoothstep(0.25, 0.85, d);
  outColor = vec4(col, 1.0);
}`;

// Ladění „button“ z Argentu: širší pruhy a klidnější zvlnění, aby text na kovu zůstal čitelný.
export const METAL_TONES = {
  silver: { light: "#f8fafc", dark: "#23262b", repetition: 1.8, angle: 68, softness: 0.34, dispersion: 0.03, distortion: 0.3, scale: 1.4 },
  amethyst: { light: "#e8d6ff", dark: "#2c1854", repetition: 1.8, angle: 70, softness: 0.34, dispersion: 0.03, distortion: 0.3, scale: 1.4 },
};

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  console.error("liquid metal shader:", gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

// Spustí kov na plátně. Bez WebGL2 vrátí null (pak zůstane CSS gradient). speed 0 = jeden statický snímek.
export function mountMetal(canvas, params) {
  const gl = canvas.getContext("webgl2", { antialias: true });
  if (!gl) return null;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const u = (name) => gl.getUniformLocation(program, name);
  const uniforms = {
    res: u("u_res"), time: u("u_time"), light: u("u_light"), dark: u("u_dark"), rep: u("u_rep"),
    angle: u("u_angle"), soft: u("u_soft"), disp: u("u_disp"), dist: u("u_dist"), scale: u("u_scale"),
  };

  let p = { speed: 0, ...params };
  let raf = 0;
  let time = Math.random() * 40; // ať víc tlačítek neteče stejně
  let last = performance.now();
  let dead = false;

  function draw() {
    raf = 0;
    if (dead) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    const now = performance.now();
    time += ((now - last) / 1000) * p.speed;
    last = now;
    gl.uniform2f(uniforms.res, w, h);
    gl.uniform1f(uniforms.time, time);
    gl.uniform3fv(uniforms.light, hexToRgb(p.light));
    gl.uniform3fv(uniforms.dark, hexToRgb(p.dark));
    gl.uniform1f(uniforms.rep, p.repetition);
    gl.uniform1f(uniforms.angle, (p.angle * Math.PI) / 180);
    gl.uniform1f(uniforms.soft, Math.max(0.02, p.softness));
    gl.uniform1f(uniforms.disp, p.dispersion);
    gl.uniform1f(uniforms.dist, p.distortion);
    gl.uniform1f(uniforms.scale, p.scale);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (p.speed > 0) raf = requestAnimationFrame(draw);
  }
  draw();

  return {
    update(next) {
      p = { ...p, ...next };
      last = performance.now();
      if (!raf) raf = requestAnimationFrame(draw);
    },
    destroy() {
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
