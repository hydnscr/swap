// ── Config ───────────────────────────────────────────────────────────────────
let TMDB_KEY = ''; // loaded from config via auth.js → window.__tmdbKey
const FREE_LIMIT = 3;

// ── Hero text per mode ────────────────────────────────────────────────────────
const HERO = {
  book:  'loved the book?<br><em>find the film.</em>',
  movie: 'loved the film?<br><em>find the book.</em>',
};

// ── Countries ─────────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code:'FR', flag:'🇫🇷', name:'France' }, { code:'US', flag:'🇺🇸', name:'United States' },
  { code:'GB', flag:'🇬🇧', name:'United Kingdom' }, { code:'DE', flag:'🇩🇪', name:'Germany' },
  { code:'ES', flag:'🇪🇸', name:'Spain' }, { code:'IT', flag:'🇮🇹', name:'Italy' },
  { code:'CA', flag:'🇨🇦', name:'Canada' }, { code:'AU', flag:'🇦🇺', name:'Australia' },
  { code:'BR', flag:'🇧🇷', name:'Brazil' }, { code:'JP', flag:'🇯🇵', name:'Japan' },
  { code:'KR', flag:'🇰🇷', name:'South Korea' }, { code:'MX', flag:'🇲🇽', name:'Mexico' },
  { code:'NL', flag:'🇳🇱', name:'Netherlands' }, { code:'BE', flag:'🇧🇪', name:'Belgium' },
  { code:'CH', flag:'🇨🇭', name:'Switzerland' }, { code:'PT', flag:'🇵🇹', name:'Portugal' },
  { code:'PL', flag:'🇵🇱', name:'Poland' }, { code:'SE', flag:'🇸🇪', name:'Sweden' },
  { code:'NO', flag:'🇳🇴', name:'Norway' }, { code:'DK', flag:'🇩🇰', name:'Denmark' },
  { code:'FI', flag:'🇫🇮', name:'Finland' }, { code:'AR', flag:'🇦🇷', name:'Argentina' },
  { code:'IN', flag:'🇮🇳', name:'India' }, { code:'ZA', flag:'🇿🇦', name:'South Africa' },
  { code:'NZ', flag:'🇳🇿', name:'New Zealand' }, { code:'SG', flag:'🇸🇬', name:'Singapore' },
  { code:'TR', flag:'🇹🇷', name:'Turkey' }, { code:'RU', flag:'🇷🇺', name:'Russia' },
];

// ── SVG icons ─────────────────────────────────────────────────────────────────
const BOOK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#5a4a3a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;
const FILM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#5a4a3a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`;
const PEN_SVG  = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#5a4a3a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`;
const CAM_SVG  = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#5a4a3a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`;
const BG_SVGS = { book: [BOOK_SVG, BOOK_SVG, PEN_SVG, BOOK_SVG, PEN_SVG], movie: [FILM_SVG, FILM_SVG, CAM_SVG, FILM_SVG, CAM_SVG] };

// ── State ─────────────────────────────────────────────────────────────────────
let mode = 'book';
let selectedItem = null;
let acTimer;
let userCountry = localStorage.getItem('swap_country') || null;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const searchInput      = document.getElementById('search-input');
const autocompleteList = document.getElementById('autocomplete-list');
const swapBtn          = document.getElementById('swap-btn');
const resultsArea      = document.getElementById('results-area');
const resultsTitle     = document.getElementById('results-title');
const resultsSub       = document.getElementById('results-sub');
const cardsGrid        = document.getElementById('cards-grid');
const loadingEl        = document.getElementById('loading');
const loadingText      = document.getElementById('loading-text');
const errorEl          = document.getElementById('error-msg');
const libraryLink      = document.getElementById('library-link');
const logoLink         = document.getElementById('logo-link');
const viewSearch       = document.getElementById('view-search');
const viewLibrary      = document.getElementById('view-library');
const libraryGrid      = document.getElementById('library-grid');
const libraryEmpty     = document.getElementById('library-empty');
const heroTitle        = document.getElementById('hero-title');
const bgIcons          = document.getElementById('bg-icons');
const bgIconsLib       = document.getElementById('bg-icons-library');
const countryModal     = document.getElementById('country-modal');
const countrySearch    = document.getElementById('country-search');
const countryList      = document.getElementById('country-list');
const countryBtn       = document.getElementById('country-btn');
const countryLabel     = document.getElementById('country-label');
const streamModal      = document.getElementById('stream-modal');
const streamModalClose = document.getElementById('stream-modal-close');
const streamModalContent = document.getElementById('stream-modal-content');
const libraryNotice    = document.getElementById('library-notice');

// ── Init ──────────────────────────────────────────────────────────────────────
// Wait briefly for auth.js to load config and set window.__tmdbKey
function waitForTmdbKey(cb, attempts = 0) {
  if (window.__tmdbKey) { TMDB_KEY = window.__tmdbKey; cb(); }
  else if (attempts < 20) setTimeout(() => waitForTmdbKey(cb, attempts + 1), 100);
  else { console.warn('TMDB key not loaded'); cb(); }
}

waitForTmdbKey(() => {
  renderBgIcons(bgIcons, 'book');
renderBgIcons(bgIconsLib, 'book');
updateCountryLabel();
if (!userCountry) showCountryModal();
});

// ── Background SVG icons ──────────────────────────────────────────────────────
function renderBgIcons(container, m) {
  if (!container) return;
  container.innerHTML = '';
  const svgs = BG_SVGS[m];
  for (let i = 0; i < 16; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'bg-icon';
    const x = Math.random() * 100, y = Math.random() * 100;
    const dur = 6 + Math.random() * 8, del = -(Math.random() * 8);
    const r1 = -8 + Math.random() * 6, r2 = 2 + Math.random() * 6;
    const sz = 28 + Math.random() * 28;
    wrap.style.cssText = `left:${x}%;top:${y}%;--dur:${dur}s;--delay:${del}s;--rot-start:${r1}deg;--rot-end:${r2}deg;width:${sz}px;height:${sz}px;`;
    wrap.innerHTML = svgs[i % svgs.length];
    container.appendChild(wrap);
  }
}

// ── Country modal ─────────────────────────────────────────────────────────────
function showCountryModal() { countryModal.classList.remove('hidden'); renderCountryList(''); countrySearch.focus(); }
function hideCountryModal() { countryModal.classList.add('hidden'); }
function renderCountryList(filter) {
  const q = filter.toLowerCase();
  const filtered = COUNTRIES.filter(c => c.name.toLowerCase().includes(q));
  countryList.innerHTML = '';
  filtered.forEach(c => {
    const li = document.createElement('li');
    li.className = 'country-item' + (userCountry === c.code ? ' selected' : '');
    li.innerHTML = `<span>${c.flag}</span> ${c.name}`;
    li.addEventListener('click', () => {
      userCountry = c.code;
      localStorage.setItem('swap_country', c.code);
      updateCountryLabel();
      hideCountryModal();
    });
    countryList.appendChild(li);
  });
}
countrySearch.addEventListener('input', () => renderCountryList(countrySearch.value));
countryBtn.addEventListener('click', () => { countrySearch.value = ''; renderCountryList(''); showCountryModal(); });
function updateCountryLabel() {
  if (!userCountry) { countryLabel.textContent = '—'; return; }
  const c = COUNTRIES.find(x => x.code === userCountry);
  countryLabel.textContent = c ? `${c.flag} ${c.name}` : userCountry;
}

// ── Mode toggle ───────────────────────────────────────────────────────────────
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
    heroTitle.classList.add('switching');
    setTimeout(() => { heroTitle.innerHTML = HERO[mode]; heroTitle.classList.remove('switching'); }, 250);
    renderBgIcons(bgIcons, mode);
    searchInput.placeholder = mode === 'book' ? 'Type a book title…' : 'Type a film or series title…';
    searchInput.value = '';
    autocompleteList.innerHTML = '';
    selectedItem = null;
    resultsArea.classList.add('hidden');
    hideError();
  });
});

// ── Autocomplete ──────────────────────────────────────────────────────────────
searchInput.addEventListener('input', () => {
  clearTimeout(acTimer);
  const q = searchInput.value.trim();
  selectedItem = null;
  if (q.length < 2) { autocompleteList.innerHTML = ''; return; }
  acTimer = setTimeout(() => fetchAutocomplete(q), 320);
});

async function fetchAutocomplete(q) {
  try {
    let items = [];
    if (mode === 'book') {
      const res  = await fetch(`https://openlibrary.org/search.json?q=${enc(q)}&limit=8&fields=title,author_name,cover_i,first_sentence,key,edition_count&sort=editions`);
      const data = await res.json();
      items = (data.docs || [])
        .sort((a, b) => (b.edition_count || 0) - (a.edition_count || 0))
        .slice(0, 5)
        .map(b => ({
          title: b.title, subtitle: b.author_name?.[0] || '',
          thumb: b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-S.jpg` : '',
          cover: b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg` : '',
          synopsis: b.first_sentence?.[0] || '', type: 'book', author: b.author_name?.[0] || '', ol_key: b.key,
        }));
    } else {
      const res  = await fetch(`https://api.themoviedb.org/3/search/multi?query=${enc(q)}&api_key=${TMDB_KEY}&language=en-US`);
      const data = await res.json();
      items = (data.results || [])
        .filter(r => r.media_type === 'movie' || r.media_type === 'tv')
        .slice(0, 5).map(r => ({
          title: r.title || r.name, subtitle: (r.release_date || r.first_air_date || '').slice(0, 4),
          thumb: r.poster_path ? `https://image.tmdb.org/t/p/w92${r.poster_path}` : '',
          cover: r.poster_path ? `https://image.tmdb.org/t/p/w300${r.poster_path}` : '',
          synopsis: r.overview || '', type: r.media_type, tmdb_id: r.id,
        }));
    }
    renderAutocomplete(items);
  } catch (e) { console.warn('Autocomplete error:', e); }
}

function renderAutocomplete(items) {
  autocompleteList.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'autocomplete-item';
    li.innerHTML = `
      ${item.thumb ? `<img class="autocomplete-thumb" src="${esc(item.thumb)}" alt="" />`
        : `<div class="autocomplete-thumb-placeholder">${mode === 'book' ? '📖' : '🎬'}</div>`}
      <div class="autocomplete-info"><strong>${esc(item.title)}</strong><span>${esc(item.subtitle)}</span></div>`;
    li.addEventListener('click', () => { selectedItem = item; searchInput.value = item.title; autocompleteList.innerHTML = ''; });
    autocompleteList.appendChild(li);
  });
}
document.addEventListener('click', e => { if (!e.target.closest('.search-box')) autocompleteList.innerHTML = ''; });

// ── Swap ──────────────────────────────────────────────────────────────────────
swapBtn.addEventListener('click', doSwap);
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSwap(); });

async function doSwap() {
  const query = searchInput.value.trim();
  if (!query) return;
  if (!checkLimit()) { window.Auth?.showPaywall('limit'); return; }

  const item = selectedItem || { title: query, synopsis: '', type: mode };
  showLoading(item.type);
  resultsArea.classList.add('hidden');
  hideError();

  try {
    if (!item.synopsis && item.tmdb_id) item.synopsis = await fetchTmdbSynopsis(item.tmdb_id, item.type);
    if (!item.synopsis && item.ol_key)  item.synopsis = await fetchOpenLibrarySynopsis(item.ol_key);
    const recs     = await callSwapAPI(item);
    const enriched = await Promise.all(recs.map(r => enrichRec(r)));
    incrementLimit();
    renderResults(item, enriched);
  } catch (e) {
    console.error(e);
    showError('Something went wrong. Check your API keys in app.js and try again.');
  } finally {
    hideLoading();
  }
}

async function callSwapAPI(item) {
  const targetMedium = item.type === 'book' ? 'films or series' : 'books';
  const sourceMedium = item.type === 'book' ? 'book' : 'film/series';
  const res = await fetch('/api/swap', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: item.title, sourceMedium, targetMedium, synopsis: item.synopsis }),
  });
  if (!res.ok) throw new Error(`Function error ${res.status}`);
  return (await res.json()).recommendations;
}

async function enrichRec(rec) {
  try {
    if (rec.type === 'book') {
      const res  = await fetch(`https://openlibrary.org/search.json?q=${enc(rec.title + ' ' + (rec.author || ''))}&limit=1&fields=title,author_name,cover_i,first_sentence&sort=editions`);
      const data = await res.json();
      const b = data.docs?.[0];
      if (b) {
        rec.cover = b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg` : '';
        rec.synopsis = rec.synopsis || b.first_sentence?.[0] || '';
        rec.author = b.author_name?.[0] || rec.author || '';
      }
    } else {
      const mediaType = rec.type === 'tv' ? 'tv' : 'movie';
      const res  = await fetch(`https://api.themoviedb.org/3/search/${mediaType}?query=${enc(rec.title)}&api_key=${TMDB_KEY}`);
      const data = await res.json();
      const r = data.results?.[0];
      if (r) {
        rec.cover = r.poster_path ? `https://image.tmdb.org/t/p/w300${r.poster_path}` : '';
        rec.synopsis = rec.synopsis || r.overview || '';
        rec.tmdb_id = r.id;
        rec.year = (r.release_date || r.first_air_date || '').slice(0, 4);
        rec.type = mediaType;
      }
    }
  } catch (e) { console.warn('Enrichment failed for', rec.title); }
  return rec;
}

async function fetchTmdbSynopsis(id, type) {
  const res  = await fetch(`https://api.themoviedb.org/3/${type === 'tv' ? 'tv' : 'movie'}/${id}?api_key=${TMDB_KEY}`);
  return (await res.json()).overview || '';
}
async function fetchOpenLibrarySynopsis(olKey) {
  try {
    const res  = await fetch(`https://openlibrary.org${olKey}.json`);
    const data = await res.json();
    const desc = data.description;
    if (!desc) return '';
    return typeof desc === 'string' ? desc.slice(0, 500) : (desc.value || '').slice(0, 500);
  } catch { return ''; }
}
async function fetchStreamingProviders(tmdbId, mediaType) {
  if (!tmdbId || !userCountry) return [];
  try {
    const res  = await fetch(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}/watch/providers?api_key=${TMDB_KEY}`);
    const data = await res.json();
    return data.results?.[userCountry]?.flatrate || [];
  } catch { return []; }
}

// ── Render results ────────────────────────────────────────────────────────────
function renderResults(sourceItem, recs) {
  const targetLabel = sourceItem.type === 'book' ? 'films & series' : 'books';
  resultsTitle.textContent = `Vibes like "${sourceItem.title}"`;
  resultsSub.textContent   = `${recs.length} ${targetLabel} with the same energy`;
  cardsGrid.innerHTML = '';
  recs.forEach((rec, i) => cardsGrid.appendChild(buildCard(rec, i, false)));
  resultsArea.classList.remove('hidden');
  resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Build card ────────────────────────────────────────────────────────────────
function buildCard(rec, index = 0, inLibrary = false) {
  const isBook = rec.type === 'book';
  const isSaved = isItemSaved(rec);
  const typeLabel = rec.type === 'tv' ? 'series' : rec.type;

  const card = document.createElement('div');
  card.className = 'card' + (inLibrary ? ' clickable' : '');
  card.style.setProperty('--card-delay', `${index * 0.25}s`);

  card.innerHTML = `
    <div class="card-cover-wrap">
      ${rec.cover ? `<img class="card-cover" src="${esc(rec.cover)}" alt="${esc(rec.title)}" loading="lazy" />`
        : `<div class="card-cover-placeholder">${isBook ? '📖' : '🎬'}</div>`}
      <span class="card-type-badge">${typeLabel}</span>
      <button class="card-heart" aria-label="Save to library">${isSaved ? '❤️' : '🤍'}</button>
      ${inLibrary ? `<div class="card-tap-hint">${isBook ? 'tap for reading links' : 'tap for streaming'}</div>` : ''}
    </div>
    <div class="card-body">
      <div>
        <div class="card-title">${esc(rec.title)}</div>
        <div class="card-meta">${rec.year || ''}${rec.author ? ' · ' + esc(rec.author) : ''}</div>
      </div>
      ${rec.vibe_reason ? `<div class="card-vibe">${esc(rec.vibe_reason)}</div>` : ''}
      ${rec.synopsis ? `
        <button class="card-synopsis-toggle">show synopsis</button>
        <div class="card-synopsis">${esc(rec.synopsis.slice(0, 300))}${rec.synopsis.length > 300 ? '…' : ''}</div>
      ` : ''}
    </div>`;

  const heartBtn = card.querySelector('.card-heart');
  heartBtn.addEventListener('click', async function (e) {
    e.stopPropagation();
    const saved = await toggleSave(rec);
    this.textContent = saved ? '❤️' : '🤍';
  });

  card.querySelector('.card-synopsis-toggle')?.addEventListener('click', function (e) {
    e.stopPropagation();
    const syn = card.querySelector('.card-synopsis');
    syn.classList.toggle('open');
    this.textContent = syn.classList.contains('open') ? 'hide synopsis' : 'show synopsis';
  });

  if (inLibrary) card.addEventListener('click', () => openInfoModal(rec));

  return card;
}

// ── Info modal ────────────────────────────────────────────────────────────────
async function openInfoModal(rec) {
  streamModalContent.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--ink-3)"><div class="spinner" style="margin:0 auto 1rem"></div>Loading…</div>`;
  streamModal.classList.remove('hidden');
  const isBook = rec.type === 'book';

  if (isBook) {
    const title = esc(rec.title), author = esc(rec.author || '');
    const q = enc(rec.title + (rec.author ? ' ' + rec.author : ''));
    streamModalContent.innerHTML = `
      <div class="stream-modal-title">${title}</div>
      ${author ? `<div class="stream-modal-year">${author}</div>` : ''}
      <div class="stream-section-label">Add to your reading list</div>
      <div class="book-links">
        <a class="book-link" href="https://www.goodreads.com/search?q=${q}" target="_blank" rel="noopener"><span class="book-link-icon">📗</span> Search on Goodreads</a>
        <a class="book-link" href="https://app.thestorygraph.com/browse?search_term=${q}" target="_blank" rel="noopener"><span class="book-link-icon">📘</span> Search on StoryGraph</a>
        <a class="book-link" href="https://openlibrary.org/search?q=${q}" target="_blank" rel="noopener"><span class="book-link-icon">📙</span> Find on Open Library</a>
      </div>`;
  } else {
    const mediaType = rec.type === 'tv' ? 'tv' : 'movie';
    const providers = await fetchStreamingProviders(rec.tmdb_id, mediaType);
    const countryName = COUNTRIES.find(c => c.code === userCountry)?.name || userCountry || 'your country';
    const jwQuery = enc(rec.title);
    streamModalContent.innerHTML = `
      <div class="stream-modal-title">${esc(rec.title)}</div>
      <div class="stream-modal-year">${rec.year || ''}</div>
      <div class="stream-section-label">Available to stream in ${esc(countryName)}</div>
      ${providers.length > 0
        ? `<div class="stream-badges">${providers.map(p => `<span class="stream-badge-lg">${esc(p.provider_name)}</span>`).join('')}</div>`
        : `<p class="stream-none">Not found on streaming in ${esc(countryName)} right now.</p>`}
      <a class="stream-jw-link" href="https://www.justwatch.com/us/search?q=${jwQuery}" target="_blank" rel="noopener">🔍 Search on JustWatch</a>`;
  }
}
streamModalClose.addEventListener('click', () => streamModal.classList.add('hidden'));
streamModal.addEventListener('click', e => { if (e.target === streamModal) streamModal.classList.add('hidden'); });

// ── Library ───────────────────────────────────────────────────────────────────
let currentLibTab = 'films';

libraryLink.addEventListener('click', async e => {
  e.preventDefault();
  showView('library');
  renderBgIcons(bgIconsLib, currentLibTab === 'films' ? 'movie' : 'book');
  await renderLibrary();
});
logoLink.addEventListener('click', e => { e.preventDefault(); showView('search'); });

document.querySelectorAll('.lib-tab').forEach(tab => {
  tab.addEventListener('click', async () => {
    document.querySelectorAll('.lib-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentLibTab = tab.dataset.tab;
    renderBgIcons(bgIconsLib, currentLibTab === 'films' ? 'movie' : 'book');
    await renderLibrary();
  });
});

async function renderLibrary() {
  // Show sync notice based on plan
  if (libraryNotice) {
    if (window.Auth?.isSwapPlus()) {
      libraryNotice.innerHTML = '✨ Your library is synced across all your devices.';
      libraryNotice.classList.remove('hidden');
    } else {
  libraryNotice.innerHTML = 'Your library is saved on this device only. <button id="notice-upgrade" style="background:none;border:none;color:var(--accent);cursor:pointer;font-size:0.8rem;text-decoration:underline;font-family:var(--font-body);padding:0;">Upgrade to Swap+</button> to sync across all your devices.';
  libraryNotice.classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('notice-upgrade')?.addEventListener('click', e => {
      e.preventDefault();
      window.Auth?.showPaywall('upgrade');
    });
  }, 0);
}
  }

  const all   = await getSaved();
  const items = currentLibTab === 'films'
    ? all.filter(i => i.type === 'movie' || i.type === 'tv')
    : all.filter(i => i.type === 'book');

  libraryGrid.innerHTML = '';
  if (items.length === 0) { libraryEmpty.classList.remove('hidden'); return; }
  libraryEmpty.classList.add('hidden');
  items.forEach((rec, i) => {
    const card = buildCard(rec, i, true);
    card.querySelector('.card-heart').addEventListener('click', () => setTimeout(renderLibrary, 50));
    libraryGrid.appendChild(card);
  });
}

// ── Storage layer (localStorage OR Supabase depending on plan) ───────────────
async function getSaved() {
  if (window.Auth?.isSwapPlus() && window.Auth?.isLoggedIn()) {
    return await window.Auth.getCloudLibrary();
  }
  return JSON.parse(localStorage.getItem('swap_library') || '[]');
}

function isItemSaved(rec) {
  // Quick local check used for heart icon state — checks the locally cached list
  const cached = window.__swapLibCache || [];
  return cached.some(i => i.title === rec.title && i.type === rec.type);
}

async function toggleSave(rec) {
  if (window.Auth?.isSwapPlus() && window.Auth?.isLoggedIn()) {
    const nowSaved = await window.Auth.toggleCloudSave(rec);
    window.__swapLibCache = await window.Auth.getCloudLibrary();
    return nowSaved;
  }
  // Local storage path
  let saved = JSON.parse(localStorage.getItem('swap_library') || '[]');
  const idx = saved.findIndex(i => i.title === rec.title && i.type === rec.type);
  if (idx === -1) saved.push(rec); else saved.splice(idx, 1);
  localStorage.setItem('swap_library', JSON.stringify(saved));
  window.__swapLibCache = saved;
  return idx === -1;
}

// Keep local cache warm for heart icon checks
(async () => { window.__swapLibCache = await getSaved(); })();

// ── Daily limit ───────────────────────────────────────────────────────────────
function checkLimit() {
  if (window.Auth?.isSwapPlus()) return true;
  const today = new Date().toDateString();
  const data  = JSON.parse(localStorage.getItem('swap_limit') || '{}');
  if (data.date !== today) return true;
  return (data.count || 0) < FREE_LIMIT;
}
function swapsLeft() {
  if (window.Auth?.isSwapPlus()) return '∞';
  const today = new Date().toDateString();
  const data  = JSON.parse(localStorage.getItem('swap_limit') || '{}');
  const used  = data.date === today ? (data.count || 0) : 0;
  return Math.max(0, FREE_LIMIT - used);
}
function incrementLimit() {
  const today = new Date().toDateString();
  const data  = JSON.parse(localStorage.getItem('swap_limit') || '{}');
  const count = (data.date === today ? (data.count || 0) : 0) + 1;
  localStorage.setItem('swap_limit', JSON.stringify({ date: today, count }));
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function showView(name) {
  viewSearch.classList.toggle('active', name === 'search');
  viewLibrary.classList.toggle('active', name === 'library');
}
function showLoading(type) {
  const msgs = type === 'book'
    ? ['Finding your vibe match…', 'Scanning the film world…', 'Almost there…']
    : ['Hunting through the shelves…', 'Finding your next read…', 'Almost there…'];
  loadingText.textContent = msgs[Math.floor(Math.random() * msgs.length)];
  loadingEl.classList.remove('hidden'); swapBtn.disabled = true;
}
function hideLoading()  { loadingEl.classList.add('hidden'); swapBtn.disabled = false; }
function showError(msg) { errorEl.textContent = msg; errorEl.classList.remove('hidden'); }
function hideError()    { errorEl.classList.add('hidden'); }
function enc(s) { return encodeURIComponent(s); }
function esc(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }