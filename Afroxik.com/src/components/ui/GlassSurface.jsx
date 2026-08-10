export default function GlassSurface({
  as = "div",
  width,
  height,
  borderRadius = 20,
  blur = 16,
  backgroundOpacity = 0.1,
  saturation = 1.2,
  lowPerformance = false,
  className = "",
  style = {},
  children,
  ...rest
}) {
  const Component = as;
  const alpha = Math.max(backgroundOpacity, lowPerformance ? 0.16 : 0.08);
  const glassBlur = lowPerformance ? Math.min(blur, 8) : Math.max(blur, 14);

  return (
    <Component
      className={`glass-surface relative overflow-hidden ${className}`.trim()}
      style={{
        ...style,
        ...(width != null ? { width: typeof width === "number" ? `${width}px` : width } : {}),
        ...(height != null ? { height: typeof height === "number" ? `${height}px` : height } : {}),
        borderRadius: `${borderRadius}px`,
        background: `linear-gradient(145deg, rgba(125, 195, 255, ${alpha}), rgba(5, 14, 34, ${Math.max(alpha + 0.18, 0.28)}))`,
        border: "1px solid rgba(156, 218, 255, 0.2)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 18px 55px rgba(0,0,0,0.2)",
        backdropFilter: `blur(${glassBlur}px) saturate(${saturation})`,
        WebkitBackdropFilter: `blur(${glassBlur}px) saturate(${saturation})`,
      }}
      {...rest}
    >
      <div className="glass-surface__shine" aria-hidden="true" />
      <div className="relative z-10 h-full w-full">{children}</div>
    </Component>
  );
}
