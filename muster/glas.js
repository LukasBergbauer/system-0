// Musterseite Glas-Dashboard: Symbole, Zeiger-Animation, Zahlen hochzählen, Diagramme, Akzentfarbe.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
const speicher = { lies: k => { try { return localStorage.getItem(k); } catch { return null; } },
  schreib: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };

// Symbole (dünne Linien, 24er-Raster)
const SYMBOLE = {
  heute: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  kalender: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10h16M8 2v4M16 2v4',
  todos: 'M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9',
  physio: 'M3 12h4l3-8 4 16 3-8h4',
  training: 'M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12',
  ziele: 'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18M12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8M12 12h.01',
  einstellungen: 'M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4',
  suche: 'M11 4a7 7 0 1 0 0 14 7 7 0 1 0 0-14M20 20l-4-4',
  plus: 'M12 5v14M5 12h14', pfeil: 'M7 17 17 7M8 7h9v9', zurueck: 'M15 6l-6 6 6 6',
  flamme: 'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z',
};
$$('svg[data-i]').forEach(s => { s.setAttribute('viewBox', '0 0 24 24'); s.innerHTML = `<path d="${SYMBOLE[s.dataset.i]}"/>`; });

// Gruß und Datum
const jetzt = new Date(), h = jetzt.getHours();
$('#gruss').textContent = `${h < 11 ? 'Guten Morgen' : h < 18 ? 'Guten Tag' : 'Guten Abend'}, Lukas`;
$('#datumzeile').textContent = jetzt.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }) + ' · 7 Dinge brauchen dich';
$('#tagzahl').textContent = String(jetzt.getDate()).padStart(2, '0');
$('#wochentag').textContent = jetzt.toLocaleDateString('de-DE', { weekday: 'long' });
$('#monat').textContent = jetzt.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }) + ' · 2 Termine';
const montag = new Date(jetzt); montag.setDate(jetzt.getDate() - ((jetzt.getDay() + 6) % 7));
$('#woche').innerHTML = [...'MDMDFSS'].map((k, i) => {
  const t = new Date(montag); t.setDate(montag.getDate() + i);
  return `<button class="tag${t.toDateString() === jetzt.toDateString() ? ' heute' : ''}"><small>${k}</small>${t.getDate()}</button>`;
}).join('');

// Zeiger: weiße Pille gleitet unter den aktiven Eintrag (Seitenleiste, Kapsel, Umschalter)
function zeigerSetzen(nav) {
  const a = $('.nav-punkt.aktiv', nav), z = $('.zeiger', nav);
  if (!a || !a.offsetWidth) return;
  Object.assign(z.style, { width: a.offsetWidth + 'px', height: a.offsetHeight + 'px', transform: `translate(${a.offsetLeft}px, ${a.offsetTop}px)` });
}
$$('[data-nav]').forEach(nav => {
  const z = $('.zeiger', nav);
  z.style.transition = 'none'; zeigerSetzen(nav); requestAnimationFrame(() => requestAnimationFrame(() => (z.style.transition = '')));
  new ResizeObserver(() => zeigerSetzen(nav)).observe(nav);
  nav.addEventListener('click', e => {
    const p = e.target.closest('.nav-punkt'); if (!p) return;
    $$('.nav-punkt', nav).forEach(x => x.classList.toggle('aktiv', x === p));
    $$('button', nav).forEach(x => x.classList.toggle('an', x === p));
    zeigerSetzen(nav);
    if (p.dataset.zeit) verlaufZeichnen(p.dataset.zeit);
  });
});

// Seitenleiste einklappen (wird gemerkt)
const app = $('#app');
if (speicher.lies('leiste') === 'zu') app.classList.add('zu');
$('#einklappen').onclick = () => {
  const schmal = innerWidth <= 1100;
  app.classList.toggle(schmal ? 'offen' : 'zu');
  if (!schmal) speicher.schreib('leiste', app.classList.contains('zu') ? 'zu' : 'auf');
};

// Zahlen hochzählen
function zaehlen(el) {
  const ziel = +el.dataset.zahl, nach = el.dataset.nach || '';
  if (ruhig) return (el.textContent = ziel + nach);
  const start = performance.now() + 250, dauer = 1100;
  const schritt = t => {
    const p = Math.min(Math.max((t - start) / dauer, 0), 1);
    el.textContent = Math.round(ziel * (1 - (1 - p) ** 3)).toLocaleString('de-DE') + nach;
    if (p < 1) requestAnimationFrame(schritt);
  };
  requestAnimationFrame(schritt);
}
$$('[data-zahl]').forEach(zaehlen);
requestAnimationFrame(() => requestAnimationFrame(() =>
  $$('[data-ring]').forEach(c => (c.style.strokeDashoffset = 440 * (1 - c.dataset.ring)))));

// Verlauf (Flächen-Diagramm)
const DATEN = {
  woche: { zeile: '58 Aufgaben in den letzten 7 Tagen', x: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    ist: [6, 9, 7, 11, 10, 8, 7], plan: [8, 10, 9, 12, 12, 9, 9] },
  monat: { zeile: '231 Aufgaben in den letzten 30 Tagen', x: ['1.', '8.', '15.', '22.', '29.'],
    ist: [5, 7, 6, 9, 8, 6, 10, 9, 7, 11, 12, 8, 7, 10, 9, 6, 8, 11, 13, 10, 9, 7, 8, 10, 12, 11, 9, 8, 10, 7],
    plan: Array.from({ length: 30 }, (_, i) => 10 + Math.round(Math.sin(i / 3) * 2)) },
};
function kurve(punkte) { // weiche Linie durch alle Punkte
  return punkte.reduce((d, [x, y], i, p) => {
    if (!i) return `M${x} ${y}`;
    const [x0, y0] = p[i - 1], [xm1, ym1] = p[i - 2] || p[i - 1], [x2, y2] = p[i + 1] || [x, y];
    return d + ` C${x0 + (x - xm1) / 6} ${y0 + (y - ym1) / 6} ${x - (x2 - x0) / 6} ${y - (y2 - y0) / 6} ${x} ${y}`;
  }, '');
}
function verlaufZeichnen(zeit) {
  const d = DATEN[zeit], max = Math.max(...d.plan, ...d.ist) * 1.15, n = d.ist.length;
  const px = i => 20 + (i * 570) / (n - 1), py = v => 180 - (v / max) * 165;
  const ist = kurve(d.ist.map((v, i) => [px(i), py(v)]));
  const gitter = [0, 1, 2, 3].map(k => `<line class="gitter" x1="0" x2="600" y1="${15 + k * 55}" y2="${15 + k * 55}"/>`).join('');
  const xs = d.x.map((t, k) => `<text x="${20 + (k * 570) / (d.x.length - 1)}" y="204" text-anchor="middle">${t}</text>`).join('');
  $('#verlauf').innerHTML = `<defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.38"/>
    <stop offset="1" style="stop-color:var(--accent);stop-opacity:0"/></linearGradient></defs>${gitter}${xs}
    <path class="geplant" d="${kurve(d.plan.map((v, i) => [px(i), py(v)]))}"/>
    <path class="flaeche" d="${ist} L${px(n - 1)} 180 L${px(0)} 180Z"/><path class="linie" pathLength="1" d="${ist}"/>`;
  $('#verlaufzeile').textContent = d.zeile;
}
verlaufZeichnen('woche');

// Donut
const ANTEILE = [['Training', 35, 'var(--accent)'], ['Physio', 25, 'var(--akzent-hell)'], ['To-dos', 22, 'var(--akzent-tief)'], ['Routinen', 18, 'var(--ink-3)']];
const U = 2 * Math.PI * 68;
let lauf = 0;
$('#donut').innerHTML = ANTEILE.map(([, p, f]) => {
  const c = `<circle cx="85" cy="85" r="68" style="stroke:${f}" stroke-dasharray="0 ${U}" stroke-dashoffset="${-lauf}" data-l="${(p / 100) * U - 3}"/>`;
  lauf += (p / 100) * U; return c;
}).join('');
requestAnimationFrame(() => requestAnimationFrame(() => $$('#donut circle').forEach((c, i) => setTimeout(() =>
  c.setAttribute('stroke-dasharray', `${c.dataset.l} ${U}`), 400 + i * 120))));
$('#anteile').innerHTML = ANTEILE.map(([n, p, f]) => `<span><i style="background:${f}"></i>${n}<b>${p} %</b></span>`).join('');

// Akzentfarbe: EINE Farbe färbt alles (Hintergrund, Hero, Diagramme). Später in den Einstellungen.
const FARBEN = ['#E8664F', '#D9503A', '#F0915F', '#D9A441', '#6E9C7E', '#4F8FBF', '#8B79D6'];
function akzentSetzen(farbe) {
  document.documentElement.style.setProperty('--accent', farbe);
  speicher.schreib('akzent', farbe);
  $$('#farben button').forEach(b => b.classList.toggle('an', b.dataset.f === farbe));
}
$('#farben').innerHTML = FARBEN.map(f => `<button style="--f:${f}" data-f="${f}" aria-label="Farbe ${f}"></button>`).join('')
  + '<label title="Eigene Farbe"><input type="color" id="eigen"></label>';
$('#farben').onclick = e => e.target.dataset.f && akzentSetzen(e.target.dataset.f);
$('#eigen').oninput = e => akzentSetzen(e.target.value);
$('#farbknopf').onclick = e => { e.stopPropagation(); $('#farbwahl').classList.toggle('offen'); };
document.addEventListener('click', e => { if (!e.target.closest('#farbwahl')) $('#farbwahl').classList.remove('offen'); });
akzentSetzen(speicher.lies('akzent') || FARBEN[0]);
