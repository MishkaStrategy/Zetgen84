(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress = document.getElementById('pageProgress');
  const topbar = document.getElementById('topbar');
  const caseRail = document.querySelector('.case-rail');
  const caseProgress = document.getElementById('caseProgress');
  const finalCta = document.querySelector('.final .button');
  const heroVersion = document.querySelector('.hero-meta span:last-child');

  // The project materials do not provide a public contact address,
  // so the CTA stays inside the proposal instead of inventing one.
  if (finalCta) finalCta.setAttribute('href', '#formats');
  if (heroVersion) heroVersion.textContent = 'V5 / 2026';

  const updatePageProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    if (progress) progress.style.width = `${value * 100}%`;
  };

  let lastY = window.scrollY;
  const updateHeader = () => {
    const y = window.scrollY;
    if (topbar) {
      topbar.classList.toggle('is-hidden', y > 140 && y > lastY + 4);
      const lightZone = [...document.querySelectorAll('.section-paper, .section-mist')]
        .some((section) => {
          const rect = section.getBoundingClientRect();
          return rect.top <= 34 && rect.bottom >= 34;
        });
      topbar.classList.toggle('on-light', lightZone);
    }
    lastY = y;
  };

  const onScroll = () => {
    updatePageProgress();
    updateHeader();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updatePageProgress);
  updatePageProgress();
  updateHeader();

  const reveals = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
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

  const makeDragScrollable = (rail) => {
    let down = false;
    let startX = 0;
    let startScroll = 0;

    rail.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      down = true;
      startX = event.clientX;
      startScroll = rail.scrollLeft;
      rail.setPointerCapture?.(event.pointerId);
    });

    rail.addEventListener('pointermove', (event) => {
      if (!down) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 4) rail.scrollLeft = startScroll - delta;
    });

    const stop = (event) => {
      down = false;
      try { rail.releasePointerCapture?.(event.pointerId); } catch (_) {}
    };

    rail.addEventListener('pointerup', stop);
    rail.addEventListener('pointercancel', stop);
    rail.addEventListener('pointerleave', () => { down = false; });

    rail.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      rail.scrollBy({ left: direction * rail.clientWidth * 0.72, behavior: reduced ? 'auto' : 'smooth' });
    });
  };

  document.querySelectorAll('.drag-scroll').forEach(makeDragScrollable);

  const updateCaseProgress = () => {
    if (!caseRail || !caseProgress) return;
    const max = caseRail.scrollWidth - caseRail.clientWidth;
    const ratio = max > 0 ? Math.min(1, caseRail.scrollLeft / max) : 1;
    caseProgress.style.width = `${Math.max(8, ratio * 100)}%`;
  };

  if (caseRail) {
    caseRail.addEventListener('scroll', updateCaseProgress, { passive: true });
    window.addEventListener('resize', updateCaseProgress);
    updateCaseProgress();
  }
})();
