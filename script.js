// ── Star background (with warp speed for page transitions) ──
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let w, h;
function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const stars = Array.from({ length: 200 }, () => ({
  x: Math.random() * w,
  y: Math.random() * h,
  r: Math.random() * 1.5,
  s: Math.random() * 0.5 + 0.2
}));

let warp = 1;        // current speed multiplier
let warpTarget = 1;  // speed we are easing toward

function animateStars() {
  ctx.clearRect(0, 0, w, h);
  warp += (warpTarget - warp) * 0.08;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';

  stars.forEach(star => {
    if (warp > 1.5) {
      // Warp mode: draw stretched streaks
      ctx.lineWidth = Math.max(star.r, 0.6);
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(star.x, star.y - star.s * warp * 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    star.y += star.s * warp;
    if (star.y > h) star.y = 0;
  });
  requestAnimationFrame(animateStars);
}
animateStars();

// ── Reveal on scroll ──
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('active');
  });
}, { threshold: 0.2 });
reveals.forEach(r => revealObserver.observe(r));

// ── Media box video hover ──
window.addEventListener('DOMContentLoaded', () => {
  const mediaBox = document.querySelector('.media-box');
  if (mediaBox) {
    const video = mediaBox.querySelector('video');
    mediaBox.addEventListener('mouseenter', () => video.play());
    mediaBox.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  }
});

// ── Navigation elements ──
const navEl = document.querySelector('nav');
const navLinks = document.querySelectorAll('nav a');
const navLinksContainer = document.querySelector('.nav-links');
const navToggle = document.querySelector('.nav-toggle');

function getTargetPosition(targetId) {
  if (targetId === 'home') return 0;
  const target = document.getElementById(targetId);
  if (!target) return null;
  const navbarHeight = navEl.offsetHeight;
  return target.getBoundingClientRect().top + window.scrollY - navbarHeight - 10;
}

// Normal smooth scroll (used as a fallback)
function scrollToTarget(targetId) {
  const pos = getTargetPosition(targetId);
  if (pos === null) return;
  window.scrollTo({ top: pos, behavior: 'smooth' });
}

// ── Cool page transition ──
const overlay = document.getElementById('page-transition');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let transitioning = false;

function transitionTo(targetId, originX, originY) {
  if (transitioning) return;

  // No overlay or reduced motion: just scroll normally
  if (!overlay || prefersReducedMotion) {
    scrollToTarget(targetId);
    return;
  }

  const pos = getTargetPosition(targetId);
  if (pos === null) return;

  transitioning = true;

  // 1) Circle expands from the click position + stars warp
  overlay.style.setProperty('--x', originX + 'px');
  overlay.style.setProperty('--y', originY + 'px');
  overlay.classList.remove('leaving');
  overlay.classList.add('covering');
  warpTarget = 25;

  // 2) Screen is covered: jump to the section and fade the overlay out
  setTimeout(() => {
    window.scrollTo({ top: pos, behavior: 'instant' });
    warpTarget = 1;

    const section = document.getElementById(targetId);
    if (section) {
      section.classList.remove('section-enter');
      void section.offsetWidth; // restart the animation
      section.classList.add('section-enter');
      setTimeout(() => section.classList.remove('section-enter'), 1000);
    }

    overlay.classList.add('leaving');
  }, 600);

  // 3) Reset the overlay quietly so it is ready for next time
  setTimeout(() => {
    overlay.style.transition = 'none';
    overlay.classList.remove('covering', 'leaving');
    void overlay.offsetWidth;
    overlay.style.transition = '';
    transitioning = false;
  }, 1300);
}

navLinks.forEach(link => {
  const href = link.getAttribute('href');
  if (!href.startsWith('#')) return; // let normal links navigate as usual
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = href.substring(1);
    transitionTo(targetId, e.clientX, e.clientY);
    if (navLinksContainer) navLinksContainer.classList.remove('open');
  });
});

// The "Need help? Let's talk" button also gets the transition
document.querySelectorAll('.cta-btn[href^="#"]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    transitionTo(btn.getAttribute('href').substring(1), e.clientX, e.clientY);
  });
});

// ── Mobile nav toggle ──
if (navToggle && navLinksContainer) {
  navToggle.addEventListener('click', () => {
    navLinksContainer.classList.toggle('open');
    navToggle.classList.toggle('open');
  });
}

// ── Scroll progress bar ──
const progressBar = document.getElementById('scroll-progress');
function updateProgressBar() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = percent + '%';
}

// ── Active nav link highlighting ──
const sections = document.querySelectorAll('section, header[id]');
function updateActiveLink() {
  const navbarHeight = navEl.offsetHeight + 20;
  let currentId = 'home';
  sections.forEach(section => {
    const top = section.getBoundingClientRect().top;
    if (top - navbarHeight <= 0) {
      currentId = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
  });
}

// ── Back to top button ──
const backToTop = document.getElementById('back-to-top');
function updateBackToTop() {
  if (!backToTop) return;
  if (window.scrollY > 400) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
}
if (backToTop) {
  backToTop.addEventListener('click', e => transitionTo('home', e.clientX, e.clientY));
}

window.addEventListener('scroll', () => {
  updateProgressBar();
  updateActiveLink();
  updateBackToTop();
});
updateProgressBar();
updateActiveLink();
updateBackToTop();

// ── Typing effect for name ──
window.addEventListener('DOMContentLoaded', () => {
  const nameEl = document.getElementById('typed-name');
  if (!nameEl) return;
  const fullText = nameEl.textContent.trim();
  nameEl.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  cursor.innerHTML = '&nbsp;';
  nameEl.after(cursor);

  let i = 0;
  function typeChar() {
    if (i < fullText.length) {
      nameEl.textContent += fullText.charAt(i);
      i++;
      setTimeout(typeChar, 90);
    }
  }
  typeChar();
});

// ── Glitch text effect (Solana-style periodic burst) ──
window.addEventListener('DOMContentLoaded', () => {
  const glitchEls = document.querySelectorAll('.glitch');
  glitchEls.forEach(el => {
    function burst() {
      el.classList.add('glitch-active');
      setTimeout(() => el.classList.remove('glitch-active'), 220);
      setTimeout(burst, 2500 + Math.random() * 4000);
    }
    setTimeout(burst, 1200 + Math.random() * 2000);
  });
});
