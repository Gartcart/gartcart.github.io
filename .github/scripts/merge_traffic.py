# AI tools were used to write this script!
import argparse
import csv
import json
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

HEADER = ("date", "total_views", "unique_views")
Counts = tuple[int, int]


def parse_day(value: str) -> date:
    return datetime.strptime(value[:10], "%Y-%m-%d").date()


def load_existing(path: Path) -> dict[date, Counts]:
    if not path.is_file():
        return {}

    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if missing := set(HEADER) - set(reader.fieldnames or []):
            sys.exit(
                f"{path} is missing column(s): {', '.join(sorted(missing))}. "
                "Delete the file to start a fresh history."
            )

        rows: dict[date, Counts] = {}
        for row in reader:
            raw = (row.get("date") or "").strip()
            if not raw:
                continue
            try:
                day = parse_day(raw)
            except ValueError:
                sys.exit(f"{path}: cannot parse date {raw!r}.")
            rows[day] = (
                int((row.get("total_views") or "0").strip() or 0),
                int((row.get("unique_views") or "0").strip() or 0),
            )
        return rows


def load_api(path: Path) -> dict[date, Counts]:
    with path.open(encoding="utf-8") as f:
        payload = json.load(f)

    if not isinstance(payload, dict) or "views" not in payload:
        sys.exit(
            f"{path} is not a traffic/views response "
            "(no 'views' key). The API call probably returned an error."
        )

    fresh: dict[date, Counts] = {}
    for entry in payload["views"]:
        stamp = entry.get("timestamp")
        if not stamp:
            continue
        fresh[parse_day(stamp)] = (
            int(entry.get("count") or 0),
            int(entry.get("uniques") or 0),
        )
    return fresh


def merge(stored: dict[date, Counts], fresh: dict[date, Counts]) -> tuple[int, int]:
    added = updated = 0
    for day, counts in fresh.items():
        previous = stored.get(day)
        if previous is None:
            stored[day] = counts
            added += 1
        else:
            merged = (max(previous[0], counts[0]), max(previous[1], counts[1]))
            if merged != previous:
                stored[day] = merged
                updated += 1
    return added, updated


def backfill(stored: dict[date, Counts], through: date) -> int:
    if not stored:
        return 0

    filled = 0
    day, last = min(stored), max(max(stored), through)
    while day <= last:
        if day not in stored:
            stored[day] = (0, 0)
            filled += 1
        day += timedelta(days=1)
    return filled


def write_csv(path: Path, stored: dict[date, Counts]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="\n", encoding="utf-8") as f:
        writer = csv.writer(f, lineterminator="\n")
        writer.writerow(HEADER)
        writer.writerows(
            [day.isoformat(), *stored[day]] for day in sorted(stored)
        )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("api_json", type=Path)
    parser.add_argument("csv_path", type=Path)
    parser.add_argument(
        "--include-today",
        action="store_true",
        help="Also record the current UTC day, which is still incomplete.",
    )
    args = parser.parse_args()

    today = datetime.now(timezone.utc).date()

    stored = load_existing(args.csv_path)
    fresh = load_api(args.api_json)

    skipped = 0
    if not args.include_today and today in fresh:
        del fresh[today]
        skipped = 1

    if not fresh:
        print("No complete days returned by the API; leaving the CSV alone.")
        return

    before = len(stored)
    added, updated = merge(stored, fresh)
    filled = backfill(stored, through=today - timedelta(days=1))
    write_csv(args.csv_path, stored)

    total = sum(counts[0] for counts in stored.values())
    print(
        f"{args.csv_path}: {before} -> {len(stored)} row(s) "
        f"({len(fresh)} complete day(s) from the API, {added} new, "
        f"{updated} revised upward, {filled} backfilled as zero, "
        f"{skipped} in-progress day skipped)"
    )
    print(f"Lifetime views in file: {total}")


if __name__ == "__main__":
    main()
