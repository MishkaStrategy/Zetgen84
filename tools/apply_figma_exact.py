from pathlib import Path

index = Path('final/index.html')
html = index.read_text(encoding='utf-8')
old_hero = '''      <figure class="hero-product reveal">
        <div class="hero-green-base"></div>
        <img src="../assets/zetgen-products-clean-ru.png" alt="Продукция ЗетГен-84" width="1537" height="1023" fetchpriority="high" decoding="async">
      </figure>'''
new_hero = '''      <figure class="hero-product hero-product-figma reveal">
        <img class="hero-product-exact" src="assets/figma-exact/hero-product.png" alt="Продукция ЗетГен-84" width="805" height="834" fetchpriority="high" decoding="async">
      </figure>'''
if old_hero in html:
    html = html.replace(old_hero, new_hero, 1)
elif new_hero not in html:
    raise RuntimeError('hero block not found')
html = html.replace('<link rel="preload" as="image" href="../assets/zetgen-products-clean-ru.png">', '<link rel="preload" as="image" href="assets/figma-exact/hero-product.png">', 1)
index.write_text(html, encoding='utf-8')

app = Path('final/app.js')
js = app.read_text(encoding='utf-8')
old_san = '''    'poster-san': `
      <div class="case-original-canvas">
        <div class="case-original-grid"></div>
        <span class="case-original-code">SV / 01</span>
        <span class="case-original-side">BRAND<br>SYSTEM</span>
        <div class="san-a-wrap"><img class="case-asset san-a" src="assets/cases/san-macbook-15.png" alt="" decoding="async"></div>
        <img class="case-asset san-b" src="assets/cases/san-macbook-m2.png" alt="" decoding="async">
        <img class="case-asset san-screen" src="assets/cases/san-screen.png" alt="" decoding="async">
      </div>`,'''
new_san = '''    'poster-san': `
      <img class="case-exact-export" src="assets/figma-exact/san-valero-poster.png" alt="" width="755" height="760" decoding="async">`,'''
if old_san in js:
    js = js.replace(old_san, new_san, 1)
elif new_san not in js:
    raise RuntimeError('San Valero markup not found')
marker = '    .case-poster.case-original{position:relative;overflow:hidden;container-type:inline-size}\n'
exact_rule = '    .poster-san.case-original .case-exact-export{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:fill;pointer-events:none;user-select:none;-webkit-user-drag:none}\n'
if exact_rule not in js:
    if marker not in js:
        raise RuntimeError('case style marker not found')
    js = js.replace(marker, marker + exact_rule, 1)
app.write_text(js, encoding='utf-8')

css = Path('final/styles.css')
text = css.read_text(encoding='utf-8')
fixes = '''

/* Exact Figma sync: Hero 6:19 + San Valero 15:277 */
.hero{
  height:834px;
  min-height:834px;
  margin-bottom:0;
  grid-template-columns:635px 805px;
}
.hero-copy{
  height:834px;
  min-height:834px;
}
.hero-title span+span{margin-top:10px}
.hero-product-figma{
  height:834px;
  min-height:834px;
  background:#dde1d2;
}
.hero-product-figma::before,.hero-product-figma::after{display:none}
.hero-product-figma .hero-product-exact{
  position:absolute;
  inset:0;
  z-index:1;
  display:block;
  width:100%;
  height:100%;
  max-width:none;
  object-fit:fill;
  transform:none;
  filter:none;
}
.orbit-a{top:150px}
.about{margin-top:0}
.case-card:first-child .case-copy>p{font-size:16px;line-height:1.45}
'''
if '/* Exact Figma sync: Hero 6:19 + San Valero 15:277 */' not in text:
    text += fixes
css.write_text(text, encoding='utf-8')

mobile = Path('final/mobile.css')
m = mobile.read_text(encoding='utf-8')
mobile_fixes = '''

/* Exact Figma assets, responsive without extra Hero bottom gap. */
@media (max-width: 820px) {
  .hero { height:auto; min-height:0; grid-template-columns:1fr; margin-bottom:0; }
  .hero-copy { height:auto; min-height:0; padding-bottom:0; }
  .hero-title span + span { margin-top:.15em; }
  .hero-product-figma { height:clamp(360px, 103.6vw, 500px); min-height:0; }
  .hero-product-figma .hero-product-exact { object-fit:fill; }
  .orbit-a { top:auto; }
  .poster-san.case-original .case-exact-export { object-fit:cover; }
}
'''
if '/* Exact Figma assets, responsive without extra Hero bottom gap. */' not in m:
    m += mobile_fixes
mobile.write_text(m, encoding='utf-8')
