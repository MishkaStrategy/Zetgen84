(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopCases = window.matchMedia('(min-width: 901px)');
  const parallaxViewport = window.matchMedia('(min-width: 641px)');
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

  // Keep audit fixes isolated from the primary art-direction stylesheet.
  const auditStyles = document.createElement('link');
  auditStyles.rel = 'stylesheet';
  auditStyles.href = './audit.css';
  document.head.append(auditStyles);

  root.classList.add('js');

  // Progressive reveal: content remains readable when IntersectionObserver is unavailable.
  const revealTargets = [...document.querySelectorAll('.reveal, .reveal-text')];
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -7% 0px' });

    revealTargets.forEach((el, index) => {
      if (el.classList.contains('reveal-text')) {
        el.style.transitionDelay = `${Math.min((index % 3) * 60, 120)}ms`;
      }
      revealObserver.observe(el);
    });
  }

  // Native horizontal review rail with pointer drag and explicit keyboard controls.
  document.querySelectorAll('[data-drag-scroll]').forEach((rail) => {
    let active = false;
    let originX = 0;
    let originScroll = 0;

    const stop = () => {
      active = false;
      rail.removeAttribute('data-dragging');
    };

    rail.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch') return;
      event.preventDefault();
      active = true;
      originX = event.clientX;
      originScroll = rail.scrollLeft;
      rail.setPointerCapture?.(event.pointerId);
      rail.setAttribute('data-dragging', 'true');
    });

    rail.addEventListener('pointermove', (event) => {
      if (!active) return;
      rail.scrollLeft = originScroll - (event.clientX - originX) * 1.15;
    });

    rail.addEventListener('pointerup', stop);
    rail.addEventListener('pointercancel', stop);
    rail.addEventListener('lostpointercapture', stop);

    rail.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const amount = Math.max(240, rail.clientWidth * 0.7);
      if (event.key === 'ArrowLeft') rail.scrollBy({ left: -amount, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      if (event.key === 'ArrowRight') rail.scrollBy({ left: amount, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      if (event.key === 'Home') rail.scrollTo({ left: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      if (event.key === 'End') rail.scrollTo({ left: rail.scrollWidth, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
  });

  // Collaboration format tabs.
  const tabs = [...document.querySelectorAll('[data-format-tab]')];
  const panels = [...document.querySelectorAll('[data-format-panel]')];

  function activateFormat(name, focus = false) {
    tabs.forEach((tab) => {
      const active = tab.dataset.formatTab === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });

    panels.forEach((panel) => {
      const active = panel.dataset.formatPanel === name;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateFormat(tab.dataset.formatTab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      activateFormat(tabs[next].dataset.formatTab, true);
    });
  });

  if (tabs.length) activateFormat(tabs.find((tab) => tab.classList.contains('is-active'))?.dataset.formatTab || tabs[0].dataset.formatTab);

  // Placeholder CTAs: explicit state instead of invented contact details.
  const toast = document.querySelector('[data-toast]');
  const toastMessage = toast?.textContent?.trim() || 'Контактная ссылка будет подключена после утверждения.';
  if (toast) toast.textContent = '';
  let toastTimer;

  document.querySelectorAll('[data-placeholder-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      document.querySelector('#contact-hook')?.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
      if (!toast) return;
      clearTimeout(toastTimer);
      toast.textContent = toastMessage;
      toast.classList.add('is-visible');
      toastTimer = window.setTimeout(() => {
        toast.classList.remove('is-visible');
        toast.textContent = '';
      }, 2600);
    });
  });

  // Cursor glow is cosmetic. Update only when the pointer moves instead of running a permanent animation loop.
  const cursorGlow = document.querySelector('.cursor-glow');
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (cursorGlow && finePointer && !reduceMotion.matches) {
    let glowFrame = 0;
    let pointerX = -400;
    let pointerY = -400;

    window.addEventListener('pointermove', (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (glowFrame) return;
      glowFrame = requestAnimationFrame(() => {
        cursorGlow.style.transform = `translate3d(${pointerX - 160}px, ${pointerY - 160}px, 0)`;
        glowFrame = 0;
      });
    }, { passive: true });
  } else if (cursorGlow) {
    cursorGlow.hidden = true;
  }

  const horizontalSection = document.querySelector('[data-horizontal-section]');
  const horizontalTrack = document.querySelector('[data-horizontal-track]');
  const horizontalProgress = document.querySelector('[data-horizontal-progress]');
  const roadmap = document.querySelector('[data-roadmap]');
  const roadFill = document.querySelector('[data-road-fill]');
  const parallaxItems = [...document.querySelectorAll('[data-parallax]')];
  let framePending = false;

  function updateHorizontalCases() {
    if (!horizontalSection || !horizontalTrack || reduceMotion.matches || !desktopCases.matches) {
      if (horizontalTrack) horizontalTrack.style.transform = '';
      if (horizontalProgress) horizontalProgress.style.width = '';
      return;
    }

    const rect = horizontalSection.getBoundingClientRect();
    const scrollable = Math.max(1, horizontalSection.offsetHeight - window.innerHeight);
    const progress = clamp(-rect.top / scrollable);
    const maxX = Math.max(0, horizontalTrack.scrollWidth - window.innerWidth);
    horizontalTrack.style.transform = `translate3d(${-maxX * progress}px, 0, 0)`;
    if (horizontalProgress) horizontalProgress.style.width = `${progress * 100}%`;
  }

  function updateRoadmap() {
    if (!roadmap || !roadFill) return;
    const rect = roadmap.getBoundingClientRect();
    const start = window.innerHeight * 0.58;
    const total = Math.max(1, rect.height - window.innerHeight * 0.62);
    const progress = clamp((start - rect.top) / total);
    roadFill.style.height = `${progress * 100}%`;
  }

  function updateParallax() {
    if (reduceMotion.matches || !parallaxViewport.matches) {
      parallaxItems.forEach((item) => { item.style.transform = ''; });
      return;
    }

    parallaxItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.bottom < -120 || rect.top > window.innerHeight + 120) return;
      const speed = Number(item.dataset.parallax || 0);
      const centerDelta = (window.innerHeight * 0.5) - (rect.top + rect.height * 0.5);
      const offset = Math.max(-64, Math.min(64, centerDelta * speed));
      item.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  }

  function renderScrollEffects() {
    updateHorizontalCases();
    updateRoadmap();
    updateParallax();
    framePending = false;
  }

  function requestEffects() {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(renderScrollEffects);
  }

  window.addEventListener('scroll', requestEffects, { passive: true });
  window.addEventListener('resize', requestEffects, { passive: true });
  desktopCases.addEventListener?.('change', requestEffects);
  parallaxViewport.addEventListener?.('change', requestEffects);
  reduceMotion.addEventListener?.('change', () => {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
    requestEffects();
  });
  requestEffects();

  // Prevent accidental empty-hash jumps; all navigation targets above are concrete anchors.
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href="#"]');
    if (anchor) event.preventDefault();
  });
})();
