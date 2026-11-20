// Leonida Ledger — boot, checklist, filters, spoiler setting, detail pane.
// Loads app/data/trophies.json (a file of this app, fetched from the same
// server the app is served from) and renders the tracker from it.

import {
  STORAGE_KEY,
  loadProgress,
  saveProgress,
  buildExport,
  downloadExport,
  parseImport,
} from './store.js';
import { renderRoadmap, renderMissables } from './roadmap.js';

const DATA_URL = 'data/trophies.json';
const TOTAL = 55;

// Filter chips: label shown, and the test a trophy must pass.
const KIND_FILTERS = [
  { id: 'all', label: 'All trophies', test: () => true },
  { id: 'story', label: 'Story', test: (t) => t.kind === 'story' },
  { id: 'missable', label: 'Missable', test: (t) => t.missable === true },
  { id: 'collectibles', label: 'Collectibles', test: (t) => t.kind === 'collectibles' },
  { id: 'activities', label: 'Activities', test: (t) => t.kind === 'activities' },
  { id: 'side', label: 'Side quests', test: (t) => t.kind === 'side' || t.kind === 'strangers' },
  { id: 'robbery', label: 'Robberies', test: (t) => t.kind === 'robbery' },
  { id: 'misc', label: 'One-offs', test: (t) => t.kind === 'misc' },
];

const KIND_LABELS = {
  story: 'Story',
  side: 'Side quest',
  strangers: 'Strangers & Freaks',
  activities: 'Activity',
  collectibles: 'Collectible',
  robbery: 'Robbery',
  misc: 'One-off',
  platinum: 'Platinum',
};

const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

let trophies = [];
let selectedId = null;
let state = loadProgress();
let kindFilter = 'all';
let gradeFilter = 'all';
let searchText = '';

// A story trophy is hidden while spoilers are on and it is not earned yet.
function isSpoilerHidden(trophy) {
  return state.spoilers && trophy.kind === 'story' && !state.earned.has(trophy.id);
}

function gradeBadge(trophy) {
  const badge = document.createElement('span');
  badge.className = 'grade-badge grade-' + trophy.grade;
  badge.textContent = trophy.grade;
  return badge;
}

function kindTag(trophy) {
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.textContent = KIND_LABELS[trophy.kind] || trophy.kind;
  return tag;
}

// One checklist row: a checkbox for earned, and a button with the trophy.
function trophyRow(trophy) {
  const item = document.createElement('li');
  const card = document.createElement('div');
  card.className = 'trophy-card' + (state.earned.has(trophy.id) ? ' earned' : '') + (trophy.id === selectedId ? ' selected' : '');

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'trophy-check';
  check.checked = state.earned.has(trophy.id);
  check.setAttribute('aria-label', 'Mark ' + trophy.name + ' as earned');
  check.addEventListener('change', () => toggleEarned(trophy.id, check.checked));

  const body = document.createElement('button');
  body.type = 'button';
  body.className = 'trophy-body';
  body.addEventListener('click', () => selectTrophy(trophy.id));

  const hidden = isSpoilerHidden(trophy);
  const name = document.createElement('div');
  name.className = 'trophy-name' + (hidden ? ' hidden-name' : '');
  name.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  const desc = document.createElement('div');
  desc.className = 'trophy-desc';
  desc.textContent = hidden
    ? 'Earn it to reveal its name, description and guide.'
    : trophy.description;
  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  meta.append(kindTag(trophy));
  if (trophy.missable) {
    const flag = document.createElement('span');
    flag.className = 'tag missable';
    flag.textContent = 'Missable';
    meta.append(flag);
  }
  if (trophy.hidden) {
    const flag = document.createElement('span');
    flag.className = 'tag hidden-flag';
    flag.textContent = 'Hidden on PSN';
    meta.append(flag);
  }
  if (trophy.count) {
    const count = document.createElement('span');
    count.className = 'tag';
    count.textContent = 'Target: ' + trophy.count;
    meta.append(count);
  }
  body.append(name, desc, meta);
  card.append(check, body, gradeBadge(trophy));
  item.append(card);
  return item;
}

function visibleTrophies() {
  const kindTest = KIND_FILTERS.find((f) => f.id === kindFilter).test;
  const query = searchText.trim().toLowerCase();
  return trophies
    .filter((t) => kindTest(t))
    .filter((t) => gradeFilter === 'all' || t.grade === gradeFilter)
    .filter((t) => {
      if (!query) return true;
      return (t.name + ' ' + t.description + ' ' + t.guide + ' ' + t.kind)
        .toLowerCase()
        .includes(query);
    });
}

function renderList() {
  const list = document.getElementById('trophyList');
  list.innerHTML = '';
  const shown = visibleTrophies();
  for (const trophy of shown) list.append(trophyRow(trophy));
  if (shown.length === 0) {
    const note = document.createElement('li');
    note.className = 'empty-note';
    note.textContent = 'No trophies match those filters. Clear the search or pick another kind.';
    list.append(note);
  }
  document.getElementById('listCount').textContent =
    shown.length + ' of ' + trophies.length + ' shown';
}

// The detail pane: the selected trophy's official text, guide and sources.
function renderDetail() {
  const panel = document.getElementById('detailPanel');
  panel.innerHTML = '';
  const trophy = trophies.find((t) => t.id === selectedId);
  if (!trophy) {
    const empty = document.createElement('p');
    empty.className = 'detail-empty';
    empty.textContent = 'Click a trophy in the checklist to read its guide and sources here.';
    panel.append(empty);
    return;
  }
  const hidden = isSpoilerHidden(trophy);
  const badge = gradeBadge(trophy);
  panel.append(badge);
  const heading = document.createElement('h3');
  heading.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  panel.append(heading);

  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = hidden
    ? 'This is a story trophy. Earn it to reveal its official description and guide.'
    : 'Official: “' + trophy.description + '” — ' + trophy.grade + '.';
  panel.append(official);

  if (!hidden) {
    const guideTitle = document.createElement('h4');
    guideTitle.textContent = 'Guide';
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    panel.append(guideTitle, guide);

    if (trophy.missable) {
      const callout = document.createElement('div');
      callout.className = 'missable-callout';
      callout.textContent =
        'Missable: this is the only trophy in the list that can be missed. ' +
        'Read the guide above before you finish Chapter 1.';
      panel.append(callout);
    }

    const sourceTitle = document.createElement('h4');
    sourceTitle.textContent = 'Sources';
    const sourceList = document.createElement('ul');
    for (const source of trophy.sources) {
      const entry = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = source.name;
      entry.append(link);
      sourceList.append(entry);
    }
    panel.append(sourceTitle, sourceList);

    const metaTitle = document.createElement('h4');
    metaTitle.textContent = 'Details';
    const meta = document.createElement('p');
    const parts = ['Kind: ' + (KIND_LABELS[trophy.kind] || trophy.kind)];
    parts.push('Roadmap stage: ' + trophy.roadmap);
    if (trophy.count) parts.push('PSN target: ' + trophy.count);
    parts.push(trophy.hidden ? 'Hidden on PlayStation until earned.' : 'Visible on PlayStation from the start.');
    meta.textContent = parts.join(' · ');
    panel.append(metaTitle, meta);
  }

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'chip';
  toggle.textContent = state.earned.has(trophy.id) ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => toggleEarned(trophy.id, !state.earned.has(trophy.id)));
  panel.append(toggle);
}

function selectTrophy(id) {
  selectedId = id;
  renderList();
  renderDetail();
}

function toggleEarned(id, earned) {
  if (earned) state.earned.add(id);
  else state.earned.delete(id);
  saveProgress(state.earned, state.spoilers);
  renderProgress();
  renderList();
  renderDetail();
  refreshRoadmap();
}

function renderProgress() {
  const earned = state.earned.size;
  const percent = Math.round((earned / TOTAL) * 100);
  document.getElementById('progressFill').style.width = percent + '%';
  document.getElementById('progressText').textContent =
    earned + ' of ' + TOTAL + ' earned — ' + percent + '%';
  document.getElementById('progressBar').setAttribute('aria-valuenow', String(earned));
}

function renderCounts() {
  const mount = document.getElementById('trophyCounts');
  mount.innerHTML = '';
  for (const grade of GRADE_ORDER) {
    const total = trophies.filter((t) => t.grade === grade).length;
    const earned = trophies.filter((t) => t.grade === grade && state.earned.has(t.id)).length;
    const chip = document.createElement('span');
    chip.className = 'count-chip';
    const label = document.createElement('b');
    label.textContent = earned + '/' + total;
    chip.append(label, document.createTextNode(' ' + grade));
    mount.append(chip);
  }
}

function renderKindChips() {
  const mount = document.getElementById('kindChips');
  mount.innerHTML = '';
  for (const filter of KIND_FILTERS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
    button.textContent = filter.label;
    button.setAttribute('aria-pressed', String(filter.id === kindFilter));
    button.addEventListener('click', () => {
      kindFilter = filter.id;
      renderKindChips();
      renderList();
    });
    mount.append(button);
  }
}

function renderSources(data) {
  const mount = document.getElementById('sourceList');
  mount.innerHTML = '';
  for (const source of data.sources || []) {
    const entry = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = source.name;
    entry.append(link);
    mount.append(entry);
  }
}

function refreshRoadmap() {
  for (const trophy of trophies) {
    trophy._earned = state.earned.has(trophy.id);
    trophy._spoilerHidden = isSpoilerHidden(trophy);
  }
  renderRoadmap(trophies, document.getElementById('roadmapStages'));
}

function wireToolbar() {
  document.getElementById('searchInput').addEventListener('input', (event) => {
    searchText = event.target.value;
    renderList();
  });
  document.getElementById('gradeFilter').addEventListener('change', (event) => {
    gradeFilter = event.target.value;
    renderList();
  });
  const spoiler = document.getElementById('spoilerToggle');
  spoiler.checked = state.spoilers;
  spoiler.addEventListener('change', () => {
    state.spoilers = spoiler.checked;
    saveProgress(state.earned, state.spoilers);
    renderList();
    renderDetail();
    refreshRoadmap();
  });
  document.getElementById('exportBtn').addEventListener('click', () => {
    downloadExport(buildExport(state.earned, state.spoilers));
  });
  document.getElementById('importInput').addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = parseImport(text);
      state = imported;
      saveProgress(state.earned, state.spoilers);
      document.getElementById('spoilerToggle').checked = state.spoilers;
      selectedId = null;
      renderAll();
    } catch (error) {
      window.alert('Import failed: ' + error.message);
    }
    event.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!window.confirm('Clear all earned trophies? This cannot be undone.')) return;
    state.earned.clear();
    saveProgress(state.earned, state.spoilers);
    selectedId = null;
    renderAll();
  });
}

function renderAll() {
  renderCounts();
  renderProgress();
  renderList();
  renderDetail();
  refreshRoadmap();
  renderMissables(trophies, document.getElementById('missableList'));
}

async function boot() {
  wireToolbar();
  renderKindChips();
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error('Could not load ' + DATA_URL);
    const data = await response.json();
    trophies = (data.trophies || []).slice().sort((a, b) => a.id - b.id);
    // Drop saved ids that are not in the list, so stale saves stay clean.
    for (const id of [...state.earned]) {
      if (!trophies.some((t) => t.id === id)) state.earned.delete(id);
    }
    renderSources(data);
    renderAll();
  } catch (error) {
    const list = document.getElementById('trophyList');
    const note = document.createElement('li');
    note.className = 'empty-note';
    note.textContent = 'The trophy list could not be loaded. Serve this folder with a static file server and open app/index.html from it.';
    list.append(note);
  }
}

boot();
