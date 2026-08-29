#!/usr/bin/env python3
"""Merge GitHub traffic API response into a running CSV of daily view counts.

Usage: merge_traffic.py <views.json> <views.csv>
"""

import csv
import json
import os
import sys

HEADER = ["date", "total_views", "unique_views"]


def load_existing(path):
    rows = {}
    if not os.path.exists(path):
        return rows

    with open(path, newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        missing = [c for c in HEADER if c not in (reader.fieldnames or [])]
        if missing:
            raise SystemExit(
                f"{path} is missing column(s): {', '.join(missing)}. "
                "Delete the file to start a fresh history."
            )
        for row in reader:
            date = (row.get("date") or "").strip()
            if not date:
                continue
            rows[date] = (
                int(row["total_views"] or 0),
                int(row["unique_views"] or 0),
            )
    return rows


def load_api(path):
    with open(path, encoding="utf-8") as handle:
        payload = json.load(handle)

    rows = {}
    for entry in payload.get("views", []):
        date = entry["timestamp"][:10]
        rows[date] = (int(entry.get("count", 0)), int(entry.get("uniques", 0)))
    return rows


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__.strip())

    json_path, csv_path = sys.argv[1], sys.argv[2]

    stored = load_existing(csv_path)
    fresh = load_api(json_path)

    before = len(stored)
    stored.update(fresh)

    os.makedirs(os.path.dirname(csv_path) or ".", exist_ok=True)
    with open(csv_path, "w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(HEADER)
        for date in sorted(stored):
            total, unique = stored[date]
            writer.writerow([date, total, unique])

    print(
        f"{csv_path}: {before} row(s) -> {len(stored)} "
        f"({len(fresh)} day(s) from the API, "
        f"{len(stored) - before} new)"
    )


if __name__ == "__main__":
    main()
