"""Read the STAFF sheet from a JRB birthday workbook without modifying it."""

import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile


NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
MONTHS = {
    name.lower(): index
    for index, name in enumerate(
        [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ],
        1,
    )
}


def cell_value(cell, shared_strings):
    value = cell.find("m:v", NS)
    text = value.text if value is not None else "".join(
        node.text or "" for node in cell.findall(".//m:t", NS)
    )
    return shared_strings[int(text)] if cell.get("t") == "s" and text else text


def read_staff(path):
    with zipfile.ZipFile(path) as workbook:
        shared = ET.fromstring(workbook.read("xl/sharedStrings.xml"))
        strings = [
            "".join(node.text or "" for node in item.findall(".//m:t", NS))
            for item in shared
        ]
        sheets = ET.fromstring(workbook.read("xl/workbook.xml"))
        sheet_names = [sheet.get("name") for sheet in sheets.findall(".//m:sheet", NS)]
        if "STAFF" not in sheet_names:
            raise ValueError("The workbook has no STAFF sheet.")
        index = sheet_names.index("STAFF") + 1
        sheet = ET.fromstring(workbook.read(f"xl/worksheets/sheet{index}.xml"))

    profiles = []
    for row in sheet.findall(".//m:sheetData/m:row", NS):
        row_number = int(row.get("r"))
        if row_number < 3:
            continue
        values = {
            re.match(r"[A-Z]+", cell.get("r")).group(): cell_value(cell, strings)
            for cell in row.findall("m:c", NS)
        }
        name = " ".join((values.get("B") or "").split())
        date_text = " ".join((values.get("C") or "").split()).strip(", ")
        if not name and not date_text:
            continue
        match = re.fullmatch(r"(\d{1,2})(?:st|nd|rd|th)\s+([A-Za-z]+)", date_text)
        if not name or not match or match.group(2).lower() not in MONTHS:
            raise ValueError(f"Invalid staff name or birthday on sheet row {row_number}.")
        day = int(match.group(1))
        month = MONTHS[match.group(2).lower()]
        import calendar
        if day < 1 or day > calendar.monthrange(2024, month)[1]:
            raise ValueError(f"Invalid staff birthday on sheet row {row_number}.")
        profiles.append({"name": name.title(), "month": month, "day": day})

    if len(profiles) != len({profile["name"].casefold() for profile in profiles}):
        raise ValueError("Duplicate staff names in the workbook need manual review.")
    return profiles


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: read-jrb-staff-birthdays.py workbook.xlsx")
    print(json.dumps(read_staff(sys.argv[1]), ensure_ascii=False))
