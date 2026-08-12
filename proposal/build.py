from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import re
import shutil
import tarfile

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / "_site"
ARCHIVE = ROOT / "site.tar.gz"

FORBIDDEN = {
    "БАД": re.compile(r"\bбад(?:ы|ами|ах|ов)?\b", re.I),
    "лекарство": re.compile(r"\bлекарств\w*", re.I),
    "лечение": re.compile(r"\bлечени\w*|\bлечит\w*", re.I),
    "профилактика": re.compile(r"\bпрофилактик\w*", re.I),
}

class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sections = 0
        self.ids: list[str] = []
        self.text: list[str] = []
        self.ignored = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "section":
            self.sections += 1
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag in {"style", "script"}:
            self.ignored += 1

    def handle_endtag(self, tag):
        if tag in {"style", "script"} and self.ignored:
            self.ignored -= 1

    def handle_data(self, data):
        if not self.ignored and data.strip():
            self.text.append(data.strip())


def extract() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    with tarfile.open(ARCHIVE, "r:gz") as tar:
        for member in tar.getmembers():
            target = (OUT / member.name).resolve()
            if OUT.resolve() not in target.parents and target != OUT.resolve():
                raise RuntimeError(f"unsafe archive path: {member.name}")
        tar.extractall(OUT)

    # The visual prototype intentionally ships without invented agency contacts.
    # Until a real email / Telegram / phone is supplied, CTA returns to cooperation formats.
    index = OUT / "index.html"
    html = index.read_text(encoding="utf-8")
    html = html.replace('mailto:hello@agency-sputnik.ru', '#formats')
    index.write_text(html, encoding="utf-8")
    (OUT / ".nojekyll").write_text("", encoding="utf-8")


def validate() -> None:
    html = (OUT / "index.html").read_text(encoding="utf-8")
    p = Parser()
    p.feed(html)
    visible = " ".join(p.text)
    errors: list[str] = []

    if p.sections != 8:
        errors.append(f"expected 8 sections, found {p.sections}")
    duplicates = sorted({x for x in p.ids if p.ids.count(x) > 1})
    if duplicates:
        errors.append("duplicate ids: " + ", ".join(duplicates))

    for marker in (
        "СПУТНИК", "Зетген-84", "От визуала", "Академия Сан Валеро",
        "Sofia School", "Тайга Озеро", "90 000", "40 000"
    ):
        if marker.lower() not in visible.lower():
            errors.append(f"missing marker: {marker}")

    for label, pattern in FORBIDDEN.items():
        match = pattern.search(visible)
        if match:
            errors.append(f"legally sensitive claim ({label}): {match.group(0)}")

    if "не гарантия коммерческого результата" not in visible.lower():
        errors.append("business-result disclaimer missing")
    if "hello@agency-sputnik.ru" in html:
        errors.append("placeholder agency email leaked into production")

    for asset in ("styles.css", "app.js"):
        if not (OUT / asset).exists():
            errors.append(f"missing asset: {asset}")

    if errors:
        print("Validation failed:")
        for error in errors:
            print(" -", error)
        raise SystemExit(1)

    print(f"OK: {p.sections} sections, {len(p.ids)} ids, legal guard passed")


if __name__ == "__main__":
    extract()
    validate()
    print(OUT)
