/* ============================================
   GIOCO DI COLORI — Main JavaScript (v3)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const hero = document.querySelector('.hero');

  // ---- Intersection Observer for scroll animations ----
  const animElements = document.querySelectorAll('.anim-up, .anim-split');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  animElements.forEach(el => observer.observe(el));

  // ---- Nav scroll state ----
  const nav = document.getElementById('nav');

  const updateNav = () => {
    const scrollY = window.scrollY;
    const heroBottom = hero.offsetHeight - 100;

    if (scrollY > heroBottom) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }

    if (scrollY > 50) {
      hero.classList.add('hero--scrolled');
    } else {
      hero.classList.remove('hero--scrolled');
    }
  };

  updateNav();

  // ---- Nav scroll-spy (active section indicator) ----
  const navLinksEls = document.querySelectorAll('.nav__links a[href^="#"]');
  const sections = [];

  navLinksEls.forEach(link => {
    const id = link.getAttribute('href').slice(1);
    const section = document.getElementById(id);
    if (section) sections.push({ el: section, link });
  });

  const updateActiveNav = () => {
    const scrollY = window.scrollY + 120;

    let current = null;
    for (const { el, link } of sections) {
      if (el.offsetTop <= scrollY) {
        current = link;
      }
    }

    navLinksEls.forEach(l => l.classList.remove('is-active'));
    if (current) current.classList.add('is-active');
  };

  updateActiveNav();

  // ---- Mobile nav toggle ----
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isOpen);
      navLinks.classList.toggle('nav__links--open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('nav__links--open');
      });
    });
  }

  // ---- AR auto-advancing carousel ----
  const arCarousel = document.getElementById('ar-carousel');
  if (arCarousel) {
    const slides = arCarousel.querySelectorAll('.ar-carousel__slide');
    const dots = arCarousel.querySelectorAll('.ar-carousel__dot');
    const prevBtn = arCarousel.querySelector('.ar-carousel__arrow--prev');
    const nextBtn = arCarousel.querySelector('.ar-carousel__arrow--next');
    const viewport = arCarousel.querySelector('.ar-carousel__viewport');
    const progress = arCarousel.querySelector('.ar-carousel__progress');
    const DURATION = 5000;
    let current = 0;
    let timer;
    let timerStart = 0;
    let remaining = DURATION;

    const resetProgress = () => {
      progress.style.animation = 'none';
      progress.offsetHeight;
      progress.style.animation = '';
    };

    const goTo = (index) => {
      slides[current].classList.remove('ar-carousel__slide--active');
      dots[current].classList.remove('ar-carousel__dot--active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('ar-carousel__slide--active');
      dots[current].classList.add('ar-carousel__dot--active');
    };

    const scheduleNext = (delay) => {
      clearTimeout(timer);
      remaining = delay;
      timerStart = Date.now();
      arCarousel.classList.remove('ar-carousel--paused');
      if (delay === DURATION) resetProgress();
      timer = setTimeout(() => {
        goTo(current + 1);
        scheduleNext(DURATION);
      }, delay);
    };

    const pauseAuto = () => {
      clearTimeout(timer);
      remaining -= (Date.now() - timerStart);
      arCarousel.classList.add('ar-carousel--paused');
    };

    const resumeAuto = () => {
      arCarousel.classList.remove('ar-carousel--paused');
      timerStart = Date.now();
      timer = setTimeout(() => {
        goTo(current + 1);
        scheduleNext(DURATION);
      }, remaining);
    };

    prevBtn.addEventListener('click', () => { goTo(current - 1); scheduleNext(DURATION); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); scheduleNext(DURATION); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); scheduleNext(DURATION); }));

    viewport.addEventListener('mouseenter', pauseAuto);
    viewport.addEventListener('mouseleave', resumeAuto);

    scheduleNext(DURATION);
  }

  // ---- Carousel with dots (Campagna) ----
  const carousel = document.getElementById('carousel');
  if (carousel) {
    const track = carousel.querySelector('.carousel__track');
    const prevBtn = carousel.querySelector('.carousel__btn--prev');
    const nextBtn = carousel.querySelector('.carousel__btn--next');
    const slides = track.querySelectorAll('.carousel__slide');
    const controls = carousel.querySelector('.carousel__controls');

    // Create page-based dots (1 dot per scroll position)
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel__dots';

    const buildDots = () => {
      while (dotsContainer.firstChild) dotsContainer.removeChild(dotsContainer.firstChild);
      const slideWidth = slides[0].offsetWidth + 20;
      const visibleSlides = Math.round(track.clientWidth / slideWidth);
      const dotCount = Math.max(slides.length - visibleSlides + 1, 1);

      for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel__dot' + (i === 0 ? ' carousel__dot--active' : '');
        dot.setAttribute('aria-label', `Pagina ${i + 1}`);
        dot.addEventListener('click', () => {
          const sw = slides[0].offsetWidth + 20;
          track.scrollTo({ left: sw * i, behavior: 'smooth' });
        });
        dotsContainer.appendChild(dot);
      }
    };

    buildDots();
    window.addEventListener('resize', buildDots);

    // Insert dots between prev and next buttons
    controls.insertBefore(dotsContainer, nextBtn);

    // Update active dot on scroll
    const updateDots = () => {
      const slideWidth = slides[0].offsetWidth + 20;
      const activeIndex = Math.round(track.scrollLeft / slideWidth);
      const dots = dotsContainer.querySelectorAll('.carousel__dot');

      dots.forEach((dot, i) => {
        dot.classList.toggle('carousel__dot--active', i === activeIndex);
      });
    };

    track.addEventListener('scroll', updateDots, { passive: true });

    const getSlideWidth = () => {
      const slide = track.querySelector('.carousel__slide');
      return slide ? slide.offsetWidth + 20 : 0;
    };

    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -getSlideWidth(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: getSlideWidth(), behavior: 'smooth' });
    });
  }

  // ---- Booking form with fade transition ----
  const form = document.getElementById('booking-form');
  const formSuccess = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const fields = form.querySelector('.cta__fields');
      const btn = form.querySelector('.btn');

      // Fade out
      fields.style.transition = 'opacity 400ms ease';
      btn.style.transition = 'opacity 400ms ease';
      fields.style.opacity = '0';
      btn.style.opacity = '0';

      setTimeout(() => {
        fields.style.display = 'none';
        btn.style.display = 'none';
        formSuccess.hidden = false;
      }, 400);
    });
  }

  // ---- Scroll progress bar ----
  const progressBar = document.querySelector('.scroll-progress');
  const updateProgress = () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(scrolled / total, 1);
    progressBar.style.transform = `scaleX(${progress})`;
  };

  // ---- Single consolidated scroll listener ----
  const onScroll = () => {
    updateNav();
    updateActiveNav();
    if (progressBar) updateProgress();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Cursor paint trail (desktop only) ----
  if (window.matchMedia('(pointer: fine)').matches) {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    document.body.appendChild(trail);

    document.addEventListener('mousemove', (e) => {
      trail.style.left = e.clientX + 'px';
      trail.style.top = e.clientY + 'px';
      trail.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
      trail.style.opacity = '0';
    });
  }

});
