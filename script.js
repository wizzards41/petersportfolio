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

const stars = Array.from({ length: 250 }, () => ({ /* More stars */
  x: Math.random() * w,
  y: Math.random() * h,
  r: Math.random() * 1.8, /* Slightly larger stars */
  s: Math.random() * 0.7 + 0.3, /* Faster stars */
  a: Math.random() * 0.7 + 0.3 /* Initial opacity */
}));

function animateStars() {
  ctx.clearRect(0, 0, w, h);
  stars.forEach(star => {
    ctx.fillStyle = `rgba(255, 255, 255, ${star.a})`; /* Use star's opacity */
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
    star.y += star.s;
    if (star.y > h) {
      star.y = 0;
      star.x = Math.random() * w; /* Reset x as well */
    }
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

// ── Media box video hover ── (No media-box in provided HTML, but keeping for completeness)
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

// ── Smooth scroll accounting for navbar height ──
const navEl = document.querySelector('nav');
const navLinks = document.querySelectorAll('nav a');
const navLinksContainer = document.querySelector('.nav-links');
const navToggle = document.querySelector('.nav-toggle');

function scrollToTarget(targetId) {
  const navbarHeight = navEl.offsetHeight;
  let targetPosition;
  if (targetId === 'home') {
    targetPosition = 0;
  } else {
    const target = document.getElementById(targetId);
    if (!target) return;
    targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 10;
  }
  window.scrollTo({ top: targetPosition, behavior: 'smooth' });
}

navLinks.forEach(link => {
  const href = link.getAttribute('href');
  if (!href.startsWith('#')) return;
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = href.substring(1);
    scrollToTarget(targetId);
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

// ── Contact form feedback (no backend — opens mail client) ──
window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();

    if (!name || !email || !message) {
      status.textContent = 'Please fill in every field before sending.';
      return;
    }

    const subject = encodeURIComponent(`Galactic Transmission from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— Starfleet Agent ${name} (${email})`);
    window.location.href = `mailto:commander.caitona@galactic.com?subject=${subject}&body=${body}`;

    status.textContent = 'Initiating quantum relay to send transmission...';
    form.reset();
  });
});


// Cosmic dust effect for skill cards
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  });
});
