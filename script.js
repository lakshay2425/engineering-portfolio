(() => {
  'use strict';

  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.getElementById('site-nav');
  const progressBar = document.getElementById('progress-bar');

  /* Mobile menu */
  const setMenu = (open) => {
    menuToggle.setAttribute('aria-expanded', String(open));
    siteNav.classList.toggle('is-open', open);
  };

  menuToggle?.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  siteNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && siteNav?.classList.contains('is-open')) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  /* Scroll progress, throttled to one update per frame */
  let ticking = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });
  updateProgress();

  /* Highlight the nav link for the section in view */
  const navLinks = new Map();
  siteNav?.querySelectorAll('a[href^="#"]').forEach((link) => {
    navLinks.set(link.getAttribute('href').slice(1), link);
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = navLinks.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((other) => other.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    navLinks.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section && section.tagName === 'SECTION') observer.observe(section);
    });
  }

  /* Lightbox for supplied images and diagrams */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxKicker = document.getElementById('lightbox-kicker');
  const closeButton = lightbox?.querySelector('.lightbox-close');
  let lastTrigger = null;

  const openLightbox = (trigger) => {
    lastTrigger = trigger;
    const title = trigger.dataset.title || '';
    lightboxTitle.textContent = title;
    lightboxKicker.textContent = title.startsWith('Architecture') ? 'Architecture' : 'Figure';
    lightboxImg.src = trigger.dataset.src;
    lightboxImg.alt = trigger.dataset.alt || title;

    if (typeof lightbox.showModal === 'function') {
      lightbox.showModal();
    } else {
      lightbox.setAttribute('open', '');
    }
    closeButton?.focus();
  };

  const closeLightbox = () => {
    if (typeof lightbox.close === 'function') {
      lightbox.close();
    } else {
      lightbox.removeAttribute('open');
    }
  };

  document.querySelectorAll('[data-lightbox]').forEach((trigger) => {
    trigger.addEventListener('click', () => openLightbox(trigger));
  });

  closeButton?.addEventListener('click', closeLightbox);

  // Clicking the backdrop (the dialog element itself, not its contents) closes it.
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  lightbox?.addEventListener('close', () => {
    lightboxImg.removeAttribute('src');
    lightboxImg.alt = '';
    lastTrigger?.focus();
  });
})();
