/* ═══════════════════════════════════════════════════════════════════
   Mundo — predictive search
   Results are rendered by sections/predictive-search.liquid so the
   suggestion cards match the product cards everywhere else, and arrow
   keys walk the list the way a native combobox does.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var routes = window.mundoRoutes || {};

  class PredictiveSearch extends HTMLElement {
    connectedCallback() {
      this.input = this.querySelector('input[type="search"]');
      this.results = this.querySelector('[data-predictive-results]');
      if (!this.input || !this.results) return;

      this.timer = null;
      this.controller = null;

      this.input.addEventListener('input', this.onInput.bind(this));
      this.addEventListener('keydown', this.onKeydown.bind(this));
    }

    onInput() {
      clearTimeout(this.timer);
      var query = this.input.value.trim();

      if (query.length < 2) {
        this.clear();
        return;
      }

      this.timer = setTimeout(this.search.bind(this, query), 220);
    }

    clear() {
      this.results.innerHTML = '';
      this.input.setAttribute('aria-expanded', 'false');
    }

    search(query) {
      // Abandon a slower in-flight request so results can never arrive
      // out of order and overwrite the newer query's answer.
      if (this.controller) this.controller.abort();
      this.controller = new AbortController();

      var element = this;
      var url =
        routes.predictive_search +
        '?q=' +
        encodeURIComponent(query) +
        '&resources[type]=product,collection,article&resources[limit]=6&section_id=predictive-search';

      fetch(url, { signal: this.controller.signal })
        .then(function (response) { return response.text(); })
        .then(function (html) {
          var parsed = new DOMParser().parseFromString(html, 'text/html');
          var fresh = parsed.querySelector('[data-predictive-results]');

          element.results.innerHTML = fresh ? fresh.innerHTML : '';
          element.input.setAttribute('aria-expanded', 'true');
        })
        .catch(function () {
          /* aborted or offline — leave the last good results in place */
        });
    }

    onKeydown(event) {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Enter') return;

      var links = Array.from(this.results.querySelectorAll('a'));
      if (!links.length) return;

      var index = links.indexOf(document.activeElement);

      if (event.key === 'Enter') {
        if (index > -1) return;
        return;
      }

      event.preventDefault();
      var next = event.key === 'ArrowDown' ? index + 1 : index - 1;

      if (next < 0) {
        this.input.focus();
        return;
      }

      if (next >= links.length) next = links.length - 1;

      links.forEach(function (link) { link.setAttribute('aria-selected', 'false'); });
      links[next].setAttribute('aria-selected', 'true');
      links[next].focus();
    }
  }

  if (!customElements.get('predictive-search')) {
    customElements.define('predictive-search', PredictiveSearch);
  }
})();
