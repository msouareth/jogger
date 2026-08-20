/* ═══════════════════════════════════════════════════════════════════
   Jogger — core UI behaviours
   Scroll reveals, the sticky header, hero parallax, the lookbook drag
   rail, seamless tickers, drawers with focus trapping, the toast and
   the local wishlist. Everything here re-binds on shopify:section:load
   so the theme editor stays live.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var settings = window.joggerSettings || {};
  var strings = window.joggerStrings || {};
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

  /* A last look once everything has loaded. The observer is the mechanism; this
     is the guarantee. Anything already on screen and still waiting is revealed
     outright, so no arrangement of clipping, layout or observer timing can
     leave a picture invisible on a page the visitor is looking at. Cheap, runs
     once, and does nothing at all when the observer has done its job. */
  function sweepReveals() {
    document.querySelectorAll('.rv:not(.in), .rv-img:not(.in)').forEach(function (node) {
      var rect = node.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      node.classList.add('in');
      if (revealObserver) revealObserver.unobserve(node);
    });
  }

  window.addEventListener('load', sweepReveals);

  /* ── seamless tickers ──────────────────────────────────────────
     A marquee only loops cleanly if the track holds two identical
     copies, because the keyframe translates it by exactly -50%. */
  function primeTickers(root) {
    (root || document).querySelectorAll('.tick-run').forEach(function (track) {
      if (track.dataset.primed) return;
      track.dataset.primed = 'true';
      track.innerHTML += track.innerHTML;
      // Kept hidden, not revealed. The track is decorative and now holds every
      // item twice; each section that uses one carries a plain list beside it
      // for anyone listening. Exposing this as well read the same words three
      // times over.
      track.setAttribute('aria-hidden', 'true');
    });
  }

  /* ── autoplaying media and reduced motion ───────────────────────
     A looping hero video is exactly the kind of thing prefers-reduced-motion
     exists to stop, and CSS cannot pause a video. Paused on the first frame
     rather than hidden, so the composition is unchanged and the poster still
     reads — the visitor loses the movement, not the picture. */
  function holdMotionMedia(root) {
    if (!reduceMotion) return;
    (root || document).querySelectorAll('.media video[autoplay]').forEach(function (video) {
      video.removeAttribute('autoplay');
      video.autoplay = false;
      video.loop = false;
      if (!video.paused) video.pause();
    });
  }

  /* ── demo mode: buttons stay, checkout does not ─────────────────
     For a demo or a pre-launch shop: every buy control still looks and behaves
     like itself right up to the last step, so the design can be shown honestly,
     but nobody lands on a payment form.

     The two cart buttons are the theme's own markup, so a capture-phase
     listener on click and submit is enough.

     "Buy it now" is not ours — Shopify renders it, and Shop Pay renders inside
     an iframe we cannot listen to. So that one is covered by a transparent
     catcher laid over the top: the button below stays fully visible, and the
     click never reaches it. Disabling it instead would grey out a button that
     is meant to be part of the design being demonstrated. */
  var checkoutMode = settings.checkoutMode || 'shopify';
  var checkoutUrl = settings.checkoutUrl || '';

  // A custom destination with no address set falls back to Shopify's checkout
  // rather than stranding the shopper, matching snippets/checkout-button.liquid.
  var sendsElsewhere = checkoutMode === 'custom' && checkoutUrl !== '';
  var sendsNowhere = checkoutMode === 'off';

  function divertCheckout(event) {
    event.preventDefault();
    event.stopPropagation();
    if (sendsElsewhere) {
      window.location.assign(checkoutUrl);
    } else {
      toast(strings.demoCheckout || 'Checkout is switched off.');
    }
  }

  function guardCheckout() {
    if (!sendsElsewhere && !sendsNowhere) return;

    document.addEventListener('click', function (event) {
      // The bag's own control is already an anchor in custom mode, so only the
      // submit-button form of it needs catching here.
      if (!event.target.closest('[name="checkout"], .pdp-payment-guard')) return;
      divertCheckout(event);
    }, true);

    document.addEventListener('submit', function (event) {
      if (!event.target.matches('form[action*="/cart"]')) return;
      // A cart form only reaches checkout via its checkout button; the quantity
      // and note controls post to the same action and must keep working.
      if (!event.submitter || event.submitter.name !== 'checkout') return;
      divertCheckout(event);
    }, true);
  }

  /*
    "Buy it now" is Shopify's markup, and Shop Pay renders in an iframe, so it
    cannot be rewritten into a link the way the bag's control can. A transparent
    catcher over the top takes the click instead — the button underneath stays
    fully visible, which is the point: it is part of the design being shown.
  */
  function guardPaymentButtons(root) {
    if (!sendsElsewhere && !sendsNowhere) return;
    (root || document).querySelectorAll('.pdp-payment').forEach(function (holder) {
      if (holder.querySelector('.pdp-payment-guard')) return;
      var guard = document.createElement('span');
      guard.className = 'pdp-payment-guard';
      guard.setAttribute('aria-hidden', 'true');
      holder.appendChild(guard);
    });
  }

  // Once, at module scope. init() runs again for every section the theme editor
  // swaps in, and these are document-level listeners — binding them there would
  // stack a fresh pair on each reload.
  guardCheckout();

  /* ── the bar's resting height ───────────────────────────────────
     Published for the hero's "under the bar" option, which pulls the picture up
     by exactly this much. It cannot be assumed: the wordmark may be an image of
     any proportion, the tagline may or may not be there, and the web fonts land
     after first paint.

     Rebuilt from the content box plus --hdr-pad rather than read off
     offsetHeight, because offsetHeight shrinks while the bar is stuck and
     publishing that value would drag the page upward as soon as anyone
     scrolled. */
  var headerSizeObserver = null;

  function publishHeaderHeight() {
    // Re-queried rather than captured: the theme editor swaps the header
    // section out wholesale, which would leave a held reference detached.
    var header = document.querySelector('.hdr');
    if (!header) return;

    var style = getComputedStyle(header);
    var pad = parseFloat(style.getPropertyValue('--hdr-pad')) || 0;
    var content = header.offsetHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    document.documentElement.style.setProperty('--hdr-h', Math.round(content + pad * 2) + 'px');

    if ('ResizeObserver' in window) {
      if (headerSizeObserver) headerSizeObserver.disconnect();
      headerSizeObserver = new ResizeObserver(publishHeaderHeight);
      headerSizeObserver.observe(header);
    }
  }

  window.addEventListener('load', publishHeaderHeight);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(publishHeaderHeight);

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


  /* ── the hero's scroll cue ──────────────────────────────────────
     It says "there is more below" and then gets out of the way: it fades on
     the first sign the visitor took the hint, and comes back if they return to
     the top. Clicking it travels to whatever section follows the hero, so it
     is a control rather than only a decoration — and it honours a reduced
     motion preference by jumping instead of gliding. */
  function bindScrollCue(root) {
    (root || document).querySelectorAll('[data-hero-cue]').forEach(function (cue) {
      if (cue.dataset.cueBound) return;
      cue.dataset.cueBound = 'true';

      cue.addEventListener('click', function () {
        // The section wrapper, not the hero div: the next thing on the page is
        // its sibling, and the inner div's sibling is nothing at all.
        var section = cue.closest('.section-hero') || cue.closest('.hero');
        var next = section && section.nextElementSibling;
        if (!next) return;
        next.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }

  /* ── when the bar stops being clear ─────────────────────────────
     While a hero runs up under the bar, the bar is transparent and its text is
     light so the picture reads through it. This decides when that ends.

     A fixed nudge of scrolling is the wrong trigger there: a few pixels of
     movement would turn the bar solid while the photograph is still filling the
     screen behind it, which is the one moment the clear bar exists for. So the
     picture itself is the trigger — the bar lands when the hero's foot reaches
     it. Everywhere else there is no picture to protect and the small nudge is
     right, because the bar is already on the page's own ground and only gains a
     shadow.

     Measured against the published resting height rather than offsetHeight.
     The bar shrinks its padding once landed, so offsetHeight would shrink with
     it, which would push the hero's foot back below the trigger and hand back
     an unlanded bar — landing and unlanding on alternate frames. */
  function barHasLanded(header) {
    var floating = header.getAttribute('data-stick') === 'page'
      ? null
      : document.querySelector('.hero--under');

    if (!floating) return window.scrollY > 24;

    var resting = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--hdr-h')
    ) || 72;

    return floating.getBoundingClientRect().bottom <= resting;
  }
  /* ── sticky header + parallax ──────────────────────────────────── */
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(function () {
      var header = document.querySelector('.hdr');
      if (header) header.toggleAttribute('data-stuck', barHasLanded(header));

      // Past a nudge of scrolling the cue has been answered, so it steps back.
      var answered = window.scrollY > 40;
      document.querySelectorAll('[data-hero-cue]').forEach(function (cue) {
        cue.toggleAttribute('data-gone', answered);
      });

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

  /* An arrow press animates the scroll position itself, and the drift writes
     to that same value every frame — left alone the two would fight and the
     smooth scroll would never arrive. So a press buys a moment of quiet. */
  function holdDrift(rail) {
    rail.dataset.driftHold = String(performance.now() + 1400);
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
        holdDrift(rail);
        rail.scrollBy({ left: -step(), behavior: 'smooth' });
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        holdDrift(rail);
        rail.scrollBy({ left: step(), behavior: 'smooth' });
      });
    }

    rail.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    sync();
  }


  /* ── a rail that moves on its own ───────────────────────────────
     The rail drifts steadily sideways and hands over the moment anyone takes
     hold of it, picking up again when they let go.

     It drives scrollLeft rather than animating a transform, which is what makes
     the handover free: the rail is still a natively scrolling box, so dragging,
     flicking, a trackpad and a keyboard all keep working exactly as they did,
     and stopping the drift is simply not adding to it this frame.

     For the loop to be seamless the cards are repeated until the track is
     longer than the rail plus one full set, and the scroll position is wound
     back by exactly one set each time it passes. Wound back by a whole set, the
     picture under the wrap is identical, so the seam cannot be seen. The copies
     are hidden from assistive technology and taken out of the tab order — they
     are the same looks a second time, and nobody should be read them twice. */
  function bindRailDrift(rail) {
    if (rail.dataset.driftBound) return;
    if (!rail.hasAttribute('data-drift')) return;
    // Motion that never stops is exactly what this preference is about.
    if (reduceMotion) return;

    var originals = [].slice.call(rail.children);
    if (!originals.length) return;

    rail.dataset.driftBound = 'true';

    var speed = parseFloat(rail.getAttribute('data-drift-speed')) || 25;

    function setWidth() {
      var gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
      var total = 0;
      originals.forEach(function (node) {
        total += node.getBoundingClientRect().width + gap;
      });
      return total;
    }

    var cycle = setWidth();
    if (cycle <= 0) return;

    var guard = 0;
    while (rail.scrollWidth < rail.clientWidth + cycle && guard < 8) {
      originals.forEach(function (node) {
        var copy = node.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        // The editor addresses blocks by these; a copy carrying them would have
        // two elements answering to one block.
        copy.removeAttribute('data-shopify-editor-block');
        copy.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach(function (el) {
          el.setAttribute('tabindex', '-1');
        });
        rail.appendChild(copy);
      });
      guard++;
    }

    var held = false;
    var last = 0;
    var ticking = false;

    /* The position is kept here and written to the rail, rather than read back
       and added to. At a drift speed a frame is worth a fraction of a pixel,
       and scrollLeft hands back a rounded number — so `scrollLeft += 0.4` reads
       as zero on the next frame and adds the same fraction again forever. Held
       as a real number here, the fractions accumulate and the rail moves. */
    var pos = rail.scrollLeft;

    function step(now) {
      if (!ticking) return;

      var elapsed = last ? (now - last) / 1000 : 0;
      last = now;

      // A tab left in the background wakes with a huge gap; capped so the rail
      // does not leap on return.
      if (elapsed > 0.05) elapsed = 0.05;

      var holdUntil = parseFloat(rail.dataset.driftHold) || 0;

      if (held || now < holdUntil) {
        // Someone else has the scroll position — a hand, or an arrow's smooth
        // scroll. Follow it, so letting go carries on from where they left it
        // instead of snapping back to where the drift had got to.
        pos = rail.scrollLeft;
      } else {
        pos += speed * elapsed;
        if (pos >= cycle) pos -= cycle;
        rail.scrollLeft = pos;
      }

      requestAnimationFrame(step);
    }

    function start() {
      if (ticking) return;
      ticking = true;
      last = 0;
      requestAnimationFrame(step);
    }

    function stop() {
      ticking = false;
    }

    /* Only while somebody actually has hold of it, or is tabbing through it.
       Hovering does not stop it — it was asked to keep going. */
    rail.addEventListener('pointerdown', function () { held = true; });
    rail.addEventListener('focusin', function () { held = true; });

    function release() {
      held = false;
      last = 0;
    }

    rail.addEventListener('pointerup', release);
    rail.addEventListener('pointercancel', release);
    rail.addEventListener('pointerleave', release);
    rail.addEventListener('focusout', release);

    /* Started outright, and the observer only ever puts it back to sleep when
       the rail leaves the screen. The other way round — starting it when the
       observer says the rail is visible — means anything that keeps the
       observer from reporting leaves a rail that never moves at all. Failing
       towards motion is the right way for a decoration to fail. */
    start();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) start();
          else stop();
        });
      }, { threshold: 0 }).observe(rail);
    }

    window.addEventListener('resize', function () {
      cycle = setWidth();
    }, { passive: true });
  }

  /* ── logos adrift in a closed area ──────────────────────────────
     The other way the brand band can move: instead of a line travelling past,
     the circles are scattered inside a box and set wandering, bouncing off the
     walls and off one another.

     Equal-mass elastic collision is the whole of the physics, and for circles
     it is short: when two overlap, push them apart along the line joining
     their centres and swap the halves of their velocities that lie along that
     line. Everything sideways to it is untouched, which is what makes a glance
     look like a glance rather than a stop. */
  function bindBrandFloat(box) {
    if (box.dataset.floatBound) return;

    var balls = [].slice.call(box.querySelectorAll('.ball'));
    if (!balls.length) return;

    box.dataset.floatBound = 'true';

    var speed = parseFloat(box.getAttribute('data-float-speed')) || 18;
    var items = balls.map(function (el) {
      return { el: el, x: 0, y: 0, vx: 0, vy: 0, d: 0 };
    });

    /* The size the merchant chose, read once and kept. Read again later it
       would be whatever was last worked out below, and each resize would ratchet
       the circles smaller until they disappeared. */
    var asked = parseFloat(getComputedStyle(box).getPropertyValue('--ball')) || 120;

    /* How much of the area the circles may cover between them. Past roughly a
       third there is more circle than space, and they stop drifting and start
       jostling — which is what a phone gets when it is handed a size chosen on
       a laptop. */
    var COVERAGE = 0.32;

    function scatter() {
      var w = box.clientWidth;
      var h = box.clientHeight;

      /* n circles of diameter d cover n·πd²/4. Turn that around for the d that
         covers the share allowed and you have the size this box can actually
         carry — from the room there is and the number of logos in it, not from
         a breakpoint. Never bigger than was asked for: this only ever takes
         size away when there is nowhere to go, and a wide screen with a few
         logos is left entirely alone. */
      var room = Math.sqrt((4 * COVERAGE * w * h) / (Math.PI * items.length));
      var size = Math.min(asked, room, h * 0.72);
      box.style.setProperty('--ball', Math.max(40, Math.round(size)) + 'px');

      items.forEach(function (it) {
        it.d = it.el.offsetWidth || 120;

        // Somewhere free, if somewhere free can be found in a reasonable number
        // of looks. A crowded box has no such place, and a circle overlapping
        // at the start is pushed clear by the collisions within a second
        // anyway — better than hanging the page hunting for perfection.
        var placed = false;
        for (var attempt = 0; attempt < 40 && !placed; attempt++) {
          it.x = Math.random() * Math.max(1, w - it.d);
          it.y = Math.random() * Math.max(1, h - it.d);
          placed = items.every(function (other) {
            if (other === it || !other.d) return true;
            var dx = other.x - it.x;
            var dy = other.y - it.y;
            return Math.sqrt(dx * dx + dy * dy) >= (it.d + other.d) / 2;
          });
        }

        // A direction of its own, all at the same pace, so the box keeps one
        // rhythm rather than one circle bolting while another crawls.
        var angle = Math.random() * Math.PI * 2;
        it.vx = Math.cos(angle) * speed;
        it.vy = Math.sin(angle) * speed;

        draw(it);
      });
    }

    function draw(it) {
      it.el.style.transform = 'translate3d(' + it.x.toFixed(2) + 'px,' + it.y.toFixed(2) + 'px,0)';
    }

    function advance(elapsed) {
      var w = box.clientWidth;
      var h = box.clientHeight;

      items.forEach(function (it) {
        it.x += it.vx * elapsed;
        it.y += it.vy * elapsed;

        // The walls.
        if (it.x < 0) { it.x = 0; it.vx = Math.abs(it.vx); }
        if (it.y < 0) { it.y = 0; it.vy = Math.abs(it.vy); }
        if (it.x + it.d > w) { it.x = w - it.d; it.vx = -Math.abs(it.vx); }
        if (it.y + it.d > h) { it.y = h - it.d; it.vy = -Math.abs(it.vy); }
      });

      // Each other.
      for (var i = 0; i < items.length; i++) {
        for (var j = i + 1; j < items.length; j++) {
          var a = items[i];
          var b = items[j];
          var reach = (a.d + b.d) / 2;
          var dx = (b.x + b.d / 2) - (a.x + a.d / 2);
          var dy = (b.y + b.d / 2) - (a.y + a.d / 2);
          var gap = Math.sqrt(dx * dx + dy * dy);
          if (gap === 0 || gap >= reach) continue;

          var nx = dx / gap;
          var ny = dy / gap;
          var push = (reach - gap) / 2;

          a.x -= nx * push;
          a.y -= ny * push;
          b.x += nx * push;
          b.y += ny * push;

          var an = a.vx * nx + a.vy * ny;
          var bn = b.vx * nx + b.vy * ny;
          a.vx += (bn - an) * nx;
          a.vy += (bn - an) * ny;
          b.vx += (an - bn) * nx;
          b.vy += (an - bn) * ny;
        }
      }

      items.forEach(draw);
    }

    /* Scattered but still. Motion is what the preference asks to be spared, not
       the arrangement, so the logos are laid out and left there. */
    if (reduceMotion) {
      scatter();
      return;
    }

    var last = 0;
    var ticking = false;
    var resting = false;

    function step(now) {
      if (!ticking) return;

      var elapsed = last ? (now - last) / 1000 : 0;
      last = now;
      if (elapsed > 0.05) elapsed = 0.05;

      if (!resting) advance(elapsed);
      requestAnimationFrame(step);
    }

    function start() {
      if (ticking) return;
      ticking = true;
      last = 0;
      requestAnimationFrame(step);
    }

    function stop() {
      ticking = false;
    }

    scatter();
    start();

    // Held still while the pointer is over the box, so a logo can be clicked
    // without having to be caught first.
    box.addEventListener('pointerenter', function () { resting = true; });
    box.addEventListener('pointerleave', function () { resting = false; last = 0; });
    box.addEventListener('focusin', function () { resting = true; });
    box.addEventListener('focusout', function () { resting = false; last = 0; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) start();
          else stop();
        });
      }, { threshold: 0 }).observe(box);
    }

    // A new box is a new arrangement; the old positions would leave circles
    // stranded outside it.
    var rescatter;
    window.addEventListener('resize', function () {
      clearTimeout(rescatter);
      rescatter = setTimeout(scatter, 200);
    }, { passive: true });
  }

  function bindBrandFloats(root) {
    (root || document).querySelectorAll('[data-brand-float]').forEach(bindBrandFloat);
  }
  function bindRails(root) {
    (root || document).querySelectorAll('.rail').forEach(bindRail);
    (root || document).querySelectorAll('.rail').forEach(bindRailDrift);
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
  var WISH_KEY = 'jogger:wishlist';

  /* The key used to carry the theme's old name. Renaming it would have quietly
     emptied the saved items of anyone who had already used the wishlist, since
     nothing would be looking where their list actually sits. Moved once, on the
     first visit after the rename, and the old key is cleared so this never runs
     again. Safe to delete a version or two from now. */
  (function carryOverWishlist() {
    try {
      var old = localStorage.getItem('mundo:wishlist');
      if (old && !localStorage.getItem(WISH_KEY)) localStorage.setItem(WISH_KEY, old);
      if (old) localStorage.removeItem('mundo:wishlist');
    } catch (error) {
      /* storage blocked — nothing was saved to carry over anyway */
    }
  })();

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
    sweepReveals();
    bindScrollCue(root);
    primeTickers(root);
    bindBrandFloats(root);
    bindRails(root);
    syncWishlist(root);
    holdMotionMedia(root);
    guardPaymentButtons(root);
    publishHeaderHeight();
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

  window.Jogger = {
    toast: toast,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    observeReveals: observeReveals,
    syncWishlist: syncWishlist,
    init: init
  };
})();
