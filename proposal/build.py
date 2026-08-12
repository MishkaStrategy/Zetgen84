from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / "_site"
SOURCE = ROOT / "index.html"

HEAD_INJECT = """
<link rel="stylesheet" href="./overrides.css?v=2">
<meta property="og:type" content="website">
<meta property="og:title" content="Zetgen-84 — Brand Transformation Proposal">
<meta property="og:description" content="Research → Brand → Packaging → Digital → Growth">
<meta name="color-scheme" content="dark">
""".strip()

BODY_INJECT = '<script src="./overrides.js?v=2" defer></script>'

class StructureParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.sections = 0
        self.ids: list[str] = []
        self.title_seen = False

    def handle_starttag(self, tag: str, attrs):
        attrs = dict(attrs)
        if tag == "section":
            self.sections += 1
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "title":
            self.title_seen = True


def build() -> Path:
    html = SOURCE.read_text(encoding="utf-8")
    if "overrides.css" not in html:
        html = html.replace("</head>", f"{HEAD_INJECT}\n</head>", 1)
    if "overrides.js" not in html:
        html = html.replace("</body>", f"{BODY_INJECT}\n</body>", 1)

    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    (OUT / "index.html").write_text(html, encoding="utf-8")
    shutil.copy2(ROOT / "overrides.css", OUT / "overrides.css")
    shutil.copy2(ROOT / "overrides.js", OUT / "overrides.js")
    (OUT / ".nojekyll").write_text("", encoding="utf-8")
    return OUT / "index.html"


def validate(path: Path) -> None:
    html = path.read_text(encoding="utf-8")
    parser = StructureParser()
    parser.feed(html)

    errors: list[str] = []
    if not parser.title_seen:
        errors.append("missing <title>")
    if parser.sections < 10:
        errors.append(f"expected >=10 sections, found {parser.sections}")
    duplicates = sorted({value for value in parser.ids if parser.ids.count(value) > 1})
    if duplicates:
        errors.append("duplicate ids: " + ", ".join(duplicates))
    for required in ("Zetgen-84", "Исслед", "B2C", "Roadmap"):
        if required.lower() not in html.lower():
            errors.append(f"missing required narrative marker: {required}")
    for asset in ("overrides.css", "overrides.js"):
        if asset not in html:
            errors.append(f"asset not injected: {asset}")

    if errors:
        print("Proposal validation failed:")
        for error in errors:
            print(f" - {error}")
        raise SystemExit(1)

    print(f"Proposal OK: {parser.sections} sections, {len(parser.ids)} ids, {path.stat().st_size} bytes")


if __name__ == "__main__":
    target = build()
    validate(target)
    print(target)
