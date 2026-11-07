// The nest: a footer button that hides the bird. The choice is remembered in this browser.

const STORAGE_KEY = 'nest'; // also read by the inline script in lib/templates.mjs
const LEAVE_DELAY_MS = 1100; // time for the bird to say goodbye before it disappears

const root = document.documentElement;

export function isNested() {
  return root.dataset.nest === '1';
}

function setNested(on) {
  if (on) root.dataset.nest = '1';
  else delete root.dataset.nest;
  try {
    if (on) localStorage.setItem(STORAGE_KEY, '1');
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage is blocked, so the choice lasts for this page only.
  }
}

// `onLeaving` and `onReturn` let the bird say something without this file knowing about the bird.
export function setupNest({ onLeaving, onReturn }) {
  const button = document.getElementById('nest');
  if (!button) return;
  let leaving = false;

  const showLabel = () => {
    button.textContent = isNested() ? 'call the bird back' : 'send the bird to the nest';
  };

  button.hidden = false; // the button is hidden in the page until this script runs
  showLabel();

  button.addEventListener('click', () => {
    if (leaving) return;
    if (isNested()) {
      setNested(false);
      showLabel();
      onReturn();
      return;
    }
    leaving = true;
    onLeaving();
    setTimeout(() => {
      setNested(true);
      showLabel();
      leaving = false;
    }, LEAVE_DELAY_MS);
  });
}
