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

// Hide the nav when the page's main content scrolls up into it,
// and bring it back when the user returns toward the top.
const nav = document.querySelector("nav");
const content = document.querySelector(".proj-wrap, .resume-sheet, .terminal-view");

if (nav && content) {
  let ticking = false;

  const update = () => {
    ticking = false;
    const navBottom = nav.getBoundingClientRect().bottom + 24;
    nav.classList.toggle("nav-hidden", content.getBoundingClientRect().top < navBottom);
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll, { passive: true });
  update();
}
