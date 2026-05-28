(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupImages() {
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('image-missing');
      });
    });
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.hidden = !menu.hidden;
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    });
    if (index < 0) {
      index = 0;
    }

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10));
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }
    window.setInterval(function () {
      show(index + 1);
    }, 6500);
  }

  function setupFilters() {
    document.querySelectorAll('[data-filter-section]').forEach(function (section) {
      var input = section.querySelector('[data-filter-input]');
      if (!input) {
        return;
      }
      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        section.querySelectorAll('[data-movie-card]').forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-category'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' ').toLowerCase();
          card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
        });
      });
    });
  }

  function createSearchCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card" data-movie-card>',
      '  <a class="poster-link" href="' + escapeHtml(item.url) + '">',
      '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="card-gradient"></span>',
      '    <span class="card-type">' + escapeHtml(item.type) + '</span>',
      '    <span class="card-year">' + escapeHtml(item.year) + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <a href="' + escapeHtml(item.url) + '" class="card-title">' + escapeHtml(item.title) + '</a>',
      '    <p>' + escapeHtml(item.oneLine) + '</p>',
      '    <div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.category) + '</span></div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearchPage() {
    var results = document.getElementById('search-results');
    var input = document.getElementById('search-page-input');
    if (!results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
    }
    var normalized = query.trim().toLowerCase();
    var list = window.SEARCH_INDEX;
    if (normalized) {
      list = list.filter(function (item) {
        return [item.title, item.year, item.region, item.type, item.category, item.genre, (item.tags || []).join(' '), item.oneLine]
          .join(' ')
          .toLowerCase()
          .indexOf(normalized) !== -1;
      });
    }
    results.innerHTML = list.slice(0, 240).map(createSearchCard).join('');
    setupImages();
  }

  ready(function () {
    setupImages();
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
