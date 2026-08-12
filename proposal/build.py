from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / "_site"
SOURCE = ROOT / "index.html"
ASSET_VERSION = "4"

HEAD_INJECT = f"""
<link rel="stylesheet" href="./overrides.css?v={ASSET_VERSION}">
<meta property="og:type" content="website">
<meta property="og:title" content="Zetgen-84 — Brand Transformation Proposal">
<meta property="og:description" content="Research → Brand → Packaging → Digital → Growth">
<meta name="color-scheme" content="dark">
""".strip()

BODY_INJECT = f'<script src="./overrides.js?v={ASSET_VERSION}" defer></script>'

FORBIDDEN_PUBLIC_CLAIMS = {
    "БАД": re.compile(r"\bбад(?:ы|ами|ах|ов)?\b", re.IGNORECASE),
    "лекарство": re.compile(r"\bлекарств\w*", re.IGNORECASE),
    "лечение": re.compile(r"\bлечени\w*|\bлечит\w*", re.IGNORECASE),
    "профилактика": re.compile(r"\bпрофилактик\w*", re.IGNORECASE),
}


class StructureParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.sections = 0
        self.ids: list[str] = []
        self.title_seen = False
        self.visible_text: list[str] = []
        self._ignored_depth = 0

    def handle_starttag(self, tag: str, attrs):
        attrs = dict(attrs)
        if tag == "section":
            self.sections += 1
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "title":
            self.title_seen = True
        if tag in {"script", "style"}:
            self._ignored_depth += 1

    def handle_endtag(self, tag: str):
        if tag in {"script", "style"} and self._ignored_depth:
            self._ignored_depth -= 1

    def handle_data(self, data: str):
        if not self._ignored_depth:
            stripped = data.strip()
            if stripped:
                self.visible_text.append(stripped)


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
    visible_text = " ".join(parser.visible_text)

    errors: list[str] = []
    if not parser.title_seen:
        errors.append("missing <title>")
    if parser.sections < 16:
        errors.append(f"expected >=16 narrative sections, found {parser.sections}")

    duplicates = sorted({value for value in parser.ids if parser.ids.count(value) > 1})
    if duplicates:
        errors.append("duplicate ids: " + ", ".join(duplicates))

    for required in ("Zetgen-84", "Исслед", "B2C", "Roadmap"):
        if required.lower() not in visible_text.lower():
            errors.append(f"missing required narrative marker: {required}")

    for asset in ("overrides.css", "overrides.js"):
        if asset not in html:
            errors.append(f"asset not injected: {asset}")

    for label, pattern in FORBIDDEN_PUBLIC_CLAIMS.items():
        match = pattern.search(visible_text)
        if match:
            errors.append(f"legally sensitive public claim detected ({label}): {match.group(0)}")

    disclaimer = "не является гарантией результата"
    if disclaimer not in visible_text.lower():
        errors.append("scenario disclaimer is missing: 'Не является гарантией результата'")

    if errors:
        print("Proposal validation failed:")
        for error in errors:
            print(f" - {error}")
        raise SystemExit(1)

    print(
        f"Proposal OK: {parser.sections} sections, {len(parser.ids)} ids, "
        f"legal-copy guard passed, {path.stat().st_size} bytes"
    )


if __name__ == "__main__":
    target = build()
    validate(target)
    print(target)
