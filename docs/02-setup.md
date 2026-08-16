# Setting up

Everything below happens in **Online Store → Themes → Customize**, unless it
says otherwise.

---

## Navigation

**Content → Menus** in your admin.

- The header reads the menu you pick in the Header section — `main-menu` by
  default. Two levels are supported: top-level items with children render a
  dropdown on desktop and an indented group in the mobile drawer.
- The footer's menu blocks each take their own menu, so you can have separate
  Shop / Help / About columns.

## The logo

In the **Header** section you can either upload a **logo image** (and set its
width), or use the **wordmark** — your store name as text.

The wordmark has a second field, **Wordmark tail**, which renders in a lighter
weight and joins onto the end. Typing `mun` and `do` gives you `mundo` with the
two-weight treatment from the original design. Leave the tail empty for a plain
wordmark.

## The home page

Sections can be added, reordered and removed freely. The default arrangement is:

| Section | What it needs |
| --- | --- |
| **Hero** | An image. Optionally hotspot and pill blocks. |
| **Product grid** | A collection. |
| **Marquee band** | Message blocks. |
| **Category tiles** | A collection per tile. |
| **Editorial split** | An image and some copy. |
| **Lookbook rail** | An image and caption per look. |
| **Values** | Up to four heading + text blocks. |

### Shoppable hotspots

The hero's most distinctive feature. Add a **Shoppable hotspot** block, pick a
product, then position it over the garment with the **Horizontal** and
**Vertical** sliders. The dot renders the product's live title and price on
hover — you never type those in, so they can't go stale.

Up to eight blocks total across hotspots and pills.

### The hero image

Landscape, and shot with headroom — the heading sits bottom-left over a gradient
veil. If your image is busy in that corner, raise **Shading** until the text
reads cleanly. Around 2400px wide is plenty.

## Product pages

### Media

Two layouts, set on the Product section:

- **Gallery** (default) — one large image with edge arrows, a thumbnail strip
  beneath, swipe on touch, and arrow-key support. Choosing a colour moves the
  gallery to that variant's photo.
- **Grid** — every image stacked two-up with each third running full width.
  This is the original Mundo layout.

For gallery, you can also set:

- **Thumbnail position** — left of the image (default), right, or below. On
  phones they always drop below, since a side rail would eat the width.
- **Maximum image height** — caps the image against the screen height, so the
  price, options and Add to bag stay visible without scrolling. 75% is the
  default; lower it if your header is tall or your details column is long.
- **Image shape** — square, portrait, tall portrait or landscape. Match it to
  how your photography is shot.
- **Image fit** — *fill the frame* (default) crops to the frame's shape and
  leaves no gaps. *Fit the whole photo in* shows every pixel, but leaves space
  at the sides whenever the photo's shape differs from the frame's.
- **Space around the image** — leave at 0 for full-bleed photography. Raise it,
  with fit set to *fit the whole photo in*, for cut-out product shots that
  should sit on a tinted ground rather than bleed to the edges.

Upload images in the order you want them read.

### The details card

**Spacing** is compact by default, which tightens the vertical rhythm so the
title, price, options and Add to bag all land above the fold. Switch it to
comfortable if you prefer more air and don't mind a scroll.

**Float the details in a card** puts the buy controls on a raised white panel
over a tinted ground. Turn it off — along with **centre the details** — for the
flat, flush-left look of a typical fashion PDP.

Alongside it:

- **Centre the details** — off gives the flush-left retail layout.
- **Size buttons** — underlined text (default), square boxes, or rounded pills.
- **Button shape** — square or rounded, for the add to bag row.
- **Colour swatches** — the product's own photo, or a flat colour chip. Photo
  swatches look for each colour's variant image; set one on each variant in the
  admin, otherwise they fall back to the chip.

Every swatch carries a thin ring so a white or cream colour still reads as a
circle, and the selected one gets an outer ring separated by a gap.

### Buying

The shopper picks a colour and a size, sets a quantity, and adds. Wanting a
second size or colour is handled the ordinary way: pick it and add again. Each
becomes its own bag line, since sizes and colours are separate variants, and the
bag is where quantities get adjusted before checkout.

There is no quantity stepper on the product page by default — the button simply
adds one. If you'd rather offer it, the **Buy buttons** block has **Show
quantity selector**, and **Quantity position** then places the stepper beside
the add button as a single control bar or stacked above it.

### Blocks

The details column is built from blocks you can reorder: title, price, variant
picker, buy buttons, detail links, description, stock note, and any number of
collapsible rows.

**Detail links** is the row of two small links at the foot of the card —
"Information" and "Size guide" by default. Point them at your policy pages.

The four collapsible rows shipped by default — Materials, Fit & sizing, Care &
repairs, Shipping & returns — have placeholder text. Replace it, or delete the
rows you don't want.

### Related products

The section below the product shows **more from the same category**. It takes
the collection the shopper arrived through, falling back to the product's own
first collection. You can switch it to Shopify's recommendation engine instead,
and choose a carousel or a grid.

## Colour swatches

The colour dots on cards and the round swatches on product pages read Shopify's
option swatches.

**Settings → Products → Options**, pick your colour option, and set a swatch for
each value. Without swatches the theme falls back to reading the value's name as
a colour — fine for "Sage", not for "Oat".

## Collection filters

The chip bar on collection pages is built from your real storefront filters.
Install the free **Search & Discovery** app and add a filter (Product type works
well for apparel). Every value becomes a chip.

Only *list* filters appear as chips — price ranges and ratings are left out
rather than squeezed into a pill. Sorting keeps the active chips.

If you add no filters, the bar just doesn't appear.

## The bag

**Theme settings → Bag.**

- **Bag style** — a slide-out drawer (default) or a separate cart page.
- **Free shipping progress** — set your threshold in store currency, no symbol.
  The bar and the "add £X more" note follow it automatically.
- **Order notes** — adds a note field for gift wrap or delivery instructions.

## Search

**Theme settings → Search.** With suggestions on, results appear as the visitor
types, styled to match your product cards. Turn it off for a plain search box.

## Social links

**Theme settings → Social accounts.** Paste full URLs. Icons only appear for
the ones you fill in.
