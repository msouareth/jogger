# Changelog

All notable changes to Mundo are recorded here. Versions follow
[semantic versioning](https://semver.org): a major bump means merchants may need
to redo some settings, a minor bump adds features safely, a patch fixes bugs.

## 1.6.1

### Added

- **Buy it now colours** — the per-button controls now cover the dynamic
  checkout button too, which 1.6.0 missed. Left unset it follows the colour
  scheme's button colour rather than Shopify's default blue.

  The branded Shop Pay button is deliberately not restyled. Its colour is
  Shopify's brand furniture, and recolouring it removes the instant
  recognition that makes an accelerated checkout button worth showing.

## 1.6.0

### Added

- **Per-button colours.** The counterpart to per-element typography: every
  button in the marketing sections now has its own **Fill**, **Label** and **On
  hover**, sitting under a `… colours` heading in that section's settings.
  Covers the hero button, the editorial split button, the product grid's view-all
  link, the newsletter join button and Add to bag.

  Leave a colour empty and that aspect keeps following the colour scheme, so a
  single button can be recoloured without detaching it from the palette
  entirely. On outline and underline buttons the fill sets the line colour,
  since those have no fill of their own.

## 1.5.0

### Added

- **Button colours.** Each colour scheme now carries its own **Button**,
  **Button text** and **Button on hover**, so the solid buttons can be a brand
  colour without dragging every heading along with them. Because they live in
  the scheme, a dark band's buttons invert on their own instead of disappearing.

  Outline and underline buttons still follow the scheme's text colour — that
  contrast is what makes them read as secondary — but an outline button turning
  solid on hover now matches the solid buttons.

  All three theme styles ship with button colours set to reproduce the previous
  look exactly, so nothing changes until you change it.

## 1.4.3

### Fixed

- **Bands down the sides of product photos.** The gallery fitted the whole photo
  inside the frame, which letterboxes whenever the photo's shape differs from
  the frame's, and added 24px of padding on top. Both read as unwanted margin on
  full-bleed photography. The image now fills the frame by default with no
  padding, and thumbnails follow the same fit so the strip matches.

### Added

- **Image fit** setting — fill the frame (default) or fit the whole photo in.
  Keep it on *fit* with some padding for cut-out product shots on a tinted
  ground; leave it on *fill* for full-bleed photography.

### Changed

- The default image shape is now tall portrait, which suits fashion photography
  and avoids cropping under the new fill behaviour.
- The quantity selector is off by default. Shoppers adjust quantity in the bag.

## 1.4.2

### Fixed

- **Every translucent colour in the theme was silently dead.** The `*-rgb`
  tokens were emitted from Liquid's `color.rgb`, which returns space-separated
  channels (`43 38 33`). Fed to the legacy `rgba(var(--token), a)` form that
  produces invalid CSS, and an invalid `var()` substitution makes the whole
  declaration compute to its initial value. Dividers, muted text, tinted
  overlays, the sticky header blur and the swatch rings all rendered as
  nothing. The tokens are now built from `.red`/`.green`/`.blue`, and
  `bin/validate.js` fails on any `*-rgb` token set from `.rgb`.
- **Colour swatches showed no colour** unless swatches were configured in the
  admin. The fallback used the option value's name directly as a CSS colour,
  and fashion names like "Almond" or "Clay" are not valid CSS, so the
  declaration was dropped and the swatch rendered empty. A new
  `swatch-color` snippet maps the common apparel vocabulary to real values,
  passes through hex and genuine CSS keywords, and leaves a visible neutral
  when a colour genuinely cannot be resolved. Admin swatches still win.

## 1.4.1

### Fixed

- **Photo colour swatches had no selected state.** They marked themselves with
  `border-color`, which stopped working in 1.3.1 when swatches moved from a
  border to an inset shadow. They now take the same ring as flat swatches.

### Changed

- The selected colour swatch reads as a target — the colour, a clear ring of
  page colour, then a solid outer ring. The gap is painted rather than left
  transparent, so it stays crisp over the tinted card ground.
- Swatches are spaced further apart so the outer ring, which takes no layout
  space, never crowds its neighbours.

## 1.4.0

### Added

- **Size button styles** — underlined text (new default, the conventional
  fashion-retail treatment), square boxes, or rounded pills. Unavailable sizes
  fade rather than strike through in the underlined style.
- **Quantity position** — beside the add button as one welded control bar
  (new default), or stacked above it.
- **Button shape** on the product page — square or rounded.
- **Uppercase title and subtitle** on the title block. The subtitle reads the
  product type or vendor.

### Changed

- The default product template is now the flat, flush-left retail layout: no
  floating card, no centring. Turn **Float the details in a card** and **Centre
  the details** back on for the previous look.

## 1.3.1

### Fixed

- **Large gap between the product image and its details.** Capping the stage
  height left the box at its full column width, so the image letterboxed inside
  it. The media column is now sized from the image ratio instead of taking a
  free `1fr`, closing the gap to the section's normal spacing.
- **Pale colour swatches were hard to see and their selected state unclear.**
  Every swatch now carries a permanent inset ring, so white reads as a circle
  against a pale ground, and the selected state is an outer ring separated by a
  gap in the page colour — legible whatever the swatch is filled with.

### Changed

- The quantity selector is on by default, so a shopper can buy several at once.
  Adding a second size creates its own bag line, each with its own quantity.

## 1.3.0

### Added

- **Thumbnail position** on the product gallery — left of the image (new
  default), right, or below. Below 750px they drop to a horizontal strip under
  the image, since a side rail would eat the width on a phone.
- **Maximum image height**, capping the gallery against the viewport so the
  price, options and Add to bag stay visible without scrolling.
- **Spacing** control on the product details, compact by default.

### Changed

- The product details column now uses a tighter vertical rhythm by default, so
  a standard product fits above the fold on a laptop screen.

## 1.2.0

### Added

- **Per-element typography.** Every heading, label, paragraph, caption and
  button label in the marketing sections now has its own font, size and colour
  setting. Size is a 50–200% multiplier folded into each type class's own
  `clamp()`, so enlarged text stays responsive instead of being pinned to a
  pixel value. Colour left empty follows the section's colour scheme.
- **Accent font** — a third global font any individual line can switch to,
  alongside the heading and body fonts.

### Fixed

- The Product grid showed dead placeholder cards when no collection was chosen.
  It now falls back to the full catalogue, so a freshly installed theme has real,
  clickable products immediately.
- Category tiles with no collection linked to `#`, which silently jumped the page
  to the top. They now link to the full catalogue.
- A detail link with a label but no URL rendered as an anchor to `#`. It now
  renders as plain text.
- Placeholder cards no longer show a pointer cursor, and sections that need
  setting up explain themselves inside the theme editor.

## 1.1.0

### Added

- **Gallery product layout.** One large stage with edge arrows, a thumbnail
  strip, touch swipe and arrow-key navigation. Selecting a colour moves the
  gallery to that variant's photo. The original two-up grid remains available
  behind a setting.
- **Floating details card.** The buy controls can sit on a raised panel over a
  tinted ground, optionally centred, with square size buttons.
- **Photo colour swatches.** Colour options can render each colour's own variant
  image instead of a flat chip, on both product pages and product cards.
- **Detail links block** — the small "Information / Size guide" row.
- **Same-category related products.** The section below a product now draws from
  the collection the shopper came through, falling back to the product's own
  collection. Shopify's recommendation engine remains available as an option.
- **Carousel layout** for related products, with arrow navigation that steps by
  one card, and a plain "+" quick add on the cards.

### Changed

- Reveal-on-hover for gallery and carousel arrows is now scoped to
  `@media (hover: hover)`, so touch devices always see them rather than relying
  on a width-based override.

## 1.0.0

First release.

### Templates

Home, collection, product, cart, search, blog, article, page, contact, 404,
password, gift card, and the full set of customer account templates.

### Home sections

Hero with ken-burns drift and shoppable product hotspots, product grid, marquee
band, category tiles, editorial split with scroll parallax, drag-scroll lookbook
rail, and values. All are presets — addable, reorderable and removable.

### Features

- **Colour schemes.** Five colours per scheme, assignable per section, so a page
  can alternate light and dark bands. The full nine-step accent ramp is derived
  from each scheme's single accent colour.
- **Theme styles.** Three one-click presets — Sand, Ink and Bloom.
- **AJAX bag.** Adds and quantity changes re-render the drawer from Liquid via
  the Section Rendering API, so money formats, discounts and the free-shipping
  bar are always correct. An open drawer keeps its state and focus.
- **Variant picker.** Instant local feedback, then a server re-render for price
  and inventory. Option availability narrows progressively.
- **Collection filters** rendered as chips from real storefront filters, with
  sorting that preserves them. Works without JavaScript.
- **Predictive search** with product cards matching the rest of the theme.
- **Saved items** stored in the visitor's browser, no account required.
- **Free shipping progress bar** with a configurable threshold.

### Accessibility

- Every animation respects `prefers-reduced-motion`
- Focus trapping and Escape handling in all drawers
- Marquees hidden from assistive tech, their content announced once as a list
- Ratio-locked image frames, so no layout shift on load
- Visible focus rings throughout

### Notes

- Built from scratch. No Dawn, no vendored framework, no build step.
- Passes `shopify theme check` with no offences.
