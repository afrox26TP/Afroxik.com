// Lom světla na okrajích tekutého skla (.liquid--glass), jak ho dělá Apple Liquid Glass.
// backdrop-filter s SVG filtrem umí jen Chrome/Edge; jinde zůstane čiré sklo z index.css.
// Každé tlačítko dostane mapu posunutí podle své velikosti: střed je čistý, u okraje se pozadí ohýbá ke středu.
const SVG_NS = "http://www.w3.org/2000/svg";
const BEZEL = 0.45; // šířka lomeného okraje jako podíl výšky tlačítka
const STRENGTH = 0.8; // síla lomu jako podíl výšky tlačítka

function displacementMap(width, height, radius) {
  const bezel = Math.max(6, height * BEZEL);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(width, height);
  const hx = width / 2 - radius;
  const hy = height / 2 - radius;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = x + 0.5 - width / 2;
      const py = y + 0.5 - height / 2;
      const qx = Math.abs(px) - hx;
      const qy = Math.abs(py) - hy;
      let nx = 0;
      let ny = 0;
      let edge;
      if (qx > 0 && qy > 0) {
        const length = Math.hypot(qx, qy) || 1;
        edge = radius - length;
        nx = (qx / length) * Math.sign(px);
        ny = (qy / length) * Math.sign(py);
      } else if (qx > qy) {
        edge = radius - qx;
        nx = Math.sign(px);
      } else {
        edge = radius - qy;
        ny = Math.sign(py);
      }
      // 1 na okraji, 0 hlouběji než šířka okraje; kvadraticky, ať lom k okraji zrychluje jako u skutečné čočky.
      const t = Math.min(1, Math.max(0, 1 - edge / bezel)) ** 2;
      const i = (y * width + x) * 4;
      image.data[i] = 128 - nx * t * 127;
      image.data[i + 1] = 128 - ny * t * 127;
      image.data[i + 2] = 128;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

export function initLiquidRefraction() {
  const chromium = navigator.userAgentData?.brands?.some((brand) => brand.brand === "Chromium");
  if (!chromium || !CSS.supports("backdrop-filter", "url(#x)")) return () => {};

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
  document.body.append(svg);

  const filters = new Map();
  const observed = new WeakSet();
  let count = 0;

  const update = (el) => {
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    if (!width || !height) return;
    let entry = filters.get(el);
    if (!entry) {
      const filter = document.createElementNS(SVG_NS, "filter");
      filter.id = `lq-refract-${++count}`;
      filter.setAttribute("filterUnits", "userSpaceOnUse");
      // V sRGB je hodnota 128 v mapě přesně „bez posunu“.
      filter.setAttribute("color-interpolation-filters", "sRGB");
      filter.innerHTML =
        '<feImage result="map" preserveAspectRatio="none"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G"/>';
      svg.append(filter);
      entry = { filter, size: "" };
      filters.set(el, entry);
    }
    const size = `${width}x${height}`;
    if (entry.size === size) return;
    entry.size = size;

    const radius = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, height / 2, width / 2);
    const [image, displace] = entry.filter.children;
    for (const node of [entry.filter, image]) {
      node.setAttribute("x", "0");
      node.setAttribute("y", "0");
      node.setAttribute("width", String(width));
      node.setAttribute("height", String(height));
    }
    image.setAttribute("href", displacementMap(width, height, radius));
    displace.setAttribute("scale", String(Math.round(height * STRENGTH)));
    el.style.setProperty("--lq-backdrop", `url(#${entry.filter.id}) blur(0.6px) saturate(170%) brightness(1.12)`);
  };

  const resize = new ResizeObserver((entries) => entries.forEach((entry) => update(entry.target)));

  // Tlačítka přibývají a mizí (hra v showcase, jazyk), proto se při změnách DOM projdou znovu.
  let scheduled = 0;
  const scan = () => {
    scheduled = 0;
    for (const el of document.querySelectorAll(".liquid--glass")) {
      if (observed.has(el)) continue;
      observed.add(el);
      resize.observe(el);
      update(el);
    }
    for (const [el, entry] of filters) {
      if (el.isConnected) continue;
      resize.unobserve(el);
      entry.filter.remove();
      filters.delete(el);
    }
  };
  const mutations = new MutationObserver(() => {
    if (!scheduled) scheduled = requestAnimationFrame(scan);
  });
  mutations.observe(document.body, { childList: true, subtree: true });
  scan();

  return () => {
    cancelAnimationFrame(scheduled);
    mutations.disconnect();
    resize.disconnect();
    svg.remove();
  };
}
