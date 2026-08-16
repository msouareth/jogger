#!/usr/bin/env node
/*
  Stamps image URLs into demo/products.csv.

  Shopify's product importer will not read a file off your disk — Image Src has
  to be a URL it can fetch. So the order is: generate the images, upload them to
  the store's Files, then run this with the base URL those files landed on. The
  filenames are deterministic, so only the prefix is unknown until upload.

  Getting the base: after uploading, open any one file in Content > Files and
  copy its link. Everything up to and including /files/ is the base — drop the
  filename and the ?v=... query, which is a cache key and is not required.

    https://cdn.shopify.com/s/files/1/0123/4567/files/home-hero.png?v=1712345678
    └──────────────────── base ────────────────────┘

  Usage:
    node bin/demo-csv.js --base https://cdn.shopify.com/s/files/1/0123/4567/files
    node bin/demo-csv.js --clear     put it back the way it shipped
    node bin/demo-csv.js --check     report what is currently set

  Re-running replaces whatever was there, so a wrong base is not a dead end.
*/

const fs = require('fs');
const path = require('path');

const CSV = path.join(__dirname, '..', 'demo', 'products.csv');

/* ── CSV ─────────────────────────────────────────────────────────
   Written out rather than hand-split on commas: Body (HTML) carries commas and
   quotes inside quoted fields, and splitting would corrupt every product
   description in the file. */

function parse(text) {
  const rows = [];
  let row = [], field = '', quoted = false, i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        quoted = false; i++; continue;
      }
      field += ch; i++; continue;
    }

    if (ch === '"') { quoted = true; i++; continue; }
    if (ch === ',') { row.push(field); field = ''; i++; continue; }
    if (ch === '\r') { i++; continue; }
    if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += ch; i++;
  }

  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function serialize(rows) {
  return rows.map(r => r.map(f => {
    const v = f == null ? '' : String(f);
    return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  }).join(',')).join('\n') + '\n';
}

/* ── stamping ────────────────────────────────────────────────────
   Shopify reads Image Src and Image Position from any row belonging to a
   handle, so a product's three images ride on its first three variant rows.
   Nothing else on those rows is touched. */

const SHOTS = [
  { suffix: '1', alt: t => t },
  { suffix: '2', alt: t => `${t} — alternate view` },
  { suffix: '3', alt: t => `${t} — campaign` }
];

function main() {
  const args = process.argv.slice(2);
  const baseAt = args.indexOf('--base');
  const base = baseAt !== -1 ? (args[baseAt + 1] || '').replace(/\/+$/, '') : null;
  const clear = args.includes('--clear');
  const check = args.includes('--check');

  if (!base && !clear && !check) {
    console.error('need --base <url>, or --clear, or --check.  See the header of this file.');
    process.exit(1);
  }
  if (base && !/^https?:\/\//.test(base)) {
    console.error(`--base must be a URL Shopify can fetch, got: ${base}`);
    process.exit(1);
  }

  const rows = parse(fs.readFileSync(CSV, 'utf8'));
  const head = rows[0];
  const col = name => {
    const i = head.indexOf(name);
    if (i === -1) { console.error(`column not found: ${name}`); process.exit(1); }
    return i;
  };

  const cHandle = col('Handle');
  const cTitle = col('Title');
  const cSrc = col('Image Src');
  const cPos = col('Image Position');
  const cAlt = col('Image Alt Text');

  if (check) {
    const set = rows.slice(1).filter(r => r[cSrc]).length;
    console.log(`${set} of ${rows.length - 1} rows carry an Image Src`);
    rows.slice(1).filter(r => r[cSrc]).slice(0, 3).forEach(r => console.log('  ', r[cSrc]));
    return;
  }

  // Title only appears on a handle's first row, so carry it forward.
  const titles = {};
  for (const r of rows.slice(1)) {
    if (r[cHandle] && r[cTitle] && !titles[r[cHandle]]) titles[r[cHandle]] = r[cTitle];
  }

  const seen = {};
  let stamped = 0;

  for (const r of rows.slice(1)) {
    const handle = r[cHandle];
    if (!handle) continue;

    r[cSrc] = ''; r[cPos] = ''; r[cAlt] = '';
    if (clear) continue;

    const n = seen[handle] = (seen[handle] || 0) + 1;
    const shot = SHOTS[n - 1];
    if (!shot) continue;

    r[cSrc] = `${base}/${handle}-${shot.suffix}.png`;
    r[cPos] = String(n);
    r[cAlt] = shot.alt(titles[handle] || handle);
    stamped++;
  }

  fs.writeFileSync(CSV, serialize(rows));

  if (clear) {
    console.log('cleared Image Src / Position / Alt Text from demo/products.csv');
  } else {
    console.log(`stamped ${stamped} image rows across ${Object.keys(seen).length} products`);
    console.log(`base: ${base}`);
    console.log('next: Shopify admin > Products > Import > demo/products.csv');
  }
}

main();
