'use strict';

// Storage keys
const STORAGE_KEYS = {
  items: 'dw_items',
  outfits: 'dw_outfits',
  savedItemIds: 'dw_saved_item_ids',
  settings: 'dw_settings',
};

// Occasions and color combos
const OCCASIONS = [
  'Casual',
  'Business',
  'Smart Casual',
  'Formal',
  'Party',
  'Wedding',
  'Sports',
  'Travel',
  'Festive',
];

const COLOR_COMBOS = {
  black: ['White', 'Grey', 'Beige', 'Camel', 'Any pop color'],
  white: ['Black', 'Navy', 'Beige', 'Pastels'],
  grey: ['Black', 'White', 'Navy', 'Burgundy', 'Camel'],
  navy: ['White', 'Grey', 'Beige', 'Camel', 'Pastels'],
  blue: ['White', 'Grey', 'Beige', 'Khaki', 'Brown'],
  brown: ['Cream', 'Beige', 'Blue', 'Olive'],
  olive: ['White', 'Black', 'Tan', 'Denim'],
  khaki: ['White', 'Navy', 'Black', 'Denim'],
  burgundy: ['Navy', 'Grey', 'Tan', 'White'],
  green: ['White', 'Tan', 'Navy', 'Grey'],
  red: ['Navy', 'Black', 'White', 'Denim'],
  pink: ['Grey', 'Navy', 'White', 'Beige'],
  purple: ['Grey', 'Navy', 'White', 'Black'],
  yellow: ['Navy', 'White', 'Denim', 'Olive'],
  orange: ['Navy', 'White', 'Denim', 'Earth tones'],
  beige: ['Navy', 'White', 'Black', 'Burgundy'],
  cream: ['Navy', 'Brown', 'Olive', 'Grey'],
};

// Utilities
function uid() {
  return 'id_' + Math.random().toString(36).slice(2, 10);
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function load(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
function toTitle(str) { return str.replace(/\s+/g, ' ').trim().replace(/(^|\s)\S/g, s => s.toUpperCase()); }
function hexToRgb(hex) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!m) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 1); break;
      case g: h = (b - r) / d + 3; break;
      case b: h = (r - g) / d + 5; break;
    }
    h /= 6;
  }
  return { h, s, l };
}
function getColorFamily(hex, name) {
  if (name) {
    const n = name.toLowerCase();
    for (const key of Object.keys(COLOR_COMBOS)) if (n.includes(key)) return key;
  }
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  if (l < 0.12) return 'black';
  if (l > 0.9) return 'white';
  const deg = Math.round(h * 360);
  if (deg < 15 || deg >= 345) return 'red';
  if (deg < 45) return 'orange';
  if (deg < 65) return 'yellow';
  if (deg < 170) return 'green';
  if (deg < 200) return 'cyan';
  if (deg < 255) return 'blue';
  if (deg < 290) return 'purple';
  if (deg < 345) return 'pink';
  return 'grey';
}

// State
let appState = {
  gender: 'men',
  items: load(STORAGE_KEYS.items, []),
  outfits: load(STORAGE_KEYS.outfits, []),
  savedItemIds: load(STORAGE_KEYS.savedItemIds, []),
};

// Elements
const els = {
  tabs: document.querySelectorAll('.tab'),
  pages: {
    wardrobe: document.getElementById('tab-wardrobe'),
    outfits: document.getElementById('tab-outfits'),
    saved: document.getElementById('tab-saved'),
    settings: document.getElementById('tab-settings'),
  },
  genderSegments: document.querySelectorAll('.segment[data-gender]'),
  occasionChips: document.getElementById('occasion-chips'),
  colorInput: document.getElementById('color-input'),
  colorName: document.getElementById('color-name'),
  comboSuggestions: document.getElementById('combo-suggestions'),
  addItemForm: document.getElementById('add-item-form'),
  addItemCategory: document.getElementById('item-category'),
  addItemSubcategory: document.getElementById('item-subcategory'),
  addItemOccasions: document.getElementById('item-occasions'),
  addItemNotes: document.getElementById('item-notes'),
  filterCategory: document.getElementById('filter-category'),
  filterOccasion: document.getElementById('filter-occasion'),
  searchText: document.getElementById('search-text'),
  wardrobeGrid: document.getElementById('wardrobe-grid'),
  builderLists: document.querySelectorAll('.builder-list'),
  outfitName: document.getElementById('outfit-name'),
  saveOutfit: document.getElementById('save-outfit'),
  outfitSavedList: document.getElementById('outfit-saved-list'),
  savedItems: document.getElementById('saved-items'),
  savedOutfits: document.getElementById('saved-outfits'),
  exportData: document.getElementById('export-data'),
  importFile: document.getElementById('import-file'),
  seedSamples: document.getElementById('seed-samples'),
};

// Initialize UI data
function initOccasions() {
  // chips
  els.occasionChips.innerHTML = '';
  OCCASIONS.forEach(name => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = name;
    chip.dataset.occasion = name;
    chip.addEventListener('click', () => chip.classList.toggle('active'));
    els.occasionChips.appendChild(chip);
  });
  // multi-select in form
  els.addItemOccasions.innerHTML = '';
  OCCASIONS.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name; els.addItemOccasions.appendChild(opt);
  });
  // filter select
  els.filterOccasion.innerHTML = '<option value="all">All Occasions</option>' +
    OCCASIONS.map(o => `<option value="${o}">${o}</option>`).join('');
}

function renderColorCombos() {
  const family = getColorFamily(els.colorInput.value, els.colorName.value);
  const options = COLOR_COMBOS[family] || ['Black', 'White', 'Grey', 'Denim'];
  els.comboSuggestions.innerHTML = '';
  options.forEach(name => {
    const el = document.createElement('button');
    el.className = 'combo';
    el.textContent = name;
    el.title = 'Filter wardrobe by this combo color';
    el.addEventListener('click', () => {
      els.searchText.value = name;
      renderWardrobe();
    });
    els.comboSuggestions.appendChild(el);
  });
}

// Tabs
els.tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.tab.active')?.classList.remove('active');
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
    els.pages[tab].classList.add('active');
  });
});

// Gender toggle
els.genderSegments.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.segment.active')?.classList.remove('active');
    btn.classList.add('active');
    appState.gender = btn.dataset.gender;
    renderWardrobe();
    renderBuilderLists();
    renderSaved();
  });
});

// Add item
els.addItemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const colorHex = els.colorInput.value;
  const colorName = toTitle(els.colorName.value || getColorFamily(colorHex));
  const item = {
    id: uid(),
    gender: appState.gender,
    category: els.addItemCategory.value,
    subcategory: toTitle(els.addItemSubcategory.value || ''),
    colorHex,
    colorName,
    occasions: Array.from(els.addItemOccasions.selectedOptions).map(o => o.value),
    notes: els.addItemNotes.value.trim(),
    createdAt: Date.now(),
  };
  appState.items.push(item);
  save(STORAGE_KEYS.items, appState.items);
  // Clear subcategory/notes only
  els.addItemSubcategory.value = '';
  els.addItemNotes.value = '';
  renderWardrobe();
  renderBuilderLists();
});

// Filters
[els.filterCategory, els.filterOccasion, els.searchText].forEach(el => {
  el.addEventListener('input', () => renderWardrobe());
});

// Color interactions
[els.colorInput, els.colorName].forEach(el => el.addEventListener('input', renderColorCombos));

// Wardrobe rendering
function itemMatchesFilters(item) {
  if (item.gender !== appState.gender) return false;
  const cat = els.filterCategory.value;
  if (cat !== 'all' && item.category !== cat) return false;
  const occ = els.filterOccasion.value;
  if (occ !== 'all' && !item.occasions.includes(occ)) return false;
  const q = els.searchText.value.trim().toLowerCase();
  if (q) {
    const hay = [item.category, item.subcategory, item.colorName, item.notes].join(' ').toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function createItemCard(item) {
  const tpl = document.getElementById('item-card-template');
  const node = tpl.content.firstElementChild.cloneNode(true);
  const swatch = node.querySelector('.swatch');
  const title = node.querySelector('.title');
  const subtitle = node.querySelector('.subtitle');
  const badges = node.querySelector('.badges');
  const saveBtn = node.querySelector('.save');
  const delBtn = node.querySelector('.delete');

  swatch.style.background = item.colorHex;
  swatch.title = `${item.colorName}`;
  title.textContent = `${toTitle(item.subcategory || item.category)} — ${item.colorName}`;
  subtitle.textContent = item.notes || '';
  badges.innerHTML = item.occasions.map(o => `<span class="badge">${o}</span>`).join('');

  if (appState.savedItemIds.includes(item.id)) saveBtn.classList.add('active');
  saveBtn.title = 'Save to list';
  saveBtn.addEventListener('click', () => {
    const idx = appState.savedItemIds.indexOf(item.id);
    if (idx >= 0) appState.savedItemIds.splice(idx, 1); else appState.savedItemIds.push(item.id);
    save(STORAGE_KEYS.savedItemIds, appState.savedItemIds);
    renderWardrobe();
    renderSaved();
  });

  delBtn.addEventListener('click', () => {
    if (!confirm('Delete this item?')) return;
    appState.items = appState.items.filter(x => x.id !== item.id);
    save(STORAGE_KEYS.items, appState.items);
    appState.savedItemIds = appState.savedItemIds.filter(id => id !== item.id);
    save(STORAGE_KEYS.savedItemIds, appState.savedItemIds);
    renderWardrobe();
    renderBuilderLists();
    renderSaved();
  });
  return node;
}

function renderWardrobe() {
  const items = appState.items.filter(itemMatchesFilters).sort((a, b) => b.createdAt - a.createdAt);
  els.wardrobeGrid.innerHTML = '';
  if (!items.length) {
    const empty = document.createElement('div');
    empty.style.opacity = '0.7';
    empty.textContent = 'No items yet. Add some from the sidebar.';
    els.wardrobeGrid.appendChild(empty);
    return;
  }
  items.forEach(item => els.wardrobeGrid.appendChild(createItemCard(item)));
}

// Outfit builder
function renderBuilderLists() {
  const byCategory = (cat) => appState.items.filter(i => i.gender === appState.gender && i.category === cat);
  els.builderLists.forEach(list => {
    const slot = list.dataset.slot;
    const items = byCategory(slot);
    list.innerHTML = '';
    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'builder-item';
      row.innerHTML = `
        <div class="dot" style="background:${item.colorHex}"></div>
        <div>
          <div style="font-weight:600">${toTitle(item.subcategory || item.category)}</div>
          <div style="font-size:12px;color:#9ca3af">${item.colorName} ${item.occasions.length ? '• ' + item.occasions.join(', ') : ''}</div>
        </div>
        <button data-action="add">Add</button>
      `;
      row.querySelector('[data-action="add"]').addEventListener('click', () => addToCurrentOutfit(slot, item.id));
      list.appendChild(row);
    });
  });
}

let currentOutfit = { top: null, bottom: null, footwear: null, accessory: null };

function addToCurrentOutfit(slot, itemId) {
  currentOutfit[slot] = itemId;
  showCurrentOutfitPreview();
}

function showCurrentOutfitPreview() {
  // Simple preview inside the saved list area
  const ids = Object.values(currentOutfit).filter(Boolean);
  const items = appState.items.filter(i => ids.includes(i.id));
  const container = els.outfitSavedList;
  container.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'outfit-card';
  card.innerHTML = `<h5>Current Outfit</h5>`;
  const row = document.createElement('div');
  row.className = 'row';
  items.forEach(i => {
    const tag = document.createElement('span');
    tag.className = 'badge';
    tag.style.background = '#0b1220';
    tag.textContent = `${toTitle(i.subcategory || i.category)} (${i.colorName})`;
    row.appendChild(tag);
  });
  if (!items.length) {
    const hint = document.createElement('div');
    hint.style.opacity = '0.7';
    hint.textContent = 'Pick items from lists above to build an outfit.';
    row.appendChild(hint);
  }
  card.appendChild(row);
  container.appendChild(card);
}

els.saveOutfit.addEventListener('click', () => {
  const name = els.outfitName.value.trim() || 'Untitled Outfit';
  const ids = Object.values(currentOutfit).filter(Boolean);
  if (!ids.length) { alert('Add at least one item to save an outfit.'); return; }
  const outfit = { id: uid(), gender: appState.gender, name, itemIds: ids, createdAt: Date.now() };
  appState.outfits.push(outfit);
  save(STORAGE_KEYS.outfits, appState.outfits);
  els.outfitName.value = '';
  currentOutfit = { top: null, bottom: null, footwear: null, accessory: null };
  showCurrentOutfitPreview();
  renderSaved();
});

function renderSaved() {
  // Items
  els.savedItems.innerHTML = '';
  const savedItems = appState.items.filter(i => appState.savedItemIds.includes(i.id) && i.gender === appState.gender);
  savedItems.forEach(item => els.savedItems.appendChild(createItemCard(item)));
  if (!savedItems.length) {
    const empty = document.createElement('div');
    empty.style.opacity = '0.7';
    empty.textContent = 'No saved items yet. Tap ❤ on items to save them.';
    els.savedItems.appendChild(empty);
  }

  // Outfits
  els.savedOutfits.innerHTML = '';
  const outfits = appState.outfits.filter(o => o.gender === appState.gender).sort((a, b) => b.createdAt - a.createdAt);
  if (!outfits.length) {
    const empty = document.createElement('div');
    empty.style.opacity = '0.7';
    empty.textContent = 'No outfits saved yet.';
    els.savedOutfits.appendChild(empty);
  }
  outfits.forEach(o => {
    const card = document.createElement('div');
    card.className = 'outfit-card';
    const items = appState.items.filter(i => o.itemIds.includes(i.id));
    card.innerHTML = `<h5>${o.name}</h5>`;
    const row = document.createElement('div');
    row.className = 'row';
    items.forEach(i => {
      const tag = document.createElement('span');
      tag.className = 'badge';
      tag.textContent = `${toTitle(i.subcategory || i.category)} (${i.colorName})`;
      row.appendChild(tag);
    });
    const actions = document.createElement('div');
    actions.style.marginTop = '8px';
    const del = document.createElement('button');
    del.textContent = 'Delete Outfit';
    del.addEventListener('click', () => {
      if (!confirm('Delete this outfit?')) return;
      appState.outfits = appState.outfits.filter(x => x.id !== o.id);
      save(STORAGE_KEYS.outfits, appState.outfits);
      renderSaved();
    });
    actions.appendChild(del);
    card.appendChild(row);
    card.appendChild(actions);
    els.savedOutfits.appendChild(card);
  });
}

// Import/Export
els.exportData.addEventListener('click', () => {
  const data = {
    items: appState.items,
    outfits: appState.outfits,
    savedItemIds: appState.savedItemIds,
    exportedAt: new Date().toISOString(),
    app: 'digital-wardrobe',
    version: 1,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'digital-wardrobe-backup.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

els.importFile.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data.items)) throw new Error('Invalid file');
    appState.items = data.items || [];
    appState.outfits = data.outfits || [];
    appState.savedItemIds = data.savedItemIds || [];
    save(STORAGE_KEYS.items, appState.items);
    save(STORAGE_KEYS.outfits, appState.outfits);
    save(STORAGE_KEYS.savedItemIds, appState.savedItemIds);
    renderWardrobe();
    renderBuilderLists();
    renderSaved();
    alert('Import successful');
  } catch (err) {
    alert('Failed to import: ' + err.message);
  } finally {
    e.target.value = '';
  }
});

// Seed samples
els.seedSamples.addEventListener('click', () => {
  const gender = appState.gender;
  const now = Date.now();
  const samples = [
    { category: 'top', subcategory: 'Oxford Shirt', colorHex: '#1f2937', colorName: 'Charcoal', occasions: ['Business', 'Smart Casual'] },
    { category: 'top', subcategory: 'T-Shirt', colorHex: '#ffffff', colorName: 'White', occasions: ['Casual', 'Travel'] },
    { category: 'bottom', subcategory: 'Slim Jeans', colorHex: '#1e3a8a', colorName: 'Indigo', occasions: ['Casual', 'Travel'] },
    { category: 'bottom', subcategory: 'Chinos', colorHex: '#eab308', colorName: 'Khaki', occasions: ['Smart Casual'] },
    { category: 'footwear', subcategory: 'White Sneakers', colorHex: '#f8fafc', colorName: 'White', occasions: ['Casual', 'Travel'] },
    { category: 'footwear', subcategory: 'Derby Shoes', colorHex: '#5b4636', colorName: 'Brown', occasions: ['Business', 'Formal'] },
    { category: 'outerwear', subcategory: 'Denim Jacket', colorHex: '#1e40af', colorName: 'Blue', occasions: ['Casual'] },
    { category: 'accessory', subcategory: 'Leather Belt', colorHex: '#5b4636', colorName: 'Brown', occasions: ['Smart Casual', 'Business'] },
  ];
  const enriched = samples.map((s, i) => ({ id: uid(), gender, notes: '', createdAt: now + i, ...s }));
  appState.items.push(...enriched);
  save(STORAGE_KEYS.items, appState.items);
  renderWardrobe();
  renderBuilderLists();
});

// Boot
function boot() {
  initOccasions();
  renderColorCombos();
  renderWardrobe();
  renderBuilderLists();
  renderSaved();
}

boot();