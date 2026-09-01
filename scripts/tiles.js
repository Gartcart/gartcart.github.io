import { projects } from "./projects-data.js";

const KNOWN_HUES = {
  "c": "#555555",
  "c++": "#f34b7d",
  "css": "#563d7c",
  "docker": "#2496ed",
  "go": "#00add8",
  "html": "#e34c26",
  "java": "#b07219",
  "javascript": "#f1e05a",
  "kubernetes": "#326ce5",
  "lua": "#000080",
  "nats jetstream": "#27aae1",
  "postgres": "#336791",
  "python": "#3572a5",
  "react": "#61dafb",
  "rust": "#dea584",
  "shell": "#89e051",
  "sql": "#e38c00",
  "svelte": "#ff3e00",
  "typescript": "#3178c6",
  "cuda": "#76b900",
  "opencv": "#5c3ee8",
  "pytorch": "#ee4c2c",
  "tensorflow": "#ff6f00",
  "unreal engine": "#8f7fe8"
};

const hashToHsl = name => {
  let h = 0;
  for (const c of name) h = (h * 31 + c.codePointAt(0)) % 360;
  return `hsl(${h} 62% 68%)`;
};

const adjustLuminance = hex => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2, d = max - min;
  let h = 0;
  if (d) {
    h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  return `hsl(${Math.round(h)} ${Math.round(Math.max(s, 0.4) * 100)}% ${Math.round(Math.min(Math.max(l, 0.62), 0.78) * 100)}%)`;
};

const resolveColor = tag => {
  const known = KNOWN_HUES[tag.toLowerCase()];
  return known ? adjustLuminance(known) : hashToHsl(tag);
};

const makeNode = (tag, cls, txt) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (txt != null) node.textContent = txt;
  return node;
};

const renderCard = ({ title, badge, image, tagline, body: projBody, tags, links }) => {
  const card = makeNode("article", "card");
  const head = makeNode("header", "card-top");
  head.append(makeNode("h2", "card-name", title));

  if (badge) {
    const { label, color } = typeof badge === "string" ? { label: badge } : badge;
    const chip = makeNode("span", "card-chip", label);
    if (color) chip.style.setProperty("--chip", color);
    head.append(chip);
  }
  card.append(head);

  if (image?.src) {
    const media = makeNode("figure", "card-media");
    const img = makeNode("img");
    img.src = image.src;
    img.alt = image.alt ?? "";
    if (image.fit === "contain") img.classList.add("fit-contain");
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => media.remove(), { once: true });
    media.append(img);
    card.append(media);
  }

  const content = makeNode("div", "card-content");
  if (tagline) content.append(makeNode("p", "card-sub", tagline));

  for (const para of [projBody ?? []].flat()) {
    content.append(makeNode("p", "card-desc", para));
  }

  if (tags?.length) {
    const list = makeNode("ul", "card-labels");
    for (const t of tags) {
      const { label, color } = typeof t === "string" ? { label: t } : t;
      const item = makeNode("li", "card-label", label);
      item.style.setProperty("--chip", color ?? resolveColor(label));
      list.append(item);
    }
    content.append(list);
  }

  if (links?.length) {
    const actions = makeNode("div", "card-actions");
    for (const { label, href } of links) {
      const btn = makeNode("a", "card-btn", label);
      btn.href = href;
      if (/^https?:/.test(href)) {
        btn.rel = "noopener noreferrer";
        btn.target = "_blank";
      }
      actions.append(btn);
    }
    content.append(actions);
  }

  if (content.childElementCount) card.append(content);
  return card;
};

const container = document.querySelector("[data-tiles]");

if (container) {
  if (projects.length) {
    container.append(...projects.map(renderCard));
  } else {
    container.append(makeNode("p", "card-empty", "No projects listed yet."));
  }
}
