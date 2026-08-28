//AI TOOLS WERE USED TO MAKE THIS FILE

import { framePath, VIEWBOX } from "./frames.js";

const SVG_NS = "http://www.w3.org/2000/svg";

const STYLES = {
  sine: { amplitude: 2.0, cycles: 24 },
  zigzag: { amplitude: 2.0, cycles: 28 },
  scallop: { amplitude: 1.8, cycles: 20 }
};

for (const tile of document.querySelectorAll("nav a[data-frame]")) {
  const { amplitude, cycles } = STYLES[tile.dataset.frame];

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "frame");
  svg.setAttribute("viewBox", VIEWBOX);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");

  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", framePath(tile.dataset.frame, amplitude, cycles));

  svg.append(path);
  tile.prepend(svg);
}
