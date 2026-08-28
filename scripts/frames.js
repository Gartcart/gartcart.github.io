//AI TOOLS WERE USED TO MAKE THIS FILE

const W = 160;
const H = 48;
const INSET = 3;
const RADIUS = 10;
const SAMPLE = 1.5;

const WAVES = {
  sine: p => Math.sin(p),
  zigzag: p => 4 * Math.abs(((p / (2 * Math.PI)) % 1) - 0.5) - 1,
  scallop: p => Math.abs(Math.sin(p / 2)) * 2 - 1
};

// rounded rect as segments that report a point and its outward normal
function perimeter() {
  const x0 = INSET, y0 = INSET, x1 = W - INSET, y1 = H - INSET;
  const lines = [
    [[x0 + RADIUS, y0], [x1 - RADIUS, y0], [0, -1]],
    [[x1, y0 + RADIUS], [x1, y1 - RADIUS], [1, 0]],
    [[x1 - RADIUS, y1], [x0 + RADIUS, y1], [0, 1]],
    [[x0, y1 - RADIUS], [x0, y0 + RADIUS], [-1, 0]]
  ];
  const arcs = [
    [[x1 - RADIUS, y0 + RADIUS], -Math.PI / 2, 0],
    [[x1 - RADIUS, y1 - RADIUS], 0, Math.PI / 2],
    [[x0 + RADIUS, y1 - RADIUS], Math.PI / 2, Math.PI],
    [[x0 + RADIUS, y0 + RADIUS], Math.PI, 1.5 * Math.PI]
  ];

  const segs = [];
  for (let i = 0; i < 4; i++) {
    const [a, b, n] = lines[i];
    segs.push({
      len: Math.hypot(b[0] - a[0], b[1] - a[1]),
      at: u => [[a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u], n]
    });
    const [c, t0, t1] = arcs[i];
    segs.push({
      len: RADIUS * Math.abs(t1 - t0),
      at: u => {
        const t = t0 + (t1 - t0) * u;
        const n = [Math.cos(t), Math.sin(t)];
        return [[c[0] + RADIUS * n[0], c[1] + RADIUS * n[1]], n];
      }
    });
  }
  return segs;
}

export const VIEWBOX = `0 0 ${W} ${H}`;

export function framePath(kind, amplitude, cycles) {
  const wave = WAVES[kind];
  if (!wave) throw new Error(`Unknown frame: ${kind}`);

  const segs = perimeter();
  const total = segs.reduce((t, s) => t + s.len, 0);
  const count = Math.round(total / SAMPLE);
  const out = [];

  for (let i = 0; i < count; i++) {
    const s = (i * total) / count;
    let acc = 0;
    for (const seg of segs) {
      if (s <= acc + seg.len || seg === segs[segs.length - 1]) {
        const [p, n] = seg.at((s - acc) / seg.len);
        const off = amplitude * wave((2 * Math.PI * cycles * s) / total);
        out.push(`${(p[0] + n[0] * off).toFixed(1)} ${(p[1] + n[1] * off).toFixed(1)}`);
        break;
      }
      acc += seg.len;
    }
  }
  return `M${out.join(" L")} Z`;
}
