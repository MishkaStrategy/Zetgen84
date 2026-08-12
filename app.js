(() => {
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        reveal.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => reveal.observe(el));

  const parallax = document.querySelectorAll('[data-parallax]');
  const casesScroll = document.getElementById('casesScroll');
  const caseTrack = document.getElementById('caseTrack');
  const caseProgress = document.getElementById('caseProgress');
  const roadmap = document.getElementById('roadmap');
  const roadFill = document.getElementById('roadFill');
  let ticking = false;

  function clamp(v, a = 0, b = 1) { return Math.max(a, Math.min(b, v)); }

  function update() {
    const y = window.scrollY;
    parallax.forEach((el) => {
      const speed = Number(el.dataset.parallax || 0);
      el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
    });

    if (casesScroll && caseTrack && window.innerWidth > 900) {
      const r = casesScroll.getBoundingClientRect();
      const maxScroll = casesScroll.offsetHeight - window.innerHeight;
      const progress = clamp((-r.top) / maxScroll);
      const maxX = Math.max(0, caseTrack.scrollWidth - window.innerWidth + parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pad')));
      caseTrack.style.transform = `translate3d(${-maxX * progress}px,0,0)`;
      if (caseProgress) caseProgress.style.width = `${progress * 100}%`;
    } else if (caseTrack) {
      caseTrack.style.transform = '';
    }

    if (roadmap && roadFill) {
      const r = roadmap.getBoundingClientRect();
      const span = roadmap.offsetHeight + window.innerHeight * .35;
      const progress = clamp((window.innerHeight * .62 - r.top) / span);
      roadFill.style.height = `${progress * 100}%`;
    }
    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  update();
})();
