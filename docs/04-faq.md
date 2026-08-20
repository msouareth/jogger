# Troubleshooting & FAQ

## My store doesn't look like the demo

Almost always one of three things:

1. **No menus.** Create `main-menu` and `footer` under **Content → Menus**.
2. **No collection on the Product grid.** Open that section and pick one.
3. **No images.** Hero, tiles, editorial and lookbook images are set per section
   in the theme editor.

The demo store also uses its own photography, which is licensed for those
images and does not ship with the theme.

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

## My header text has gone invisible

Almost always a colour set in **Header → Bar colours → Menu, icons and
wordmark**. That colour is used everywhere, including where the bar sits on the
page's own background — so white set there disappears against a pale page.

Clear the field. Empty means it follows your colour scheme, which is the safe
setting. If what you wanted was light labels only while the bar floats over a
hero picture, use **Over a hero picture** instead — that is what it is for.

## A footer column has vanished

Columns with nothing in them are hidden on the live shop rather than left as a
heading over empty space. The usual cause is a menu column pointing at a menu
that has not been built yet.

In the theme editor the column stays visible and says so, so you can still select
it. Build the menu in **Content → Menus**, then pick it in the block.

## The contact form goes to the wrong inbox

It goes wherever your store's contact email points — nothing about it is set in
the theme, and no address is stored here. Change it in your Shopify settings and
the form follows.

The newsletter is not email at all: it adds the subscriber to your customer list
with marketing consent, where you will find them under **Customers**.

## The hero text and the scroll cue are crowding each other

Both default to the foot of the picture. Move the text up with **Text position —
down**, or send the cue to one side with **Scroll cue**, or turn the cue off.

On a phone there is no room for both, so hero text sitting at the foot is lifted
to make space automatically.

## The brand circles do not move

In the loose layout they need somewhere to go. If the circles cover much more
than a third of the area they jostle instead of drifting.

Raise **Area height**, lower **Circle size**, or use fewer logos. On a narrow
screen the theme already brings the size down for you — a size chosen on a laptop
would otherwise arrive unchanged on a phone and jam it solid.

## Can I add a second colour scheme band?

Yes. Every home section, the footer, ticker and newsletter have a **Colour
scheme** setting. Set one to `scheme-3` for the dark band. You can also create
additional schemes in **Theme settings → Colours**.

## Can I use a font that isn't in the list?

Not without code. The picker offers Shopify's font library, which is what's
available to themes without custom development.

## Does it work with my apps?

Yes. Apps that provide **app blocks** can be placed directly into the product
page's information column from the theme editor, so a review widget or a size
chart sits exactly where you want it. Apps that work through script tags — email
capture, analytics, chat, upsells — run as they do on any theme.

## Can I sell in another language?

Yes. Every piece of storefront wording runs through Shopify's translation
system, so it can be translated in **Content → Translations** or with a
translation app. The footer also carries country and language selectors, which
appear automatically once you have more than one market or language enabled.

## Accessibility

- Every animation respects `prefers-reduced-motion`
- Drawers trap focus and close on Escape
- The marquee and ticker are hidden from screen readers and their messages
  announced once as a plain list
- The collection filter bar and sort work without JavaScript
- Images reserve their space before loading, so nothing shifts under you

## Getting help

Email **support@mundo.dev** — see [Support](support.html) for what to include.
The fastest answers come from a message with your store URL, the page it happens
on, the browser and device, and a screenshot.
