import { useEffect, useRef, useState } from "react";

// Jeden sdílený observer pro všechny Reveal bloky na stránce.
const callbacks = new WeakMap();
let sharedObserver = null;

function getObserver() {
  if (sharedObserver || typeof IntersectionObserver === "undefined") return sharedObserver;
  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        callbacks.get(entry.target)?.();
        callbacks.delete(entry.target);
        sharedObserver.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.06 },
  );
  return sharedObserver;
}

/**
 * Plynulé odhalení při scrollu (inspirace Streamally).
 * mode="children" animuje přímé potomky postupně, mode="self" animuje sám sebe.
 */
export default function Reveal({ as: Component = "div", mode = "children", className = "", children, ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const element = ref.current;
    const observer = getObserver();
    if (!element || !observer) return undefined;
    callbacks.set(element, () => setVisible(true));
    observer.observe(element);
    return () => {
      callbacks.delete(element);
      observer.unobserve(element);
    };
  }, []);

  const base = mode === "self" ? "reveal-self" : "reveal";
  return (
    <Component ref={ref} className={`${base}${visible ? " is-visible" : ""} ${className}`.trim()} {...rest}>
      {children}
    </Component>
  );
}
