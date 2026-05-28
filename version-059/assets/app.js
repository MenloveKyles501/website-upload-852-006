
(function () {
  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => Array.from(root.querySelectorAll(s));

  function initMobileNav() {
    const btn = qs('[data-mobile-toggle]');
    const nav = qs('[data-mobile-nav]');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  function initHeroSlider() {
    const wrap = qs('[data-hero-slider]');
    if (!wrap) return;
    const items = qsa('[data-hero-slide]', wrap);
    const title = qs('[data-hero-title]');
    const desc = qs('[data-hero-desc]');
    const tags = qs('[data-hero-tags]');
    const poster = qs('[data-hero-poster]');
    const prev = qs('[data-hero-prev]');
    const next = qs('[data-hero-next]');
    if (!items.length || !title || !desc || !tags || !poster) return;

    let index = 0;
    let timer = null;

    function render(i) {
      const slide = items[i];
      const data = slide.dataset;
      title.textContent = data.title || '';
      desc.textContent = data.desc || '';
      tags.innerHTML = (data.tags || '').split('|').filter(Boolean).map(t => `<span class="badge">${t}</span>`).join('');
      poster.src = data.poster || '';
      poster.alt = data.title || '';
      items.forEach((el, idx) => el.classList.toggle('active', idx === i));
      index = i;
    }

    function step(delta) {
      const nextIndex = (index + delta + items.length) % items.length;
      render(nextIndex);
    }

    prev && prev.addEventListener('click', () => { step(-1); restart(); });
    next && next.addEventListener('click', () => { step(1); restart(); });

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(() => step(1), 5000);
    }

    render(0);
    restart();
  }

  function initSearchPage() {
    const root = qs('[data-search-page]');
    if (!root || typeof window.SITE_DATA === 'undefined') return;

    const data = window.SITE_DATA;
    const input = qs('[data-search-input]', root);
    const typeSel = qs('[data-search-type]', root);
    const regionSel = qs('[data-search-region]', root);
    const yearSel = qs('[data-search-year]', root);
    const list = qs('[data-search-results]', root);
    const count = qs('[data-search-count]', root);
    const hotTags = qsa('[data-hot-tag]', root);

    const params = new URLSearchParams(window.location.search);
    if (params.get('q')) input.value = params.get('q');

    const allGenres = [];
    data.forEach(m => m.genre.split(/[,/、\s]+/).forEach(g => g && allGenres.push(g)));

    function card(movie) {
      return `
        <a class="item" href="../movie/${movie.code}.html">
          <div class="thumb poster"><img src="../${movie.poster}" alt="${movie.title}"></div>
          <div class="body">
            <h3>${movie.title}</h3>
            <div class="sub">${movie.region} · ${movie.type} · ${movie.year}</div>
            <p class="desc">${movie.one_line}</p>
            <div class="meta">
              <span>${movie.genre}</span>
            </div>
          </div>
        </a>`;
    }

    function applyFilter() {
      const q = input.value.trim().toLowerCase();
      const type = typeSel.value;
      const region = regionSel.value;
      const year = yearSel.value;
      const filtered = data.filter(m => {
        const t = m.title.toLowerCase();
        const g = m.genre.toLowerCase();
        const z = m.tags.join(' ').toLowerCase();
        const y = String(m.year);
        const match = !q || t.includes(q) || g.includes(q) || z.includes(q) || m.one_line.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q);
        const typeOK = !type || m.type === type;
        const regionOK = !region || m.region === region;
        const yearOK = !year || y === year;
        return match && typeOK && regionOK && yearOK;
      });
      count.textContent = `找到 ${filtered.length} 部影片`;
      list.innerHTML = filtered.slice(0, 240).map(card).join('') || '<div class="block"><h2>没有找到匹配内容</h2><p>试试其他关键词、地区或年份。</p></div>';
    }

    input && input.addEventListener('input', applyFilter);
    typeSel && typeSel.addEventListener('change', applyFilter);
    regionSel && regionSel.addEventListener('change', applyFilter);
    yearSel && yearSel.addEventListener('change', applyFilter);

    hotTags.forEach(tag => tag.addEventListener('click', () => {
      input.value = tag.dataset.tag || '';
      applyFilter();
      window.scrollTo({ top: list.offsetTop - 120, behavior: 'smooth' });
    }));

    applyFilter();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initHeroSlider();
    initSearchPage();
  });
})();
