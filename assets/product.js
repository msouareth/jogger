/* ═══════════════════════════════════════════════════════════════════
   Jogger — variant picker
   Option inputs update the hidden variant id and the disabled state
   immediately so the UI never feels laggy, then the product section is
   re-rendered server-side to repaint price, badges and inventory. That
   keeps every money format, discount and unit price correct without
   reimplementing Shopify's filters in JavaScript.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var strings = window.joggerStrings || {};

  class VariantPicker extends HTMLElement {
    connectedCallback() {
      this.sectionId = this.getAttribute('data-section');
      this.productUrl = this.getAttribute('data-url');
      this.updateUrl = this.getAttribute('data-update-url') !== 'false';
      this.variants = this.readVariants();

      this.addEventListener('change', this.onChange.bind(this));
      this.markAvailability();
    }

    readVariants() {
      var script = this.querySelector('[data-variant-json]');

      try {
        return JSON.parse(script.textContent);
      } catch (error) {
        return [];
      }
    }

    /* Values selected right now, in option order. */
    get selection() {
      return Array.from(this.querySelectorAll('input[type="radio"]:checked, select[data-option-position]')).map(
        function (input) {
          return { position: parseInt(input.getAttribute('data-option-position'), 10), value: input.value };
        }
      )
        .sort(function (a, b) { return a.position - b.position; })
        .map(function (entry) { return entry.value; });
    }

    findVariant(selection) {
      return this.variants.find(function (variant) {
        return variant.options.every(function (option, index) {
          return option === selection[index];
        });
      });
    }

    onChange(event) {
      if (!event.target.matches('input[type="radio"], select[data-option-position]')) return;

      var selection = this.selection;
      var variant = this.findVariant(selection);

      this.updateOptionLabels();
      this.markAvailability();

      var idField = document.querySelector('[data-variant-id]');
      if (idField) idField.value = variant ? variant.id : '';

      this.setButtonState(variant);

      if (!variant) return;

      if (this.updateUrl && window.history.replaceState) {
        window.history.replaceState({}, '', this.productUrl + '?variant=' + variant.id);
      }

      this.revealVariantMedia(variant);
      this.renderSection(variant);
    }

    /* The `<em>` beside each option label echoes the chosen value,
       exactly as the design shows "Colour — Oat". */
    updateOptionLabels() {
      this.querySelectorAll('[data-option-group]').forEach(function (group) {
        var label = group.querySelector('[data-option-value-label]');
        if (!label) return;

        var checked = group.querySelector('input[type="radio"]:checked');
        if (checked) label.textContent = checked.value;
      });
    }

    /* A value is offered only if some variant carrying it is in stock
       given everything chosen before it — the same progressive rule
       Shopify's own pickers use. */
    markAvailability() {
      var selection = this.selection;
      var variants = this.variants;

      this.querySelectorAll('[data-option-group]').forEach(function (group) {
        var position = parseInt(group.getAttribute('data-option-position'), 10);
        var index = position - 1;

        group.querySelectorAll('input[type="radio"]').forEach(function (input) {
          var reachable = variants.some(function (variant) {
            if (variant.options[index] !== input.value) return false;

            for (var i = 0; i < index; i++) {
              if (variant.options[i] !== selection[i]) return false;
            }

            return variant.available;
          });

          var visual = input.nextElementSibling;
          input.toggleAttribute('data-unavailable', !reachable);
          if (visual) visual.toggleAttribute('data-unavailable', !reachable);
        });
      });
    }

    setButtonState(variant) {
      var button = document.querySelector('[data-add-button]');
      if (!button) return;

      var text = button.querySelector('[data-add-text]');
      var available = variant && variant.available;

      button.toggleAttribute('disabled', !available);

      if (!text) return;

      if (!variant) text.textContent = strings.unavailable;
      else if (!variant.available) text.textContent = strings.soldOut;
      else text.textContent = strings.addToBag;
    }

    revealVariantMedia(variant) {
      if (!variant.featured_media) return;

      var shot = document.querySelector('[data-media-id="' + variant.featured_media.id + '"]');
      if (!shot) return;

      // Gallery layout: move the stage to that slide. Grid layout: bring
      // the image into view instead.
      if (shot.hasAttribute('data-slide')) {
        var gallery = shot.closest('[data-gallery]');
        if (gallery && gallery.joggerGallery) {
          gallery.joggerGallery.show(Number(shot.getAttribute('data-slide')));
          return;
        }
      }

      shot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    renderSection(variant) {
      var picker = this;

      fetch(this.productUrl + '?variant=' + variant.id + '&section_id=' + this.sectionId)
        .then(function (response) { return response.text(); })
        .then(function (html) {
          var parsed = new DOMParser().parseFromString(html, 'text/html');

          parsed.querySelectorAll('[data-variant-part]').forEach(function (fresh) {
            var name = fresh.getAttribute('data-variant-part');
            var current = document.querySelector('[data-variant-part="' + name + '"]');
            if (current) current.innerHTML = fresh.innerHTML;
          });

          picker.setButtonState(variant);
        })
        .catch(function () {
          /* Price stays as it was; the selected variant id is already
             correct, so adding to the bag still works. */
        });
    }
  }

  if (!customElements.get('variant-picker')) {
    customElements.define('variant-picker', VariantPicker);
  }

  /* ── product gallery ───────────────────────────────────────────
     One stage, crossfading slides, driven by the arrows, the thumbnail
     strip, arrow keys, or the variant picker. */
  function buildGallery(root) {
    if (root.joggerGallery) return;

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-slide]'));
    var thumbs = Array.prototype.slice.call(root.querySelectorAll('[data-gallery-thumb]'));
    var prev = root.querySelector('[data-gallery-prev]');
    var next = root.querySelector('[data-gallery-next]');
    if (slides.length === 0) return;

    var index = 0;

    function show(n) {
      if (n < 0) n = slides.length - 1;
      if (n >= slides.length) n = 0;
      index = n;

      slides.forEach(function (slide, i) {
        slide.toggleAttribute('data-active', i === index);
      });

      thumbs.forEach(function (thumb, i) {
        thumb.toggleAttribute('data-active', i === index);
        if (i === index) thumb.setAttribute('aria-current', 'true');
        else thumb.removeAttribute('aria-current');
      });

      if (thumbs[index]) thumbs[index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    if (prev) prev.addEventListener('click', function () { show(index - 1); });
    if (next) next.addEventListener('click', function () { show(index + 1); });

    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener('click', function () { show(i); });
    });

    root.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    });

    // Swipe on touch devices.
    var startX = null;
    root.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var delta = e.changedTouches[0].clientX - startX;
      if (Math.abs(delta) > 45) show(delta < 0 ? index + 1 : index - 1);
      startX = null;
    }, { passive: true });

    root.joggerGallery = { show: show };
    show(0);
  }

  function initGalleries(root) {
    (root || document).querySelectorAll('[data-gallery]').forEach(buildGallery);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initGalleries(document); });
  } else {
    initGalleries(document);
  }

  document.addEventListener('shopify:section:load', function (event) {
    initGalleries(event.target);
  });

  /* ── product recommendations ───────────────────────────────────
     Recommendations are only available on their own route, so the
     section ships empty and pulls its own markup in once. */
  function loadRecommendations() {
    var host = document.querySelector('[data-recommendations]');
    if (!host || host.dataset.loaded) return;

    host.dataset.loaded = 'true';

    fetch(host.getAttribute('data-url'))
      .then(function (response) { return response.text(); })
      .then(function (html) {
        var parsed = new DOMParser().parseFromString(html, 'text/html');
        var fresh = parsed.querySelector('[data-recommendations]');
        if (!fresh || !fresh.innerHTML.trim()) return;

        host.innerHTML = fresh.innerHTML;
        if (window.Jogger) window.Jogger.init(host);
      })
      .catch(function () {
        /* no recommendations is a fine outcome — the section stays empty */
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRecommendations);
  } else {
    loadRecommendations();
  }

  document.addEventListener('shopify:section:load', function (event) {
    if (event.target.querySelector('[data-recommendations]')) {
      event.target.querySelector('[data-recommendations]').removeAttribute('data-loaded');
      loadRecommendations();
    }
  });

  /* ── quantity stepper on the product page ──────────────────────── */
  document.addEventListener('click', function (event) {
    var step = event.target.closest('[data-qty-step]');
    if (!step) return;

    event.preventDefault();
    var field = step.parentElement.querySelector('input');
    if (!field) return;

    var next = (parseInt(field.value, 10) || 1) + parseInt(step.getAttribute('data-qty-step'), 10);
    field.value = Math.max(parseInt(field.min, 10) || 1, next);
    field.dispatchEvent(new Event('change', { bubbles: true }));
  });
})();
