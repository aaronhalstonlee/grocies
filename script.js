const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CATS = ['Produce', 'Dairy', 'Meat & Seafood', 'Frozen', 'Pantry', 'Bakery', 'Beverages', 'Costco', 'Refrigerated', 'Other'];
const PR = {
  'vegetarian': { ic: '🥦', lb: 'Vegetarian', tc: 'tv', pc: 'ov' },
  'pre-prepared': { ic: '🧊', lb: 'Pre-made', tc: 'tp', pc: 'op' },
  'high-sodium': { ic: '🧂', lb: 'High-Na', tc: 'ts', pc: 'os' },
  'other': { ic: '🍴', lb: 'Free Pick', tc: 'to', pc: 'oo' }
};
const ALIASES = {
  vegetarian: ['vegetarian', 'veg', 'veggie', 'plant-based', 'meatless'],
  'pre-prepared': ['pre-prepared', 'pre prepared', 'premade', 'pre-made', 'frozen', 'prepared', 'ready'],
  'high-sodium': ['high-sodium', 'high sodium', 'sodium', 'salty', 'high salt', 'salt']
};

let meals = lj('dp3_meals', null) || seed();
let plan = lj('dp3_plan', {});
let lastWk = lj('dp3_last', []);
let groc = lj('dp3_groc', []);
let ckd = lj('dp3_ckd', {});
let staples = lj('dp3_staples', []);
let eMid = null, ePrim = 'other', aDay = null, mFil = 'all', iParsed = [];

function lj(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } }
function save() {
  localStorage.setItem('dp3_meals', JSON.stringify(meals));
  localStorage.setItem('dp3_plan', JSON.stringify(plan));
  localStorage.setItem('dp3_last', JSON.stringify(lastWk));
  localStorage.setItem('dp3_groc', JSON.stringify(groc));
  localStorage.setItem('dp3_ckd', JSON.stringify(ckd));
  localStorage.setItem('dp3_staples', JSON.stringify(staples));
}
function uid() { return Math.random().toString(36).slice(2, 9) }
function shuf(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = 0 | Math.random() * (i + 1);[b[i], b[j]] = [b[j], b[i]]; } return b }

function seed() {
  return [
    { id: uid(), name: 'Frozen Pizza', primary: 'pre-prepared', cuisine: 'American', ings: [{ n: 'Frozen pizza', a: '1', c: 'Frozen' }] },
    { id: uid(), name: 'Costco Street Tacos', primary: 'pre-prepared', cuisine: 'Mexican', ings: [{ n: 'Costco street taco kit', a: '1 pkg', c: 'Frozen' }, { n: 'Lime', a: '2', c: 'Produce' }, { n: 'Cilantro', a: '1 bunch', c: 'Produce' }] },
    { id: uid(), name: "TJ's Butter Chicken", primary: 'pre-prepared', cuisine: 'Indian', ings: [{ n: "TJ's Butter Chicken", a: '2 pkgs', c: 'Frozen' }, { n: 'Basmati rice', a: '2 cups', c: 'Pantry' }] },
    { id: uid(), name: 'Pasta Marinara', primary: 'vegetarian', cuisine: 'Italian', ings: [{ n: 'Pasta', a: '400g', c: 'Pantry' }, { n: 'Marinara sauce', a: '1 jar', c: 'Pantry' }, { n: 'Parmesan', a: '1 block', c: 'Dairy' }, { n: 'Garlic', a: '4 cloves', c: 'Produce' }] },
    { id: uid(), name: 'Veggie Tacos', primary: 'vegetarian', cuisine: 'Mexican', ings: [{ n: 'Tortillas', a: '8', c: 'Bakery' }, { n: 'Black beans', a: '1 can', c: 'Pantry' }, { n: 'Bell pepper', a: '2', c: 'Produce' }, { n: 'Avocado', a: '2', c: 'Produce' }, { n: 'Shredded cheese', a: '1 bag', c: 'Dairy' }] },
    { id: uid(), name: 'Lentil Soup', primary: 'vegetarian', cuisine: 'Mediterranean', ings: [{ n: 'Red lentils', a: '300g', c: 'Pantry' }, { n: 'Carrots', a: '2', c: 'Produce' }, { n: 'Vegetable broth', a: '1 carton', c: 'Pantry' }, { n: 'Cumin', a: '1 tsp', c: 'Pantry' }] },
    { id: uid(), name: 'Shakshuka', primary: 'vegetarian', cuisine: 'Middle Eastern', ings: [{ n: 'Eggs', a: '6', c: 'Dairy' }, { n: 'Crushed tomatoes', a: '1 can', c: 'Pantry' }, { n: 'Bell pepper', a: '1', c: 'Produce' }, { n: 'Feta cheese', a: '100g', c: 'Dairy' }] },
    { id: uid(), name: 'Pasta e Fagioli', primary: 'vegetarian', cuisine: 'Italian', ings: [{ n: 'Ditalini pasta', a: '200g', c: 'Pantry' }, { n: 'Cannellini beans', a: '1 can', c: 'Pantry' }, { n: 'Crushed tomatoes', a: '1 can', c: 'Pantry' }, { n: 'Vegetable broth', a: '1 carton', c: 'Pantry' }] },
    { id: uid(), name: 'Chicken Stir Fry', primary: 'high-sodium', cuisine: 'Asian', ings: [{ n: 'Chicken breast', a: '500g', c: 'Meat & Seafood' }, { n: 'Broccoli', a: '1 head', c: 'Produce' }, { n: 'Soy sauce', a: '3 tbsp', c: 'Pantry' }, { n: 'Jasmine rice', a: '2 cups', c: 'Pantry' }, { n: 'Garlic', a: '3 cloves', c: 'Produce' }] },
    { id: uid(), name: 'Salmon & Veggies', primary: 'other', cuisine: 'American', ings: [{ n: 'Salmon fillets', a: '2', c: 'Meat & Seafood' }, { n: 'Asparagus', a: '1 bunch', c: 'Produce' }, { n: 'Lemon', a: '1', c: 'Produce' }, { n: 'Olive oil', a: '2 tbsp', c: 'Pantry' }] },
    { id: uid(), name: 'Turkey Meatballs', primary: 'other', cuisine: 'Italian', ings: [{ n: 'Ground turkey', a: '500g', c: 'Meat & Seafood' }, { n: 'Pasta', a: '300g', c: 'Pantry' }, { n: 'Marinara sauce', a: '1 jar', c: 'Pantry' }, { n: 'Parmesan', a: '1 block', c: 'Dairy' }] },
    { id: uid(), name: 'Sheet Pan Chicken & Veg', primary: 'other', cuisine: 'American', ings: [{ n: 'Chicken thighs', a: '4', c: 'Meat & Seafood' }, { n: 'Potatoes', a: '4', c: 'Produce' }, { n: 'Zucchini', a: '2', c: 'Produce' }, { n: 'Olive oil', a: '3 tbsp', c: 'Pantry' }] },
  ]
}

// ---- Auto-generate ----
function autoGen() {
  const cur = DAYS.map(d => plan[d]).filter(Boolean);
  if (cur.length >= 4) lastWk = cur;

  const used = new Set(), usedC = new Set();

  const avail = (prim, noRepeat = true) => shuf(meals.filter(m =>
    m.primary === prim && !used.has(m.id) && (!noRepeat || !lastWk.includes(m.id))
  ));

  const pick = (prim, variety = false) => {
    let pool = avail(prim, true);
    if (!pool.length) pool = avail(prim, false);
    if (!pool.length) return null;
    if (variety) {
      const novel = pool.filter(m => !usedC.has(m.cuisine));
      if (novel.length) pool = novel;
    }
    const m = pool[0];
    used.add(m.id);
    if (m.cuisine) usedC.add(m.cuisine);
    return m;
  };

  const pp = pick('pre-prepared');
  if (!pp) { toast('⚠️ Need at least 1 pre-made meal'); return }
  const hs = pick('high-sodium');
  if (!hs) { toast('⚠️ Need at least 1 high-sodium meal'); return }
  const vegs = [];
  for (let i = 0; i < 3; i++) { const v = pick('vegetarian', true); if (!v) { toast(`⚠️ Need ${3 - i} more vegetarian meal${3 - i > 1 ? 's' : ''}`); return } vegs.push(v) }
  const free = [];
  for (let i = 0; i < 2; i++) { const o = pick('other', true); if (!o) { toast(`⚠️ Need ${2 - i} more free pick meal${2 - i > 1 ? 's' : ''}`); return } free.push(o) }

  const all = shuf([pp, hs, ...vegs, ...free]);
  DAYS.forEach((d, i) => { plan[d] = all[i].id });
  save(); rAll();
  toast('🎲 Week generated!');
  document.querySelectorAll('.nb')[0].click();
}

// ---- Grocery list ----
function genList() {
  const map = {};
  DAYS.forEach(d => {
    if (!plan[d]) return;
    const m = meals.find(x => x.id === plan[d]);
    if (!m) return;
    m.ings.forEach(i => { const k = `${i.c}:::${i.n.toLowerCase()}`; if (!map[k]) map[k] = { n: i.n, a: i.a, c: i.c } });
  });
  groc = Object.values(map); ckd = {}; save(); rShop();
  document.querySelectorAll('.nb')[2].click();
}

// ---- Render ----
function rAll() { rLbl(); rRules(); rWeek(); rMeals(); rShop() }

function rLbl() {
  const n = new Date(), m = new Date(n);
  m.setDate(n.getDate() - ((n.getDay() + 6) % 7));
  const e = new Date(m); e.setDate(m.getDate() + 6);
  const f = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  document.getElementById('week-lbl').textContent = `${f(m)} – ${f(e)}`;
}

function rRules() {
  const pm = DAYS.map(d => plan[d]).filter(Boolean).map(id => meals.find(m => m.id === id)).filter(Boolean);
  const c = p => pm.filter(m => m.primary === p).length;
  const v = c('vegetarian'), p = c('pre-prepared'), s = c('high-sodium');
  document.getElementById('rules-bar').innerHTML = `
    <div class="rule ${p >= 1 ? 'met' : 'unmet'}"><div class="rule-ic">🧊</div><div class="rule-ct">${p}/1</div><div class="rule-lb">Pre-made</div></div>
    <div class="rule ${s >= 1 ? 'met' : 'unmet'}"><div class="rule-ic">🧂</div><div class="rule-ct">${s}/1</div><div class="rule-lb">High-Na</div></div>
    <div class="rule ${v >= 3 ? 'met' : 'unmet'}"><div class="rule-ic">🥦</div><div class="rule-ct">${v}/3</div><div class="rule-lb">Vegetarian</div></div>
    <div class="rule ${pm.length >= 7 ? 'met' : 'unmet'}"><div class="rule-ic">📅</div><div class="rule-ct">${pm.length}/7</div><div class="rule-lb">Planned</div></div>`;
}

function rWeek() {
  const n = new Date(), base = new Date(n);
  base.setDate(n.getDate() - ((n.getDay() + 6) % 7));
  document.getElementById('week-grid').innerHTML = DAYS.map((d, i) => {
    const dt = new Date(base); dt.setDate(base.getDate() + i);
    const ds = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const ml = plan[d] ? meals.find(x => x.id === plan[d]) : null;
    const pr = ml ? (PR[ml.primary] || PR.other) : null;
    return `<div class="day-row" onclick="openAssign('${d}')">
      <div><div class="day-lbl">${d}</div><div class="day-dt">${ds}</div></div>
      ${ml ? `<div style="flex:1"><div class="meal-nm">${ml.name}</div><div class="tags"><span class="tag ${pr.tc}">${pr.ic} ${pr.lb}</span>${ml.cuisine ? `<span class="tag tg">${ml.cuisine}</span>` : ''}</div></div>`
        : '<div class="no-meal">Tap to assign</div>'}
      <span style="color:#ccc;font-size:1.2rem">›</span></div>`;
  }).join('');
}

function rMeals() {
  const el = document.getElementById('meals-list');
  const list = mFil === 'all' ? meals : meals.filter(m => m.primary === mFil);
  const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (!sorted.length) { el.innerHTML = `<div class="empty"><div class="empty-ic">🍽</div><p>${mFil === 'all' ? 'No meals yet.<br>Tap + to add.' : 'No meals in this category.'}</p></div>`; return }
  el.innerHTML = sorted.map(m => {
    const pr = PR[m.primary] || PR.other;
    return `<div class="mi" onclick="openEdit('${m.id}')">
      <div style="flex:1"><div class="mi-nm">${m.name}</div>
      <div class="tags" style="margin-top:3px"><span class="tag ${pr.tc}">${pr.ic} ${pr.lb}</span>${m.cuisine ? `<span class="tag tg">${m.cuisine}</span>` : ''}</div>
      <div class="mi-sub">${m.ings.length} ingredient${m.ings.length !== 1 ? 's' : ''}</div></div>
      <span style="color:#ccc;font-size:1.2rem">›</span></div>`;
  }).join('');
}

function rShop() {
  const el = document.getElementById('shop-list');
  const hasGroc = groc.length > 0;
  const hasStaples = staples.length > 0;

  if (!hasGroc && !hasStaples) {
    el.innerHTML = '<div class="empty"><div class="empty-ic">🛒</div><p>No list yet.<br>Plan meals then tap "Make List".</p></div>';
    document.getElementById('prog-fill').style.width = '0%';
    return;
  }

  const byCat = {};
  groc.forEach(i => { if (!byCat[i.c]) byCat[i.c] = []; byCat[i.c].push(i) });

  staples.forEach(i => {
    const key = `${i.c}::${i.n}`;
    const alreadyIn = (byCat[i.c] || []).some(x => `${x.c}::${x.n}` === key);
    if (!alreadyIn) { if (!byCat[i.c]) byCat[i.c] = []; byCat[i.c].push(i); }
  });

  const total = Object.values(byCat).reduce((s, arr) => s + arr.length, 0);
  const done = Object.values(ckd).filter(Boolean).length;

  let html = '';
  CATS.forEach(cat => {
    if (!byCat[cat]) return;
    html += `<div class="card"><div class="cat-hdr">${cat}</div>`;
    byCat[cat].forEach(item => {
      const raw = `${item.c}::${item.n}`;
      const isck = ckd[raw];
      html += `<div class="si${isck ? ' ck' : ''}" onclick="togCk('${encodeURIComponent(raw)}')"><div class="sck"></div><div class="si-txt">${item.n}</div>${item.a ? `<div class="si-amt">${item.a}</div>` : ''}</div>`;
    });
    html += '</div>';
  });

  el.innerHTML = html;
  document.getElementById('prog-fill').style.width = `${total ? Math.round(done / total * 100) : 0}%`;
}

// ---- Tabs / FAB ----
function swTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
  document.querySelectorAll('.nb').forEach(b => b.classList.remove('on'));
  document.getElementById('tab-' + name).classList.add('on');
  btn.classList.add('on');
  document.getElementById('fab').style.display = name === 'meals' ? 'flex' : 'none';
}
function setFilter(f, btn) {
  mFil = f;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('on'));
  btn.classList.add('on'); rMeals();
}

// ---- Modals ----
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('h');
}

function openAssign(day) {
  aDay = day;
  document.getElementById('assign-ttl').textContent = `Meal for ${day}`;
  const order = { 'pre-prepared': 0, 'high-sodium': 1, 'vegetarian': 2, 'other': 3 };
  const sorted = [...meals].sort((a, b) => (order[a.primary] || 3) - (order[b.primary] || 3) || a.name.localeCompare(b.name));
  document.getElementById('assign-list').innerHTML = sorted.map(m => {
    const pr = PR[m.primary] || PR.other;
    const wasLast = lastWk.includes(m.id);
    return `<div class="ac" onclick="assignMeal('${m.id}')">
      <div style="flex:1"><div class="ac-nm">${m.name}${wasLast ? ' <span style="font-size:.65rem;color:var(--mut)">(last week)</span>' : ''}</div>
      <div class="tags" style="margin-top:2px"><span class="tag ${pr.tc}">${pr.ic} ${pr.lb}</span></div></div>
      ${plan[day] === m.id ? '<span style="color:var(--gr);font-weight:700;font-size:1.1rem">✓</span>' : ''}
    </div>`;
  }).join('');
  document.getElementById('ov-assign').classList.remove('h');
}

function assignMeal(id) { plan[aDay] = id; save(); rAll(); closeModal('ov-assign') }
function clearDay() { delete plan[aDay]; save(); rAll(); closeModal('ov-assign') }

function openAdd() {
  eMid = null; ePrim = 'other';
  document.getElementById('meal-ttl').textContent = 'Add Meal';
  document.getElementById('m-name').value = '';
  document.getElementById('m-cuisine').value = '';
  document.getElementById('del-btn').style.display = 'none';
  document.getElementById('ing-list').innerHTML = '';
  rPrimOpts(); addIng();
  document.getElementById('ov-meal').classList.remove('h');
}
function openEdit(id) {
  const m = meals.find(x => x.id === id); if (!m) return;
  eMid = id; ePrim = m.primary || 'other';
  document.getElementById('meal-ttl').textContent = 'Edit Meal';
  document.getElementById('m-name').value = m.name;
  document.getElementById('m-cuisine').value = m.cuisine || '';
  document.getElementById('del-btn').style.display = 'inline-flex';
  document.getElementById('ing-list').innerHTML = '';
  m.ings.forEach(i => addIng(i));
  rPrimOpts();
  document.getElementById('ov-meal').classList.remove('h');
}
function setPrim(p) { ePrim = p; rPrimOpts() }
function rPrimOpts() {
  const map = { v: 'vegetarian', p: 'pre-prepared', s: 'high-sodium', o: 'other' };
  Object.entries(map).forEach(([k, v]) => {
    const el = document.getElementById(`po-${k}`);
    el.className = 'popt' + (ePrim === v ? ' ' + PR[v].pc : '');
  });
}
function addIng(ing) {
  const row = document.createElement('div'); row.className = 'ir';
  const opts = CATS.map(c => `<option value="${c}"${ing?.c === c ? ' selected' : ''}>${c}</option>`).join('');
  row.innerHTML = `<input type="text" placeholder="Ingredient" value="${ing?.n || ''}"><input type="text" placeholder="Amount" value="${ing?.a || ''}"><select>${opts}</select><button class="ir-del" onclick="this.parentElement.remove()">×</button>`;
  document.getElementById('ing-list').appendChild(row);
}
function saveMeal() {
  const name = document.getElementById('m-name').value.trim();
  if (!name) { toast('Enter a meal name.'); return }
  const cuisine = document.getElementById('m-cuisine').value;
  const ings = [];
  document.querySelectorAll('#ing-list .ir').forEach(r => {
    const [ni, ai, cs] = r.querySelectorAll('input,select');
    const n = ni.value.trim(); if (!n) return;
    ings.push({ n, a: ai.value.trim(), c: cs.value });
  });
  if (eMid) { const m = meals.find(x => x.id === eMid); m.name = name; m.primary = ePrim; m.cuisine = cuisine; m.ings = ings; }
  else meals.push({ id: uid(), name, primary: ePrim, cuisine, ings });
  save(); rAll(); closeModal('ov-meal');
  toast(eMid ? 'Meal updated ✓' : 'Meal added ✓');
}
function delMeal() {
  if (!eMid || !confirm('Delete this meal?')) return;
  meals = meals.filter(m => m.id !== eMid);
  DAYS.forEach(d => { if (plan[d] === eMid) delete plan[d] });
  save(); rAll(); closeModal('ov-meal'); toast('Meal deleted');
}

// ---- Staples ----
function openStaples() {
  document.getElementById('staples-list').innerHTML = '';
  if (staples.length) {
    staples.forEach(s => addStapleRow(s));
  } else {
    addStapleRow();
  }
  document.getElementById('ov-staples').classList.remove('h');
}
function addStapleRow(ing) {
  const row = document.createElement('div'); row.className = 'ir';
  const opts = CATS.map(c => `<option value="${c}"${ing?.c === c ? ' selected' : ''}>${c}</option>`).join('');
  row.innerHTML = `<input type="text" placeholder="Item" value="${ing?.n || ''}"><input type="text" placeholder="Amount" value="${ing?.a || ''}"><select>${opts}</select><button class="ir-del" onclick="this.parentElement.remove()">×</button>`;
  document.getElementById('staples-list').appendChild(row);
}
function saveStaples() {
  staples = [];
  document.querySelectorAll('#staples-list .ir').forEach(r => {
    const [ni, ai, cs] = r.querySelectorAll('input,select');
    const n = ni.value.trim(); if (!n) return;
    staples.push({ n, a: ai.value.trim(), c: cs.value });
  });
  save(); rShop(); closeModal('ov-staples');
  toast(`Staples saved (${staples.length} item${staples.length !== 1 ? 's' : ''}) ✓`);
}
function toggleStaplesImport() {
  const panel = document.getElementById('staples-import-panel');
  const isHidden = panel.classList.toggle('h');
  document.getElementById('staples-import-txt').value = '';
  if (!isHidden) document.getElementById('staples-import-txt').focus();
}
function doStaplesImport() {
  const txt = document.getElementById('staples-import-txt').value.trim();
  if (!txt) return;
  const lines = txt.split('\n').filter(l => l.trim());
  const existing = new Set(staples.map(s => s.n.toLowerCase()));
  let added = 0;
  lines.forEach(line => {
    const cols = line.includes('\t') ? line.split('\t') : line.split(',');
    const costco = cols[0] ? cols[0].trim() : '';
    const other  = cols[1] ? cols[1].trim() : '';
    if (costco && !existing.has(costco.toLowerCase())) {
      staples.push({ n: costco, a: '', c: 'Costco' });
      existing.add(costco.toLowerCase()); added++;
    }
    if (other && !existing.has(other.toLowerCase())) {
      staples.push({ n: other, a: '', c: 'Other' });
      existing.add(other.toLowerCase()); added++;
    }
  });
  save();
  document.getElementById('staples-list').innerHTML = '';
  staples.forEach(s => addStapleRow(s));
  document.getElementById('staples-import-panel').classList.add('h');
  document.getElementById('staples-import-txt').value = '';
  toast(`Added ${added} staple${added !== 1 ? 's' : ''} ✓`);
}

// ---- Import ----
function openImport() {
  document.getElementById('import-txt').value = '';
  document.getElementById('import-prev').innerHTML = '';
  document.getElementById('import-slots').innerHTML = '';
  document.getElementById('import-slots').classList.add('h');
  iParsed = [];
  document.getElementById('ov-import').classList.remove('h');
}

// Parse column-per-meal format:
// Row 0: meal names (one per column)
// Rows 1+: ingredients for that column's meal
function parseSheetData(txt) {
  const lines = txt.trim().split('\n').filter(l => l.trim() !== '');
  if (!lines.length) return [];
  const rows = lines.map(l => l.includes('\t') ? l.split('\t') : l.split(',').map(c => c.replace(/^"|"$/g, '').trim()));
  const numCols = rows[0].length;
  const out = [];
  for (let c = 0; c < numCols; c++) {
    const mealName = (rows[0][c] || '').trim();
    if (!mealName) continue;
    const ings = [];
    for (let r = 1; r < rows.length; r++) {
      const ingName = (rows[r][c] || '').trim();
      if (ingName) ings.push({ n: ingName, a: '', c: 'Other' });
    }
    out.push({ name: mealName, primary: 'other', cuisine: '', ings });
  }
  return out;
}

function prevImport() {
  const txt = document.getElementById('import-txt').value;
  iParsed = parseSheetData(txt);
  const prevEl = document.getElementById('import-prev');
  const slotsEl = document.getElementById('import-slots');

  if (!iParsed.length) {
    prevEl.textContent = 'No meals found — make sure your data is tab or comma separated.';
    slotsEl.classList.add('h');
    return;
  }

  const ingTotal = iParsed.reduce((s, m) => s + m.ings.length, 0);
  prevEl.innerHTML = `<strong>${iParsed.length} meal${iParsed.length !== 1 ? 's' : ''} found</strong> · ${ingTotal} total ingredients`;

  // Render rule slot selectors for each meal
  slotsEl.classList.remove('h');
  slotsEl.innerHTML = `
    <div style="font-size:.67rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--mut);margin-bottom:8px">
      Set rule slot for each meal
    </div>` +
    iParsed.map((m, i) => `
      <div class="import-slot-row" data-idx="${i}">
        <div class="import-slot-name">${m.name}</div>
        <div class="import-slot-btns">
          <button class="islot-btn ${m.primary === 'vegetarian' ? 'islot-on-v' : ''}" onclick="setSlot(${i},'vegetarian')">🥦</button>
          <button class="islot-btn ${m.primary === 'pre-prepared' ? 'islot-on-p' : ''}" onclick="setSlot(${i},'pre-prepared')">🧊</button>
          <button class="islot-btn ${m.primary === 'high-sodium' ? 'islot-on-s' : ''}" onclick="setSlot(${i},'high-sodium')">🧂</button>
          <button class="islot-btn ${m.primary === 'other' ? 'islot-on-o' : ''}" onclick="setSlot(${i},'other')">🍴</button>
        </div>
      </div>`
    ).join('');
}

function setSlot(idx, prim) {
  iParsed[idx].primary = prim;
  // Re-render just that row's buttons
  const row = document.querySelector(`.import-slot-row[data-idx="${idx}"]`);
  if (!row) return;
  const onCls = { vegetarian: 'islot-on-v', 'pre-prepared': 'islot-on-p', 'high-sodium': 'islot-on-s', other: 'islot-on-o' };
  row.querySelectorAll('.islot-btn').forEach(btn => {
    btn.className = 'islot-btn';
  });
  const prims = ['vegetarian', 'pre-prepared', 'high-sodium', 'other'];
  const btns = row.querySelectorAll('.islot-btn');
  btns[prims.indexOf(prim)].className = `islot-btn ${onCls[prim]}`;
}

function doImport() {
  if (!iParsed.length) {
    iParsed = parseSheetData(document.getElementById('import-txt').value);
    if (!iParsed.length) { toast('Paste your sheet data first, then Preview.'); return; }
  }
  let added = 0, updated = 0;
  iParsed.forEach(m => {
    const idx = meals.findIndex(ex => ex.name.toLowerCase() === m.name.toLowerCase());
    if (idx > -1) { meals[idx].ings = m.ings; meals[idx].primary = m.primary; updated++; }
    else { meals.push({ id: uid(), ...m }); added++; }
  });
  save(); rAll(); closeModal('ov-import');
  // Jump to meals tab so they can see what was imported
  const mealsBtn = document.querySelectorAll('.nb')[1];
  swTab('meals', mealsBtn);
  toast(`${added} added, ${updated} updated ✓`);
}

// ---- Shop ----
function togCk(enc) { const k = decodeURIComponent(enc); ckd[k] = !ckd[k]; save(); rShop() }
function clearCk() { Object.keys(ckd).forEach(k => { if (ckd[k]) delete ckd[k] }); save(); rShop() }

// ---- Toast ----
function toast(msg, ms = 2400) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), ms);
}

document.querySelectorAll('.ovr').forEach(o => o.addEventListener('click', e => { if (e.target === o) o.classList.add('h') }));
rAll();
