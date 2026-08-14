(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress = document.getElementById('pageProgress');
  const topbar = document.getElementById('topbar');
  const caseRail = document.querySelector('.case-rail');
  const caseProgress = document.getElementById('caseProgress');
  const productPanel = document.getElementById('productPanel');
  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateScroll = () => {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const ratio = Math.min(1, Math.max(0, window.scrollY / max));
    if (progress) progress.style.width = `${ratio * 100}%`;

    if (topbar && window.innerWidth > 720) {
      const goingDown = window.scrollY > lastScrollY;
      topbar.classList.toggle('is-hidden', goingDown && window.scrollY > 280);
    }
    lastScrollY = window.scrollY;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, { passive: true });
  updateScroll();

  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => observer.observe(el));
  }

  const enableDrag = (scroller) => {
    if (!scroller) return;
    let isDown = false;
    let startX = 0;
    let startScroll = 0;

    scroller.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch') return;
      isDown = true;
      startX = event.clientX;
      startScroll = scroller.scrollLeft;
      scroller.setPointerCapture?.(event.pointerId);
    });
    scroller.addEventListener('pointermove', (event) => {
      if (!isDown) return;
      scroller.scrollLeft = startScroll - (event.clientX - startX);
    });
    const end = () => { isDown = false; };
    scroller.addEventListener('pointerup', end);
    scroller.addEventListener('pointercancel', end);
    scroller.addEventListener('pointerleave', end);

    scroller.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const dir = event.key === 'ArrowRight' ? 1 : -1;
        scroller.scrollBy({ left: dir * scroller.clientWidth * 0.72, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
  };

  document.querySelectorAll('.drag-scroll').forEach(enableDrag);

  const updateCaseProgress = () => {
    if (!caseRail || !caseProgress) return;
    const max = Math.max(1, caseRail.scrollWidth - caseRail.clientWidth);
    caseProgress.style.width = `${Math.min(1, caseRail.scrollLeft / max) * 100}%`;
  };
  caseRail?.addEventListener('scroll', () => requestAnimationFrame(updateCaseProgress), { passive: true });
  updateCaseProgress();

  if (!reduceMotion && productPanel && window.matchMedia('(pointer:fine)').matches) {
    productPanel.addEventListener('pointermove', (event) => {
      const rect = productPanel.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      productPanel.style.setProperty('--mx', `${x * 7}px`);
      productPanel.style.setProperty('--my', `${y * 7}px`);
      const img = productPanel.querySelector('.product-image');
      if (img) img.style.transform = `translate(${x * 7}px, ${y * 7}px) scale(.975)`;
    });
    productPanel.addEventListener('pointerleave', () => {
      const img = productPanel.querySelector('.product-image');
      if (img) img.style.transform = '';
    });
  }
})();
