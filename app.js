(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.site-header');
  const pageProgress = document.getElementById('pageProgress');
  const casesScroll = document.getElementById('casesScroll');
  const caseTrack = document.getElementById('caseTrack');
  const caseProgress = document.getElementById('caseProgress');
  const parallaxItems = [...document.querySelectorAll('[data-parallax]')];
  const darkSections = [...document.querySelectorAll('.cases, .final')];

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -6% 0px'
  });

  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

  let ticking = false;

  function updatePageProgress() {
    if (!pageProgress) return;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = clamp(window.scrollY / max);
    pageProgress.style.width = `${progress * 100}%`;
  }

  function updateHeaderTheme() {
    if (!header) return;
    const sampleY = 44;
    const dark = darkSections.some((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= sampleY && rect.bottom >= sampleY;
    });
    header.classList.toggle('is-dark', dark);
  }

  function updateCases() {
    if (!casesScroll || !caseTrack) return;

    if (window.innerWidth <= 900 || reduceMotion.matches) {
      caseTrack.style.transform = '';
      if (caseProgress) caseProgress.style.width = '100%';
      return;
    }

    const rect = casesScroll.getBoundingClientRect();
    const scrollRange = Math.max(1, casesScroll.offsetHeight - window.innerHeight);
    const progress = clamp(-rect.top / scrollRange);
    const leftPad = parseFloat(getComputedStyle(caseTrack).paddingLeft) || 0;
    const maxX = Math.max(0, caseTrack.scrollWidth - window.innerWidth + leftPad);

    caseTrack.style.transform = `translate3d(${-maxX * progress}px, 0, 0)`;
    if (caseProgress) caseProgress.style.width = `${progress * 100}%`;
  }

  function updateParallax() {
    if (reduceMotion.matches || window.innerWidth <= 900) {
      parallaxItems.forEach((item) => { item.style.transform = ''; });
      return;
    }

    parallaxItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const speed = Number(item.dataset.parallax || 0);
      const offset = (window.innerHeight * 0.5 - (rect.top + rect.height * 0.5)) * speed;
      item.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  }

  function update() {
    updatePageProgress();
    updateHeaderTheme();
    updateCases();
    updateParallax();
    ticking = false;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  reduceMotion.addEventListener?.('change', requestUpdate);

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      if (reduceMotion.matches) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  update();
})();
