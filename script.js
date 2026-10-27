// ── Star background ──
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

function animateStars() {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#ffffff';
  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
    star.y += star.s;
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

// ── Custom smooth scroll (works even if Windows animations are off) ──
let scrollAnimId = null;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY, duration = 900) {
  if (scrollAnimId) cancelAnimationFrame(scrollAnimId);

  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  targetY = Math.max(0, Math.min(targetY, maxY));

  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 2) return;

  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));
    if (progress < 1) {
      scrollAnimId = requestAnimationFrame(step);
    } else {
      scrollAnimId = null;
    }
  }
  scrollAnimId = requestAnimationFrame(step);
}

// Stop the animation if the user scrolls manually
['wheel', 'touchstart', 'keydown'].forEach(evt => {
  window.addEventListener(evt, () => {
    if (scrollAnimId) {
      cancelAnimationFrame(scrollAnimId);
      scrollAnimId = null;
    }
  }, { passive: true });
});

function scrollToTarget(targetId) {
  if (targetId === 'home') {
    smoothScrollTo(0);
    return;
  }
  const target = document.getElementById(targetId);
  if (!target) return;
  const navbarHeight = navEl.offsetHeight;
  const y = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 10;
  smoothScrollTo(y);
}

navLinks.forEach(link => {
  const href = link.getAttribute('href');
  if (!href.startsWith('#')) return;
  link.addEventListener('click', e => {
    e.preventDefault();
    scrollToTarget(href.substring(1));
    if (navLinksContainer) navLinksContainer.classList.remove('open');
  });
});

// "Need help? Let's talk" button
document.querySelectorAll('.cta-btn[href^="#"]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    scrollToTarget(btn.getAttribute('href').substring(1));
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
  // At the very bottom of the page, highlight the last section
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5) {
    currentId = 'contact';
  }
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
  backToTop.addEventListener('click', () => scrollToTarget('home'));
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

// ── Glitch text effect ──
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
