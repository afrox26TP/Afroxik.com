import { useCallback, useEffect, useRef, useState } from "react";

function legacyCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    area.remove();
  }
}

// Vrací [klíč naposledy zkopírované položky, copy(text, klíč)].
export function useCopy(resetAfter = 1800) {
  const [copiedKey, setCopiedKey] = useState(null);
  const timerRef = useRef(0);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const copy = useCallback(
    async (text, key = text) => {
      let ok;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        ok = legacyCopy(text);
      }
      if (!ok) return false;

      setCopiedKey(key);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopiedKey(null), resetAfter);
      return true;
    },
    [resetAfter],
  );

  return [copiedKey, copy];
}
