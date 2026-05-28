(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function bindMenu() {
    var button = qs('[data-menu-toggle]');
    var menu = qs('[data-nav-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function bindSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function bindHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var next = qs('[data-hero-next]', root);
    var prev = qs('[data-hero-prev]', root);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });
    next && next.addEventListener('click', function () {
      show(index + 1);
      play();
    });
    prev && prev.addEventListener('click', function () {
      show(index - 1);
      play();
    });
    play();
  }

  function bindFilters() {
    var bars = qsa('[data-filter-bar]');
    bars.forEach(function (bar) {
      var container = bar.parentElement;
      var cards = qsa('[data-card]', container);
      var input = qs('[data-filter-input]', bar);
      var year = qs('[data-filter-year]', bar);
      var region = qs('[data-filter-region]', bar);
      var type = qs('[data-filter-type]', bar);
      var empty = qs('[data-no-results]', container);

      function apply() {
        var query = normalize(input && input.value);
        var selectedYear = normalize(year && year.value);
        var selectedRegion = normalize(region && region.value);
        var selectedType = normalize(type && type.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-tags')
          ].join(' '));
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (selectedYear && normalize(card.getAttribute('data-year')) !== selectedYear) {
            ok = false;
          }
          if (selectedRegion && normalize(card.getAttribute('data-region')) !== selectedRegion) {
            ok = false;
          }
          if (selectedType && normalize(card.getAttribute('data-type')) !== selectedType) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      [input, year, region, type].forEach(function (el) {
        if (el) {
          el.addEventListener('input', apply);
          el.addEventListener('change', apply);
        }
      });
    });
  }

  function bindSearchPage() {
    var box = qs('[data-search-page-input]');
    var results = qs('[data-search-results]');
    if (!box || !results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    box.value = initial;

    function render() {
      var query = normalize(box.value);
      var pool = window.SEARCH_INDEX || [];
      var list = pool.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          item.tags,
          item.oneLine,
          item.category
        ].join(' '));
        return !query || haystack.indexOf(query) !== -1;
      }).slice(0, 80);

      results.innerHTML = list.map(function (item) {
        return '<a class="search-result-card" href="./' + item.file + '">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span><h2>' + escapeHtml(item.title) + '</h2>' +
          '<p>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type + ' · ' + item.category) + '</p>' +
          '<p>' + escapeHtml(item.oneLine) + '</p></span></a>';
      }).join('');

      if (!list.length) {
        results.innerHTML = '<div class="no-results show">没有找到匹配影片</div>';
      }
    }

    box.addEventListener('input', render);
    render();
  }

  function escapeHtml(text) {
    return String(text || '').replace(/[&<>"']/g, function (ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch];
    });
  }

  window.initMoviePlayer = function (src) {
    var root = qs('[data-player]');
    if (!root) {
      return;
    }
    var video = qs('video', root);
    var button = qs('[data-play-button]', root);
    if (!video || !src) {
      return;
    }
    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function start() {
      attach();
      root.classList.add('is-playing');
      video.play().catch(function () {
        video.controls = true;
      });
    }

    attach();
    if (button) {
      button.addEventListener('click', start);
    }
    video.addEventListener('play', function () {
      root.classList.add('is-playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    bindMenu();
    bindSearchForms();
    bindHero();
    bindFilters();
    bindSearchPage();
  });
}());
