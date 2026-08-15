(() => {
  const root = document.documentElement;
  const progress = document.getElementById('pageProgress');
  const rail = document.getElementById('caseRail');
  const caseProgress = document.getElementById('caseProgress');

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
