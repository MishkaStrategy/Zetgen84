(() => {
  const root = document.documentElement;
  const progress = document.getElementById('pageProgress');
  const rail = document.getElementById('caseRail');
  const caseProgress = document.getElementById('caseProgress');

  // Replace the temporary CSS mockups with the original image layers exported from Figma.
  const caseStyle = document.createElement('style');
  caseStyle.textContent = `
    .case-poster.case-original{position:relative;overflow:hidden;container-type:inline-size}
    .poster-san.case-original .case-exact-export{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:fill;pointer-events:none;user-select:none;-webkit-user-drag:none}
    .case-original-canvas{position:absolute;left:0;top:50%;width:100cqw;height:100.662252cqw;transform:translateY(-50%);overflow:hidden}
    .case-original-canvas .case-asset{position:absolute;display:block;max-width:none;pointer-events:none;user-select:none;-webkit-user-drag:none}
    .case-original-grid{position:absolute;inset:0;pointer-events:none;background-size:16.6666667% 100%,100% 20%}
    .poster-san .case-original-grid{background-image:linear-gradient(to right,transparent calc(100% - .5px),rgba(255,255,255,.55) calc(100% - .5px),rgba(255,255,255,.55) 100%),linear-gradient(to bottom,transparent calc(100% - .5px),rgba(255,255,255,.55) calc(100% - .5px),rgba(255,255,255,.55) 100%)}
    .poster-sofia .case-original-grid{background-image:linear-gradient(to right,transparent calc(100% - .5px),rgba(255,249,255,.18) calc(100% - .5px),rgba(255,249,255,.18) 100%),linear-gradient(to bottom,transparent calc(100% - .5px),rgba(255,249,255,.18) calc(100% - .5px),rgba(255,249,255,.18) 100%)}
    .poster-taiga .case-original-grid{background-image:linear-gradient(to right,transparent calc(100% - .5px),rgba(237,255,232,.18) calc(100% - .5px),rgba(237,255,232,.18) 100%),linear-gradient(to bottom,transparent calc(100% - .5px),rgba(237,255,232,.18) calc(100% - .5px),rgba(237,255,232,.18) 100%)}
    .case-original-code,.case-original-side{position:absolute;z-index:20;top:4.503311cqw;color:#fff;font-size:clamp(6px,1.324503cqw,10px);line-height:1.2;letter-spacing:.16em;font-weight:400}
    .case-original-code{left:4.503311cqw}
    .case-original-side{right:7.682119cqw;text-align:right;font-size:clamp(6px,1.456954cqw,11px);line-height:1.25;letter-spacing:.12em}
    .poster-sofia .case-original-code,.poster-sofia .case-original-side{color:#fff9ff}
    .poster-taiga .case-original-code,.poster-taiga .case-original-side{color:#edffe8}

    .san-a-wrap{position:absolute;left:-21.192053cqw;top:-3.311258cqw;width:104.660305cqw;height:77.668742cqw;display:flex;align-items:center;justify-content:center;z-index:4}
    .san-a-wrap .san-a{position:relative!important;width:99.205298cqw;height:69.650066cqw;object-fit:cover;transform:rotate(-4.78deg)}
    .san-b{left:22.88555cqw;top:25.889842cqw;width:78.974cqw;height:63.103046cqw;object-fit:contain;transform:rotate(3.78deg);transform-origin:center;z-index:7}
    .san-screen{left:41.179756cqw;top:28.272356cqw;width:57.692221cqw;height:41.796821cqw;object-fit:cover;transform:rotate(3.78deg);transform-origin:center;z-index:8}

    .sofia-image{left:1.854305cqw;top:41.059603cqw;width:51.523179cqw;height:51.258278cqw;object-fit:cover;z-index:3}
    .sofia-pro{left:25.136105cqw;top:11.82171cqw;width:79.623514cqw;height:74.656546cqw;object-fit:contain;z-index:5}
    .sofia-this{left:26.720779cqw;top:13.283679cqw;width:76.628474cqw;height:71.727099cqw;object-fit:contain;z-index:6}
    .sofia-hand{left:53.378159cqw;top:72.5190cqw;width:42.529471cqw;height:28.673086cqw;object-fit:contain;z-index:9}

    .taiga-mac{position:absolute;left:1.986755cqw;top:29.271523cqw;width:83.443709cqw;height:62.384106cqw;overflow:hidden;z-index:3}
    .taiga-mac img{position:absolute;left:-16.7%;top:-20.14%;width:134.14%;height:134.29%;max-width:none;object-fit:fill}
    .taiga-hand{left:53.245033cqw;top:43.443709cqw;width:75.990346cqw;height:71.2520cqw;object-fit:contain;z-index:5}
    .taiga-screen{left:56.995114cqw;top:44.055858cqw;width:26.646cqw;height:48.199285cqw;object-fit:contain;z-index:6}

    @media (max-width:820px){
      .case-original-code,.case-original-side{font-size:6px}
      .case-original-side{right:4.5cqw}
    }
  `;
  document.head.appendChild(caseStyle);


  const posterMarkup = {
    'poster-san': `
      <img class="case-exact-export" src="assets/figma-exact/san-valero-poster.png" alt="" width="755" height="760" decoding="async">`,
    'poster-sofia': `
      <div class="case-original-canvas">
        <div class="case-original-grid"></div>
        <span class="case-original-code">SS / 02</span>
        <span class="case-original-side">DIGITAL<br>PRINT</span>
        <img class="case-asset sofia-image" src="assets/cases/sofia-image.png" alt="" loading="lazy" decoding="async">
        <img class="case-asset sofia-pro" src="assets/cases/sofia-pro.png" alt="" loading="lazy" decoding="async">
        <img class="case-asset sofia-this" src="assets/cases/sofia-this.png" alt="" loading="lazy" decoding="async">
        <img class="case-asset sofia-hand" src="assets/cases/sofia-hand.png" alt="" loading="lazy" decoding="async">
      </div>`,
    'poster-taiga': `
      <div class="case-original-canvas">
        <div class="case-original-grid"></div>
        <span class="case-original-code">ТО / 03</span>
        <span class="case-original-side">SITE<br>SOCIAL</span>
        <div class="taiga-mac"><img src="assets/cases/taiga-mac-studio.png" alt="" loading="lazy" decoding="async"></div>
        <img class="case-asset taiga-hand" src="assets/cases/taiga-hand.png" alt="" loading="lazy" decoding="async">
        <img class="case-asset taiga-screen" src="assets/cases/taiga-screen.png" alt="" loading="lazy" decoding="async">
      </div>`
  };

  Object.entries(posterMarkup).forEach(([className, markup]) => {
    const poster = document.querySelector(`.${className}`);
    if (!poster) return;
    poster.classList.add('case-original');
    poster.innerHTML = markup;
  });

  const updatePageProgress = () => {
    const max = root.scrollHeight - innerHeight;
    const value = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    if (progress) progress.style.width = `${value * 100}%`;
  };

  const updateRailProgress = () => {
    if (!rail || !caseProgress) return;
    const max = rail.scrollWidth - rail.clientWidth;
    const value = max > 0 ? Math.min(1, Math.max(0, rail.scrollLeft / max)) : 0;
    caseProgress.style.width = `${28 + value * 72}%`;
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updatePageProgress();
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => {
    updatePageProgress();
    updateRailProgress();
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  });

  if (rail) {
    rail.addEventListener('scroll', updateRailProgress, { passive: true });

    let down = false;
    let startX = 0;
    let startScroll = 0;

    rail.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch') return;
      down = true;
      startX = event.clientX;
      startScroll = rail.scrollLeft;
      rail.setPointerCapture(event.pointerId);
      rail.classList.add('is-dragging');
    });
    rail.addEventListener('pointermove', (event) => {
      if (!down) return;
      rail.scrollLeft = startScroll - (event.clientX - startX);
    });
    const release = (event) => {
      if (!down) return;
      down = false;
      rail.classList.remove('is-dragging');
      try { rail.releasePointerCapture(event.pointerId); } catch (_) {}
    };
    rail.addEventListener('pointerup', release);
    rail.addEventListener('pointercancel', release);
    rail.addEventListener('pointerleave', (event) => {
      if (down && event.buttons === 0) release(event);
    });

    rail.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      rail.scrollBy({ left: (event.key === 'ArrowRight' ? 1 : -1) * Math.min(rail.clientWidth * .85, 1200), behavior: 'smooth' });
    });
  }

  updatePageProgress();
  updateRailProgress();
})();