# Jogger

A warm, modern apparel theme for Shopify. Visible grid, flush-left labels, light
type weights on a sand ground, and a camel accent. Motion throughout: scroll
reveals, a drifting hero, shoppable hotspots, a draggable lookbook and soft
crossfades — all of which stand down automatically for visitors who ask their
device to reduce motion.

Built from scratch as original work: no Dawn, no vendored framework, no build
step. Drop the folder on a store and it runs.

---

## Requirements

- A Shopify store (any plan)
- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) for local development

```bash
npm install -g @shopify/cli@latest
```

## Getting started

```bash
shopify theme dev --store your-store.myshopify.com
```

To push a copy to the store:

```bash
shopify theme push --unpublished --theme "Jogger"
```

To package it for distribution:

```bash
shopify theme package
```

---

## What's in the box

### Templates

| Template | Section |
| --- | --- |
| Home | `hero`, `featured-products`, `marquee`, `category-tiles`, `editorial-split`, `lookbook`, `values` |
| Collection | `main-collection` — chips built from your storefront filters, sorting, pagination |
| Product | `main-product` + `related-products` |
| Cart | `main-cart` (drawer or page, your choice) |
| Search | `main-search` with optional predictive suggestions |
| Blog / Article | `main-blog`, `main-article` with comments |
| Page / Contact | `main-page`, `main-contact` |
| Customers | account, login, register, addresses, order, activate, reset |
| 404, Password, Gift card | `main-404`, `main-password`, `gift_card.liquid` |

### Home sections

Every one is a preset, so they can be added, reordered or removed in the theme
editor.

- **Hero** — full-bleed image with a slow ken-burns drift, a gradient veil, up to
  eight blocks that are either **shoppable hotspots** (pick a product, place it
  with x/y sliders — it renders the live title and price) or corner **pills**.
- **Product grid** — pick a collection and a column count.
- **Marquee band** — a scrolling rule of messages; italic text picks up the accent.
- **Category tiles** — collection tiles with live product counts.
- **Editorial split** — copy beside an image that parallaxes against the scroll.
- **Lookbook rail** — drag-to-scroll, snap-aligned.
- **Values** — up to four numbered columns.

---

## Theme settings

Everything visual is driven from **Theme settings**, and the whole design is
regenerated from those tokens — there is no hard-coded brand colour anywhere in
the stylesheet.

- **Theme styles** — three one-click presets (Sand, Ink, Bloom) defined in
  `config/settings_data.json`, each carrying a full set of colour schemes plus
  its own type and geometry.
- **Colour schemes** — five colours per scheme (background, surface, text,
  accent, secondary accent), assignable **per section**, so a page can alternate
  light and dark bands. The nine-step accent ramp is *derived* from each
  scheme's single accent: steps 100–400 mix toward that scheme's own ground,
  600–900 darken. Change the accent and badges, progress bars, hovers, focus
  rings and hero gradients all move with it.
- **Typography** — body and heading fonts, display weight, type scale, and
  heading tracking. Set both fonts to the same family for the single-typeface
  look of the original design.
- **Layout** — content width, edge padding at both ends of the scale, corner
  radius.
- **Motion** — reveals, hero drift and parallax, each independently switchable.
- **Product cards** — quick add, save button, colour dots, hover image, subtitle
  source.
- **Bag** — drawer or page, free-shipping threshold and progress bar, order notes.

## Repo layout

| Path | Contents |
| --- | --- |
| `assets/ config/ layout/ locales/ sections/ snippets/ templates/` | The theme itself — the only directories that ship |
| `docs/` | Buyer-facing documentation |
| `demo/` | Demo store setup guide and a 120-variant product import CSV |
| `bin/` | `validate.js`, the static checker |

`.shopifyignore` keeps everything below the first row out of the archive and out
of `shopify theme push`.

---

## Notes on how a few things work

**The bag is fully AJAX.** Adds and quantity changes go through the Cart AJAX API
and ask for the `cart-drawer` section back in the same round trip, so totals,
discounts and the free-shipping bar are re-rendered by Liquid's own money
filters rather than by a JavaScript reimplementation of them. An open drawer
stays open and keeps focus across updates.

**Quick add is deliberately conservative.** A card only adds straight to the bag
when the product has exactly one purchasable variant. Anything with real options
links through to the product page, so nobody buys a size they never picked.

**Collection chips are real storefront filters.** Set your filters up in the
Search & Discovery app; every *list* filter becomes a row of chips. Price and
rating filters are left out rather than crammed into a pill. Sorting carries the
active filters through, and the whole bar works without JavaScript.

**Saved items are local.** The heart on a card writes to `localStorage` — no
account and no app required. It is a wishlist, not a synced one.

**The variant picker updates twice.** The hidden variant id and the button state
change instantly on click, then the product section is re-rendered server-side to
repaint price, badges and inventory. Option values grey out progressively using
the same rule Shopify's own pickers use.

**Grids are written mobile-first on purpose.** Sections pass their column count
as an inline `--cols` custom property, and an inline custom property outranks any
stylesheet rule *including one inside a media query*. Desktop counts are
therefore only read inside `min-width` queries — writing those breakpoints as
`max-width` would let the inline value win and the grids would never collapse.

**Colour tokens are emitted per scheme, not at `:root`.**
`snippets/css-variables.liquid` writes one rule per scheme and is shared by
`theme.liquid`, `password.liquid` and `gift_card.liquid`. Sections wrap their
contents in `.scheme.color-scheme-N`, so assigning a scheme rebases that
subtree's entire palette — including the derived values like `--ink-60` and the
accent ramp, which recompute from the scheme's own text and background rather
than the global ones. That's what makes a dark band invert correctly instead of
leaving grey text on a dark ground.

**Never put a literal `%}` inside a `{% liquid %}` tag**, not even in a comment
within it. It closes the tag early and the remainder of the file is reparsed as
raw HTML, which surfaces as a baffling syntax error hundreds of lines away.
`bin/validate.js` checks for this.

---

## Translations

`locales/en.default.json` holds every storefront string, and
`locales/en.default.schema.json` holds the theme-settings labels. Section schema
labels are literal English; move them to `t:` keys if you want to ship the theme
in more than one language.

## Development checks

`bin/validate.js` is a dependency-free static checker. It parses every JSON file
and `{% schema %}` block, resolves every `render`, `section`, `sections` and
`asset_url` reference, verifies every translation key exists, checks Liquid tag
balance, and catches multi-line conditions inside `{% liquid %}` tags (which
Liquid silently mis-parses).

```bash
node bin/validate.js
```

## Browser support

Evergreen Chrome, Edge, Firefox and Safari. Layout uses grid, `aspect-ratio`,
`clamp()` and custom properties; `backdrop-filter` is progressive enhancement and
degrades to a solid background.

## Licence

Copyright © 2026. All rights reserved. This theme is sold as a commercial
product; it is not open source.
