// Text jako 3D voxely: pod barevnou čelní plochou leží kopie, ze které vrstvené stíny dělají hloubku.
// Směr hloubky a barvy bočnic nastavuje CSS (--vx-x/--vx-y, --vx-s1…s4, --vx-face), čtečky čtou jen čelo.
export default function VoxelText({ children, className = "" }) {
  return (
    <span className={`voxel ${className}`.trim()}>
      <span className="voxel__depth" aria-hidden="true">
        {children}
      </span>
      <span className="voxel__face">{children}</span>
    </span>
  );
}
