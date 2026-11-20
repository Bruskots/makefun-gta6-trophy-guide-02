// Leonida Ledger — saved progress.
// Progress lives in localStorage under one key and never leaves the browser
// unless the player exports it. Export writes a JSON file; import reads one
// back and only accepts files shaped like an export of this guide.

export const STORAGE_KEY = 'leonida-ledger-progress-v1';
export const APP_ID = 'leonida-ledger-gta6-trophies';
export const EXPORT_VERSION = 1;

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Load the saved state: which trophy ids are earned, and the spoiler setting.
// Unknown fields are dropped; unknown trophy ids are ignored by the caller.
export function loadProgress() {
  const stored = readStored();
  const earned = new Set();
  let spoilers = true;
  if (stored && typeof stored === 'object') {
    if (Array.isArray(stored.earned)) {
      for (const id of stored.earned) {
        if (Number.isInteger(id)) earned.add(id);
      }
    }
    if (typeof stored.spoilers === 'boolean') spoilers = stored.spoilers;
  }
  return { earned, spoilers };
}

// Persist the earned set and the spoiler setting.
export function saveProgress(earned, spoilers) {
  const payload = {
    app: APP_ID,
    version: EXPORT_VERSION,
    earned: [...earned].sort((a, b) => a - b),
    spoilers,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage can be full or blocked; the in-memory state still works.
  }
  return payload;
}

// Build the object an export file holds.
export function buildExport(earned, spoilers) {
  return {
    app: APP_ID,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
    spoilers,
  };
}

// Download the export as a JSON file through a temporary anchor.
export function downloadExport(data) {
  const text = JSON.stringify(data, null, 2);
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'leonida-ledger-progress.json';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

// Parse an imported file's text. Returns { earned, spoilers } or throws
// a short, human-readable error when the file is not one of our exports.
export function parseImport(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('That file is not a Leonida Ledger export.');
  }
  if (parsed.app !== APP_ID) {
    throw new Error('That file is not a Leonida Ledger export.');
  }
  if (!Array.isArray(parsed.earned)) {
    throw new Error('The export has no earned-trophy list.');
  }
  const earned = new Set();
  for (const id of parsed.earned) {
    if (Number.isInteger(id)) earned.add(id);
  }
  const spoilers = typeof parsed.spoilers === 'boolean' ? parsed.spoilers : true;
  return { earned, spoilers };
}
