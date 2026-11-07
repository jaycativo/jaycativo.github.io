// The light or dark paper button. The choice is remembered in this browser only.
(function () {
  var button = document.getElementById('theme');
  if (!button) return;
  var root = document.documentElement;

  function isDark() {
    var t = root.dataset.theme;
    if (t) return t === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function label() { button.textContent = isDark() ? 'light paper' : 'dark paper'; }

  button.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    label();
  });

  label();
})();
