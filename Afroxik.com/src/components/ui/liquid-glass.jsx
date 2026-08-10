import GlassSurface from "./GlassSurface";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function LiquidGlass({
  as = "div",
  containerClass = "",
  className = "",
  children,
  borderRadius = 24,
  backgroundOpacity = 0,
  saturation = 1.2,
  displace = 0.48,
  lowPerformance = false,
  forceSvgFilter = false,
  ...rest
}) {
  const effectiveSaturation = forceSvgFilter && !lowPerformance
    ? saturation + displace * 0.1
    : saturation;

  return (
    <GlassSurface
      as={as}
      borderRadius={borderRadius}
      backgroundOpacity={backgroundOpacity}
      saturation={effectiveSaturation}
      lowPerformance={lowPerformance}
      className={cx("liquid-glass-shell liquid-glass-panel", containerClass, className)}
      {...rest}
    >
      {children}
    </GlassSurface>
  );
}
