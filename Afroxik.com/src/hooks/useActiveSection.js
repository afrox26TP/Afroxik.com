import { useEffect, useState } from "react";

// Scroll-spy: vrací id sekce, která právě protíná střed viewportu (nebo null nad první sekcí).
export function useActiveSection(ids, enabled = true) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === "undefined") return undefined;

    const intersecting = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) intersecting.set(entry.target.id, entry.isIntersecting);
        setActive(ids.find((id) => intersecting.get(id)) ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [ids, enabled]);

  return active;
}
