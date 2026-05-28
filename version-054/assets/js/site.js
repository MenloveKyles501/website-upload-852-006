
(function () {
  const root = document.body?.dataset.root || './';
  const page = document.body?.dataset.page || '';

  function qs(sel, el = document) { return el.querySelector(sel); }
  function qsa(sel, el = document) { return Array.from(el.querySelectorAll(sel)); }
  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }
  function textMatch(item, keyword) {
    const hay = [item.title, item.region, item.type, item.year, item.genre, item.one_line, item.summary, item.review, item.tags.join(' ')].join(' ').toLowerCase();
    return hay.includes(keyword.toLowerCase());
  }
  function renderSuggest(container, items) {
    if (!container) return;
    container.innerHTML = items.map(item => `
      <a href="${root}detail/${item.id}.html">
        <img src="${root}assets/posters/${item.id}.svg" alt="${escapeHtml(item.title)}" loading="lazy">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <div style="color:#64748b;font-size:.9rem;line-height:1.5">${escapeHtml(item.one_line)}</div>
          <div style="margin-top:6px;color:#94a3b8;font-size:.82rem">${escapeHtml(item.year)} · ${escapeHtml(item.region)} · ${escapeHtml(item.category)}</div>
        </div>
      </a>
    `).join('');
    container.classList.toggle('show', items.length > 0);
  }

  async function initGlobalSearch() {
    const input = qs('[data-global-search]');
    const suggest = qs('[data-search-suggest]');
    if (!input || !suggest) return;
    let movies = null;
    const ensureData = async () => {
      if (movies) return movies;
      const res = await fetch(`${root}assets/data/movies.json`, { cache: 'force-cache' });
      movies = await res.json();
      return movies;
    };
    const run = async () => {
      const term = input.value.trim();
      if (term.length < 2) {
        suggest.classList.remove('show');
        suggest.innerHTML = '';
        return;
      }
      const data = await ensureData();
      const hits = data.filter(item => textMatch(item, term)).slice(0, 10);
      renderSuggest(suggest, hits);
    };
    input.addEventListener('input', run);
    input.addEventListener('focus', run);
    document.addEventListener('click', (ev) => {
      if (!suggest.contains(ev.target) && ev.target !== input) {
        suggest.classList.remove('show');
      }
    });
  }

  function initMobileMenu() {
    const btn = qs('[data-menu-button]');
    const panel = qs('[data-mobile-panel]');
    if (!btn || !panel) return;
    btn.addEventListener('click', () => panel.classList.toggle('hidden'));
  }

  function bindCardFilters(rootEl = document) {
    const input = qs('[data-filter-search]', rootEl);
    const typeSel = qs('[data-filter-type]', rootEl);
    const regionSel = qs('[data-filter-region]', rootEl);
    const yearSel = qs('[data-filter-year]', rootEl);
    const cards = qsa('[data-card]', rootEl);
    if (!input && !typeSel && !regionSel && !yearSel) return;

    const apply = () => {
      const kw = (input?.value || '').trim().toLowerCase();
      const type = typeSel?.value || '';
      const region = regionSel?.value || '';
      const year = yearSel?.value || '';
      let visible = 0;
      cards.forEach(card => {
        const hay = `${card.dataset.title || ''} ${card.dataset.region || ''} ${card.dataset.type || ''} ${card.dataset.year || ''} ${card.dataset.genre || ''} ${card.dataset.tags || ''}`.toLowerCase();
        const ok = (!kw || hay.includes(kw)) && (!type || card.dataset.type === type) && (!region || card.dataset.region === region) && (!year || card.dataset.year === year);
        card.classList.toggle('hidden', !ok);
        if (ok) visible += 1;
      });
      const counter = qs('[data-filter-count]', rootEl);
      if (counter) counter.textContent = visible;
    };
    [input, typeSel, regionSel, yearSel].forEach(el => el && el.addEventListener('input', apply));
    apply();
  }

  function initDetailPlayer() {
    const wrap = qs('[data-player]');
    if (!wrap) return;
    const video = qs('video', wrap);
    const playBtn = qs('[data-play-toggle]', wrap);
    const sources = qsa('[data-source-btn]', wrap);
    const mp4Src = wrap.dataset.mp4;
    const hlsSrc = wrap.dataset.hls;
    const vendor = wrap.dataset.vendor;

    const setActive = (btn) => {
      sources.forEach(item => item.classList.toggle('active', item === btn));
    };

    const attachSource = (kind) => {
      if (!video) return;
      if (window.Hls && window.Hls.isSupported() && kind === 'hls') {
        if (video._hls) {
          video._hls.destroy();
          video._hls = null;
        }
        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(hlsSrc);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data.fatal) {
            console.warn('HLS error, fallback to MP4');
          }
        });
        video._hls = hls;
      } else {
        if (video._hls) {
          video._hls.destroy();
          video._hls = null;
        }
        video.src = kind === 'hls' ? hlsSrc : mp4Src;
      }
    };

    const playState = () => {
      if (!playBtn) return;
      playBtn.textContent = video && !video.paused ? '❚❚' : '▶';
    };

    sources.forEach(btn => {
      btn.addEventListener('click', () => {
        setActive(btn);
        const kind = btn.dataset.sourceBtn;
        attachSource(kind);
        video.play().catch(() => {});
        playState();
      });
    });

    if (video) {
      const defaultBtn = sources[0];
      if (defaultBtn) setActive(defaultBtn);
      attachSource(defaultBtn?.dataset.sourceBtn || 'hls');
      video.addEventListener('play', playState);
      video.addEventListener('pause', playState);
      video.addEventListener('ended', playState);
      video.addEventListener('click', () => {
        if (video.paused) video.play().catch(() => {});
        else video.pause();
      });
    }

    if (playBtn && video) {
      playBtn.addEventListener('click', () => {
        if (video.paused) video.play().catch(() => {});
        else video.pause();
      });
      playState();
    }
  }

  function initDetailTabs() {
    const tabs = qsa('[data-tab-btn]');
    const panels = qsa('[data-tab-panel]');
    if (!tabs.length || !panels.length) return;
    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tabBtn;
        tabs.forEach(t => t.classList.toggle('active', t === btn));
        panels.forEach(p => p.classList.toggle('hidden', p.dataset.tabPanel !== target));
      });
    });
  }

  function init() {
    initGlobalSearch();
    initMobileMenu();
    bindCardFilters(document);
    initDetailPlayer();
    initDetailTabs();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
