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

// ── Hero photo: use the transparent cutout, or fall back to the normal photo ──
const heroImg = document.getElementById('hero-photo');
if (heroImg) {
  heroImg.addEventListener('error', () => {
    if (heroImg.dataset.fallback) return; // avoid a loop
    heroImg.dataset.fallback = '1';
    heroImg.src = 'img/my picture.jpg';
    heroImg.parentElement.classList.add('no-cutout');
  });
}

// ── Reveal on scroll ──
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('active');
  });
}, { threshold: 0.2 });
reveals.forEach(r => revealObserver.observe(r));

// ── Navigation elements ──
const navEl = document.querySelector('nav');
const navAnchors = document.querySelectorAll('nav a[href^="#"]');
const navLinks = document.querySelectorAll('.nav-links a');
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
  const navbarHeight = navEl.offsetHeight + 16;
  const y = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 10;
  smoothScrollTo(y);
}

// Every in-page link: navbar, "Let's Talk", hero and contact buttons
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    scrollToTarget(link.getAttribute('href').substring(1));
    if (navLinksContainer) navLinksContainer.classList.remove('open');
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
  const navbarHeight = navEl.offsetHeight + 40;
  let currentId = 'home';
  sections.forEach(section => {
    const top = section.getBoundingClientRect().top;
    if (top - navbarHeight <= 0) {
      currentId = section.getAttribute('id');
    }
  });
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
