/* LP Assessment — field app for Loss Prevention site assessments */
(function () {
  'use strict';

  const A = window.Android || null;           // native bridge (absent when tested in a browser)
  const HOSTED = !A && !!window.LPA_HOSTED;    // running as a Claude page: sync to the viewer's Claude account

  // ---------------- icons ----------------
  const I = {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    cam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    img: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M20 16l-5-5-8 8"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    chev: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z"/><path d="M9 12l2 2 4-4" stroke-linecap="round"/></svg>',
    clip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h7"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20V9M7 13l5-5 5 5M5 4h14"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.9l7.6-4.6M8.2 13.1l7.6 4.6"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>'
  };

  // ---------------- helpers ----------------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const fmtDate = (iso) => {
    if (!iso) return '';
    const p = iso.split('-'); if (p.length !== 3) return iso;
    const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+p[1] - 1];
    return (+p[2]) + ' ' + m + ' ' + p[0];
  };
  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2400);
  }
  function busy(on, msg) {
    let b = $('#busy');
    if (!on) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement('div'); b.id = 'busy'; b.className = 'busy'; document.body.appendChild(b); }
    b.innerHTML = '<div class="box"><div class="spin"></div><div>' + esc(msg || 'Working…') + '</div></div>';
  }

  // ---------------- storage ----------------
  let db;
  function freshDb() {
    return { version: 1, sites: [], risks: DEFAULT_RISKS.slice(), standards: DEFAULT_STANDARDS.slice(),
      timelines: DEFAULT_TIMELINES.slice(), recentLocations: [], assessor: '' };
  }
  // ---- web storage (iPhone / browser): IndexedDB for data + photo blobs ----
  const W = {
    idb: null, urls: {},
    open() {
      return new Promise((res, rej) => {
        const r = indexedDB.open('lp-assessment', 1);
        r.onupgradeneeded = () => { r.result.createObjectStore('kv'); r.result.createObjectStore('photos'); };
        r.onsuccess = () => { W.idb = r.result; res(); };
        r.onerror = () => rej(r.error);
      });
    },
    tx(store, mode, fn) {
      return new Promise((res, rej) => {
        const t = W.idb.transaction(store, mode); const st = t.objectStore(store); let out;
        const q = fn(st); if (q) q.onsuccess = () => { out = q.result; };
        t.oncomplete = () => res(out); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
      });
    },
    get: (k) => W.tx('kv', 'readonly', st => st.get(k)),
    set: (k, v) => W.tx('kv', 'readwrite', st => st.put(v, k)),
    mem: {},
    putPhoto(id, blob) {
      const done = () => { W.urls[id] = URL.createObjectURL(blob); };
      if (!W.idb) { W.mem[id] = blob; done(); return Promise.resolve(); }
      return W.tx('photos', 'readwrite', st => st.put(blob, id)).then(done, () => { W.mem[id] = blob; done(); });
    },
    getPhoto(id) { if (W.mem[id]) return Promise.resolve(W.mem[id]); if (!W.idb) return Promise.resolve(null); return W.tx('photos', 'readonly', st => st.get(id)); },
    delPhoto(id) { if (W.urls[id]) URL.revokeObjectURL(W.urls[id]); delete W.urls[id]; delete W.mem[id]; if (!W.idb) return Promise.resolve(); return W.tx('photos', 'readwrite', st => st.delete(id)); },
    loadAllPhotos() {
      return new Promise((res, rej) => {
        const t = W.idb.transaction('photos', 'readonly'); const c = t.objectStore('photos').openCursor();
        c.onsuccess = () => { const cur = c.result; if (cur) { W.urls[cur.key] = URL.createObjectURL(cur.value); cur.continue(); } };
        t.oncomplete = () => res(); t.onerror = () => rej(t.error);
      });
    }
  };
  const blobToDataUrl = (b) => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(b); });
  const b64ToBlob = (b64, type) => { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type }); };

  function load(webTxt) {
    let txt = '';
    try { txt = A ? A.loadState() : (webTxt || ''); } catch (e) { txt = ''; }
    try { db = txt ? JSON.parse(txt) : freshDb(); } catch (e) { db = freshDb(); }
    const f = freshDb();
    for (const k of Object.keys(f)) if (db[k] == null) db[k] = f[k];
    if (!db.deletedSites) db.deletedSites = [];
    migrate(db.sites);
  }
  let saveTimer = null;
  function save(now) {
    clearTimeout(saveTimer);
    const run = () => {
      if (!db) return;
      const txt = JSON.stringify(db);
      try {
        if (A) { if (!A.saveState(txt)) toast('Warning: could not save data'); }
        else W.set('db', txt).catch(() => toast('Warning: could not save data'));
      } catch (e) { toast('Warning: could not save data'); }
    };
    if (now) run(); else saveTimer = setTimeout(run, 400);
    if (HOSTED) cloudSchedule();
  }
  window.addEventListener('pagehide', () => save(true));
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(true); });

  let photoBase = '';
  function assetOf(id) {
    for (const s of db.sites) for (const l of s.locations) for (const p of l.photos) if (p.id === id) return p.asset || '';
    return '';
  }
  function photoSrc(id) {
    if (!A) { if (W.urls[id]) return W.urls[id]; const as = HOSTED && assetOf(id); return as ? '/_blob/' + as : ''; }
    if (!photoBase) photoBase = 'file://' + A.photoDir() + '/';
    return photoBase + id + '.jpg';
  }
  async function photoData(id) {
    if (!A) {
      let b = await W.getPhoto(id).catch(() => null);
      const as = !b && HOSTED && assetOf(id);
      if (as) { try { const r = await fetch('/_blob/' + as); if (r.ok) { b = await r.blob(); W.putPhoto(id, b).catch(() => { }); } } catch (e) { } }
      return b ? blobToDataUrl(b) : '';
    }
    const b = A.photoBase64(id); return b ? 'data:image/jpeg;base64,' + b : '';
  }
  async function photoDataMap(ids) { const m = {}; for (const id of ids) m[id] = await photoData(id); return m; }
  function deletePhotoFile(id, asset) {
    if (A) { A.deletePhoto(id); return; }
    W.delPhoto(id).catch(() => { });
    if (HOSTED && asset && C.assets) C.assets.delete(asset).catch(() => { });
  }

  // ---------------- model helpers ----------------
  const site = (id) => db.sites.find(s => s.id === id);
  const loc = (s, id) => s && s.locations.find(l => l.id === id);
  const touch = (s) => { s.updatedAt = Date.now(); save(); };
  const riskCount = (s) => s.locations.reduce((n, l) => n + l.risks.length, 0);
  const photoCount = (s) => s.locations.reduce((n, l) => n + l.photos.length, 0);
  function newLocation(name) { return { id: uid(), name: name || '', findings: '', risks: [newRisk()], photos: [], done: false }; }
  function newRisk() { return { id: uid(), types: [], standard: '', timeline: '' }; }
  function typesOf(r) { return Array.isArray(r.types) ? r.types : (r.type ? [r.type] : []); }
  function migrate(sites) { (sites || []).forEach(s => s.locations.forEach(l => l.risks.forEach(r => { r.types = typesOf(r); delete r.type; }))); }
  function rememberLocation(name) {
    name = (name || '').trim(); if (!name) return;
    db.recentLocations = [name].concat(db.recentLocations.filter(n => n.toLowerCase() !== name.toLowerCase())).slice(0, 60);
  }
  function filledRisks(l) { return l.risks.filter(r => typesOf(r).length || r.standard || r.timeline); }

  // ---------------- routing ----------------
  let view = { name: 'home' };
  let sheetStack = [];
  function go(v) { view = v; render(); window.scrollTo(0, 0); }

  window.onAndroidBack = function () {
    if (sheetStack.length) { closeSheet(); return true; }
    if (view.name === 'loc') { go({ name: 'site', siteId: view.siteId }); return true; }
    if (view.name === 'site') { go({ name: 'home' }); return true; }
    return false;
  };

  // ---------------- rendering ----------------
  function render() {
    const app = $('#app');
    if (view.name === 'home') app.innerHTML = homeView();
    else if (view.name === 'site') { const s = site(view.siteId); if (!s) return go({ name: 'home' }); app.innerHTML = siteView(s); }
    else if (view.name === 'loc') {
      const s = site(view.siteId), l = loc(s, view.locId);
      if (!l) return go({ name: 'site', siteId: view.siteId });
      app.innerHTML = locView(s, l);
    }
    bind();
  }

  function homeView() {
    const sites = db.sites.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    let h = '<header class="bar"><div class="brand-mark">' + I.shield + '</div><h1>LP Assessment<span class="sub">Loss Prevention site assessments</span></h1>' +
      '<button class="icon-btn" data-act="home-menu" aria-label="Menu">' + I.more + '</button></header><main>';
    if (HOSTED && (C.status === 'signedout' || C.status === 'off')) {
      h += '<div class="card install"><b>Not saving to your Claude account</b><p>' + (C.status === 'signedout' ? 'Sign in to Claude to keep your assessments safe in your account.' : 'Account storage is not available here, so data stays in this browser only. Make a backup regularly.') + '</p></div>';
    }
    if (window.LPA_installHint && window.LPA_installHint()) {
      h += '<div class="card install"><b>Install on your iPhone</b><p>Tap the <b>Share</b> button in Safari, then <b>Add to Home Screen</b>. Always open LP Assessment from that icon — it works offline and keeps your data safe.</p></div>';
    }
    if (!sites.length) {
      h += '<div class="empty">' + I.clip + '<h3>No assessments yet</h3><p>Start a new site assessment, add the locations you visit, then export the whole site as one PDF report.</p></div>';
    } else {
      h += '<div class="section-title">Site assessments <span class="count">' + sites.length + '</span></div>';
      for (const s of sites) {
        h += '<div class="card site-card" role="button" data-act="open-site" data-id="' + s.id + '"><button class="card-more" data-act="site-card-menu" data-id="' + s.id + '" aria-label="Options">' + I.more + '</button><h3>' + esc(s.name || 'Untitled site') + '</h3>' +
          '<div class="meta"><span>' + esc(fmtDate(s.date)) + '</span>' + (s.assessor ? '<span>' + esc(s.assessor) + '</span>' : '') + '</div>' +
          '<div class="stats">' + [[s.locations.length, 'location'], [riskCount(s), 'risk'], [photoCount(s), 'photo']].map(x => '<span class="stat"><b>' + x[0] + '</b>' + x[1] + (x[0] === 1 ? '' : 's') + '</span>').join('') + '</div></div>';
      }
    }
    h += '</main><button class="fab" data-act="new-site">' + I.plus + 'New assessment</button>';
    return h;
  }

  function siteView(s) {
    let h = '<header class="bar"><button class="icon-btn" data-act="back" aria-label="Back">' + I.back + '</button>' +
      '<h1>' + esc(s.name || 'Untitled site') + '<span class="sub">' + esc(fmtDate(s.date)) + '</span></h1>' +
      '<button class="icon-btn" data-act="site-menu" aria-label="Menu">' + I.more + '</button></header><main>';
    h += '<div class="card">' +
      '<label class="f"><span>Site / property name</span><input class="input" data-bind="site.name" value="' + esc(s.name) + '" placeholder="e.g. Sunset Island Resort"></label>' +
      '<div class="row2"><label class="f"><span>Assessment date</span><input class="input" type="date" data-bind="site.date" value="' + esc(s.date) + '"></label>' +
      '<label class="f"><span>Assessed by</span><input class="input" data-bind="site.assessor" value="' + esc(s.assessor) + '" placeholder="Your name"></label></div>' +
      '<label class="f" style="margin-bottom:2px"><span>Reference / notes (optional)</span><input class="input" data-bind="site.ref" value="' + esc(s.ref) + '" placeholder="e.g. Annual LP visit, client, report no."></label>' +
      '</div>';
    h += '<div class="section-title">Locations <span class="count">' + s.locations.length + '</span></div>';
    if (!s.locations.length) {
      h += '<div class="empty" style="padding:22px 20px">' + I.pin + '<h3>Add the locations you will inspect</h3><p>Pick several at once from the list, or type your own.</p></div>';
    }
    s.locations.forEach((l, i) => {
      const fr = filledRisks(l);
      const types = Array.from(new Set([].concat.apply([], fr.map(typesOf))));
      const ph = l.photos[0];
      h += '<button class="card loc-card" data-act="open-loc" data-id="' + l.id + '">' +
        '<div class="thumb"' + (ph ? ' style="background-image:url(\'' + photoSrc(ph.id) + '\')"' : '') + '>' + (ph ? '' : I.cam) + '</div>' +
        '<div class="body"><h4><span class="num">' + (i + 1) + '</span>' + esc(l.name || 'Unnamed location') + '</h4>' +
        '<div class="line">' + (fr.length ? plural(fr.length, 'risk') + ' · ' + plural(l.photos.length, 'photo') : 'No findings yet' + (l.photos.length ? ' · ' + plural(l.photos.length, 'photo') : '')) + '</div>' +
        (types.length ? '<div class="line">' + esc(types.join(', ')) + '</div>' : '') +
        '</div><span class="chev">' + I.chev + '</span></button>';
    });
    h += '<button class="btn ghost block" data-act="add-locs" style="margin-top:4px">' + I.plus + 'Add locations</button>';
    h += '</main><div class="dock"><div class="inner"><button class="btn amber" data-act="export">' + I.pdf + 'Export PDF report</button></div></div>';
    return h;
  }

  function locView(s, l) {
    const idx = s.locations.indexOf(l);
    let h = '<header class="bar"><button class="icon-btn" data-act="back" aria-label="Back">' + I.back + '</button>' +
      '<h1>' + esc(l.name || 'Location') + '<span class="sub">Location ' + (idx + 1) + ' of ' + s.locations.length + ' · ' + esc(s.name || '') + '</span></h1>' +
      '<button class="icon-btn" data-act="loc-menu" aria-label="Menu">' + I.more + '</button></header><main>';

    h += '<div class="card"><label class="f"><span>Location name</span><input class="input" data-bind="loc.name" value="' + esc(l.name) + '" placeholder="e.g. Main kitchen" list="loc-sugg"></label>' +
      '<datalist id="loc-sugg">' + locSuggestions().map(n => '<option value="' + esc(n) + '">').join('') + '</datalist>' +
      '<label class="f" style="margin-bottom:2px"><span>Findings</span><textarea class="input" rows="4" data-bind="loc.findings" placeholder="Describe what you observed at this location…">' + esc(l.findings) + '</textarea></label></div>';

    h += '<div class="section-title">Risks &amp; required standards <span class="count">' + l.risks.length + '</span></div>';
    l.risks.forEach((r, i) => {
      h += '<div class="card risk" data-risk="' + r.id + '"><div class="risk-head"><b>Risk ' + (i + 1) + '</b>' +
        '<button class="link-btn danger" data-act="del-risk" data-id="' + r.id + '">Remove</button></div>' +
        '<label class="f"><span>Risk type(s)</span><button class="input" style="text-align:left;display:flex;justify-content:space-between;align-items:center" data-act="pick-risk" data-id="' + r.id + '">' +
        '<span style="color:' + (r.types.length ? 'var(--ink)' : '#9AA19A') + '">' + esc(r.types.length ? r.types.join(', ') : 'Select risk type(s)') + '</span>' + I.chev + '</button></label>' +
        '<label class="f"><span>Required standard</span><div class="std-wrap"><textarea class="input" rows="3" data-bind="risk.standard" data-id="' + r.id + '" placeholder="Type, or choose from the standards library" style="padding-bottom:46px">' + esc(r.standard) + '</textarea>' +
        '<button class="btn small std-lib" data-act="pick-std" data-id="' + r.id + '">' + I.book + 'Library</button></div></label>' +
        '<label class="f"><span>Timeline</span><div class="chips" style="margin-bottom:8px">' +
        db.timelines.map(t => '<button class="chip' + (r.timeline === t ? ' on' : '') + '" data-act="set-tl" data-id="' + r.id + '" data-v="' + esc(t) + '">' + esc(t) + '</button>').join('') +
        '</div><input class="input" data-bind="risk.timeline" data-id="' + r.id + '" value="' + esc(r.timeline) + '" placeholder="Or type a timeline / due date"></label></div>';
    });
    h += '<button class="btn ghost block" data-act="add-risk">' + I.plus + 'Add another risk</button>';

    h += '<div class="section-title">Photos <span class="count">' + l.photos.length + '</span></div>';
    if (l.photos.length) {
      h += '<div class="photos">' + l.photos.map(p => '<div class="photo"><img src="' + photoSrc(p.id) + '" loading="lazy" data-act="view-photo" data-id="' + p.id + '"><button class="x" data-act="del-photo" data-id="' + p.id + '" aria-label="Remove photo">' + I.close + '</button></div>').join('') + '</div>';
    }
    h += '<div class="photo-add"><button class="btn primary" data-act="photo-cam">' + I.cam + 'Take photo</button><button class="btn" data-act="photo-gal">' + I.img + 'From gallery</button></div>';

    const next = s.locations[idx + 1];
    h += '</main><div class="dock"><div class="inner">' +
      (next ? '<button class="btn primary" data-act="next-loc">Next: ' + esc(next.name || 'location') + ' ' + I.chev + '</button>'
            : '<button class="btn primary" data-act="back">' + I.check + 'Done — back to site</button>') +
      '</div></div>';
    return h;
  }

  function locSuggestions() {
    const seen = new Set(); const out = [];
    for (const n of db.recentLocations.concat(LOCATION_SUGGESTIONS)) { const k = n.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(n); } }
    return out;
  }

  // ---------------- events ----------------
  function bind() {
    $$('[data-bind]').forEach(el => {
      el.addEventListener('input', () => onInput(el));
      el.addEventListener('change', () => onInput(el, true));
    });
  }

  function onInput(el, committed) {
    const key = el.dataset.bind, v = el.value;
    const s = site(view.siteId); if (!s) return;
    if (key.startsWith('site.')) {
      s[key.slice(5)] = v;
      if (key === 'site.assessor' && committed) db.assessor = v;
      if (committed) { const h = $('.bar h1'); if (h) h.innerHTML = esc(s.name || 'Untitled site') + '<span class="sub">' + esc(fmtDate(s.date)) + '</span>'; }
    } else {
      const l = loc(s, view.locId); if (!l) return;
      if (key === 'loc.name') { l.name = v; if (committed) { rememberLocation(v); const h = $('.bar h1'); if (h) h.firstChild.textContent = v || 'Location'; } }
      else if (key === 'loc.findings') l.findings = v;
      else if (key.startsWith('risk.')) {
        const r = l.risks.find(x => x.id === el.dataset.id); if (!r) return;
        r[key.slice(5)] = v;
        if (key === 'risk.timeline') $$('.chip[data-id="' + r.id + '"]').forEach(c => c.classList.toggle('on', c.dataset.v === v));
      }
    }
    touch(s);
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]'); if (!t) return;
    const act = t.dataset.act, id = t.dataset.id;
    const s = site(view.siteId), l = s && loc(s, view.locId);
    switch (act) {
      case 'back': window.onAndroidBack(); break;
      case 'new-site': {
        const ns = { id: uid(), name: '', date: today(), assessor: db.assessor || '', ref: '', locations: [], createdAt: Date.now(), updatedAt: Date.now() };
        db.sites.push(ns); save(true); go({ name: 'site', siteId: ns.id });
        setTimeout(() => { const i = $('[data-bind="site.name"]'); if (i) i.focus(); }, 80);
        break;
      }
      case 'open-site': go({ name: 'site', siteId: id }); break;
      case 'open-loc': go({ name: 'loc', siteId: view.siteId, locId: id }); break;
      case 'add-locs': addLocationsSheet(s); break;
      case 'next-loc': { const i = s.locations.indexOf(l); go({ name: 'loc', siteId: s.id, locId: s.locations[i + 1].id }); break; }
      case 'add-risk': l.risks.push(newRisk()); touch(s); render(); setTimeout(() => { const c = $$('.risk'); c[c.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 30); break;
      case 'del-risk': {
        const r = l.risks.find(x => x.id === id);
        const doIt = () => { l.risks = l.risks.filter(x => x.id !== id); touch(s); render(); };
        if (r && (r.types.length || r.standard || r.timeline)) confirmSheet('Remove this risk?', 'Risk type, standard and timeline for this entry will be deleted.', 'Remove', doIt);
        else doIt();
        break;
      }
      case 'pick-risk': pickRiskSheet(s, l, l.risks.find(x => x.id === id)); break;
      case 'pick-std': pickStandardSheet(s, l, l.risks.find(x => x.id === id)); break;
      case 'set-tl': {
        const r = l.risks.find(x => x.id === id); r.timeline = r.timeline === t.dataset.v ? '' : t.dataset.v; touch(s);
        $$('.chip[data-id="' + id + '"]').forEach(c => c.classList.toggle('on', c.dataset.v === r.timeline));
        const inp = $('[data-bind="risk.timeline"][data-id="' + id + '"]'); if (inp) inp.value = r.timeline;
        break;
      }
      case 'photo-cam': case 'photo-gal': requestPhotos(act === 'photo-cam' ? 'camera' : 'gallery', s, l); break;
      case 'del-photo': confirmSheet('Remove this photo?', 'The photo will be deleted from this location.', 'Remove', () => {
        const ph = l.photos.find(p => p.id === id);
        l.photos = l.photos.filter(p => p.id !== id); deletePhotoFile(id, ph && ph.asset); touch(s); render();
      }); break;
      case 'view-photo': viewPhoto(id); break;
      case 'export': exportSheet(s); break;
      case 'home-menu': homeMenu(); break;
      case 'site-menu': siteMenu(s); break;
      case 'site-card-menu': siteMenu(site(id)); break;
      case 'loc-menu': locMenu(s, l); break;
    }
  });

  // ---------------- photos ----------------
  function requestPhotos(source, s, l) {
    save(true);
    const target = JSON.stringify({ siteId: s.id, locId: l.id });
    if (A) { A.pickPhoto(source, target); return; }
    // web / iPhone: camera or photo library through a file input, resized before storing
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = source !== 'camera';
    if (source === 'camera') inp.setAttribute('capture', 'environment');
    inp.style.display = 'none'; document.body.appendChild(inp);
    inp.onchange = async () => {
      const files = Array.from(inp.files || []); inp.remove();
      if (!files.length) return;
      busy(true, files.length > 1 ? 'Adding ' + files.length + ' photos…' : 'Adding photo…');
      const out = [];
      for (const f of files) {
        try { out.push(await importImageFile(f)); }
        catch (e) { toast('Could not add a photo: ' + (e.message || e)); }
      }
      busy(false);
      window.onPhotos(out, target);
    };
    inp.click();
  }

  async function importImageFile(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('unsupported image')); im.src = url; });
      const MAX = 1600, sc = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.round(img.naturalWidth * sc), h = Math.round(img.naturalHeight * sc);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.82));
      if (!blob) throw new Error('could not compress image');
      const id = uid();
      await W.putPhoto(id, blob);
      c.width = c.height = 0;
      return { id, w, h };
    } finally { URL.revokeObjectURL(url); }
  }

  window.onPhotos = function (photos, targetJson) {
    let tgt = {}; try { tgt = JSON.parse(targetJson || '{}'); } catch (e) { }
    const s = site(tgt.siteId), l = loc(s, tgt.locId);
    if (!l) { photos.forEach(p => deletePhotoFile(p.id)); return; }
    photos.forEach(p => l.photos.push({ id: p.id, w: p.w, h: p.h }));
    touch(s); save(true);
    if (photos.length) toast(plural(photos.length, 'photo') + ' added');
    if (HOSTED) uploadPending();
    if (view.name === 'loc' && view.locId === l.id) render();
    else go({ name: 'loc', siteId: s.id, locId: l.id });
    setTimeout(() => { const g = $('.photos'); if (g) g.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 60);
  };

  function viewPhoto(id) {
    openSheet({ title: 'Photo', body: '<img src="' + photoSrc(id) + '" style="width:100%;border-radius:12px;display:block">' });
  }

  // ---------------- sheets ----------------
  function openSheet({ title, body, foot, onMount }) {
    const root = $('#sheet-root');
    const el = document.createElement('div'); el.className = 'scrim';
    el.innerHTML = '<div class="sheet"><div class="grabber"></div><div class="sheet-head"><h2>' + esc(title) + '</h2><button class="icon-btn" data-sheet-close aria-label="Close">' + I.close + '</button></div>' +
      '<div class="sheet-body">' + body + '</div>' + (foot ? '<div class="sheet-foot">' + foot + '</div>' : '') + '</div>';
    el.addEventListener('click', (e) => { if (e.target === el || e.target.closest('[data-sheet-close]')) closeSheet(); });
    root.appendChild(el); sheetStack.push(el);
    if (onMount) onMount(el);
    return el;
  }
  function closeSheet() { const el = sheetStack.pop(); if (el) el.remove(); }
  function closeAllSheets() { while (sheetStack.length) closeSheet(); }

  function confirmSheet(title, msg, okLabel, onOk) {
    openSheet({ title, body: '<p class="hint" style="font-size:15px;margin-bottom:4px">' + esc(msg) + '</p>',
      foot: '<div class="btn-row"><button class="btn" data-sheet-close>Cancel</button><button class="btn danger" id="ok-btn">' + esc(okLabel) + '</button></div>',
      onMount: (el) => $('#ok-btn', el).onclick = () => { closeSheet(); onOk(); } });
  }

  function promptSheet(title, label, value, onOk, multiline) {
    openSheet({ title,
      body: '<label class="f"><span>' + esc(label) + '</span>' + (multiline ? '<textarea class="input" id="pr-in" rows="4">' + esc(value) + '</textarea>' : '<input class="input" id="pr-in" value="' + esc(value) + '">') + '</label>',
      foot: '<div class="btn-row"><button class="btn" data-sheet-close>Cancel</button><button class="btn primary" id="ok-btn">Save</button></div>',
      onMount: (el) => { const i = $('#pr-in', el); setTimeout(() => i.focus(), 50); $('#ok-btn', el).onclick = () => { const v = i.value.trim(); closeSheet(); onOk(v); }; } });
  }

  function addLocationsSheet(s) {
    const existing = new Set(s.locations.map(l => l.name.toLowerCase()));
    const sugg = locSuggestions().filter(n => !existing.has(n.toLowerCase()));
    const picked = new Set();
    openSheet({ title: 'Add locations',
      body: '<p class="hint">Tick every location you will visit on this site, and/or type new ones (one per line). You can add more later.</p>' +
        '<label class="f"><span>Type location names</span><textarea class="input" id="loc-new" rows="3" placeholder="e.g. Main kitchen&#10;LPG storage&#10;Staff accommodation block B"></textarea></label>' +
        '<div class="search"><input class="input" id="loc-q" placeholder="Search the list…"></div>' +
        '<div id="loc-list">' + sugg.map(n => '<label class="check" data-n="' + esc(n.toLowerCase()) + '"><input type="checkbox" value="' + esc(n) + '"><div class="t">' + esc(n) + '</div></label>').join('') + '</div>',
      foot: '<button class="btn primary block" id="ok-btn">Add locations</button>',
      onMount: (el) => {
        const btn = $('#ok-btn', el), ta = $('#loc-new', el);
        const upd = () => {
          const typed = ta.value.split('\n').map(x => x.trim()).filter(Boolean);
          const n = picked.size + typed.length;
          btn.textContent = n ? 'Add ' + plural(n, 'location') : 'Add locations';
        };
        ta.addEventListener('input', upd);
        $$('input[type=checkbox]', el).forEach(c => c.addEventListener('change', () => { c.checked ? picked.add(c.value) : picked.delete(c.value); upd(); }));
        $('#loc-q', el).addEventListener('input', (e) => { const q = e.target.value.toLowerCase(); $$('#loc-list .check', el).forEach(r => r.style.display = r.dataset.n.includes(q) ? '' : 'none'); });
        btn.onclick = () => {
          const typed = ta.value.split('\n').map(x => x.trim()).filter(Boolean);
          const names = Array.from(picked).concat(typed);
          if (!names.length) { toast('Tick or type at least one location'); return; }
          names.forEach(n => { s.locations.push(newLocation(n)); rememberLocation(n); });
          touch(s); save(true); closeSheet(); render();
          toast(plural(names.length, 'location') + ' added');
        };
      } });
  }

  function pickRiskSheet(s, l, r) {
    const sel = new Set(r.types);
    // keep any previously chosen type that is no longer in the list
    r.types.forEach(t => { if (!db.risks.includes(t)) db.risks.push(t); });
    const draw = (el) => {
      $('#rt-list', el).innerHTML = db.risks.map((x, i) => '<label class="check"><input type="checkbox" data-i="' + i + '"' + (sel.has(x) ? ' checked' : '') + '><div class="t">' + esc(x) + '</div></label>').join('');
      $('#rt-done', el).textContent = sel.size ? 'Done — ' + plural(sel.size, 'risk type') + ' selected' : 'Done';
    };
    openSheet({ title: 'Risk type(s)',
      body: '<p class="hint">Tick every risk type that applies to this entry.</p><div id="rt-list"></div>' +
        '<button class="opt" id="custom-risk" style="color:var(--navy-2);font-weight:600">+ Other / custom risk type…</button>',
      foot: '<div class="btn-row"><button class="btn" id="rt-clear" style="flex:0 0 auto">Clear</button><button class="btn primary" id="rt-done">Done</button></div>',
      onMount: (el) => {
        draw(el);
        $('#rt-list', el).addEventListener('change', (e) => {
          const c = e.target; const v = db.risks[+c.dataset.i];
          c.checked ? sel.add(v) : sel.delete(v); draw(el);
        });
        $('#rt-clear', el).onclick = () => { sel.clear(); draw(el); };
        $('#rt-done', el).onclick = () => { r.types = db.risks.filter(x => sel.has(x)); touch(s); closeSheet(); render(); };
        $('#custom-risk', el).onclick = () => promptSheet('Custom risk type', 'Risk type', '', (v) => {
          if (!v) return;
          const ex = db.risks.find(x => x.toLowerCase() === v.toLowerCase());
          if (ex) sel.add(ex); else { db.risks.push(v); sel.add(v); save(); }
          draw(el);
        });
      } });
  }

  function pickStandardSheet(s, l, r) {
    const listHtml = () => db.standards.map((x, i) => '<button class="opt" data-i="' + i + '" data-n="' + esc(x.toLowerCase()) + '">' + esc(x) + '</button>').join('');
    openSheet({ title: 'Standards library',
      body: '<div class="search"><input class="input" id="std-q" placeholder="Search standards (e.g. fire, LPG, chemical)…"></div><div id="std-list">' + listHtml() + '</div>',
      foot: '<div class="btn-row"><button class="btn" id="std-save">' + I.save + 'Save mine to library</button></div>',
      onMount: (el) => {
        const filter = (q) => $$('#std-list .opt', el).forEach(b => b.style.display = b.dataset.n.includes(q) ? '' : 'none');
        $('#std-q', el).addEventListener('input', (e) => filter(e.target.value.toLowerCase()));
        $('#std-list', el).addEventListener('click', (e) => {
          const b = e.target.closest('.opt'); if (!b) return;
          const v = db.standards[+b.dataset.i];
          r.standard = r.standard && r.standard.trim() && !r.standard.includes(v) ? r.standard.trim() + '\n' + v : v;
          touch(s); closeSheet(); render();
        });
        $('#std-save', el).onclick = () => {
          const v = (r.standard || '').trim();
          if (!v) { toast('Type a standard first, then save it to the library'); return; }
          if (db.standards.some(x => x.toLowerCase() === v.toLowerCase())) { toast('Already in the library'); return; }
          db.standards.push(v); save(); toast('Saved to standards library');
          $('#std-list', el).innerHTML = listHtml();
        };
      } });
  }

  function homeMenu() {
    openSheet({ title: 'Menu',
      body: '<button class="menu-item" id="m-std">' + I.book + '<div>Standards library<small>' + db.standards.length + ' standards — add, edit or remove</small></div></button>' +
        '<button class="menu-item" id="m-risk">' + I.list + '<div>Risk types<small>' + db.risks.length + ' risk types — add, edit or remove</small></div></button>' +
        '<button class="menu-item danger" id="m-delmany">' + I.trash + '<div>Delete assessments<small>Select one or more assessments to delete</small></div></button>' +
        '<button class="menu-item" id="m-backup">' + I.save + '<div>Back up all data<small>Save a backup file (includes photos)</small></div></button>' +
        '<button class="menu-item" id="m-restore">' + I.upload + '<div>Restore from backup<small>Load assessments from a backup file</small></div></button>' +
        '<p class="hint" style="margin-top:14px">LP Assessment ' + esc(A && A.appVersion ? 'v' + A.appVersion() : 'web 1.1') + ' · ' + esc(storageNote()) + '</p>',
      onMount: (el) => {
        $('#m-std', el).onclick = () => { closeSheet(); manageList('Standards library', 'standards', true); };
        $('#m-risk', el).onclick = () => { closeSheet(); manageList('Risk types', 'risks', false); };
        $('#m-backup', el).onclick = () => { closeSheet(); backupAll(); };
        $('#m-delmany', el).onclick = () => { closeSheet(); deleteManySheet(); };
        $('#m-restore', el).onclick = () => { closeSheet(); if (A) A.openBackup(); else pickBackupFile(); };
      } });
  }

  function manageList(title, key, multiline) {
    const draw = (el) => {
      $('#ml', el).innerHTML = db[key].map((x, i) => '<div class="opt" style="display:flex;gap:8px;align-items:flex-start"><div style="flex:1">' + esc(x) + '</div>' +
        '<button class="link-btn" data-e="' + i + '">Edit</button><button class="link-btn danger" data-d="' + i + '">Delete</button></div>').join('');
    };
    openSheet({ title, body: '<div id="ml"></div>', foot: '<button class="btn primary block" id="ml-add">' + I.plus + 'Add new</button>',
      onMount: (el) => {
        draw(el);
        $('#ml', el).addEventListener('click', (e) => {
          const ed = e.target.closest('[data-e]'), de = e.target.closest('[data-d]');
          if (ed) promptSheet('Edit', title, db[key][+ed.dataset.e], (v) => { if (v) { db[key][+ed.dataset.e] = v; save(); draw(el); } }, multiline);
          if (de) confirmSheet('Delete this entry?', db[key][+de.dataset.d], 'Delete', () => { db[key].splice(+de.dataset.d, 1); save(); draw(el); });
        });
        $('#ml-add', el).onclick = () => promptSheet('Add new', title, '', (v) => { if (v) { db[key].push(v); save(); draw(el); } }, multiline);
      } });
  }

  function siteMenu(s) {
    openSheet({ title: s.name || 'Site',
      body: (view.name === 'home' ? '<button class="menu-item" id="m-open">' + I.edit + '<div>Open<small>' + plural(s.locations.length, 'location') + ' · ' + esc(fmtDate(s.date)) + '</small></div></button>' : '') +
        '<button class="menu-item" id="m-reorder">' + I.list + '<div>Reorder locations<small>Change the order used in the report</small></div></button>' +
        '<button class="menu-item" id="m-dup">' + I.copy + '<div>Duplicate as new assessment<small>Same site & location names, empty findings — for a follow-up visit</small></div></button>' +
        '<button class="menu-item danger" id="m-del">' + I.trash + '<div>Delete assessment<small>Removes all locations, findings and photos</small></div></button>',
      onMount: (el) => {
        $('#m-reorder', el).onclick = () => { closeSheet(); reorderSheet(s); };
        const mo = $('#m-open', el); if (mo) mo.onclick = () => { closeSheet(); go({ name: 'site', siteId: s.id }); };
        $('#m-dup', el).onclick = () => {
          closeSheet();
          const ns = { id: uid(), name: s.name, date: today(), assessor: db.assessor || s.assessor, ref: '', createdAt: Date.now(), updatedAt: Date.now(),
            locations: s.locations.map(l => newLocation(l.name)) };
          db.sites.push(ns); save(true); go({ name: 'site', siteId: ns.id }); toast('Duplicated — new assessment dated today');
        };
        $('#m-del', el).onclick = () => confirmDeleteSites([s.id]);
      } });
  }

  function confirmDeleteSites(ids) {
    const list = db.sites.filter(x => ids.includes(x.id));
    if (!list.length) return;
    const nl = list.reduce((n, s) => n + s.locations.length, 0), np = list.reduce((n, s) => n + photoCount(s), 0);
    const title = list.length === 1 ? 'Delete "' + (list[0].name || 'Untitled site') + '"?' : 'Delete ' + list.length + ' assessments?';
    confirmSheet(title, plural(nl, 'location') + ', all findings and ' + plural(np, 'photo') + ' will be permanently deleted. This cannot be undone — make a backup first if you may need them.', 'Delete', () => {
      list.forEach(s => s.locations.forEach(l => l.photos.forEach(p => deletePhotoFile(p.id, p.asset))));
      db.deletedSites = (db.deletedSites || []).concat(ids);
      db.sites = db.sites.filter(x => !ids.includes(x.id)); save(true); closeAllSheets(); go({ name: 'home' });
      toast(plural(list.length, 'assessment') + ' deleted');
    });
  }

  function deleteManySheet() {
    if (!db.sites.length) { toast('No assessments to delete'); return; }
    const sel = new Set();
    const sites = db.sites.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    openSheet({ title: 'Delete assessments',
      body: '<div class="btn-row" style="margin-bottom:10px"><button class="btn small" id="d-all">Select all</button><button class="btn small" id="d-none">Clear</button></div>' +
        sites.map(s => '<label class="check"><input type="checkbox" value="' + s.id + '"><div class="t"><b>' + esc(s.name || 'Untitled site') + '</b><small>' + esc(fmtDate(s.date)) + ' · ' + plural(s.locations.length, 'location') + ' · ' + plural(photoCount(s), 'photo') + '</small></div></label>').join(''),
      foot: '<button class="btn danger block" id="d-go">' + I.trash + 'Delete selected</button>',
      onMount: (el) => {
        const boxes = $$('input[type=checkbox]', el);
        const upd = () => { $('#d-go', el).innerHTML = I.trash + (sel.size ? 'Delete ' + plural(sel.size, 'assessment') : 'Delete selected'); };
        boxes.forEach(b => b.addEventListener('change', () => { b.checked ? sel.add(b.value) : sel.delete(b.value); upd(); }));
        $('#d-all', el).onclick = () => { boxes.forEach(b => { b.checked = true; sel.add(b.value); }); upd(); };
        $('#d-none', el).onclick = () => { boxes.forEach(b => { b.checked = false; }); sel.clear(); upd(); };
        $('#d-go', el).onclick = () => { if (!sel.size) { toast('Select at least one assessment'); return; } confirmDeleteSites(Array.from(sel)); };
      } });
  }

  function reorderSheet(s) {
    const draw = (el) => {
      $('#ro', el).innerHTML = s.locations.map((l, i) => '<div class="opt" style="display:flex;align-items:center;gap:6px"><span class="num">' + (i + 1) + '</span><div style="flex:1;min-width:0">' + esc(l.name || 'Unnamed') + '</div>' +
        '<button class="btn small" data-u="' + i + '"' + (i === 0 ? ' disabled style="opacity:.3"' : '') + '>↑</button><button class="btn small" data-dn="' + i + '"' + (i === s.locations.length - 1 ? ' disabled style="opacity:.3"' : '') + '>↓</button></div>').join('');
    };
    openSheet({ title: 'Reorder locations', body: '<div id="ro"></div>', foot: '<button class="btn primary block" data-sheet-close>Done</button>',
      onMount: (el) => {
        draw(el);
        $('#ro', el).addEventListener('click', (e) => {
          const u = e.target.closest('[data-u]'), d = e.target.closest('[data-dn]');
          const L = s.locations;
          if (u) { const i = +u.dataset.u; [L[i - 1], L[i]] = [L[i], L[i - 1]]; }
          if (d) { const i = +d.dataset.dn; [L[i + 1], L[i]] = [L[i], L[i + 1]]; }
          if (u || d) { touch(s); draw(el); render(); }
        });
      } });
  }

  function locMenu(s, l) {
    openSheet({ title: l.name || 'Location',
      body: '<button class="menu-item" id="m-dupl">' + I.copy + '<div>Duplicate location<small>Copy the name, findings and risks (not photos)</small></div></button>' +
        '<button class="menu-item danger" id="m-dell">' + I.trash + '<div>Delete location<small>Removes its findings and photos</small></div></button>',
      onMount: (el) => {
        $('#m-dupl', el).onclick = () => {
          closeSheet();
          const c = JSON.parse(JSON.stringify(l)); c.id = uid(); c.name = l.name + ' (copy)'; c.photos = []; c.risks.forEach(r => r.id = uid());
          s.locations.splice(s.locations.indexOf(l) + 1, 0, c); touch(s); go({ name: 'loc', siteId: s.id, locId: c.id });
        };
        $('#m-dell', el).onclick = () => confirmSheet('Delete this location?', (l.name || 'This location') + ' and its ' + plural(l.photos.length, 'photo') + ' will be deleted.', 'Delete', () => {
          l.photos.forEach(p => deletePhotoFile(p.id, p.asset)); s.locations = s.locations.filter(x => x.id !== l.id); touch(s); save(true); closeAllSheets(); go({ name: 'site', siteId: s.id });
        });
      } });
  }

  // ---------------- export ----------------
  function safeName(s) { return (s || 'Site').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_').slice(0, 60) || 'Site'; }

  function exportSheet(s) {
    if (!s.locations.length) { toast('Add at least one location first'); return; }
    const sel = new Set(s.locations.map(l => l.id));
    openSheet({ title: 'Export PDF report',
      body: '<p class="hint">Choose the locations to include. The report has a cover page with a summary, one page per location (findings, risks, standards, timeline and photos) and a consolidated action plan.</p>' +
        '<div class="btn-row" style="margin-bottom:10px"><button class="btn small" id="sel-all">Select all</button><button class="btn small" id="sel-none">Clear</button></div>' +
        s.locations.map((l, i) => '<label class="check"><input type="checkbox" value="' + l.id + '" checked><div class="t"><b>' + (i + 1) + '. ' + esc(l.name || 'Unnamed location') + '</b><small>' + plural(filledRisks(l).length, 'risk') + ' · ' + plural(l.photos.length, 'photo') + '</small></div></label>').join('') +
        '<label class="check"><input type="checkbox" id="opt-plan" checked><div class="t"><b>Include action plan table</b><small>All risks from all locations in one table at the end</small></div></label>',
      foot: '<button class="btn amber block" id="go-pdf">' + I.pdf + 'Create PDF</button>',
      onMount: (el) => {
        const boxes = $$('input[type=checkbox][value]', el);
        const upd = () => { $('#go-pdf', el).innerHTML = I.pdf + 'Create PDF (' + plural(sel.size, 'location') + ')'; };
        boxes.forEach(b => b.addEventListener('change', () => { b.checked ? sel.add(b.value) : sel.delete(b.value); upd(); }));
        $('#sel-all', el).onclick = () => { boxes.forEach(b => { b.checked = true; sel.add(b.value); }); upd(); };
        $('#sel-none', el).onclick = () => { boxes.forEach(b => { b.checked = false; }); sel.clear(); upd(); };
        upd();
        $('#go-pdf', el).onclick = () => {
          if (!sel.size) { toast('Select at least one location'); return; }
          const plan = $('#opt-plan', el).checked;
          closeSheet(); makePdf(s, s.locations.filter(l => sel.has(l.id)), plan);
        };
      } });
  }

  function makePdf(s, locations, plan) {
    busy(true, 'Building PDF report…');
    setTimeout(async () => {
      let doc;
      try {
        const pm = await photoDataMap([].concat.apply([], locations.map(l => l.photos.map(p => p.id))));
        doc = window.buildReport({ site: s, locations, includePlan: plan, photoData: (id) => pm[id] || '' });
      } catch (e) { busy(false); toast('PDF failed: ' + e.message); console.error(e); return; }
      const name = 'LP_Assessment_' + safeName(s.name) + '_' + (s.date || today()) + '.pdf';
      if (!A) { const blob = doc.output('blob'); busy(false); webExportDone(name, blob, true); return; }
      const b64 = doc.output('datauristring').split(',')[1];
      const ok = A.writeExport(b64, name);
      busy(false);
      if (!ok) { toast('Could not write PDF'); return; }
      exportDone(name, 'application/pdf', true);
    }, 60);
  }

  function exportDone(name, mime, isPdf) {
    openSheet({ title: isPdf ? 'Report ready' : 'Backup ready',
      body: '<div class="done-banner">' + I.check + '<div><b>' + esc(name) + '</b></div></div>' +
        (isPdf ? '<button class="menu-item" id="x-open">' + I.eye + '<div>Open<small>View in your PDF reader</small></div></button>' : '') +
        '<button class="menu-item" id="x-share">' + I.share + '<div>Share<small>Email, WhatsApp, Drive, Teams…</small></div></button>' +
        '<button class="menu-item" id="x-save">' + I.save + '<div>Save to phone<small>Choose a folder, e.g. Downloads</small></div></button>',
      onMount: (el) => {
        if (isPdf) $('#x-open', el).onclick = () => A.openExport(name, mime);
        $('#x-share', el).onclick = () => A.shareExport(name, mime);
        $('#x-save', el).onclick = () => A.saveExportAs(name, mime);
      } });
  }

  // web / iPhone: share sheet (Save to Files, Mail, WhatsApp…) or open in a new tab
  function webExportDone(name, blob, isPdf) {
    if (HOSTED) return hostedExportDone(name, blob, isPdf);
    const mime = isPdf ? 'application/pdf' : 'application/json';
    const file = new File([blob], name, { type: mime });
    const url = URL.createObjectURL(blob);
    const canShare = !!(navigator.canShare && navigator.canShare({ files: [file] }));
    openSheet({ title: isPdf ? 'Report ready' : 'Backup ready',
      body: '<div class="done-banner">' + I.check + '<div><b>' + esc(name) + '</b></div></div>' +
        (canShare ? '<button class="menu-item" id="x-share">' + I.share + '<div>Share or save<small>Save to Files, Mail, WhatsApp, AirDrop…</small></div></button>' : '') +
        (isPdf ? '<a class="menu-item" id="x-open" href="' + url + '" target="_blank" rel="noopener">' + I.eye + '<div>Open<small>View the PDF</small></div></a>' : '') +
        '<a class="menu-item" id="x-dl" href="' + url + '" download="' + esc(name) + '">' + I.save + '<div>Download<small>Saves to your Downloads folder</small></div></a>',
      onMount: (el) => {
        const sb = $('#x-share', el);
        if (sb) sb.onclick = () => navigator.share({ files: [file], title: name }).catch((e) => { if (e && e.name !== 'AbortError') toast('Sharing failed — try Download'); });
      } });
  }

  // ---------------- backup / restore ----------------
  function backupAll() {
    busy(true, 'Preparing backup…');
    setTimeout(async () => {
      const ids = [].concat.apply([], db.sites.map(s => [].concat.apply([], s.locations.map(l => l.photos.map(p => p.id)))));
      const pm = await photoDataMap(ids);
      const photos = {};
      for (const id of ids) if (pm[id]) photos[id] = pm[id].split(',')[1];
      const txt = JSON.stringify({ kind: 'lp-assessment-backup', version: 1, createdAt: new Date().toISOString(), db, photos });
      const name = 'LP_Assessment_backup_' + today() + '.json';
      busy(false);
      if (!A) { webExportDone(name, new Blob([txt], { type: 'application/json' }), false); return; }
      if (!A.writeExportText(txt, name)) { toast('Could not write backup'); return; }
      exportDone(name, 'application/json', false);
    }, 60);
  }

  window.onBackupLoaded = function (txt) {
    let data;
    try { data = JSON.parse(txt); } catch (e) { toast('That file is not a valid backup'); return; }
    if (!data || data.kind !== 'lp-assessment-backup' || !data.db) { toast('That file is not an LP Assessment backup'); return; }
    busy(true, 'Restoring…');
    setTimeout(async () => {
      let added = 0, skipped = 0;
      migrate(data.db.sites);
      for (const s of data.db.sites || []) {
        if (db.sites.some(x => x.id === s.id)) { skipped++; continue; }
        for (const l of s.locations) for (const p of l.photos) {
          const b = data.photos && data.photos[p.id]; if (!b) continue;
          if (A) A.importPhoto(p.id, b);
          else { try { await W.putPhoto(p.id, b64ToBlob(b, 'image/jpeg')); delete p.asset; } catch (e) { } }
        }
        db.sites.push(s); added++;
      }
      for (const k of ['standards', 'risks', 'timelines', 'recentLocations']) {
        for (const v of data.db[k] || []) if (!db[k].includes(v)) db[k].push(v);
      }
      save(true); busy(false); render(); if (HOSTED) uploadPending();
      toast('Restored ' + plural(added, 'assessment') + (skipped ? ' (' + skipped + ' already on this phone)' : ''));
    }, 60);
  };


  // ---------------- Claude account sync (hosted mode) ----------------
  const C = { db: null, assets: null, downloads: null, uid: null, status: HOSTED ? 'connecting' : 'none', synced: {}, metaJson: '', cloudDeleted: new Set(),
    timer: null, running: false, again: false, uploading: false, pendingUploads: 0 };
  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej({ code: 'timeout' }), ms))]);

  function storageNote() {
    if (!HOSTED) return 'Data is stored on this phone only. Make a backup regularly.';
    if (C.status === 'synced') return C.pendingUploads ? 'Saving to your Claude account… ' + plural(C.pendingUploads, 'photo') + ' still uploading.' : 'Saved to your Claude account — private to you, available on any device where you open this page.';
    if (C.status === 'connecting') return 'Connecting to your Claude account…';
    if (C.status === 'error') return 'Could not reach your Claude account just now. Your work is kept on this device and will sync when the connection is back.';
    return 'Not syncing to your Claude account — data stays in this browser. Make a backup regularly.';
  }

  async function cloudInit() {
    try {
      const cl = window.claude;
      if (!cl || !cl.use) { C.status = 'off'; render(); return; }
      const [dbc, user, assets, downloads] = await Promise.all(['db', 'user', 'assets', 'downloads'].map(n => cl.use(n).catch(() => null)));
      C.assets = assets; C.downloads = downloads;
      if (!dbc || !user) { C.status = dbc ? 'off' : 'signedout'; render(); return; }
      const uid = await user.id();
      if (!uid) { C.status = 'signedout'; render(); return; }
      C.db = dbc; C.uid = uid;
      const snap = await withTimeout(dbc.collection('data/users/' + uid).get(), 15000);
      let meta = null; const cloudSites = {};
      snap.docs.forEach(d => {
        const v = d.data(); if (!v) return;
        if (d.id === 'meta') meta = v;
        else if (d.id.indexOf('site_') === 0) cloudSites[d.id.slice(5)] = v;
      });
      // deletions made on any device win
      const deleted = new Set([].concat(db.deletedSites || [], (meta && meta.deleted) || []));
      db.deletedSites = Array.from(deleted);
      db.sites.filter(s => deleted.has(s.id)).forEach(s => s.locations.forEach(l => l.photos.forEach(p => W.delPhoto(p.id).catch(() => { }))));
      db.sites = db.sites.filter(s => !deleted.has(s.id));
      for (const id of Object.keys(cloudSites)) {
        if (deleted.has(id)) continue;
        const cs = cloudSites[id]; let parsed;
        try { parsed = JSON.parse(cs.json); } catch (e) { continue; }
        const local = db.sites.find(s => s.id === id);
        if (!local) db.sites.push(parsed);
        else if ((cs.updatedAt || 0) > (local.updatedAt || 0)) db.sites[db.sites.indexOf(local)] = parsed;
        if (!local || (cs.updatedAt || 0) >= (local.updatedAt || 0)) C.synced[id] = cs.updatedAt || 0;
      }
      migrate(db.sites);
      if (meta) {
        for (const k of ['standards', 'risks', 'timelines', 'recentLocations']) for (const v of meta[k] || []) if (!db[k].includes(v)) db[k].push(v);
        if (!db.assessor && meta.assessor) db.assessor = meta.assessor;
      }
      Object.keys(cloudSites).forEach(id => { if (deleted.has(id)) C.cloudDeleted.delete(id); });
      C.status = 'synced';
      save(true);
      if (view.name !== 'home' && !site(view.siteId)) go({ name: 'home' }); else render();
      cloudPush(Object.keys(cloudSites));
      uploadPending();
    } catch (e) {
      C.status = 'error'; render();
      setTimeout(() => { if (C.status === 'error') cloudInit(); }, 30000);
    }
  }

  function cloudSchedule() {
    if (!C.db || C.status !== 'synced') return;
    clearTimeout(C.timer); C.timer = setTimeout(() => cloudPush(), 1500);
  }

  async function cloudPush(cloudIds) {
    if (!C.db) return;
    if (C.running) { C.again = true; return; }
    C.running = true;
    try {
      const col = C.db.collection('data/users/' + C.uid);
      const known = new Set(cloudIds || Object.keys(C.synced));
      for (const s of db.sites.slice()) {
        if (C.synced[s.id] === s.updatedAt) continue;
        const stamp = s.updatedAt || Date.now();
        await col.doc('site_' + s.id).set({ json: JSON.stringify(s), updatedAt: stamp, name: s.name || '', date: s.date || '' });
        C.synced[s.id] = stamp;
      }
      for (const id of db.deletedSites || []) {
        if (!known.has(id) && !(id in C.synced)) continue;
        await col.doc('site_' + id).delete();
        delete C.synced[id]; known.delete(id);
      }
      const meta = { risks: db.risks, standards: db.standards, timelines: db.timelines, recentLocations: db.recentLocations, assessor: db.assessor || '', deleted: (db.deletedSites || []).slice(-500) };
      const mj = JSON.stringify(meta);
      if (mj !== C.metaJson) { await col.doc('meta').set(meta); C.metaJson = mj; }
      if (C.status !== 'synced') { C.status = 'synced'; }
    } catch (e) {
      if (e && e.code === 'quota_exceeded') toast('Your Claude account storage for this app is full. Delete old assessments.');
      C.status = 'error';
      setTimeout(() => { if (C.status === 'error') { C.status = 'synced'; cloudPush(); } }, 20000);
    } finally {
      C.running = false;
      if (C.again) { C.again = false; cloudPush(); }
    }
  }

  async function uploadPending() {
    if (!C.assets || C.uploading) return;
    C.uploading = true;
    try {
      for (;;) {
        const todo = [];
        db.sites.forEach(s => s.locations.forEach(l => l.photos.forEach(p => { if (!p.asset && !p.missing) todo.push({ s, p }); })));
        C.pendingUploads = todo.length;
        if (!todo.length) break;
        const { s, p } = todo[0];
        const blob = await W.getPhoto(p.id).catch(() => null);
        if (!blob) { p.missing = true; continue; }   // photo not on this device (taken on another one before it uploaded)
        let res;
        try { res = await C.assets.upload(blob, { type: 'image/jpeg' }); }
        catch (e) {
          if (e && (e.code === 'store_unavailable' || e.code === 'rate_limited' || e.code === 'upstream_error')) { setTimeout(uploadPending, 15000); }
          else if (e && e.code === 'quota_or_state') toast('Photo storage is full. Delete old assessments to free space.');
          break;
        }
        // the photo may have been deleted while uploading
        const still = db.sites.some(x => x.locations.some(l => l.photos.includes(p)));
        if (!still) { C.assets.delete(res.id).catch(() => { }); continue; }
        p.asset = res.id; s.updatedAt = Date.now(); save();
      }
    } finally { C.uploading = false; }
  }

  function hostedExportDone(name, blob, isPdf) {
    if (!C.downloads) {
      openSheet({ title: isPdf ? 'Report ready' : 'Backup ready', body: '<p class="hint">Saving files is not available in this view. Open this page in the Claude app or on claude.ai in Safari and try again.</p>' });
      return;
    }
    openSheet({ title: isPdf ? 'Report ready' : 'Backup ready',
      body: '<div class="done-banner">' + I.check + '<div><b>' + esc(name) + '</b><br><span style="font-size:13px">' + (blob.size / 1048576).toFixed(1) + ' MB</span></div></div>' +
        '<button class="btn amber block" id="x-save">' + I.share + (isPdf ? 'Save or share PDF' : 'Save backup file') + '</button>' +
        '<p class="hint" style="margin-top:12px">In the Claude iPhone app this opens the share sheet (Save to Files, Mail, WhatsApp). In Safari it saves to Downloads.</p>',
      onMount: (el) => {
        $('#x-save', el).onclick = () => {
          C.downloads.save({ filename: name, data: blob }).then(() => { closeSheet(); toast(isPdf ? 'PDF saved' : 'Backup saved'); }, (e) => {
            const c = e && e.code;
            if (c === 'declined') return;
            if (c === 'rate_limited') toast('A save is already in progress — wait a moment and try again');
            else toast('Could not save the file here (' + (c || 'error') + ')');
          });
        };
      } });
  }

  function pickBackupFile() {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json,text/plain';
    inp.style.display = 'none'; document.body.appendChild(inp);
    inp.onchange = () => {
      const f = inp.files && inp.files[0]; inp.remove(); if (!f) return;
      const fr = new FileReader(); fr.onload = () => window.onBackupLoaded(fr.result); fr.readAsText(f);
    };
    inp.click();
  }

  // ---------------- start ----------------
  const isStandalone = () => window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  window.LPA_installHint = () => !A && !HOSTED && !isStandalone() && isIOS();

  if (A) { load(); render(); }
  else {
    (async () => {
      let txt = '';
      try { await W.open(); txt = (await W.get('db')) || ''; await W.loadAllPhotos(); }
      catch (e) { W.idb = null; if (!HOSTED) toast('Storage unavailable — data will not be saved. Avoid Private Browsing.'); }
      load(txt); render();
      if (HOSTED) { cloudInit(); return; }
      try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { }
      if (!HOSTED && 'serviceWorker' in navigator && /^https:|^http:\/\/localhost/.test(location.href)) navigator.serviceWorker.register('sw.js').catch(() => { });
    })();
  }
})();
