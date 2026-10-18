import { useEffect, useRef } from "react";
import { METAL_TONES, mountMetal } from "../../lib/liquidMetal";
import { PREFERS_REDUCED_MOTION } from "../../lib/device";

// Tekutý kov přes celý rodičovský prvek (tlačítko). Teče jen když je vidět, při najetí na tlačítko zrychlí.
// still = bez WebGL, jen statický chromový gradient z CSS (slabý výkon nebo omezené animace).
export default function MetalLayer({ tone = "silver", still = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (still || !canvas) return undefined;
    const metal = mountMetal(canvas, METAL_TONES[tone] ?? METAL_TONES.silver);
    if (!metal) return undefined;

    let visible = false;
    let hover = false;
    const apply = () => {
      if (PREFERS_REDUCED_MOTION) metal.update({ speed: 0 });
      else metal.update({ speed: visible ? (hover ? 2.4 : 0.8) : 0 });
    };
    const inView = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      apply();
    }, { rootMargin: "120px" });
    inView.observe(canvas);
    // Při změně velikosti (jazyk, okno) se překreslí i zastavený kov.
    const resize = new ResizeObserver(() => metal.update({}));
    resize.observe(canvas);

    const host = canvas.closest("a, button");
    const enter = () => {
      hover = true;
      apply();
    };
    const leave = () => {
      hover = false;
      apply();
    };
    host?.addEventListener("pointerenter", enter);
    host?.addEventListener("pointerleave", leave);
    return () => {
      inView.disconnect();
      resize.disconnect();
      host?.removeEventListener("pointerenter", enter);
      host?.removeEventListener("pointerleave", leave);
      metal.destroy();
    };
  }, [tone, still]);

  return (
    <span className="metal-layer" data-tone={tone} aria-hidden="true">
      {!still && <canvas ref={canvasRef} />}
    </span>
  );
}
