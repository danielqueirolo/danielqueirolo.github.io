// Reveal on scroll, marquee pause, copy email. No scroll listeners.
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

  var toggle = document.querySelector('.marquee-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var m = document.querySelector('.marquee');
      var paused = m.classList.toggle('paused');
      toggle.setAttribute('aria-pressed', paused ? 'true' : 'false');
      toggle.textContent = paused ? 'Play photos' : 'Pause photos';
    });
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
