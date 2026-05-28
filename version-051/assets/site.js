
(function () {
  function by(sel, root) { return (root || document).querySelector(sel); }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function setupMobileMenu() {
    var btn = by('[data-menu-toggle]');
    var menu = by('[data-nav-menu]');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () {
      menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
    });
    all('[data-nav-menu] a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function setupFilterBars() {
    all('[data-filter-root]').forEach(function (root) {
      var input = by('[data-filter-input]', root);
      var clear = by('[data-filter-clear]', root);
      var items = all('[data-filter-item]', root);
      if (!input || !items.length) return;

      function applyFilter() {
        var q = (input.value || '').trim().toLowerCase();
        items.forEach(function (item) {
          var text = (item.getAttribute('data-search') || '').toLowerCase();
          var ok = !q || text.indexOf(q) !== -1;
          item.classList.toggle('hidden', !ok);
        });
      }
      input.addEventListener('input', applyFilter);
      if (clear) clear.addEventListener('click', function () { input.value = ''; applyFilter(); input.focus(); });
      applyFilter();
    });
  }

  function setupHeroCarousel() {
    var carousel = by('[data-hero-carousel]');
    if (!carousel) return;
    var slides = all('[data-hero-slide]', carousel);
    var dots = all('[data-hero-dot]', carousel);
    if (!slides.length) return;
    var index = 0;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (slide, idx) { slide.classList.toggle('active', idx === index); });
      dots.forEach(function (dot, idx) { dot.classList.toggle('active', idx === index); });
    }
    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () { show(idx); });
    });
    show(0);
    setInterval(function () { show(index + 1); }, 6000);
  }

  function setupJumpToTarget() {
    all('[data-jump]').forEach(function (node) {
      node.addEventListener('click', function () {
        var target = by(node.getAttribute('data-jump'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupFilterBars();
    setupHeroCarousel();
    setupJumpToTarget();
  });
})();
