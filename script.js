// ── Star background (with warp effect) ──
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let w, h;
function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const starColors = ['#ffffff', '#ffffff', '#8be9fd', '#bd93f9'];

const stars = Array.from({ length: 200 }, () => ({
  x: Math.random() * w,
  y: Math.random() * h,
  r: Math.random() * 1.5,
  s: Math.random() * 0.5 + 0.2,
  c: starColors[Math.floor(Math.random() * starColors.length)]
}));

// warp > 0 = flying down the page (stars rush up)
// warp < 0 = flying up the page (stars rush down)
let warp = 0;
let warpTarget = 0;

function animateStars() {
  ctx.clearRect(0, 0, w, h);
  warp += (warpTarget - warp) * 0.12;
  if (Math.abs(warp) < 0.01 && warpTarget === 0) warp = 0;

  const warping = Math.abs(warp) > 0.04;
  ctx.lineCap = 'round';

  stars.forEach(star => {
    // Normal drift plus warp speed (bigger/faster stars feel closer)
    const vy = star.s - warp * (6 + star.s * 45);

    if (warping) {
      const tail = vy * 2.6;
      ctx.globalAlpha = Math.min(1, 0.35 + Math.abs(warp) * 0.65);
      ctx.strokeStyle = star.c;
      ctx.lineWidth = Math.max(star.r * 0.9, 0.7);
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(star.x, star.y - tail);
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }

    star.y += vy;
    if (star.y > h) { star.y = 0; if (warping) star.x = Math.random() * w; }
    if (star.y < 0) { star.y = h; if (warping) star.x = Math.random() * w; }
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

// ── Custom smooth scroll + star warp ──
let scrollAnimId = null;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function stopScrollAnimation() {
  if (scrollAnimId) {
    cancelAnimationFrame(scrollAnimId);
    scrollAnimId = null;
  }
  warpTarget = 0;
}

function smoothScrollTo(targetY, duration = 1100) {
  if (scrollAnimId) cancelAnimationFrame(scrollAnimId);

  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  targetY = Math.max(0, Math.min(targetY, maxY));

  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 2) { warpTarget = 0; return; }

  const direction = distance > 0 ? 1 : -1;
  // Longer scrolls get a stronger warp
  const strength = Math.min(1, 0.45 + Math.abs(distance) / 1500);
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));

    // Warp builds up, peaks in the middle, then fades out
    warpTarget = direction * strength * Math.sin(Math.PI * progress);

    if (progress < 1) {
      scrollAnimId = requestAnimationFrame(step);
    } else {
      scrollAnimId = null;
      warpTarget = 0;
    }
  }
  scrollAnimId = requestAnimationFrame(step);
}

// Stop the animation if the user scrolls manually
['wheel', 'touchstart', 'keydown'].forEach(evt => {
  window.addEventListener(evt, () => {
    if (scrollAnimId) stopScrollAnimation();
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
