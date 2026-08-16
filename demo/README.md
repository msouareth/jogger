# Demo store setup

Everything needed to stand up the store shown in the Mundo marketing shots.
Budget about 30 minutes. The imagery is generated for you in step 1, so most of
that is clicking through the Shopify admin rather than waiting on uploads.

Do this on a **development store** (free, from
[partners.shopify.com](https://partners.shopify.com)), not on a live shop.

---

## 1. Generate the placeholder imagery

```bash
node bin/demo-images.js
```

Writes 35 PNGs to `demo/images/` — three per product, plus a hero, four category
tiles, an editorial frame and five lookbook slots, each at the ratio its slot
expects. They are art-directed colour fields in the theme's own Sand palette
with an abstract garment form, not photographs and not pretending to be. They
carry no licence, so they are safe to publish in a demo.

`--list` prints the shot list without writing. `--only <text>` regenerates a
subset, which is worth knowing because a full run takes about ninety seconds.

These are a stand-in, not a destination. Real photography is what sells an
apparel theme — see step 3 for swapping it in.

## 2. Upload the images and point the CSV at them

Shopify's importer fetches `Image Src` over HTTP; it cannot read a file off your
disk. So the images go up first, and then the CSV learns where they landed.

**Content → Files → Upload files** — select everything in `demo/images/`.

Then open any one of them, copy its link, and keep the part up to and including
`/files/`:

```
https://cdn.shopify.com/s/files/1/0123/4567/files/home-hero.png?v=1712345678
└──────────────────── this much ───────────────────┘
```

```bash
node bin/demo-csv.js --base https://cdn.shopify.com/s/files/1/0123/4567/files
```

That fills `Image Src`, `Image Position` and `Image Alt Text` for all 8
products. Re-run it with a different base to correct a mistake, `--clear` to put
the file back as it shipped, or `--check` to see what is currently set.

## 3. Import the catalogue

`products.csv` holds 8 products / 120 variants — the wardrobe the theme was
designed around, with a `Colour` and a `Size` option on every product.

**Products → Import → Upload file → `demo/products.csv`**

The home page images — hero, category tiles, editorial, lookbook — are not part
of the import. They are picked per section in the theme editor at step 8, from
the same files you uploaded.

**Swapping in real photography later:** replace the files in `demo/images/`
keeping the names, re-upload, and re-run `bin/demo-csv.js`. Nothing else
changes. Good sources for a demo you intend to publish: your own shoot, or a
service with a clear commercial licence.

Notes on what's in it:

- Prices are USD. Change them in the CSV before importing if you'd rather demo
  in another currency.
- `The Long Overcoat` carries the tag `badge:Icon`. That's the theme's manual
  badge convention — any product tagged `badge:Something` shows that word on its
  card.
- Three products are tagged `new`, which paints the sage "New" badge.
- `Cotton Gauze Shirt` has a compare-at price, so it demos the struck-through
  sale price and the sale badge.
- On each product, the first colour's **XL is deliberately out of stock**, so
  you can see the struck-through size pill and the progressive availability
  logic working.

## 4. Colour swatches

The card colour dots and the product page swatches read Shopify's option
swatches. Without them the theme falls back to interpreting the value name as a
CSS colour — which works for "Sage" and "Olive" but not for "Oat" or "Clay".

**Settings → Products → Options → Colour** and set a swatch per value:

| Value | Swatch |
| --- | --- |
| Oat | `#ddd2c0` |
| Clay | `#b09077` |
| Sage | `#9aa694` |
| Espresso | `#4a3c31` |
| Chalk | `#efe9df` |
| Pale Sage | `#b8c2b4` |
| Olive | `#8a8f6f` |
| Almond | `#e3d8c8` |
| Stone | `#7d746a` |
| Ink | `#2f2b26` |
| Camel | `#a89c8c` |
| Sand | `#c6b9a5` |

## 5. Collections

Create these as **automated** collections, condition `Product type is equal to
…`, which keeps them correct as you add stock:

| Collection | Condition |
| --- | --- |
| New in | Product tag is equal to `new` |
| Outerwear | Product type is equal to `Outerwear` |
| Knitwear | Product type is equal to `Knitwear` |
| Dresses | Product type is equal to `Dresses` |
| Shirting | Product type is equal to `Shirting` |
| Trousers | Product type is equal to `Trousers` |

Give each a collection image — the Category tiles section falls back to it when
no tile image is set.

## 6. Menus

**Content → Menus.** The header and footer read these two handles by default.

**Main menu** (`main-menu`):
`New in`, `Outerwear`, `Knitwear`, `Dresses`, `Lookbook`

**Footer menu** (`footer`):
`Shipping`, `Returns`, `Size guide`, `Repairs`

The footer has three menu blocks in the demo layout; point them at whichever
menus you like, or make `Shop`, `Help` and `House` menus to match the design.

## 7. Filters

The collection page's chip bar is built from real storefront filters. Install
the free **Search & Discovery** app, then under **Filters** add a filter on
**Product type**. Each of its values becomes a chip.

Without this the chip row simply doesn't render — the page still works, it just
loses the filter bar.

## 8. Section setup

**Online Store → Themes → Customize.**

Every image below is picked from **Content → Files**, where step 2 put them.

- **Hero** — `home-hero.png`. The generated one keeps its form to the right
  because the hero's label, heading and button sit bottom-left. Then add three
  Shoppable hotspot blocks and pick a product for each, positioning them with
  the x/y sliders.
- **Product grid** — point it at `New in`. Sort that collection **Newest first**
  in the Shopify admin, or the grid shows the same four products forever.
- **Category tiles** — a block per category, each with its collection set and
  `category-<name>.png` as the image. A tile with no collection does not render
  at all, so there are never more tiles than categories. **Columns on desktop**
  fixes the tile size; past a full row they slide.
- **Editorial split** — `home-editorial.png`.
- **Lookbook** — five looks, `lookbook-1.png` through `-5.png`, caption each.

## 9. Try the theme styles

At the top of **Theme settings** you'll find three one-click styles: **Sand**
(the original), **Ink** (monochrome, square corners, heavier headings) and
**Bloom** (terracotta, softer corners, larger type). Worth flipping between them
in a demo video — it's the fastest way to show the theme's range.

Then try setting one section's **Colour scheme** to `scheme-3` to see a dark
band mid-page.
