import { useEffect, useId, useMemo, useRef, useState } from "react";

function supportsBackdropFilter() {
  if (typeof window === "undefined") return false;
  return CSS.supports("backdrop-filter", "blur(10px)") || CSS.supports("-webkit-backdrop-filter", "blur(10px)");
}

function supportsSvgFilterBackdrop(filterId) {
  if (typeof window === "undefined") return false;
  const probe = document.createElement("div");
  probe.style.backdropFilter = `url(#${filterId})`;
  probe.style.webkitBackdropFilter = `url(#${filterId})`;
  return !!(probe.style.backdropFilter || probe.style.webkitBackdropFilter);
}

export default function GlassSurface({
  as = "div",
  width,
  height,
  borderRadius = 20,
  borderWidth = 0.07,
  brightness = 70,
  opacity = 0.93,
  blur = 11,
  displace = 0.5,
  backgroundOpacity = 0,
  saturation = 1,
  distortionScale = -180,
  redOffset = 0,
  greenOffset = 10,
  blueOffset = 20,
  xChannel = "R",
  yChannel = "G",
  mixBlendMode = "difference",
  lowPerformance = false,
  forceSvgFilter = false,
  className = "",
  style = {},
  children,
  ...rest
}) {
  const Component = as;
  const containerRef = useRef(null);
  const feImageRef = useRef(null);
  const redChannelRef = useRef(null);
  const greenChannelRef = useRef(null);
  const blueChannelRef = useRef(null);
  const gaussianBlurRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const uid = useId().replace(/:/g, "");
  const filterId = `glass-filter-${uid}`;
  const redGradId = `red-grad-${uid}`;
  const blueGradId = `blue-grad-${uid}`;

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    const onChange = (event) => setIsDarkMode(event.matches);
    mediaQuery.addEventListener("change", onChange);

    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  const generateDisplacementMap = useMemo(
    () => () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const actualWidth = rect?.width || 360;
      const actualHeight = rect?.height || 220;
      const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);

      const svg = `
        <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stop-color="#0000"/>
              <stop offset="100%" stop-color="red"/>
            </linearGradient>
            <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#0000"/>
              <stop offset="100%" stop-color="blue"/>
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"/>
          <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${redGradId})"/>
          <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode:${mixBlendMode}"/>
          <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)"/>
        </svg>
      `;

      return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    },
    [blueGradId, borderRadius, borderWidth, brightness, blur, mixBlendMode, opacity, redGradId],
  );

  useEffect(() => {
    if (!feImageRef.current) return;
    feImageRef.current.setAttribute("href", generateDisplacementMap());
  }, [generateDisplacementMap, width, height]);

  useEffect(() => {
    const channels = [
      { ref: redChannelRef, offset: redOffset },
      { ref: greenChannelRef, offset: greenOffset },
      { ref: blueChannelRef, offset: blueOffset },
    ];

    channels.forEach(({ ref, offset }) => {
      if (!ref.current) return;
      ref.current.setAttribute("scale", String(distortionScale + offset));
      ref.current.setAttribute("xChannelSelector", xChannel);
      ref.current.setAttribute("yChannelSelector", yChannel);
    });

    if (gaussianBlurRef.current) {
      gaussianBlurRef.current.setAttribute("stdDeviation", String(displace));
    }
  }, [blueOffset, displace, distortionScale, greenOffset, redOffset, xChannel, yChannel]);

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver(() => {
      if (feImageRef.current) {
        feImageRef.current.setAttribute("href", generateDisplacementMap());
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [generateDisplacementMap]);

  const baseStyles = {
    ...style,
    ...(width != null ? { width: typeof width === "number" ? `${width}px` : width } : {}),
    ...(height != null ? { height: typeof height === "number" ? `${height}px` : height } : {}),
    borderRadius: `${borderRadius}px`,
  };

  useEffect(() => {
    if (!forceSvgFilter || lowPerformance) return undefined;
    const element = containerRef.current;
    if (!element) return undefined;

    const filterValue = `url(#${filterId}) saturate(${saturation})`;
    const applyFilter = () => {
      if (!containerRef.current) return;
      containerRef.current.style.backdropFilter = "none";
      containerRef.current.style.webkitBackdropFilter = "none";
      containerRef.current.style.backdropFilter = filterValue;
      containerRef.current.style.webkitBackdropFilter = filterValue;
    };

    // Re-apply on subsequent frames to avoid timing issues after mode toggles.
    applyFilter();
    const raf1 = requestAnimationFrame(applyFilter);
    const timer = window.setTimeout(applyFilter, 40);
    return () => {
      cancelAnimationFrame(raf1);
      window.clearTimeout(timer);
    };
  }, [filterId, forceSvgFilter, lowPerformance, saturation]);

  if (lowPerformance) {
    return (
      <Component
        ref={containerRef}
        className={`glass-surface relative overflow-hidden ${className}`.trim()}
        style={{
          ...baseStyles,
          background: isDarkMode ? "rgba(8, 20, 46, 0.72)" : "rgba(240, 247, 255, 0.72)",
          border: "1px solid rgba(89, 168, 255, 0.18)",
        }}
        {...rest}
      >
        <div className="relative z-10 h-full w-full">{children}</div>
      </Component>
    );
  }

  const canUseSvg = forceSvgFilter || supportsSvgFilterBackdrop(filterId);
  const canUseBackdrop = supportsBackdropFilter();

  const visualStyles = canUseSvg
    ? {
        background: isDarkMode ? `hsl(0 0% 0% / ${backgroundOpacity})` : `hsl(0 0% 100% / ${backgroundOpacity})`,
        backdropFilter: `url(#${filterId}) saturate(${saturation})`,
        WebkitBackdropFilter: `url(#${filterId}) saturate(${saturation})`,
      }
    : canUseBackdrop
      ? {
          background: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(12px) saturate(1.6)",
          WebkitBackdropFilter: "blur(12px) saturate(1.6)",
        }
      : {
          background: isDarkMode ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.1)",
        };

  return (
    <Component
      ref={containerRef}
      className={`glass-surface relative overflow-hidden ${className}`.trim()}
      style={{ ...baseStyles, ...visualStyles }}
      {...rest}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
            <feImage ref={feImageRef} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />

            <feDisplacementMap ref={redChannelRef} in="SourceGraphic" in2="map" result="dispRed" />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="red"
            />

            <feDisplacementMap ref={greenChannelRef} in="SourceGraphic" in2="map" result="dispGreen" />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="green"
            />

            <feDisplacementMap ref={blueChannelRef} in="SourceGraphic" in2="map" result="dispBlue" />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="blue"
            />

            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur ref={gaussianBlurRef} in="output" stdDeviation="0.7" />
          </filter>
        </defs>
      </svg>

      <div className="relative z-10 h-full w-full">{children}</div>
    </Component>
  );
}
