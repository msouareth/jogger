# Troubleshooting & FAQ

## My store doesn't look like the demo

Almost always one of three things:

1. **No menus.** Create `main-menu` and `footer` under **Content → Menus**.
2. **No collection on the Product grid.** Open that section and pick one.
3. **No images.** Hero, tiles, editorial and lookbook images are set per section
   in the theme editor.

The demo also uses specific photography. See `demo/README.md` if you bought the
theme with the demo pack.

## The filter chips don't appear on collection pages

They're built from real storefront filters, which need the free **Search &
Discovery** app. Install it, add a filter on Product type, and the chips appear.

Only list-type filters become chips. Price and rating filters are intentionally
left out.

## The colour dots are wrong or missing

Set option swatches: **Settings → Products → Options → your colour option**, and
give each value a swatch colour or image.

Without swatches the theme reads the value's *name* as a CSS colour. "Sage" and
"Olive" happen to be real CSS colours; "Oat" and "Clay" are not, so they render
as nothing.

## Quick add says "Quick add" but takes me to the product page

That's intended. It only adds directly when a product has exactly one
purchasable variant. Anything with a size or colour choice sends the customer to
the product page rather than silently picking a variant for them.

## A size is struck through

That variant is out of stock. The theme works out availability progressively —
once a colour is chosen, sizes unavailable *in that colour* are struck through.

## The bag drawer doesn't open

Check **Theme settings → Bag → Bag style** is set to "Slide-out drawer" and not
"Separate page".

## Saved items disappeared

The save/heart feature stores items in the visitor's own browser. Clearing
browser data, or switching device or browser, clears them. It's a convenience
wishlist, not an account-backed one — no data reaches your store.

## Can I add a second colour scheme band?

Yes. Every home section, the footer, ticker and newsletter have a **Colour
scheme** setting. Set one to `scheme-3` for the dark band. You can also create
additional schemes in **Theme settings → Colours**.

## Can I use a font that isn't in the list?

Not without code. The picker offers Shopify's font library, which is what's
available to themes without custom development.

## Does it work with my apps?

Product pages support app blocks — apps that provide them can be added straight
into the product information column. Apps that inject via script tags work
normally.

## Is it translated?

The storefront strings ship in English and are fully translatable through
**Content → Translations** or a translation app. The theme editor's own setting
labels are English only.

## Accessibility

- Every animation respects `prefers-reduced-motion`
- Drawers trap focus and close on Escape
- The marquee and ticker are hidden from screen readers and their messages
  announced once as a plain list
- The collection filter bar and sort work without JavaScript
- Images reserve their space before loading, so nothing shifts under you

## Getting help

Contact details are in your purchase receipt. When reporting a problem, the
fastest fix comes from including: your store URL, the page it happens on, the
browser and device, and a screenshot.
