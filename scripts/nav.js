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

// Hide the nav whenever page content — project cards, resume, analytics,
// or the hero text and cue — would collide with it while scrolling.
const nav = document.querySelector("nav");
const watched = document.querySelectorAll(
  ".proj-wrap, .resume-sheet, .terminal-view, .hero .label, .scroll-cue"
);

if (nav && watched.length) {
  let ticking = false;

  const update = () => {
    ticking = false;
    const navRect = nav.getBoundingClientRect();
    const navTop = navRect.top - 24;
    const navBottom = navRect.bottom + 24;

    let overlaps = false;
    for (const el of watched) {
      const r = el.getBoundingClientRect();
      if (r.top < navBottom && r.bottom > navTop) {
        overlaps = true;
        break;
      }
    }
    nav.classList.toggle("nav-hidden", overlaps);
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
