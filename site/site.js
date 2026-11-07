// The light or dark paper button. The choice is remembered in this browser only.

const STORAGE_KEY = 'theme'; // also read by the inline script in lib/templates.mjs

const root = document.documentElement;
const button = document.getElementById('theme');

function isDark() {
  if (root.dataset.theme) return root.dataset.theme === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function showLabel() {
  button.textContent = isDark() ? 'light paper' : 'dark paper';
}

function toggle() {
  const next = isDark() ? 'light' : 'dark';
  root.dataset.theme = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage is blocked, so the choice lasts for this page only.
  }
  showLabel();
}

if (button) {
  button.addEventListener('click', toggle);
  showLabel();
}
