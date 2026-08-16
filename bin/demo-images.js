#!/usr/bin/env node
/*
  Generates the demo store's placeholder imagery.

  Why this exists: demo/products.csv ships without photography on purpose, so a
  fresh install has nothing to show. These are not photographs and are not
  pretending to be — they are art-directed colour fields in the theme's own Sand
  palette, at the exact ratios each slot expects. They read as deliberate rather
  than broken, and they carry no licence.

  No dependencies, matching the rest of the theme. PNG is written by hand:
  zlib is in Node, and the rest of the format is a signature, three chunks and a
  CRC. Shopify will not accept SVG as a product image, so raster is required.

  Usage:
    node bin/demo-images.js            write demo/images/
    node bin/demo-images.js --list     print what it would write, and the ratios
*/

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/* ── PNG ─────────────────────────────────────────────────────────── */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

/*
  Scanlines use the Up filter. These images are overwhelmingly vertical
  gradients, so each row differs from the one above it by almost nothing and the
  deltas deflate to very little — a None filter roughly quadruples the files.
*/
function encodePng(width, height, rgb) {
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  let prev = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const off = y * (stride + 1);
    raw[off] = 2;
    const row = rgb.subarray(y * stride, (y + 1) * stride);
    for (let i = 0; i < stride; i++) raw[off + 1 + i] = (row[i] - prev[i]) & 0xff;
    prev = row;
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // truecolour
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    // Level 6, not 9. On these gradients 9 buys about 2% and costs several
    // times the runtime across 35 images.
    chunk('IDAT', zlib.deflateSync(raw, { level: 6 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ── palette ─────────────────────────────────────────────────────── */

// The Sand preset plus the swatch values demo/README.md asks merchants to set,
// so the imagery and the product options come from one set of colours.
const HUES = {
  bg: [250, 247, 242], surface: [241, 234, 224], ink: [43, 38, 33],
  accent: [138, 111, 82], sage: [142, 155, 135],
  oat: [221, 210, 192], clay: [176, 144, 119], espresso: [74, 60, 49],
  chalk: [239, 233, 223], stone: [125, 116, 106], camel: [168, 156, 140],
  sand: [198, 185, 165], paleSage: [184, 194, 180], almond: [227, 216, 200]
};

const mix = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t
];

// Ordered dither. An 8-bit gradient across 1200px of a narrow tonal range bands
// visibly; ±1 of patterned noise removes it for a modest cost in file size.
const BAYER = [
  [0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]
];

/* ── composition ─────────────────────────────────────────────────── */

/* Smoothstep, tolerant of reversed edges so it can be used to fade either way. */
function smooth(e0, e1, x) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

/*
  A garment, abstracted: shoulders, a body that tapers, a neck cut out of the
  top. Deliberately soft-edged and low contrast — a hard silhouette would read
  as clip art, whereas this reads as a form under studio light.

  Without it the images are handsome but empty, and eight products' worth of
  empty colour fields looks like photography that failed to load rather than a
  choice. `cx` shifts it off-centre for the wider campaign frames.
*/
function garment(nx, ny, cx, scale) {
  const top = 0.20, bot = 0.94;
  const t = (ny - top) / (bot - top);
  if (t < -0.08 || t > 1.08) return 0;

  // Shoulder swell just below the neck, then a gentle taper to the hem.
  const w = (0.115 + 0.08 * Math.exp(-Math.pow((t - 0.07) / 0.17, 2)) + 0.028 * t) * scale;
  const dx = Math.abs(nx - cx);

  let cov = smooth(w + 0.014, w - 0.014, dx);
  cov *= smooth(top - 0.03, top + 0.04, ny);
  cov *= smooth(bot + 0.03, bot - 0.05, ny);

  const ndx = (nx - cx) / (0.058 * scale);
  const ndy = (ny - (top + 0.012)) / 0.05;
  cov *= smooth(0.8, 1.2, Math.sqrt(ndx * ndx + ndy * ndy));

  return Math.max(0, Math.min(1, cov));
}

function render(width, height, recipe) {
  const { from, to, wash, angle, band, glowX, glowY, glowR, subject, subjectX, subjectScale, subjectHue } = recipe;
  const buf = Buffer.alloc(width * height * 3);
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const diag = Math.abs(width * cos) + Math.abs(height * sin);

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;

      // Base: a gradient run along `angle` rather than straight down, so the
      // set does not read as one repeated swatch.
      let t = ((x - width / 2) * cos + (y - height / 2) * sin) / diag + 0.5;
      t = Math.min(1, Math.max(0, t));
      let c = mix(from, to, t * t * (3 - 2 * t));

      // A soft horizon, placed off-centre. Real photographs rarely divide in half.
      if (band != null) {
        const d = Math.abs(ny - band);
        const f = Math.max(0, 1 - d * 5.2);
        c = mix(c, wash, f * f * 0.55);
      }

      // Off-centre glow, standing in for a light source.
      if (glowR) {
        const dx = (nx - glowX) * (width / height);
        const dy = ny - glowY;
        const d = Math.sqrt(dx * dx + dy * dy) / glowR;
        if (d < 1) {
          const f = (1 - d) * (1 - d);
          c = mix(c, HUES.chalk, f * 0.42);
        }
      }

      // The subject, laid over the ground before the vignette so the vignette
      // sits on it too and the two read as one exposure.
      if (subject) {
        const cov = garment(nx, ny, subjectX, subjectScale);
        if (cov > 0) {
          c = mix(c, subjectHue, cov * 0.5);
          // A faint lift down one edge, so the form has a light side.
          const edge = Math.max(0, 1 - Math.abs(nx - (subjectX - 0.05)) * 9);
          c = mix(c, HUES.chalk, cov * edge * 0.18);
        }
      }

      // Vignette, very slight — enough to seat the frame.
      const vx = (nx - 0.5) * 2, vy = (ny - 0.5) * 2;
      const v = Math.min(1, (vx * vx + vy * vy) * 0.34);
      c = mix(c, HUES.ink, v * 0.1);

      const d4 = (BAYER[y & 3][x & 3] / 16 - 0.5) * 1.6;
      const o = (y * width + x) * 3;
      buf[o] = Math.max(0, Math.min(255, Math.round(c[0] + d4)));
      buf[o + 1] = Math.max(0, Math.min(255, Math.round(c[1] + d4)));
      buf[o + 2] = Math.max(0, Math.min(255, Math.round(c[2] + d4)));
    }
  }
  return buf;
}

/* Deterministic per-name variation, so re-running produces identical files. */
function seedOf(name) {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

const PAIRS = [
  ['oat', 'clay'], ['sand', 'espresso'], ['chalk', 'camel'], ['almond', 'stone'],
  ['paleSage', 'sage'], ['surface', 'accent'], ['oat', 'stone'], ['chalk', 'sage'],
  ['almond', 'clay'], ['sand', 'accent']
];

const SUBJECT_HUES = ['espresso', 'stone', 'clay', 'accent', 'sage', 'camel'];

function recipeFor(name, role) {
  const s = seedOf(name);
  const s2 = seedOf(name + '~');
  const pair = PAIRS[Math.floor(s * PAIRS.length) % PAIRS.length];
  const flip = s > 0.5;

  // Wide frames put the form off to one side and smaller, leaving room the way
  // a campaign shot does; upright frames centre it.
  const wide = role === 'campaign' || role === 'hero' || role === 'editorial';

  // The hero is not free to choose its side. The theme sets the hero's label,
  // heading and button bottom-left, so the form goes right or it sits under the
  // type. Everything else may fall either way for variety.
  const side = role === 'hero' ? 0.72 : (s2 > 0.5 ? 0.68 : 0.33);

  return {
    from: HUES[flip ? pair[1] : pair[0]],
    to: HUES[flip ? pair[0] : pair[1]],
    wash: HUES[s > 0.66 ? 'chalk' : s > 0.33 ? 'oat' : 'almond'],
    angle: (0.18 + s * 0.9) * Math.PI,
    band: 0.32 + s * 0.42,
    glowX: 0.22 + s * 0.56,
    glowY: 0.18 + (1 - s) * 0.4,
    glowR: 0.55 + s * 0.5,
    subject: role !== 'plain',
    subjectX: wide ? side : 0.46 + s2 * 0.08,
    subjectScale: wide ? 0.62 + s2 * 0.16 : 0.92 + s2 * 0.2,
    subjectHue: HUES[SUBJECT_HUES[Math.floor(s2 * SUBJECT_HUES.length) % SUBJECT_HUES.length]]
  };
}

/* ── what to write ───────────────────────────────────────────────── */

// Ratios come straight from demo/README.md's shot list and from what each
// section's frame actually expects.
const PRODUCTS = [
  'cashmere-crew', 'cotton-gauze-shirt', 'pleated-wide-trouser', 'ribbed-knit-dress',
  'shawl-cardigan', 'the-chore-jacket', 'the-long-overcoat', 'washed-silk-cami'
];

function plan() {
  const out = [];
  for (const h of PRODUCTS) {
    out.push({ name: `${h}-1.png`, w: 900, h: 1200, role: 'card', note: 'card / front, 3:4' });
    out.push({ name: `${h}-2.png`, w: 900, h: 1200, role: 'card', note: 'hover crossfade, 3:4' });
    out.push({ name: `${h}-3.png`, w: 1400, h: 933, role: 'campaign', note: 'campaign frame, 3:2' });
  }
  out.push({ name: 'home-hero.png', w: 1800, h: 900, role: 'hero', note: 'hero, 2:1' });
  for (const c of ['outerwear', 'knitwear', 'dresses', 'shirting']) {
    out.push({ name: `category-${c}.png`, w: 900, h: 1125, role: 'card', note: 'category tile, 4:5' });
  }
  out.push({ name: 'home-editorial.png', w: 1200, h: 900, role: 'editorial', note: 'editorial split, 4:3' });
  for (let i = 1; i <= 5; i++) {
    out.push({ name: `lookbook-${i}.png`, w: 900, h: 1200, role: 'card', note: 'lookbook, 3:4' });
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  let items = plan();

  // --only <substring> regenerates a subset. Writing all 35 is slow enough that
  // iterating on the look without it is painful.
  const onlyAt = args.indexOf('--only');
  if (onlyAt !== -1 && args[onlyAt + 1]) {
    const needle = args[onlyAt + 1];
    items = items.filter(i => i.name.includes(needle));
  }

  if (args.includes('--list')) {
    items.forEach(i => console.log(`${i.name.padEnd(28)} ${String(i.w).padStart(4)}x${String(i.h).padEnd(5)} ${i.note}`));
    console.log(`\n${items.length} images`);
    return;
  }

  if (items.length === 0) {
    console.log('nothing matched --only');
    return;
  }

  const dir = path.join(__dirname, '..', 'demo', 'images');
  fs.mkdirSync(dir, { recursive: true });

  let bytes = 0;
  for (const i of items) {
    const png = encodePng(i.w, i.h, render(i.w, i.h, recipeFor(i.name, i.role)));
    fs.writeFileSync(path.join(dir, i.name), png);
    bytes += png.length;
  }

  console.log(`wrote ${items.length} images to demo/images/  (${(bytes / 1048576).toFixed(1)} MB)`);
  console.log('next: upload them to Shopify (Content > Files), then run bin/demo-csv.js');
}

main();
