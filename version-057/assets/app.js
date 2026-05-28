(function () {
  const moviesIndex = window.MOVIES_INDEX || [];

  function normalize(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[\-_/|·,，。.!?、:：()（）\[\]{}]/g, '');
  }

  function matches(movie, query) {
    const q = normalize(query);
    if (!q) return true;
    const haystack = normalize([
      movie.title,
      movie.region,
      movie.type,
      movie.genre,
      movie.year,
      movie.oneLine,
      movie.summary,
      (movie.tags || []).join(' ')
    ].join(' '));
    return haystack.includes(q);
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function createCard(movie) {
    const a = document.createElement('a');
    a.className = 'card';
    a.href = movie.url;
    const tags = (movie.tags || []).slice(0, 3).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
    a.innerHTML = `
      <div class="poster" style="${movie.posterStyle || ''}">
        <div class="poster-top">
          <div class="poster-initials">${escapeHtml(movie.posterText || '影')}</div>
          <div class="poster-meta">
            <span class="badge">${escapeHtml(movie.type || '')}</span>
            <span class="badge">${escapeHtml(movie.year || '')}</span>
            <span class="badge">${escapeHtml(movie.region || '')}</span>
          </div>
        </div>
        <div class="poster-bottom">
          <p class="poster-title">${escapeHtml(movie.title || '')}</p>
        </div>
      </div>
      <div class="card-body">
        <h3>${escapeHtml(movie.title || '')}</h3>
        <p>${escapeHtml(movie.oneLine || movie.summary || '')}</p>
        <div class="tag-row">${tags}</div>
      </div>
    `;
    return a;
  }

  function renderMovieGrid(container, movies) {
    container.innerHTML = '';
    if (!movies.length) {
      container.innerHTML = '<div class="empty-state">没有找到匹配内容，请换一个关键词再试。</div>';
      return;
    }
    const frag = document.createDocumentFragment();
    movies.forEach(movie => frag.appendChild(createCard(movie)));
    container.appendChild(frag);
  }

  function setupSearch() {
    const input = document.querySelector('[data-search-input]');
    const grid = document.querySelector('[data-search-results]');
    const scope = document.body.getAttribute('data-scope') || 'all';
    const typeFilter = document.body.getAttribute('data-type-filter') || '';
    if (!input || !grid) return;

    const baseMovies = moviesIndex.filter(movie => {
      if (!typeFilter) return true;
      return movie.bucket === typeFilter || movie.type === typeFilter;
    });

    function refresh() {
      const q = input.value.trim();
      const visible = baseMovies.filter(movie => matches(movie, q)).slice(0, scope === 'home' ? 24 : 48);
      renderMovieGrid(grid, visible);
    }

    input.addEventListener('input', refresh);
    refresh();
  }

  function setupPlayer() {
    const root = document.querySelector('[data-player-root]');
    if (!root) return;

    const video = root.querySelector('video');
    const playBtn = root.querySelector('[data-play-btn]');
    const sourceButtons = Array.from(root.querySelectorAll('[data-source-btn]'));
    const title = root.getAttribute('data-title') || document.title;
    const m3u8Index = parseInt(root.getAttribute('data-source-index') || '0', 10) || 0;
    let hls = null;
    let currentUrl = '';

    function destroyHls() {
      if (hls) {
        try { hls.destroy(); } catch (e) {}
        hls = null;
      }
    }

    function setActiveButton(url) {
      sourceButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-url') === url);
      });
    }

    function loadSource(url, autoplay) {
      if (!url) return;
      currentUrl = url;
      setActiveButton(url);
      destroyHls();
      if (window.Hls && window.Hls.isSupported() && /\.m3u8(?:\?|$)/i.test(url)) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (autoplay) video.play().catch(() => {});
        });
      } else {
        video.src = url;
        if (autoplay) video.play().catch(() => {});
      }
    }

    sourceButtons.forEach(btn => {
      btn.addEventListener('click', () => loadSource(btn.getAttribute('data-url'), true));
    });

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (!currentUrl) {
          const btn = sourceButtons[m3u8Index % sourceButtons.length] || sourceButtons[0];
          if (btn) loadSource(btn.getAttribute('data-url'), true);
        } else {
          video.play().catch(() => {});
        }
      });
    }

    const initial = sourceButtons[m3u8Index % sourceButtons.length] || sourceButtons[0];
    if (initial) {
      loadSource(initial.getAttribute('data-url'), false);
    }
    root.setAttribute('aria-label', title);
  }

  function highlightNav() {
    const path = location.pathname.replace(/\/+$/g, '').replace(/^\//, '');
    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href === 'index.html' && (location.pathname === '/' || location.pathname.endsWith('/index.html') || location.pathname === '')) {
        a.classList.add('active');
      } else if (href !== 'index.html' && path.includes(href.replace(/^\.\//, '').replace(/^\//, ''))) {
        a.classList.add('active');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupSearch();
    setupPlayer();
    highlightNav();
  });
})();
