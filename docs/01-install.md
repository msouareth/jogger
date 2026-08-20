# Installing Jogger

## What you received

A `.zip` file containing the theme. Don't unzip it — Shopify wants the zip.

## Upload it

1. In your Shopify admin, go to **Online Store → Themes**
2. Under **Theme library**, click **Add theme → Upload zip file**
3. Choose the Jogger zip and wait for it to process
4. Click **Customize** to start setting it up, or **Publish** when you're ready
   for customers to see it

Jogger installs alongside your current theme. Nothing on your live store changes
until you press **Publish**, so you can set the whole thing up in private first.
That's the recommended way to do it.

## Before it looks like the demo

Jogger renders your real products, collections and menus, so a brand-new store
shows placeholder frames rather than the demo imagery. The three things that
make the biggest difference, in order:

1. **Menus** — create a menu with the handle `main-menu` for the header and one
   called `footer` for the footer (**Content → Menus**). Without these, the
   navigation is empty.
2. **A collection on the home page** — open the Product grid section in the
   theme editor and pick one.
3. **Images** — hero, category tiles, editorial and lookbook images are all set
   in the theme editor.

See [Setting up](02-setup.html) for the full run-through.

## Requirements

- Any Shopify plan
- No apps required. The collection filter chips use the free **Search &
  Discovery** app if you want them; everything else works out of the box.

## Updating later

When you receive a new version, upload the new zip as a separate theme and
re-apply your settings, or use the Shopify CLI to push over your existing copy
if you're comfortable with it. **Your content — products, collections, pages —
is never touched by a theme update.** Theme settings and section layouts live
with the theme, so they don't carry across automatically.

If you've edited the theme's code, keep a copy of your changes before updating.
