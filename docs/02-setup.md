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
weight and joins onto the end. Typing `Jog` and `ger` gives you `Jogger` with the
two-weight treatment from the original design. Leave the tail empty for a plain
wordmark.

A **Tagline** sits under the wordmark in small tracked caps — a location, a
proposition, or nothing at all.

## The header bar

**Bar layout** decides where the wordmark sits, and the other two groups take
the places around it:

| Layout | Left | Centre | Right |
| --- | --- | --- | --- |
| Logo left | wordmark | menu | icons |
| Menu · logo centred | menu | wordmark | icons |
| Icons · menu · logo right | icons | menu | wordmark |

Whatever is in the middle sits on the true centre of the bar, not the midpoint
of whatever space the menu happens to leave.

**Space on the left of centre** and **Space on the right of centre** set the air
either side of that centred group, in pixels, up to 750. The two are separate so
you can weight the bar deliberately. Narrow screens ease both back rather than
crowding.

On a phone the wordmark is always centred and the menu becomes a drawer,
whatever the layout — three groups do not fit across a narrow bar.

### Bar colours

**Header → Bar colours.** Four optional colours, all of which fall back to the
colour scheme when left empty:

| Setting | Colours |
| --- | --- |
| **Menu, icons and wordmark** | the whole bar's ordinary state |
| **On hover** | links and icons under the pointer, and the line that sweeps in under a link |
| **Current page** | the link for the page the visitor is on |
| **Over a hero picture** | the bar while it floats over a hero, before scrolling |

Leaving them empty is the safe choice. A colour set in the first field is used
**everywhere**, including where the bar sits on the page's own background — so
if you want light labels only while the bar is over a picture, use the last
field, not the first. Setting white in the first field is the usual way to end
up with an invisible header.

### When the bar takes its background

While a hero is set to run up under the bar, the bar is clear and its labels are
light so the picture shows through. **When the bar takes its background** decides
when that ends — once the picture has passed (default), or as soon as the page
moves.

## The home page

Sections can be added, reordered and removed freely. The default arrangement is:

| Section | What it needs |
| --- | --- |
| **Hero** | An image or a video. Optionally hotspot and pill blocks. |
| **Category tiles** | A collection per tile. Only tiles with a collection appear. |
| **Marquee band** | Message blocks. |
| **Product grid** | A collection. |
| **Editorial split** | An image or video, and some copy. |
| **Lookbook rail** | An image and caption per look. |
| **Values** | Up to four heading + text blocks. |
| **Brand band** | A logo per brand. |

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

An **animated GIF** goes in the same image field. It is left whole rather than
resized, so it keeps moving.

### A video instead

The **Video** field takes a Shopify-hosted video and it replaces the image. It
plays muted, on a loop, with no controls — a backdrop, not something to operate.

Set an image as well: it becomes the **poster**, which is the still shown while
the file loads and what stays if a browser refuses to autoplay. Setting both is
the good case, not a clash.

A visitor who has asked their device for reduced motion sees the poster and no
movement.

### How the picture sits

| Setting | What it does |
| --- | --- |
| **Run up under the bar** | The picture starts at the very top and the header floats over it. Only sensible on a template that opens with this section. |
| **Full width** | Edge to edge instead of keeping the page's side margins. Corners square off, since a rounded corner against the screen edge reads as a mistake. |
| **Image** | *Fill the frame* keeps the hero the same height everywhere and crops to fit. *Show the whole picture* gives the frame the picture's own proportions — nothing is cropped, but the height then changes with the shape of your file and **Height** stops applying. |
| **Height** | 50–100% of the screen. |
| **Shading** | How strongly the foot of the picture is darkened under the text. |

### Where the text sits

**Text position — across** and **Text position — down** place the block in any of
nine spots. They are independent, so it can be centred across and still sit at
the foot.

Then two distances, in pixels:

- **Distance from the sides** — how far from the left or right edge. No effect
  while the text is centred across, since there is no side to sit away from.
- **Distance from top and bottom** — how far from the top or the foot. No effect
  while the text is in the middle.

Both are held back on a small picture — a fifth of its width, a third of its
height — so a generous desktop setting still leaves something to read on a
phone.

**Text width** is how wide the block may run before it wraps. Widen it to keep a
large heading on one line; the body paragraph keeps its own readable measure
whatever you set, so a wide block gives the heading room without stretching the
body into long lines.

### The pills

The small round captions. Add or remove them as **Pill** blocks; place them with
**Pill position — across** and **— down**, and the two distance sliders beside
them. They stay side by side wherever you send them.

If your hero text also sits at the foot and centred, put the pills to one side so
the two do not crowd.

### The scroll cue

A pair of chevrons at the foot of the picture, falling one after the other, that
tell a visitor there is more below. They fade away as soon as anyone scrolls, and
clicking travels to the next section.

**Scroll cue** places them centred or to one side, or hides them. **Show the cue
on phones** is on by default; on a narrow screen hero text sitting at the foot is
lifted to make room for them.

## The announcement ticker

A thin band above the header, scrolling slowly. Each **Message** block is one
phrase; they repeat seamlessly, so two or three is plenty. **Seconds per loop**
is higher for slower. It pauses while the pointer is over it.

Remove every block and the band disappears.

## Editorial split

An image or video on one side, writing on the other. **Image position** puts the
picture left or right; on a phone it always stacks with the picture first.

The **Video** field works exactly as the hero's does — it replaces the image, the
image becomes its poster, and the frame keeps its shape either way so the column
does not change height with the proportions of your file.

## Lookbook rail

A row of tall cards you drag sideways, with arrows for anyone who would rather
click or use a keyboard.

**Layout** offers two:

- **Level** — every card on the same line.
- **Staggered** — cards step alternately down and up as the rail runs, which
  reads less like a filmstrip and more like a spread. **Step** sets how far, and
  is halved on a phone where height is the scarcer thing.

**Move on its own** sets the rail drifting sideways. It never reaches an end —
the looks repeat and the join cannot be seen. Dragging, flicking or the arrows
take over at any moment and it picks up again as soon as the visitor lets go.
**Speed** is in pixels a second; around 25 is a slow drift. It stops for reduced
motion, and while the section is off screen.

**Hint** is the small line at the right of the heading — "Drag to explore" by
default. Clear it if the arrows say enough.

## Brand band

Round logos, for the mills, makers or labels you work with. One **Brand** block
per logo, each with a picture, a name and an optional link.

**How they move** offers two quite different things:

- **In a line** — they travel steadily across the page and loop seamlessly.
  **Seconds per loop** is higher for slower.
- **Loose** — they are scattered inside a closed area where they drift about and
  bounce off the walls and off each other. **Drift speed** is in pixels a second;
  **Area height** is how tall the box is. Give them room: a shallow area with
  large circles leaves nowhere to go.

**Circle size** is the size on a screen with room for it. In the loose layout a
circle is brought down when the box could not otherwise hold them all with space
to drift, so a size chosen on a laptop does not leave a phone jammed solid.

**How the image sits in the circle** — *inside, whole* is right for logos, which
usually carry their own margins and read badly pressed against a curve. *Filling,
cropped* suits photographs.

**Ring thickness** and **Ring colour** draw a line around each circle. The ring is
drawn inside the circle, so the circles keep the size you set and the rings never
touch before the circles do. Zero removes it.

Both layouts pause while the pointer is over them, so a logo can be clicked
without being chased.

## Category tiles

One **Category** block per tile, each pointing at a collection. A block renders
once it has a collection, so the row stays tidy while you are still building it.

**When there are more categories than columns** decides what happens once you
have more tiles than fit across a row:

- **Wrap onto the next row** — they flow down the page as a grid.
- **Scroll sideways** — they become a rail you drag, which keeps the section one
  row tall however many you add.

With fewer tiles than columns the row simply does not fill. The tiles keep the
size they were designed at rather than stretching to cover the width.

## Newsletter

Sits above the footer. **Fine print** is the small line under the field — the
place for a note about how often you write, or a link to your privacy policy.

Subscribers are added to your Shopify customer list with marketing consent,
not emailed anywhere by the theme. You will find them under **Customers** in
your admin.

## Product pages

### Media

Two layouts, set on the Product section:

- **Gallery** (default) — one large image with edge arrows, a thumbnail strip
  beneath, swipe on touch, and arrow-key support. Choosing a colour moves the
  gallery to that variant's photo.
- **Grid** — every image stacked two-up with each third running full width.
  This is the original Jogger layout.

For gallery, you can also set:

- **Show thumbnails** — turn the strip off entirely for a single-image gallery
  driven by the arrows and swipe alone.
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
repairs, Shipping & returns — come with example wording. Write your own, or
remove the rows you do not need.

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
- **Order notes** — adds a note field for gift wrap or delivery instructions.- **Order notes** — adds a note field for gift wrap or delivery instructions.
- **Checkout** — where the buy buttons lead. *Shopify checkout* is the normal
  choice and what the theme ships with. *Your own form* points them at a URL you
  set, for shops collecting orders through their own form or a cash-on-delivery
  app. *Nowhere* keeps the buttons but stops them, for showing a store before it
  opens.

## Search

**Theme settings → Search.** With suggestions on, results appear as the visitor
types, styled to match your product cards. Turn it off for a plain search box.

## The footer

Built from blocks, so the columns are yours to arrange.

| Block | What it holds |
| --- | --- |
| **Brand** | Your wordmark or logo, a line about the shop, and the social icons. |
| **Menu** | A heading and a menu — one block per column. |
| **Contact details** | An address, up to two phone numbers, an email and opening hours. |
| **Text** | A heading and free writing. |

The phone numbers and the email are real links: on a phone the number dials and
the email opens the mail app. Type the number however reads best — the spacing
is stripped out of the dial link only, so `+213 555 01 02 03` shows as you wrote
it and dials as it should. Include the country code for anyone calling from
abroad.

**A column with nothing in it disappears** on the live shop rather than leaving a
heading over empty space. In the theme editor it stays put and says what it
needs, so you can still select it to fix or remove it. That is why a menu column
pointing at a menu you have not built yet shows nothing on the storefront.

The bar underneath carries the copyright — your store name, taken from
**Settings → Store details**, and the year, which updates itself. **Tagline** sits
beside it. **Show payment icons** and **Show country and language selectors**
turn those on and off.

## Other pages

Every template is built from sections, so all of these can be rearranged the
same way as the home page.

| Page | Notes |
| --- | --- |
| **Contact** | Uses the `page.contact` template. Your words on the left, the form on the right; whatever you write in the page body becomes the intro beside it. Messages go to your store's contact email — see the FAQ. |
| **Blog** and **Article** | Show or hide the excerpt, the featured image and the author. Articles per page is yours to set. |
| **Collections list** | Every collection as a tile. |
| **Search** | Full results page, matching the suggestions dropdown. |
| **404** | Editable heading and text. |
| **Password** | Shown while the store is password-protected. Its own heading, message and image. |
| **Customer accounts** | Login, register, account, addresses, order, password reset and account activation. All follow your colour scheme and type; there is nothing to configure. |

## Social links

**Theme settings → Social accounts.** Fields for Instagram, TikTok, Pinterest,
Facebook and YouTube. Paste the full URL including `https://`. Icons appear in
the footer only for the ones you fill in, so leave the rest empty.
