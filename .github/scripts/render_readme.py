# AI tools were used to write this script!
import argparse
import csv
import sys
from datetime import date, datetime, timezone
from pathlib import Path

START = "<!-- TRAFFIC:START -->"
END = "<!-- TRAFFIC:END -->"


def plot(series, height=15, offset=3, floor_min=None, floor_max=None):
    if not series:
        return ""

    low = min(series if floor_min is None else [*series, floor_min])
    high = max(series if floor_max is None else [*series, floor_max])
    interval = high - low
    ratio = 1 if interval == 0 else height / interval

    min2, max2 = round(low * ratio), round(high * ratio)
    rows = max2 - min2
    width = len(series) + offset
    grid = [[" "] * width for _ in range(rows + 1)]

    for y in range(min2, max2 + 1):
        value = high if rows == 0 else high - ((y - min2) * interval) / rows
        label = f"{value:8.0f}"
        grid[y - min2][max(offset - len(label), 0)] = label
        grid[y - min2][offset - 1] = "\u253c" if y == 0 else "\u2524"

    first = round(series[0] * ratio) - min2
    grid[rows - first][offset - 1] = "\u253c"

    for x in range(len(series) - 1):
        y0 = round(series[x] * ratio) - min2
        y1 = round(series[x + 1] * ratio) - min2
        if y0 == y1:
            grid[rows - y0][x + offset] = "\u2500"
        else:
            grid[rows - y1][x + offset] = "\u2570" if y0 > y1 else "\u256d"
            grid[rows - y0][x + offset] = "\u256e" if y0 > y1 else "\u256f"
            for y in range(min(y0, y1) + 1, max(y0, y1)):
                grid[rows - y][x + offset] = "\u2502"

    return "\n".join("".join(row).rstrip() for row in grid)


def read_rows(path: Path):
    if not path.is_file():
        sys.exit(f"{path} does not exist yet; run the merge step first.")

    with path.open(newline="", encoding="utf-8") as f:
        rows = [
            (
                datetime.strptime(row["date"].strip(), "%Y-%m-%d").date(),
                int((row.get("total_views") or "0").strip() or 0),
                int((row.get("unique_views") or "0").strip() or 0),
            )
            for row in csv.DictReader(f)
            if (row.get("date") or "").strip()
        ]

    if not rows:
        sys.exit(f"{path} has no data rows.")
    return sorted(rows)


def build_block(rows, window: int) -> str:
    recent = rows[-window:]
    views = [r[1] for r in recent]

    total = sum(views)
    uniques = sum(r[2] for r in recent)
    lifetime = sum(r[1] for r in rows)
    peak_day, peak_views, _ = max(recent, key=lambda r: r[1])
    top = max(5, *views) if len(views) > 1 else max(5, views[0])
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    chart = plot(views, height=min(15, top), floor_min=0, floor_max=top)

    return "\n".join(
        [
            START,
            "",
            f"### Repository traffic &mdash; last {len(recent)} days",
            "",
            "| Views | Unique visitors | Busiest day | Lifetime views |",
            "| ----: | --------------: | :---------- | -------------: |",
            f"| {total:,} | {uniques:,} | {peak_day.isoformat()} "
            f"({peak_views:,}) | {lifetime:,} |",
            "",
            "```",
            f"Total views per day, {recent[0][0].isoformat()} "
            f"to {recent[-1][0].isoformat()}",
            "",
            chart,
            "```",
            "",
            f"<sub>Collected daily from the GitHub traffic API &middot; "
            f"updated {stamp}.</sub>",
            "",
            END,
        ]
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("csv_path", type=Path)
    parser.add_argument("readme", type=Path)
    parser.add_argument("--days", type=int, default=30)
    args = parser.parse_args()

    block = build_block(read_rows(args.csv_path), args.days)
    text = args.readme.read_text(encoding="utf-8")

    if START not in text or END not in text:
        sys.exit(
            f"{args.readme} needs the {START} and {END} markers "
            "around the section to replace."
        )

    head, _, rest = text.partition(START)
    _, _, tail = rest.partition(END)
    args.readme.write_text(head + block + tail, encoding="utf-8")
    print(f"Wrote {len(block.splitlines())} line(s) into {args.readme}.")


if __name__ == "__main__":
    main()
