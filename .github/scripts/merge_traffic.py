import csv
import json
import sys
from pathlib import Path

HEADER = ("date", "total_views", "unique_views")

def load_existing(path: Path) -> dict[str, tuple[int, int]]:
    if not path.is_file():
        return {}

    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if missing := set(HEADER) - set(reader.fieldnames or []):
            sys.exit(
                f"{path} is missing column(s): {', '.join(missing)}. "
                "Delete the file to start a fresh history."
            )

        return {
            date: (
                int(row.get("total_views") or 0),
                int(row.get("unique_views") or 0)
            )
            for row in reader
            if (date := (row.get("date") or "").strip())
        }

def load_api(path: Path) -> dict[str, tuple[int, int]]:
    with path.open(encoding="utf-8") as f:
        return {
            entry["timestamp"][:10]: (
                int(entry.get("count", 0)),
                int(entry.get("uniques", 0))
            )
            for entry in json.load(f).get("views", [])
        }

def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(f"Usage: {sys.argv[0]} <api.json> <traffic.csv>")

    json_path, csv_path = map(Path, sys.argv[1:])

    stored = load_existing(csv_path)
    fresh = load_api(json_path)

    before = len(stored)
    stored.update(fresh)

    csv_path.parent.mkdir(parents=True, exist_ok=True)

    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(HEADER)
        writer.writerows([date, *stored[date]] for date in sorted(stored))

    print(
        f"{csv_path}: {before} row(s) -> {len(stored)} "
        f"({len(fresh)} day(s) from the API, "
        f"{len(stored) - before} new)"
    )

if __name__ == "__main__":
    main()
