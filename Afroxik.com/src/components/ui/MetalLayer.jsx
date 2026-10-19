import { useEffect, useRef } from "react";
import { METAL_TONES, mountMetal } from "../../lib/liquidMetal";
import { PREFERS_REDUCED_MOTION } from "../../lib/device";

// Tekutý kov přes celý rodičovský prvek (tlačítko). Teče jen když je vidět, při najetí na tlačítko zrychlí.
// still = bez WebGL, jen statický chromový gradient z CSS (slabý výkon nebo omezené animace).
export default function MetalLayer({ tone = "silver", still = false }) {
  const layerRef = useRef(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (still || !layer) return undefined;
    // Plátno vzniká až tady: destroy() ztratí WebGL kontext a ten by na stejném plátně už nešel použít
    // (StrictMode ve vývoji spouští efekt dvakrát, kov by pak vůbec netekl).
    const canvas = document.createElement("canvas");
    layer.append(canvas);
    const metal = mountMetal(canvas, METAL_TONES[tone] ?? METAL_TONES.silver);
    if (!metal) {
      canvas.remove();
      return undefined;
    }

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

    const host = layer.closest("a, button");
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
      canvas.remove();
    };
  }, [tone, still]);

  return <span ref={layerRef} className="metal-layer" data-tone={tone} aria-hidden="true" />;
}
