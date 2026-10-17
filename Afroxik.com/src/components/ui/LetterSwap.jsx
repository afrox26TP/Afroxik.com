// Písmena se při hoveru rodičovského odkazu/tlačítka postupně „přetočí“ (inspirace Streamally).
export default function LetterSwap({ text, className = "" }) {
  const chars = Array.from(text);
  return (
    <span className={`letter-swap ${className}`.trim()}>
      <span className="letter-swap__line" aria-hidden="true">
        {chars.map((char, index) => {
          const glyph = char === " " ? " " : char;
          return (
            <span className="letter-swap__char" key={index}>
              <span className="letter-swap__flip" style={{ transitionDelay: `${index * 22}ms` }}>
                <span>{glyph}</span>
                <span className="letter-swap__dup">{glyph}</span>
              </span>
            </span>
          );
        })}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
