/* ═══════════════════════════════════════════════════════════════════
   Jogger — AJAX bag
   Adds, quantity changes and removals go through the Cart AJAX API and
   ask for the cart-drawer section back in the same round trip, so the
   drawer, the totals and the free-shipping bar all repaint from real
   Liquid rather than from a JS re-implementation of the money filters.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var routes = window.joggerRoutes || {};
  var strings = window.joggerStrings || {};
  var settings = window.joggerSettings || {};
  var SECTION = 'cart-drawer';

  function toast(message) {
    if (window.Jogger && window.Jogger.toast) window.Jogger.toast(message);
  }

  /* Swap every [data-cart-part] in the freshly rendered section over
     its counterpart in the live document. The drawer shell itself is
     never replaced, so an open drawer stays open and keeps focus. */
  function applySection(html) {
    if (!html) return;

    var parsed = new DOMParser().parseFromString(html, 'text/html');

    parsed.querySelectorAll('[data-cart-part]').forEach(function (fresh) {
      var name = fresh.getAttribute('data-cart-part');
      var current = document.querySelector('[data-cart-part="' + name + '"]');
      if (current) current.replaceWith(fresh);
    });

    var source = parsed.querySelector('[data-cart-count]');
    if (source) updateCount(source.getAttribute('data-cart-count'));

    if (window.Jogger) window.Jogger.syncWishlist(document);
  }

  function updateCount(count) {
    var total = parseInt(count, 10) || 0;

    document.querySelectorAll('.bag-n').forEach(function (bubble) {
      var changed = bubble.textContent.trim() !== String(total);
      bubble.textContent = total;

      if (!changed) return;
      bubble.setAttribute('data-pop', '');
      setTimeout(function () {
        bubble.removeAttribute('data-pop');
      }, 320);
    });

    document.querySelectorAll('[data-cart-count-label]').forEach(function (node) {
      node.textContent = total;
    });
  }

  function sectionsUrl() {
    return window.location.pathname + window.location.search;
  }

  function post(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(body)
    }).then(function (response) {
      return response.json().then(function (data) {
        if (!response.ok) throw data;
        return data;
      });
    });
  }

  /* ── add ───────────────────────────────────────────────────────── */
  function addToCart(items, options) {
    var opts = options || {};

    return post(routes.cart_add, {
      items: items,
      sections: SECTION,
      sections_url: sectionsUrl()
    })
      .then(function (data) {
        if (data.sections) applySection(data.sections[SECTION]);

        if (settings.cartType === 'drawer') {
          toast(strings.addedToBag);
          if (opts.openDrawer !== false && window.Jogger) window.Jogger.openDrawer('CartDrawer');
        } else {
          window.location.href = routes.cart;
        }

        document.dispatchEvent(new CustomEvent('jogger:cart:added', { detail: data }));
        return data;
      })
      .catch(function (error) {
        toast((error && (error.description || error.message)) || strings.cartError);
        throw error;
      });
  }

  /* ── change a line ─────────────────────────────────────────────── */
  function changeLine(key, quantity) {
    var row = document.querySelector('[data-line-key="' + key + '"]');
    if (row) row.setAttribute('data-busy', '');

    return post(routes.cart_change, {
      id: key,
      quantity: quantity,
      sections: SECTION,
      sections_url: sectionsUrl()
    })
      .then(function (data) {
        if (data.sections) applySection(data.sections[SECTION]);
        updateCount(data.item_count);

        // The cart page renders its own markup, so reload it rather than
        // trying to patch two independent layouts from one section.
        if (document.querySelector('[data-cart-page]')) window.location.reload();

        document.dispatchEvent(new CustomEvent('jogger:cart:changed', { detail: data }));
        return data;
      })
      .catch(function (error) {
        if (row) row.removeAttribute('data-busy');
        toast((error && (error.description || error.message)) || strings.cartError);
        throw error;
      });
  }

  /* ── quantity + remove controls ────────────────────────────────── */
  document.addEventListener('click', function (event) {
    var step = event.target.closest('[data-step]');

    if (step) {
      event.preventDefault();
      var row = step.closest('[data-line-key]');
      if (!row) return;

      var field = row.querySelector('[data-qty]');
      var current = parseInt(field ? field.value || field.textContent : '1', 10) || 1;
      changeLine(row.getAttribute('data-line-key'), Math.max(0, current + parseInt(step.getAttribute('data-step'), 10)));
      return;
    }

    var remove = event.target.closest('[data-remove]');

    if (remove) {
      event.preventDefault();
      var target = remove.closest('[data-line-key]');
      if (target) changeLine(target.getAttribute('data-line-key'), 0);
    }
  });

  document.addEventListener('change', function (event) {
    var field = event.target.closest('[data-qty]');
    if (!field) return;

    var row = field.closest('[data-line-key]');
    if (!row) return;

    changeLine(row.getAttribute('data-line-key'), Math.max(0, parseInt(field.value, 10) || 0));
  });

  /* ── cart note ─────────────────────────────────────────────────── */
  var noteTimer;

  document.addEventListener('input', function (event) {
    var note = event.target.closest('[data-cart-note]');
    if (!note) return;

    clearTimeout(noteTimer);
    noteTimer = setTimeout(function () {
      post(routes.cart_update, { note: note.value }).catch(function () {});
    }, 600);
  });

  /* ── product forms ─────────────────────────────────────────────
     Intercepted so adding never leaves the page. Falls back to a
     normal form POST if fetch is unavailable. */
  document.addEventListener('submit', function (event) {
    var form = event.target.closest('form[data-product-form]');
    if (!form || !window.fetch) return;

    event.preventDefault();

    var button = form.querySelector('[type="submit"]');
    var properties = {};

    form.querySelectorAll('[name^="properties["]').forEach(function (field) {
      if (field.type === 'checkbox' && !field.checked) return;
      var key = field.name.replace('properties[', '').replace(']', '');
      if (field.value) properties[key] = field.value;
    });

    var id = form.querySelector('[name="id"]');
    if (!id || !id.value) return;

    var quantityField = form.querySelector('[name="quantity"]');
    var item = {
      id: Number(id.value),
      quantity: parseInt(quantityField ? quantityField.value : '1', 10) || 1
    };

    if (Object.keys(properties).length) item.properties = properties;

    if (button) {
      button.setAttribute('disabled', '');
      button.setAttribute('data-loading', '');
    }

    addToCart([item]).finally(function () {
      if (!button) return;
      button.removeAttribute('disabled');
      button.removeAttribute('data-loading');
    });
  });

  /* ── quick add from a product card ─────────────────────────────
     Cards only carry a variant id when the product has exactly one
     purchasable variant; anything with real options links through to
     the product page instead, so nobody buys a size by accident. */
  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-quick-add]');
    if (!button) return;

    event.preventDefault();
    var variantId = Number(button.getAttribute('data-quick-add'));
    if (!variantId) return;

    button.setAttribute('data-loading', '');
    addToCart([{ id: variantId, quantity: 1 }]).finally(function () {
      button.removeAttribute('data-loading');
    });
  });

  window.JoggerCart = {
    add: addToCart,
    change: changeLine,
    applySection: applySection
  };
})();
