(() => {
  const params = new URLSearchParams(location.search);
  const qaMode = params.get('qa') === '1';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || qaMode;
  const root = document.documentElement;

  if (qaMode) {
    root.style.scrollBehavior = 'auto';
    document.body.dataset.qa = 'true';
  }

  document.body.classList.add('js-enhanced');

  // Global scroll progress.
  const progress = document.createElement('div');
  progress.className = 'experience-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<i></i>';
  document.body.appendChild(progress);

  // Subtle pointer light on desktop.
  if (!reduce && window.matchMedia('(pointer:fine)').matches) {
    const cursor = document.createElement('div');
    cursor.className = 'experience-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);
    let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty;
    addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive:true });
    const loop = () => {
      cx += (tx - cx) * .09;
      cy += (ty - cy) * .09;
      cursor.style.left = `${cx}px`;
      cursor.style.top = `${cy}px`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  const sections = [...document.querySelectorAll('section.sec, section.full, section[id]')]
    .filter((node, index, arr) => arr.indexOf(node) === index);

  const labels = [
    'Старт','Диагностика','Система','Возможность','Трансформация','Стратегия',
    'Бренд','Упаковка','Digital','Контент','Creators','Продажи','Roadmap','Инвестиции','KPI','Сценарии','Кейсы','Следующий шаг'
  ];

  const chapter = document.createElement('div');
  chapter.className = 'experience-chapter';
  chapter.setAttribute('aria-hidden', 'true');
  chapter.innerHTML = '<span>01 / 18</span><b>Старт</b>';
  document.body.appendChild(chapter);

  const chapterIndex = (section) => Math.max(0, sections.indexOf(section));
  const updateChapter = (section) => {
    const idx = chapterIndex(section);
    const total = Math.max(sections.length, 1);
    const displayTotal = String(total).padStart(2, '0');
    const displayIndex = String(idx + 1).padStart(2, '0');
    chapter.querySelector('span').textContent = `${displayIndex} / ${displayTotal}`;
    chapter.querySelector('b').textContent = labels[idx] || section.querySelector('.ey')?.textContent?.trim() || 'Zetgen-84';
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('stage-in');
    });
  }, { threshold:.08, rootMargin:'0px 0px -8% 0px' });
  sections.forEach((section) => revealObserver.observe(section));

  const chapterObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) updateChapter(visible.target);
  }, { threshold:[.18,.35,.6], rootMargin:'-18% 0px -45% 0px' });
  sections.forEach((section) => chapterObserver.observe(section));

  let ticking = false;
  const updateProgress = () => {
    const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
    root.style.setProperty('--experience-progress', Math.min(1, Math.max(0, scrollY / max)).toFixed(4));
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive:true });
  updateProgress();

  // Deterministic hash positioning for runner screenshots only.
  if (qaMode && location.hash) {
    const target = document.querySelector(location.hash);
    if (target) {
      const place = () => {
        target.scrollIntoView({ block:'start', behavior:'auto' });
        updateChapter(target);
        updateProgress();
      };
      place();
      requestAnimationFrame(place);
      setTimeout(place, 80);
      setTimeout(place, 350);
    }
  }

  // Give the hero core a restrained spatial response without touching layout.
  const orb = document.querySelector('.orb');
  const orbBox = document.querySelector('.orbbox');
  if (orb && orbBox && !reduce && matchMedia('(pointer:fine)').matches) {
    orbBox.addEventListener('pointermove', (e) => {
      const r = orbBox.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - .5) * 12;
      const y = ((e.clientY - r.top) / r.height - .5) * -10;
      orb.style.transform = `rotateY(${x}deg) rotateX(${y}deg) translateZ(8px)`;
    }, { passive:true });
    orbBox.addEventListener('pointerleave', () => { orb.style.transform = ''; });
  }

  // Premium micro-interaction for primary CTAs.
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.btn.primary').forEach((button) => {
      button.addEventListener('pointermove', (e) => {
        const r = button.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width/2) * .08;
        const y = (e.clientY - r.top - r.height/2) * .12;
        button.style.transform = `translate(${x}px, ${y}px)`;
      });
      button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    });
  }

  // Make horizontal narrative strips work with a trackpad/wheel on desktop.
  document.querySelectorAll('.scroll, .road, .pipeline').forEach((scroller) => {
    if (scroller.scrollWidth <= scroller.clientWidth) return;
    scroller.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const atStart = scroller.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = Math.ceil(scroller.scrollLeft + scroller.clientWidth) >= scroller.scrollWidth && e.deltaY > 0;
      if (atStart || atEnd) return;
      e.preventDefault();
      scroller.scrollLeft += e.deltaY * .72;
    }, { passive:false });
  });

  // Improve tab semantics without overriding the existing tab logic.
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.setAttribute('role', 'button');
    if (!tab.hasAttribute('tabindex')) tab.tabIndex = 0;
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tab.click(); }
    });
  });
})();
