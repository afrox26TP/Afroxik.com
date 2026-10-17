import { useEffect, useState } from "react";

// Sleduje, jestli je element ve viewportu. Bere element (ne ref), aby šlo použít callback ref.
export function useInView(element, { rootMargin = "0px", initial = true } = {}) {
  const [inView, setInView] = useState(initial);

  useEffect(() => {
    if (!element || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, rootMargin]);

  return inView;
}
