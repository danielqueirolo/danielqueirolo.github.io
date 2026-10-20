// Reveal on scroll, talks carousel, copy email. No window scroll listeners.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var items = document.querySelectorAll('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Talks carousel: drifts on its own, and hands control to the visitor
  // the moment they touch, drag, scroll or use the arrows.
  var sc = document.querySelector('.scroller');
  if (sc) {
    var track = sc.querySelector('.scroller-track');
    var toggle = document.querySelector('.scroller-toggle');
    var SPEED = 70;             // px per second while drifting
    var RESUME_AFTER = 3500;    // ms of inactivity before drifting again
    var userPaused = reduce;    // the Pause button (or reduced motion)
    var holdUntil = 0;          // temporary pause after interaction
    var visible = false;
    var pos = 0, last = 0;

    // The track holds the photos twice; looping at half its width is seamless.
    var half = function () { return track.scrollWidth / 2; };
    var hold = function () { holdUntil = performance.now() + RESUME_AFTER; };
    var wrap = function () {
      var h = half();
      if (sc.scrollLeft >= h) sc.scrollLeft -= h;
      else if (sc.scrollLeft <= 0) sc.scrollLeft += h;
    };

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0.05 }).observe(sc);
    } else { visible = true; }

    var tick = function (t) {
      var dt = last ? Math.min(t - last, 64) : 0; last = t;
      if (!userPaused && visible && t > holdUntil && !dragging) {
        pos = (pos || sc.scrollLeft) + SPEED * dt / 1000;
        sc.scrollLeft = pos;
        if (sc.scrollLeft >= half()) { pos -= half(); sc.scrollLeft = pos; }
      } else {
        pos = sc.scrollLeft;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // Touch and trackpad: native scrolling, we just step aside.
    ['touchstart', 'wheel', 'keydown'].forEach(function (ev) {
      sc.addEventListener(ev, hold, { passive: true });
    });
    sc.addEventListener('scroll', function () { if (performance.now() < holdUntil) wrap(); }, { passive: true });

    // Mouse drag on desktop.
    var dragging = false, startX = 0, startLeft = 0, moved = 0;
    sc.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      dragging = true; moved = 0; startX = e.clientX; startLeft = sc.scrollLeft;
      sc.classList.add('dragging'); sc.setPointerCapture(e.pointerId); hold();
    });
    sc.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      moved = Math.abs(e.clientX - startX);
      sc.scrollLeft = startLeft - (e.clientX - startX);
      wrap(); startLeft = sc.scrollLeft; startX = e.clientX;
    });
    var end = function () { if (!dragging) return; dragging = false; sc.classList.remove('dragging'); hold(); };
    sc.addEventListener('pointerup', end);
    sc.addEventListener('pointercancel', end);

    // Arrow buttons move by roughly one photo.
    document.querySelectorAll('.scroller-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        hold();
        var fig = track.querySelector('figure');
        var step = fig ? fig.getBoundingClientRect().width + 14 : 320;
        wrap();
        sc.scrollBy({ left: step * Number(b.getAttribute('data-dir')), behavior: reduce ? 'auto' : 'smooth' });
      });
    });

    if (toggle) {
      toggle.addEventListener('click', function () {
        userPaused = !userPaused;
        toggle.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
        toggle.textContent = userPaused ? 'Play' : 'Pause';
      });
    }
  }

  var copy = document.querySelector('[data-copy]');
  if (copy && navigator.clipboard) {
    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(copy.getAttribute('data-copy')).then(function () {
        var s = document.querySelector('.copy-status');
        if (s) s.textContent = 'Email copied to your clipboard.';
      });
    });
  }
})();
