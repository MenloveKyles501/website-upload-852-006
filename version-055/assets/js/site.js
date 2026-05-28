(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('is-open');
    });
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var empty = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(filterInput && filterInput.value);
    var year = normalize(yearFilter && yearFilter.value);
    var type = normalize(typeFilter && typeFilter.value);
    var shown = 0;

    cards.forEach(function (card) {
      var text = normalize(card.innerText);
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardType = normalize(card.getAttribute('data-type'));
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchYear = !year || cardYear === year;
      var matchType = !type || cardType === type;
      var visible = matchKeyword && matchYear && matchType;

      card.classList.toggle('hidden-by-filter', !visible);
      if (visible) {
        shown += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', shown === 0);
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilters);
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', applyFilters);
  }

  var searchInput = document.querySelector('[data-search-input]');
  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var value = params.get('q') || '';
    searchInput.value = value;
    if (filterInput) {
      filterInput.value = value;
      applyFilters();
    }
  }
})();
