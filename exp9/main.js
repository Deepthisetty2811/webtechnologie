/**
 * EasyBuy — main.js
 * Client-side interactivity for the EasyBuy e-commerce site.
 */

// ─── Toast Notification ───────────────────────────────────────────────────────

/**
 * Show a temporary toast message.
 * @param {string} message
 * @param {number} [duration=2400] ms
 */
function showToast(message, duration = 2400) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ─── Cart (client-side mirror using sessionStorage) ───────────────────────────

const CART_KEY = 'easybuy_cart';

function getCart() {
  try {
    return JSON.parse(sessionStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartBadge() {
  const badge = document.querySelector('.cart-count');
  if (badge) {
    const count = getCart().length;
    badge.textContent = count;
    badge.style.display = count === 0 ? 'none' : '';
  }
}

/**
 * Add an item to the client-side cart and give visual feedback.
 * (The real add-to-cart goes through the PHP href; this enhances UX.)
 * @param {string} itemName
 * @param {HTMLElement} [cardEl]
 */
function addToCartUI(itemName, cardEl) {
  const cart = getCart();
  cart.push(itemName);
  saveCart(cart);
  updateCartBadge();
  showToast(`✔ ${itemName} added to cart`);

  if (cardEl) {
    cardEl.classList.add('added');
    setTimeout(() => cardEl.classList.remove('added'), 600);
  }
}

// ─── Intercept "Add to Cart" clicks for instant feedback ─────────────────────

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href*="add="]');
  if (!link) return;

  const url = new URL(link.href, window.location.href);
  const itemName = url.searchParams.get('add');
  if (!itemName) return;

  const card = link.closest('.product-card') || link.closest('article');
  addToCartUI(itemName, card);
  // Allow the default navigation (PHP session update) to proceed normally.
});

// ─── Contact Form — client-side validation ────────────────────────────────────

function initContactForm() {
  const form = document.querySelector('#contact form, .contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput  = form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[type="email"]');

    const name  = nameInput?.value.trim()  || '';
    const email = emailInput?.value.trim() || '';

    if (!name) {
      showToast('⚠ Please enter your name.');
      nameInput?.focus();
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('⚠ Please enter a valid email.');
      emailInput?.focus();
      return;
    }

    // Simulate submission
    showToast('✉ Message sent! We'll get back to you soon.');
    form.reset();
  });
}

// ─── Cookie Form — welcome message without page reload ───────────────────────

function initCookieForm() {
  const form = document.querySelector('header form[method="POST"], .cookie-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    const nameInput = form.querySelector('input[name="username"]');
    const value = nameInput?.value.trim();
    if (!value) return; // Let the browser / PHP handle empty

    // Set a JS-side cookie for instant welcome message
    document.cookie = `username=${encodeURIComponent(value)};path=/;max-age=3600`;

    // Update welcome paragraph if it exists
    let welcome = document.querySelector('.welcome-msg');
    if (!welcome) {
      welcome = document.createElement('p');
      welcome.className = 'welcome-msg';
      form.insertAdjacentElement('afterend', welcome);
    }
    welcome.textContent = `Welcome, ${value}! 👋`;
    welcome.style.animation = 'none';
    requestAnimationFrame(() => {
      welcome.style.animation = 'fadeIn .4s ease';
    });

    showToast(`👋 Hi, ${value}!`);
  });
}

// ─── Smooth active nav link highlighting ─────────────────────────────────────

function initNavHighlight() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${entry.target.id}`
          );
        });
      });
    },
    { rootMargin: '-30% 0px -60% 0px' }
  );

  sections.forEach((s) => observer.observe(s));
}

// ─── Product cards: staggered entrance animation ──────────────────────────────

function initProductAnimations() {
  const cards = document.querySelectorAll('.product-card, #products article');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = `opacity .45s ease ${i * 0.09}s, transform .45s ease ${i * 0.09}s`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  cards.forEach((card) => observer.observe(card));
}

// ─── Restore cart count from sessionStorage on page load ─────────────────────

function syncCartFromURL() {
  // If the PHP page just added an item via GET, mirror it client-side.
  const params = new URLSearchParams(window.location.search);
  const added = params.get('add');
  if (added) {
    const cart = getCart();
    cart.push(added);
    saveCart(cart);
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  syncCartFromURL();
  updateCartBadge();
  initContactForm();
  initCookieForm();
  initNavHighlight();
  initProductAnimations();
});
