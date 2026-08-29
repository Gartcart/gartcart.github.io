/**
 * AI Tools were used to generate the comments and to shorten the length of some functions
 * A port of asciichartpy's plot() by Will Humphlett
 */
function roundHalfEven(x) {
  const floor = Math.floor(x);
  const diff = x - floor;
  if (diff > 0.5) return floor + 1;
  if (diff < 0.5) return floor;
  return floor % 2 === 0 ? floor : floor + 1;
}

/** Python's "{:8.0f}": round half to even, no decimals, right-aligned to 8. */
function formatLabel(value) {
  return String(roundHalfEven(value)).padStart(8, " ");
}

/**
 * @param {number[]} series  One value per day.
 * @param {object}   [cfg]
 * @param {number}   [cfg.height=15]  Row count.
 * @param {number}   [cfg.offset=3]   Columns reserved for the axis.
 * @returns {string}
 */
export function plot(series, cfg = {}) {
  if (!series.length) return "";

  const offset = cfg.offset ?? 3;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const interval = max - min;
  const height = cfg.height ?? (interval || 1);
  const ratio = interval === 0 ? 1 : height / interval;
  const min2 = roundHalfEven(min * ratio);
  const max2 = roundHalfEven(max * ratio);

  const rows = max2 - min2;
  const width = series.length + offset;
  const grid = Array.from({ length: rows + 1 }, () => new Array(width).fill(" "));

  for (let y = min2; y <= max2; y++) {
    const label = formatLabel(rows === 0 ? max : max - ((y - min2) * interval) / rows);
    grid[y - min2][Math.max(offset - label.length, 0)] = label;
    grid[y - min2][offset - 1] = y === 0 ? "┼" : "┤";
  }

  const first = roundHalfEven(series[0] * ratio) - min2;
  grid[rows - first][offset - 1] = "┼";

  for (let x = 0; x < series.length - 1; x++) {
    const y0 = roundHalfEven(series[x] * ratio) - min2;
    const y1 = roundHalfEven(series[x + 1] * ratio) - min2;
    if (y0 === y1) {
      grid[rows - y0][x + offset] = "─";
    } else {
      grid[rows - y1][x + offset] = y0 > y1 ? "╰" : "╭";
      grid[rows - y0][x + offset] = y0 > y1 ? "╮" : "╯";
      for (let y = Math.min(y0, y1) + 1; y < Math.max(y0, y1); y++) {
        grid[rows - y][x + offset] = "│";
      }
    }
  }

  return grid.map((row) => row.join("").replace(/\s+$/, "")).join("\n");
}

/** Python's strftime("%c") in UTC, e.g. "Fri Aug 28 07:07:17 2026". */
export function formatCTime(date) {
  // FIX: Removed accidental spaces inside the strings
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // FIX: Changed `(n) = >` to `(n) =>` and removed spaces in "0"
  const p = (n) => String(n).padStart(2, "0");

  return `${days[date.getUTCDay()]} ${months[date.getUTCMonth()]}` +
  ` ${String(date.getUTCDate()).padStart(2, " ")}` +
  ` ${p(date.getUTCHours())}:${p(date.getUTCMinutes())}:${p(date.getUTCSeconds())}` +
  ` ${date.getUTCFullYear()}`;
}
