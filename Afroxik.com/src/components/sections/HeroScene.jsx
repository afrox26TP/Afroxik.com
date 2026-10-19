import Cube3d from "../ui/Cube3d";
import MetalLayer from "../ui/MetalLayer";
import "./HeroScene.css";

// 3D objekty kolem nadpisu v úvodu – zatím vypnuté. Zapnou se tak, že Hero.jsx tuhle komponentu naimportuje
// a vykreslí jako první potomek sekce: <HeroScene lowMotion={lowMotion} />. Dokud se neimportuje, nedostane se
// do buildu ani její CSS.

// Holografický globus ve skleněné kouli: poledníky po 30° a rovnoběžky na 0° a ±30°/±60° (cos a sin šířky),
// všechno z teček jako písmo Doto.
const MERIDIANS = [0, 30, 60, 90, 120, 150];
const PARALLELS = [
  { cos: 1, sin: 0 },
  { cos: 0.866, sin: 0.5 },
  { cos: 0.866, sin: -0.5 },
  { cos: 0.5, sin: 0.866 },
  { cos: 0.5, sin: -0.866 },
];

function Globe() {
  return (
    <span className="globe">
      <span className="globe__spin">
        {MERIDIANS.map((angle) => (
          <i key={`m${angle}`} className="globe__meridian" style={{ "--a": `${angle}deg` }} />
        ))}
        {PARALLELS.map(({ cos, sin }) => (
          <i key={`p${sin}`} className="globe__parallel" style={{ "--c": cos, "--s": sin }} />
        ))}
      </span>
    </span>
  );
}

// Gyroskop: tři kovové prstence, každý se točí kolem jiné osy, uprostřed zářící jádro.
function Gyro() {
  return (
    <span className="gyro">
      {["a", "b", "c"].map((ring) => (
        <span key={ring} className={`gyro__ring gyro__ring--${ring}`}>
          <i />
          <i />
          <i />
          <i />
        </span>
      ))}
      <span className="gyro__core" />
    </span>
  );
}

// Skleněná koule s točícím se globusem, koule z tekutého kovu, gyroskop a skleněná kostka. Při pohybu myši se
// posouvají podle své hloubky – paralaxu řídí lib/pointer3d.js přes --px/--py (data-parallax).
export default function HeroScene({ lowMotion }) {
  return (
    <div className="hero-scene" aria-hidden="true" data-parallax="">
      <span className="hero-obj hero-obj--orb">
        <span className="orb orb--glass">
          <Globe />
          <span className="orb__shine" />
        </span>
      </span>
      <span className="hero-obj hero-obj--metal">
        <span className="orb orb--metal">
          <MetalLayer tone="sphere" still={lowMotion} />
          <span className="orb__shade" />
        </span>
      </span>
      <span className="hero-obj hero-obj--gyro">
        <Gyro />
      </span>
      <span className="hero-obj hero-obj--cube">
        <Cube3d />
      </span>
    </div>
  );
}
