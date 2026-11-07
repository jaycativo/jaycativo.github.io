// The pet: a little blue bird. It hops, blinks, watches the pointer, and chirps when clicked.
(function () {
  var COLORS = { B: '#7C9CFF', D: '#4F6FD8', W: '#F4F1E8', O: '#FF8A3D', K: '#26241F' };
  var SAYS = ['chirp.', 'chirp chirp.', 'tweet?', 'hi.', 'nice beanie.'];

  function frame(eye, legs) {
    return [
      '.....BB.....', '....BBBB....', '...BBBBBB...',
      '...BBB' + eye + 'BBOO.', '..BBBBBBBO..', '..DDBBBWWW..',
      '..DDDBWWWW..', '...DDWWWW...',
      legs ? '....O..O....' : '............', '............',
    ];
  }

  function svg(eye, legs) {
    var px = 6, rows = frame(eye, legs), out = '';
    rows.forEach(function (row, y) {
      for (var x = 0; x < 12; x++) {
        var c = COLORS[row[x]];
        if (c) out += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + c + '"/>';
      }
    });
    return '<svg width="' + 12 * px + '" height="' + 10 * px + '" viewBox="0 0 12 10" shape-rendering="crispEdges" role="img" aria-label="A little blue bird. Click it.">' + out + '</svg>';
  }

  var perch = document.createElement('div');
  perch.id = 'perch';
  perch.innerHTML = '<div id="bird"><div id="bird-say" role="status"></div><div id="flip"><div id="sprite"></div></div></div>';
  document.body.appendChild(perch);

  var bird = document.getElementById('bird');
  var say = document.getElementById('bird-say');
  var flip = document.getElementById('flip');
  var sprite = document.getElementById('sprite');
  var calm = document.body.classList.contains('calm');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var x = 24, busy = false, sayTimer;

  function show(eye, legs) { sprite.innerHTML = svg(eye, legs); }
  function face(dir) { flip.style.transform = dir > 0 ? 'none' : 'scaleX(-1)'; }

  function hopTo(nx) {
    if (busy) return;
    busy = true;
    if (nx !== x) face(nx > x ? 1 : -1);
    show('K', false);
    sprite.classList.remove('hop');
    void sprite.offsetWidth;
    sprite.classList.add('hop');
    x = nx;
    bird.style.left = x + 'px';
    setTimeout(function () { show('K', true); busy = false; }, 520);
  }

  function blink() {
    show('B', true);
    setTimeout(function () { show('K', true); }, 150);
  }

  function chirp(text) {
    say.textContent = text || SAYS[Math.floor(Math.random() * SAYS.length)];
    say.style.opacity = 1;
    clearTimeout(sayTimer);
    sayTimer = setTimeout(function () { say.style.opacity = 0; }, 1600);
  }

  show('K', true);

  // The nest: a footer button hides the bird, and the choice is remembered in this browser.
  var nest = document.getElementById('nest');
  var root = document.documentElement;
  var leaving = false;
  function nested() { return root.dataset.nest === '1'; }
  function nestLabel() { if (nest) nest.textContent = nested() ? 'call the bird back' : 'send the bird to the nest'; }
  function setNest(on) {
    if (on) root.dataset.nest = '1'; else delete root.dataset.nest;
    try { if (on) localStorage.setItem('nest', '1'); else localStorage.removeItem('nest'); } catch (e) {}
    nestLabel();
  }
  if (nest) {
    nest.hidden = false;
    nestLabel();
    nest.addEventListener('click', function () {
      if (leaving) return;
      if (nested()) { setNest(false); chirp('hi.'); return; }
      leaving = true;
      chirp('off to the nest.');
      setTimeout(function () { setNest(true); leaving = false; }, 1100);
    });
  }

  bird.addEventListener('click', function () { chirp(); hopTo(x); });

  window.addEventListener('mousemove', function (e) {
    if (busy || e.clientY < window.innerHeight - 160) return;
    face(e.clientX > x + 36 ? 1 : -1);
  });

  setInterval(function () {
    if (nested()) return;
    var r = Math.random();
    if (!calm && !reduced && r < 0.5) {
      var max = Math.max(24, window.innerWidth - 100);
      var nx = Math.max(10, Math.min(max, x + (Math.random() * 200 - 100)));
      hopTo(nx);
    } else if (r < 0.85) {
      blink();
    }
  }, 2400);
})();
