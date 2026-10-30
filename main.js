// Solid navigation bar once the page scrolls past the top of the hero.
(function () {
  var nav = document.querySelector('nav');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


// Dark/light switch. Follows the system setting until the visitor picks one; the choice is remembered.
(function () {
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;
  var root = document.documentElement, media = window.matchMedia('(prefers-color-scheme: dark)');
  try { var saved = localStorage.getItem('theme'); if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved); } catch (e) {}
  function isDark() {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : media.matches;
  }
  function sync() {
    var dark = isDark();
    btn.classList.toggle('is-dark', dark);
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  btn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    sync();
  });
  if (media.addEventListener) media.addEventListener('change', sync);
  sync();
})();

// Older news is hidden until the visitor asks for it.
(function () {
  var btn = document.getElementById('news-toggle'), older = document.getElementById('older-news');
  if (!btn || !older) return;
  btn.addEventListener('click', function () {
    var open = older.hidden;
    older.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Show less' : 'Show older news';
  });
})();

// Each "bib" button shows or hides its BibTeX entry.
(function () {
  document.querySelectorAll('.actions .bib').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pre = btn.nextElementSibling, open = pre.hidden;
      pre.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    });
  });
})();
