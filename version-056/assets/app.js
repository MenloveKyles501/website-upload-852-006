(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var siteNav = document.querySelector('[data-site-nav]');

  if (menuButton && siteNav) {
    menuButton.addEventListener('click', function () {
      siteNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    restart();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  var cardGrid = document.querySelector('[data-card-grid]');

  if (filterPanel && cardGrid) {
    var keywordInput = filterPanel.querySelector('[data-filter-keyword]');
    var regionSelect = filterPanel.querySelector('[data-filter-region]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var emptyState = document.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(cardGrid.querySelectorAll('[data-card]'));

    function fillSelect(select, values) {
      if (!select) {
        return;
      }

      values.sort(function (a, b) {
        return String(b).localeCompare(String(a), 'zh-Hans-CN');
      });

      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    function uniqueValues(name) {
      var map = Object.create(null);

      cards.forEach(function (card) {
        var value = card.getAttribute(name) || '';
        if (value) {
          map[value] = true;
        }
      });

      return Object.keys(map);
    }

    fillSelect(regionSelect, uniqueValues('data-region'));
    fillSelect(typeSelect, uniqueValues('data-type'));
    fillSelect(yearSelect, uniqueValues('data-year'));

    function applyFilters() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();

        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (region && card.getAttribute('data-region') !== region) {
          matched = false;
        }

        if (type && card.getAttribute('data-type') !== type) {
          matched = false;
        }

        if (year && card.getAttribute('data-year') !== year) {
          matched = false;
        }

        card.hidden = !matched;

        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    }

    [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  }
})();
