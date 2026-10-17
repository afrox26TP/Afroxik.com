function detectLowEnd() {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = navigator.deviceMemory ?? 4;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = Boolean(connection?.saveData);
  const verySlowNetwork = connection?.effectiveType === "2g" || connection?.effectiveType === "slow-2g";
  const weakCpu = cores <= 2;
  const lowMemory = mem > 0 && mem <= 3;
  return weakCpu || lowMemory || saveData || verySlowNetwork;
}

export const IS_LOW_END = detectLowEnd();

export const PREFERS_REDUCED_MOTION =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
