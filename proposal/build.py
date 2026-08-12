from __future__ import annotations
from pathlib import Path
import re, shutil
ROOT=Path(__file__).resolve().parent
OUT=ROOT.parent/'_site'
FILES=('index.html','v3.css','v3.js','qa.js')
FORBIDDEN={'БАД':re.compile(r'\bбад(?:ы|ами|ах|ов)?\b',re.I),'лекарство':re.compile(r'\bлекарств\w*',re.I),'лечение':re.compile(r'\bлечени\w*|\bлечит\w*',re.I),'профилактика':re.compile(r'\bпрофилактик\w*',re.I)}
def validate():
 html=(ROOT/'index.html').read_text(encoding='utf-8'); js=(ROOT/'v3.js').read_text(encoding='utf-8'); css=(ROOT/'v3.css').read_text(encoding='utf-8'); all_text=html+' '+js; errors=[]
 for asset in ('v3.css','v3.js','qa.js'):
  if asset not in html: errors.append('missing asset: '+asset)
 for marker in ('Zetgen-84','B2C','Roadmap','Research Sprint','3,5–5,0 млн ₽'):
  if marker.lower() not in all_text.lower(): errors.append('missing narrative marker: '+marker)
 for label,pattern in FORBIDDEN.items():
  m=pattern.search(js)
  if m: errors.append(f'legally sensitive claim ({label}): {m.group(0)}')
 if 'не является гарантией результата' not in js.lower(): errors.append('scenario disclaimer missing')
 if len(css)<10000 or len(js)<15000: errors.append('proposal bundle unexpectedly small')
 if errors:
  print('Proposal validation failed:'); [print(' - '+e) for e in errors]; raise SystemExit(1)
 print(f'Proposal V3 OK: html={len(html)}, css={len(css)}, js={len(js)}, legal guard passed')
def build():
 if OUT.exists(): shutil.rmtree(OUT)
 OUT.mkdir(parents=True)
 for name in FILES: shutil.copy2(ROOT/name,OUT/name)
 (OUT/'.nojekyll').write_text('',encoding='utf-8')
 return OUT/'index.html'
if __name__=='__main__': validate(); print(build())
