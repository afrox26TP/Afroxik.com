const FACES = ["front", "back", "right", "left", "top", "bottom"];

// Skleněná kostka s tečkovanými stěnami (jako písmo Doto). Velikost bere z --size rodiče.
export default function Cube3d({ className = "" }) {
  return (
    <span className={`cube3d ${className}`.trim()} aria-hidden="true">
      {FACES.map((face) => (
        <i key={face} className={`cube3d__face cube3d__face--${face}`} />
      ))}
    </span>
  );
}
