# Customizing the look

All of this is in **Theme settings** — the gear icon at the bottom of the theme
editor sidebar. No code.

---

## Theme styles

At the very top you'll find three one-click styles:

| Style | Character |
| --- | --- |
| **Sand** | The original. Warm sand ground, camel accent, light headings, 4px corners. |
| **Ink** | Monochrome and editorial. Square corners, heavier headings, tighter tracking. |
| **Bloom** | Terracotta and sage, softer 14px corners, slightly larger type. |

Picking one replaces your colour, type and geometry settings in one move. Start
from whichever is closest, then adjust.

## Colour schemes

Jogger uses **colour schemes** rather than one flat palette. Each scheme is a set
of five colours, and every section can be assigned a scheme — so you can run a
dark band through the middle of a light page.

Each scheme has:

| Colour | Used for |
| --- | --- |
| **Background** | The section's ground |
| **Surface** | Image frames before they load, the newsletter panel, empty states |
| **Text** | All body and heading text |
| **Accent** | Prices, hovers, focus rings, the bag counter, links |
| **Secondary accent** | Sparingly — the "New" badge, free-shipping bar, in-stock dot |
| **Button** | Solid buttons — add to bag, checkout, the hero call to action |
| **Button text** | The label on those buttons |
| **Button on hover** | What a solid button becomes on hover |

Button colours sit inside the scheme rather than being global, which means a
dark band's buttons invert on their own. Set them per scheme and you never get
a dark button on a dark ground.

Outline and underline buttons deliberately follow the scheme's **text** colour
instead — that quieter contrast is what makes them read as secondary. An
outline button that turns solid on hover uses your button colours.

### The accent is the big one

There's no palette of a dozen shades to fill in. The theme generates a full
nine-step ramp from your single accent colour — the light steps mix toward that
scheme's background, the dark steps deepen. Change the accent and badges,
progress bars, hovers, focus rings, price colours and hero gradients all move
together, staying in relation to each other.

This is why a Jogger store recolours convincingly in about ten seconds.

### Using schemes per section

Every home section, the footer, the ticker and the newsletter have a **Colour
scheme** picker. The default three are set up so that:

- `scheme-1` is your main light ground
- `scheme-2` is a subtle tinted band
- `scheme-3` is the inverted dark band

Try setting the Values or Editorial section to `scheme-3` — the entire subtree
inverts correctly, including text opacity and the accent ramp, because those are
derived rather than fixed.

You can add more schemes; every one you create becomes available in every
section's picker.

## Styling individual pieces of text

Every heading, label, paragraph, caption and button label in the marketing
sections has its own **font, size and colour** controls, sitting under a
`… type` heading in that section's settings.

- **Font** — Default, Heading font, Body font, or Accent font. "Default" leaves
  the element as designed.
- **Size** — 50% to 200% of that element's normal size. It's a multiplier, not a
  fixed pixel value, so text stays responsive: an enlarged heading still shrinks
  correctly on a phone.
- **Colour** — leave it empty and the element follows the section's colour
  scheme. Set it to override just that one line.

You'll find these on: the ticker, hero (label, heading, text, button), product
grid, marquee, category tiles and their captions, editorial split, lookbook and
its captions, values, newsletter, footer menus and about text, and related
products.

## Styling individual buttons

Alongside the text controls, every button in the marketing sections has its own
**Fill**, **Label** and **On hover**, under a `… colours` heading in that
section's settings. You'll find them on the hero button, the editorial split
button, the product grid's view-all link, the newsletter join button, Add to bag
and Buy it now.

**Buy it now** is Shopify's dynamic checkout button. Left unset it follows your
scheme's button colour instead of Shopify's default blue. The branded **Shop
Pay** button is not restyled — that colour is Shopify's, and changing it costs
you the recognition that makes the button work.

Leave a colour empty and that aspect keeps following the colour scheme — so you
can give one button a brand fill while its label and hover still track the
palette, rather than detaching it entirely.

On outline and underline buttons, **Fill** sets the line colour, since those
have no fill of their own.

If you want *all* buttons to change together, don't use these — set **Button**,
**Button text** and **Button on hover** on the colour scheme instead. These
per-button controls are for the exceptions.

### Why three fonts and not a free choice per line

The font control offers your three theme fonts rather than the whole font
library. That's deliberate: pages where every line uses a different typeface
look broken, and three families is already more than most fashion brands use.
Set your **Accent font** to whatever contrast you want — a serif, a condensed
face, something with character — and any single line can switch to it.

## Typography

These set the defaults everything inherits from.

- **Body font / Heading font** — anything in Shopify's font library. Set both to
  the same family for the single-typeface look of the original design.
- **Accent font** — a third family that any individual line can be switched to,
  using the per-element controls above. Leave it matching the others unless you
  want a deliberate contrast.
- **Display weight** — how heavy the biggest headings are. 300 gives the light,
  wide-set original; 500 reads much bolder and more commercial.
- **Type scale** — nudges everything up or down together, 90–115%.
- **Heading tracking** — how tightly large headings are letter-spaced. More
  negative is tighter. This is the setting that most changes the theme's
  character: −60 is fashion-editorial, 0 is neutral.

## Layout

- **Maximum content width** — 1200 to 1800px.
- **Edge padding** — set separately for small and large screens.
- **Corner radius** — applies to image frames and panels. `0` is hard and
  modernist, `16`+ is soft and contemporary. Buttons and chips always stay fully
  rounded by design.

## Motion

Reveals, hero drift and editorial parallax are switchable independently.

All of it is disabled automatically for visitors whose device asks for reduced
motion — you don't need to do anything for that, and you can't override it.
That's deliberate: it's an accessibility requirement, not a preference.

## Product cards

- **Quick add** — the hover button. Products with a single variant add straight
  to the bag; anything with options links to the product page instead, so nobody
  buys a size they never chose.
- **Save button** — the heart. Saves to the visitor's own browser; no account
  needed, and nothing is synced to your store.
- **Colour dots** — reads your colour option.
- **Second image on hover** — crossfades to the product's second image.
- **Card subtitle** — product type, vendor, or nothing.
