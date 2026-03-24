const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CATS = ['Produce', 'Dairy', 'Meat & Seafood', 'Frozen', 'Pantry', 'Bakery', 'Beverages', 'Other'];
const PR = {
    'vegetarian': { ic: '🥦', lb: 'Vegetarian', tc: 'tv', pc: 'ov' },
    'pre-prepared': { ic: '🧊', lb: 'Pre-made', tc: 'tp', pc: 'op' },
    'high-sodium': { ic: '🧂', lb: 'High-Na', tc: 'ts', pc: 'os' },
    'other': { ic: '🍴', lb: 'Free Pick', tc: 'to', pc: 'oo' }
};
const ALIASES = {
    vegetarian: ['vegetarian', 'veg', 'veggie', 'plant-based', 'meatless'],
    'pre-prepared': ['pre-prepared', 'premade', 'pre-made', 'frozen', 'prepared', 'ready'],
    'high-sodium': ['high-sodium', 'high sodium', 'sodium', 'salty', 'high salt', 'salt']
};

let meals = lj('dp3_meals', null) || seed();
let plan = lj('dp3_plan', {});
let lastWk = lj('dp3_last', []);
let groc = lj('dp3_groc', []);
let ckd = lj('dp3_ckd', {});
let eMid = null, ePrim = 'other', aDay = null, mFil = 'all', iParsed = [];

function lj(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } }
function save() {
    localStorage.setItem('dp3_meals', JSON.stringify(meals));
    localStorage.setItem('dp3_plan', JSON.stringify(plan));
    localStorage.setItem('dp3_last', JSON.stringify(lastWk));
    localStorage.setItem('dp3_groc', JSON.stringify(groc));
    localStorage.setItem('dp3_ckd', JSON.stringify(ckd));
}
function uid() { return Math.random().toString(36).slice(2, 9) }
function shuf(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = 0 | Math.random() * (i + 1); [b[i], b[j]] = [b[j], b[i]]; } return b }

function seed() {
    return [
        { id: uid(), name: 'Frozen Pizza', primary: 'pre-prepared', cuisine: 'American', ings: [{ n: 'Frozen pizza', a: '1', c: 'Frozen' }] },
        { id: uid(), name: 'Pasta Marinara', primary: 'vegetarian', cuisine: 'Italian', ings: [{ n: 'Pasta', a: '400g', c: 'Pantry' }, { n: 'Marinara sauce', a: '1 jar', c: 'Pantry' }] }
    ]
}

function autoGen() {
    const cur = DAYS.map(d => plan[d]).filter(Boolean);
    if (cur.length >= 4) lastWk = cur;
    const used = new Set(), usedC = new Set();
    const avail = (prim, noRepeat = true) => shuf(meals.filter(m => m.primary === prim && !used.has(m.id) && (!noRepeat || !lastWk.includes(m.id))));
    const pick = (prim, variety = false) => {
        let pool = avail(prim, true);
        if (!pool.length) pool = avail(prim, false);
        if (!pool.length) return null;
        if (variety) { const novel = pool.filter(m => !usedC.has(m.cuisine)); if (novel.length) pool = novel; }
        const m = pool[0]; used.add(m.id); if (m.cuisine) usedC.add(m.cuisine); return m;
    };
    const pp = pick('pre-prepared'), hs = pick('high-sodium'), vegs = [], free = [];
    if (!pp || !hs) { toast('⚠️ Need more meals!'); return }
    for (let i = 0; i < 3; i++) { const v = pick('vegetarian', true); if (v) vegs.push(v) }
    for (let i = 0; i < 2; i++) { const o = pick('other', true); if (o) free.push(o) }
    const all = shuf([pp, hs, ...vegs, ...free]);
    DAYS.forEach((d, i) => { if (all[i]) plan[d] = all[i].id });
    save(); rAll(); toast('🎲 Week generated!');
}

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

function rAll() { rLbl(); rRules(); rWeek(); rMeals(); rShop() }
function rLbl() {
    const n = new Date(), m = new Date(n); m.setDate(n.getDate() - ((n.getDay() + 6) % 7));
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
    const n = new Date(), base = new Date(n); base.setDate(n.getDate() - ((n.getDay() + 6) % 7));
    document.getElementById('week-grid').innerHTML = DAYS.map((d, i) => {
        const dt = new Date(base); dt.setDate(base.getDate() + i);
        const ds = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const ml = plan[d] ? meals.find(x => x.id === plan[d]) : null;
        const pr = ml ? (PR[ml.primary] || PR.other) : null;
        return `<div class="day-row" onclick="openAssign('${d}')">
      <div><div class="day-lbl">${d}</div><div class="day-dt">${ds}</div></div>
      ${ml ? `<div style="flex:1"><div class="meal-nm">${ml.name}</div><div class="tags"><span class="tag ${pr.tc}">${pr.ic} ${pr.lb}</span>${ml.cuisine ? `<span class="tag tg">${ml.cuisine}</span>` : ''}</div></div>` : '<div class="no-meal">Tap to assign</div>'}
      <span style="color:#ccc;font-size:1.2rem">›</span></div>`;
    }).join('');
}
function rMeals() {
    const el = document.getElementById('meals-list');
    const list = mFil === 'all' ? meals : meals.filter(m => m.primary === mFil);
    const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (!sorted.length) { el.innerHTML = `<div class="empty"><div class="empty-ic">🍽</div><p>No meals found.</p></div>`; return }
    el.innerHTML = sorted.map(m => {
        const pr = PR[m.primary] || PR.other;
        return `<div class="mi" onclick="openEdit('${m.id}')">
      <div style="flex:1"><div class="mi-nm">${m.name}</div><div class="tags"><span class="tag ${pr.tc}">${pr.ic} ${pr.lb}</span></div>
      <div class="mi-sub">${m.ings.length} items</div></div><span style="color:#ccc;font-size:1.2rem">›</span></div>`;
    }).join('');
}
function rShop() {
    const el = document.getElementById('shop-list');
    if (!groc.length) { el.innerHTML = '<div class="empty"><p>No items.</p></div>'; document.getElementById('prog-fill').style.width = '0%'; return; }
    const byCat = {}; groc.forEach(i => { if (!byCat[i.c]) byCat[i.c] = []; byCat[i.c].push(i) });
    let html = ''; let total = groc.length, done = 0; Object.values(ckd).forEach(v => { if (v) done++ });
    CATS.forEach(cat => {
        if (!byCat[cat]) return; html += `<div class="card"><div class="cat-hdr">${cat}</div>`;
        byCat[cat].forEach(item => {
            const raw = `${item.c}::${item.n}`, isck = ckd[raw];
            html += `<div class="si${isck ? ' ck' : ''}" onclick="togCk('${encodeURIComponent(raw)}')"><div class="sck"></div><div class="si-txt">${item.n}</div><div class="si-amt">${item.a}</div></div>`;
        }); html += '</div>';
    });
    el.innerHTML = html; document.getElementById('prog-fill').style.width = `${total ? Math.round(done / total * 100) : 0}%`;
}

function swTab(name, btn) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
    document.querySelectorAll('.nb').forEach(b => b.classList.remove('on'));
    document.getElementById('tab-' + name).classList.add('on'); btn.classList.add('on');
    document.getElementById('fab').style.display = name === 'meals' ? 'flex' : 'none';
}
function setFilter(f, btn) { mFil = f; document.querySelectorAll('.pill').forEach(p => p.classList.remove('on')); btn.classList.add('on'); rMeals(); }

function closeModal(id) { document.getElementById(id).classList.add('h') }
function openAssign(day) {
    aDay = day; document.getElementById('assign-ttl').textContent = `Meal for ${day}`;
    const sorted = [...meals].sort((a, b) => a.name.localeCompare(b.name));
    document.getElementById('assign-list').innerHTML = sorted.map(m => {
        return `<div class="ac" onclick="assignMeal('${m.id}')"><div class="ac-nm">${m.name}</div>${plan[day] === m.id ? '<span>✓</span>' : ''}</div>`;
    }).join('');
    document.getElementById('ov-assign').classList.remove('h');
}
function assignMeal(id) { plan[aDay] = id; save(); rAll(); closeModal('ov-assign') }
function clearDay() { delete plan[aDay]; save(); rAll(); closeModal('ov-assign') }

function openAdd() { eMid = null; ePrim = 'other'; document.getElementById('meal-ttl').textContent = 'Add Meal'; document.getElementById('m-name').value = ''; document.getElementById('m-cuisine').value = ''; document.getElementById('del-btn').style.display = 'none'; document.getElementById('ing-list').innerHTML = ''; rPrimOpts(); addIng(); document.getElementById('ov-meal').classList.remove('h'); }
function openEdit(id) {
    const m = meals.find(x => x.id === id); if (!m) return;
    eMid = id; ePrim = m.primary || 'other'; document.getElementById('meal-ttl').textContent = 'Edit Meal';
    document.getElementById('m-name').value = m.name; document.getElementById('m-cuisine').value = m.cuisine || '';
    document.getElementById('del-btn').style.display = 'inline-flex'; document.getElementById('ing-list').innerHTML = '';
    m.ings.forEach(i => addIng(i)); rPrimOpts(); document.getElementById('ov-meal').classList.remove('h');
}
function setPrim(p) { ePrim = p; rPrimOpts() }
function rPrimOpts() {
    const map = { v: 'vegetarian', p: 'pre-prepared', s: 'high-sodium', o: 'other' };
    Object.entries(map).forEach(([k, v]) => { document.getElementById(`po-${k}`).className = 'popt' + (ePrim === v ? ' ' + PR[v].pc : ''); });
}
function addIng(ing) {
    const row = document.createElement('div'); row.className = 'ir';
    const opts = CATS.map(c => `<option value="${c}"${ing?.c === c ? ' selected' : ''}>${c}</option>`).join('');
    row.innerHTML = `<input type="text" placeholder="Item" value="${ing?.n || ''}"><input type="text" placeholder="Amt" value="${ing?.a || ''}"><select>${opts}</select><button class="ir-del" onclick="this.parentElement.remove()">×</button>`;
    document.getElementById('ing-list').appendChild(row);
}
function saveMeal() {
    const name = document.getElementById('m-name').value.trim(); if (!name) return;
    const ings = []; document.querySelectorAll('#ing-list .ir').forEach(r => {
        const [ni, ai, cs] = r.querySelectorAll('input,select');
        if (ni.value.trim()) ings.push({ n: ni.value.trim(), a: ai.value.trim(), c: cs.value });
    });
    const cuisine = document.getElementById('m-cuisine').value;
    if (eMid) { const m = meals.find(x => x.id === eMid); m.name = name; m.primary = ePrim; m.cuisine = cuisine; m.ings = ings; }
    else meals.push({ id: uid(), name, primary: ePrim, cuisine, ings });
    save(); rAll(); closeModal('ov-meal'); toast('Saved ✓');
}
function delMeal() { if (!eMid || !confirm('Delete?')) return; meals = meals.filter(m => m.id !== eMid); save(); rAll(); closeModal('ov-meal'); }

function openImport() { document.getElementById('import-txt').value = ''; document.getElementById('import-prev').textContent = ''; iParsed = []; document.getElementById('ov-import').classList.remove('h'); }

function parseCSV(txt) {
    const lines = txt.trim().split('\n').map(l => l.trim()).filter(Boolean);
    const rows = lines.map(l => l.includes('\t') ? l.split('\t') : l.split(',').map(x => x.replace(/^"|"$/g, '').trim()));
    const first = (rows[0]?.[0] || '').toLowerCase();
    const start = (['meal', 'name', 'dinner'].some(w => first.includes(w))) ? 1 : 0;
    const out = [];

    for (let i = start; i < rows.length; i++) {
        const [rn = '', rc = '', rcu = '', ring = ''] = rows[i];
        const name = rn.trim(); if (!name) continue;
        const cl = rc.trim().toLowerCase();
        let primary = 'other';
        for (const [k, aliases] of Object.entries(ALIASES)) { if (aliases.some(a => cl.includes(a))) { primary = k; break; } }

        const ings = [];
        if (ring.trim()) {
            ring.split(';').forEach(p => {
                const parts = p.split(':').map(s => s.trim());
                if (parts[0]) ings.push({ n: parts[0], a: parts[1] || '', c: CATS.includes(parts[2]) ? parts[2] : 'Other' });
            });
        }
        out.push({ name, primary, cuisine: rcu.trim(), ings });
    }
    return out;
}

function prevImport() {
    iParsed = parseCSV(document.getElementById('import-txt').value);
    const el = document.getElementById('import-prev');
    if (!iParsed.length) { el.textContent = 'No valid rows.'; return; }
    const ingCount = iParsed.reduce((acc, m) => acc + m.ings.length, 0);
    el.innerHTML = `<strong>${iParsed.length} meals (${ingCount} items) found.</strong>`;
}

function doImport() {
    if (!iParsed.length) { iParsed = parseCSV(document.getElementById('import-txt').value); if (!iParsed.length) return; }
    let added = 0, updated = 0;
    iParsed.forEach(m => {
        const idx = meals.findIndex(ex => ex.name.toLowerCase() === m.name.toLowerCase());
        if (idx > -1) { Object.assign(meals[idx], m); updated++; }
        else { meals.push({ id: uid(), ...m }); added++; }
    });
    save(); rAll(); closeModal('ov-import'); toast(`Added ${added}, Updated ${updated} ✓`);
}

function togCk(enc) { const k = decodeURIComponent(enc); ckd[k] = !ckd[k]; save(); rShop() }
function clearCk() { Object.keys(ckd).forEach(k => { if (ckd[k]) delete ckd[k] }); save(); rShop() }
function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2400); }

// Global click to close modals
document.querySelectorAll('.ov').forEach(o => o.addEventListener('click', e => { if (e.target === o) closeModal(o.id) }));

// Initial render
rAll();
