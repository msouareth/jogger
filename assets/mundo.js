/* ═══════════════════════════════════════════════════════════════════
   Mundo — core UI behaviours
   Scroll reveals, the sticky header, hero parallax, the lookbook drag
   rail, seamless tickers, drawers with focus trapping, the toast and
   the local wishlist. Everything here re-binds on shopify:section:load
   so the theme editor stays live.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var settings = window.mundoSettings || {};
  var strings = window.mundoStrings || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── scroll reveal ─────────────────────────────────────────────── */
  var revealObserver = null;

  if (settings.reveal !== false && !reduceMotion && 'IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
  } else {
    document.documentElement.classList.add('motion-off');
  }

  function observeReveals(root) {
    if (!revealObserver) return;
    (root || document).querySelectorAll('.rv, .rv-img').forEach(function (node) {
      if (node.classList.contains('in')) return;
      revealObserver.observe(node);
    });
  }

  /* ── seamless tickers ──────────────────────────────────────────
     A marquee only loops cleanly if the track holds two identical
     copies, because the keyframe translates it by exactly -50%. */
  function primeTickers(root) {
    (root || document).querySelectorAll('.tick-run').forEach(function (track) {
      if (track.dataset.primed) return;
      track.dataset.primed = 'true';
      track.innerHTML += track.innerHTML;
      track.setAttribute('aria-hidden', 'false');
    });
  }

  /* ── folding the header menu ────────────────────────────────────
     The menu is one block beside a centred wordmark, and the bar's side
     columns are locked to the same width so the wordmark stays centred. The
     menu therefore cannot borrow room from the emptier icon side: past a
     certain length it runs into the wordmark, and no breakpoint answers that,
     because it depends on how many links the merchant wrote.

     So measure it. The attribute is cleared and re-set without yielding, so
     the browser never paints the unfolded state in between. */
  function fitHeaderMenu() {
    var header = document.querySelector('.hdr');
    if (!header) return;

    var side = header.querySelector('.hside--left');
    var list = header.querySelector('.hnav ul');
    if (!side || !list) return;

    header.removeAttribute('data-fold');

    // Below the drawer breakpoint the stylesheet has already hidden the menu,
    // so it measures zero and simply never folds on this path.
    var style = getComputedStyle(side);
    var available = side.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    if (list.scrollWidth > available) header.setAttribute('data-fold', '');
  }

  window.addEventListener('resize', fitHeaderMenu);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeaderMenu);

  /* ── sticky header + parallax ──────────────────────────────────── */
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(function () {
      var header = document.querySelector('.hdr');
      if (header) header.toggleAttribute('data-stuck', window.scrollY > 24);

      if (settings.parallax !== false && !reduceMotion) {
        document.querySelectorAll('.plx').forEach(function (node) {
          var rect = node.getBoundingClientRect();
          if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
          var offset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
          node.style.transform = 'scale(1.1) translateY(' + (-offset * 26).toFixed(2) + 'px)';
        });
      }

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* ── lookbook drag rail ────────────────────────────────────────
     Pointer drag scrolls the rail. We only suppress the click that
     follows if the pointer actually travelled, so taps still open
     the look underneath. */
  function bindRail(rail) {
    if (rail.dataset.bound) return;
    rail.dataset.bound = 'true';

    var down = false;
    var moved = false;
    var startX = 0;
    var startLeft = 0;

    rail.addEventListener('pointerdown', function (event) {
      if (event.button !== 0) return;
      down = true;
      moved = false;
      startX = event.clientX;
      startLeft = rail.scrollLeft;
    });

    rail.addEventListener('pointermove', function (event) {
      if (!down) return;
      var delta = event.clientX - startX;
      if (!moved && Math.abs(delta) > 4) {
        moved = true;
        rail.setAttribute('data-drag', '');
        if (rail.setPointerCapture) rail.setPointerCapture(event.pointerId);
      }
      if (moved) rail.scrollLeft = startLeft - delta;
    });

    function endDrag() {
      down = false;
      // Leave data-drag on for one frame so the click that fires after
      // pointerup lands on a rail with pointer-events disabled.
      requestAnimationFrame(function () {
        rail.removeAttribute('data-drag');
      });
    }

    rail.addEventListener('pointerup', endDrag);
    rail.addEventListener('pointercancel', endDrag);
    rail.addEventListener('pointerleave', endDrag);
  }

  /* Arrow buttons beside a rail. Each press moves by roughly one card,
     measured from the real DOM so it stays correct at any breakpoint. */
  function bindRailNav(wrap) {
    if (wrap.dataset.navBound) return;
    wrap.dataset.navBound = 'true';

    var rail = wrap.querySelector('.rail');
    var prev = wrap.querySelector('[data-rail-prev]');
    var next = wrap.querySelector('[data-rail-next]');
    if (!rail || (!prev && !next)) return;

    function step() {
      var card = rail.children[0];
      if (!card) return rail.clientWidth;
      var gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
      return card.getBoundingClientRect().width + gap;
    }

    function sync() {
      var max = rail.scrollWidth - rail.clientWidth - 1;
      if (prev) prev.toggleAttribute('disabled', rail.scrollLeft <= 0);
      if (next) next.toggleAttribute('disabled', rail.scrollLeft >= max);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        rail.scrollBy({ left: -step(), behavior: 'smooth' });
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        rail.scrollBy({ left: step(), behavior: 'smooth' });
      });
    }

    rail.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    sync();
  }

  function bindRails(root) {
    (root || document).querySelectorAll('.rail').forEach(bindRail);
    (root || document).querySelectorAll('.rail-wrap').forEach(bindRailNav);
  }

  /* ── drawers ───────────────────────────────────────────────────── */
  var FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var openDrawerEl = null;
  var lastFocused = null;

  function openDrawer(id) {
    var drawer = document.getElementById(id);
    if (!drawer) return;

    lastFocused = document.activeElement;
    closeDrawer(true);

    drawer.setAttribute('data-open', '');
    drawer.removeAttribute('aria-hidden');
    var scrim = document.querySelector('[data-scrim-for="' + id + '"]') || document.getElementById('Scrim');
    if (scrim) scrim.setAttribute('data-open', '');
    document.body.classList.add('is-locked');
    openDrawerEl = drawer;

    var first = drawer.querySelector(FOCUSABLE);
    if (first) requestAnimationFrame(function () { first.focus(); });
  }

  function closeDrawer(silent) {
    document.querySelectorAll('.drawer[data-open], .nav-drawer[data-open], .search-panel[data-open]').forEach(
      function (drawer) {
        drawer.removeAttribute('data-open');
        drawer.setAttribute('aria-hidden', 'true');
      }
    );
    document.querySelectorAll('.scrim[data-open]').forEach(function (scrim) {
      scrim.removeAttribute('data-open');
    });
    document.body.classList.remove('is-locked');
    openDrawerEl = null;

    if (!silent && lastFocused && document.contains(lastFocused)) {
      lastFocused.focus();
      lastFocused = null;
    }
  }

  document.addEventListener('click', function (event) {
    var opener = event.target.closest('[data-drawer-open]');
    if (opener) {
      event.preventDefault();
      openDrawer(opener.getAttribute('data-drawer-open'));
      return;
    }

    if (event.target.closest('[data-drawer-close]') || event.target.closest('.scrim')) {
      event.preventDefault();
      closeDrawer();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeDrawer();
      return;
    }

    if (event.key !== 'Tab' || !openDrawerEl) return;

    var focusable = Array.prototype.filter.call(
      openDrawerEl.querySelectorAll(FOCUSABLE),
      function (node) { return node.offsetParent !== null; }
    );
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ── toast ─────────────────────────────────────────────────────── */
  var toastTimer;

  function toast(message) {
    var node = document.getElementById('Toast');
    if (!node || !message) return;
    node.textContent = message;
    node.setAttribute('data-on', '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      node.removeAttribute('data-on');
    }, 1900);
  }

  /* ── wishlist ──────────────────────────────────────────────────
     Saved items live in localStorage: no account required, and no
     server round trip. Handles are stable across sessions. */
  var WISH_KEY = 'mundo:wishlist';

  function readWishlist() {
    try {
      return JSON.parse(localStorage.getItem(WISH_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function writeWishlist(list) {
    try {
      localStorage.setItem(WISH_KEY, JSON.stringify(list));
    } catch (error) {
      /* storage full or blocked — the toggle still works for this page */
    }
  }

  function syncWishlist(root) {
    var saved = readWishlist();
    (root || document).querySelectorAll('[data-wish]').forEach(function (button) {
      button.toggleAttribute('data-on', saved.indexOf(button.getAttribute('data-wish')) !== -1);
    });
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-wish]');
    if (!button) return;

    event.preventDefault();
    var handle = button.getAttribute('data-wish');
    var saved = readWishlist();
    var index = saved.indexOf(handle);

    if (index === -1) {
      saved.push(handle);
      toast(strings.saved);
    } else {
      saved.splice(index, 1);
      toast(strings.removedFromSaved);
    }

    writeWishlist(saved);
    document.querySelectorAll('[data-wish="' + handle + '"]').forEach(function (node) {
      node.toggleAttribute('data-on', index === -1);
    });
  });

  /* ── search panel ──────────────────────────────────────────────── */
  document.addEventListener('click', function (event) {
    if (!event.target.closest('[data-search-open]')) return;
    event.preventDefault();

    var panel = document.getElementById('SearchPanel');
    if (!panel) return;

    var isOpen = panel.hasAttribute('data-open');
    closeDrawer(true);
    if (isOpen) return;

    panel.setAttribute('data-open', '');
    panel.removeAttribute('aria-hidden');
    var scrim = document.getElementById('Scrim');
    if (scrim) scrim.setAttribute('data-open', '');
    openDrawerEl = panel;

    var input = panel.querySelector('input[type="search"]');
    if (input) requestAnimationFrame(function () { input.focus(); });
  });

  /* ── accordions: only one open at a time within a group ────────── */
  document.addEventListener('toggle', function (event) {
    var details = event.target;
    if (!details.open || !details.closest('.acc[data-single]')) return;

    details.closest('.acc').querySelectorAll('details[open]').forEach(function (other) {
      if (other !== details) other.open = false;
    });
  }, true);

  /* ── address province selects ──────────────────────────────────
     all_country_option_tags puts each country's provinces on the
     option as JSON, so the province list is filled from that rather
     than from another network request. */
  function bindCountrySelect(select) {
    if (select.dataset.bound) return;
    select.dataset.bound = 'true';

    var wrapper = select.closest('.account-form') || document;
    var province = wrapper.querySelector('[data-address-province]');
    var provinceWrapper = wrapper.querySelector('[data-address-province-wrapper]');
    if (!province) return;

    function fill() {
      var option = select.options[select.selectedIndex];
      var raw = option ? option.getAttribute('data-provinces') : null;
      var list = [];

      try {
        list = JSON.parse(raw) || [];
      } catch (error) {
        list = [];
      }

      province.innerHTML = '';

      if (!list.length) {
        if (provinceWrapper) provinceWrapper.hidden = true;
        return;
      }

      if (provinceWrapper) provinceWrapper.hidden = false;
      var wanted = province.getAttribute('data-default');

      list.forEach(function (pair) {
        var node = document.createElement('option');
        node.value = pair[0];
        node.textContent = pair[1];
        if (pair[0] === wanted) node.selected = true;
        province.appendChild(node);
      });
    }

    if (select.getAttribute('data-default')) select.value = select.getAttribute('data-default');
    select.addEventListener('change', fill);
    fill();
  }

  function bindCountrySelects(root) {
    (root || document).querySelectorAll('[data-address-country]').forEach(bindCountrySelect);
  }

  /* ── boot ──────────────────────────────────────────────────────── */
  function init(root) {
    bindCountrySelects(root);
    observeReveals(root);
    primeTickers(root);
    bindRails(root);
    syncWishlist(root);
    fitHeaderMenu();
    onScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(document); });
  } else {
    init(document);
  }

  // Theme editor: sections are swapped in without a page load.
  document.addEventListener('shopify:section:load', function (event) {
    init(event.target);
  });
  document.addEventListener('shopify:section:select', function (event) {
    event.target.querySelectorAll('.rv, .rv-img').forEach(function (node) {
      node.classList.add('in');
    });
  });

  window.Mundo = {
    toast: toast,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    observeReveals: observeReveals,
    syncWishlist: syncWishlist,
    init: init
  };
})();
