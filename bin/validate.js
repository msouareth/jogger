/* Static checks for the Jogger theme: JSON validity, cross-file references,
   translation keys, and Liquid tag balance.

   Complements `shopify theme check` -- run both. Usage: node bin/validate.js */
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2] || path.resolve(__dirname, '..');
const errors = [];

const walk = (dir) => {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
};

const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');
const read = (p) => fs.readFileSync(p, 'utf8').replace(/^﻿/, '');

const sections = new Set(
  walk(path.join(ROOT, 'sections'))
    .filter((f) => f.endsWith('.liquid'))
    .map((f) => path.basename(f, '.liquid'))
);
const sectionGroups = new Set(
  walk(path.join(ROOT, 'sections'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.basename(f, '.json'))
);
const snippets = new Set(walk(path.join(ROOT, 'snippets')).map((f) => path.basename(f, '.liquid')));
const assets = new Set(walk(path.join(ROOT, 'assets')).map((f) => path.basename(f)));

// -- 1. JSON files parse -------------------------------------------
const jsonFiles = walk(ROOT).filter(
  (f) => f.endsWith('.json') && !rel(f).startsWith('.git') && !rel(f).includes('node_modules')
);
const parsed = {};
for (const file of jsonFiles) {
  try {
    parsed[rel(file)] = JSON.parse(read(file));
  } catch (e) {
    errors.push(`${rel(file)}: invalid JSON - ${e.message}`);
  }
}

// -- 2. Translation keys -------------------------------------------
const flatten = (obj, prefix = '', out = new Set()) => {
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    out.add(key);
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
  }
  return out;
};
const storefrontKeys = flatten(parsed['locales/en.default.json'] || {});
const schemaKeys = flatten(parsed['locales/en.default.schema.json'] || {});

// -- 3. Schema setting rules ---------------------------------------
// Shopify rejects a whole section file if any setting breaks these, and the
// only symptom is "does not refer to an existing section file" wherever that
// section is used -- so catch them here where the message is useful.

// inline_richtext permits a small tag set; <br> in particular is not in it.
const INLINE_RICHTEXT_TAGS = new Set(['b', 'strong', 'i', 'em', 'u', 'span', 'a', '/b', '/strong', '/i', '/em', '/u', '/span', '/a']);

function checkSettings(label, settings) {
  for (const setting of settings || []) {
    if (setting.type === 'range') {
      const { min, max, step, default: def, id } = setting;
      if ([min, max, step].some((v) => typeof v !== 'number')) continue;
      if (step <= 0) {
        errors.push(`${label}: range "${id}" has a non-positive step`);
        continue;
      }
      if ((max - min) % step !== 0) {
        errors.push(`${label}: range "${id}" span (${min}-${max}) is not divisible by step ${step}`);
      }
      if ((max - min) / step > 100) {
        errors.push(`${label}: range "${id}" has more than 100 steps`);
      }
      if (typeof def === 'number') {
        if (def < min || def > max) {
          errors.push(`${label}: range "${id}" default ${def} is outside ${min}-${max}`);
        } else if ((def - min) % step !== 0) {
          errors.push(
            `${label}: range "${id}" default ${def} is not a step in the range (min ${min}, step ${step})`
          );
        }
      }
    }

    if (setting.type === 'inline_richtext' && typeof setting.default === 'string') {
      for (const [, tag] of setting.default.matchAll(/<\s*(\/?[a-z0-9]+)/gi)) {
        if (!INLINE_RICHTEXT_TAGS.has(tag.toLowerCase())) {
          errors.push(`${label}: inline_richtext "${setting.id}" default uses tag <${tag}>, which is not permitted`);
        }
      }
    }
  }
}

// -- 4. Liquid files -----------------------------------------------
const PAIRED = ['if', 'unless', 'for', 'case', 'capture', 'form', 'paginate', 'comment', 'raw', 'tablerow'];
const liquidFiles = walk(ROOT).filter((f) => f.endsWith('.liquid'));

for (const file of liquidFiles) {
  const src = read(file);
  const name = rel(file);

  const schemaMatch = src.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  if (schemaMatch) {
    try {
      const schema = JSON.parse(schemaMatch[1]);
      const walkSchema = (node) => {
        if (Array.isArray(node)) return node.forEach(walkSchema);
        if (node && typeof node === 'object') {
          for (const v of Object.values(node)) {
            if (typeof v === 'string' && v.startsWith('t:')) {
              const key = v.slice(2);
              if (!schemaKeys.has(key)) {
                errors.push(`${name}: schema key "${key}" missing from en.default.schema.json`);
              }
            } else walkSchema(v);
          }
        }
      };
      walkSchema(schema);
      checkSettings(name, schema.settings);
      for (const block of schema.blocks || []) {
        checkSettings(`${name} [block "${block.type}"]`, block.settings);
      }
    } catch (e) {
      errors.push(`${name}: schema block is not valid JSON - ${e.message}`);
    }
  }

  const body = src
    .replace(/\{%-?\s*schema\s*-?%\}[\s\S]*?\{%-?\s*endschema\s*-?%\}/g, '')
    .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, '')
    .replace(/\{%-?\s*raw\s*-?%\}[\s\S]*?\{%-?\s*endraw\s*-?%\}/g, '');

  // tag balance
  const stack = [];
  const tagRe = /\{%-?\s*(\w+)/g;
  let m;
  while ((m = tagRe.exec(body))) {
    const tag = m[1];
    if (PAIRED.includes(tag)) stack.push({ tag, index: m.index });
    else if (tag.startsWith('end')) {
      const want = tag.slice(3);
      if (!PAIRED.includes(want)) continue;
      const top = stack.pop();
      if (!top) errors.push(`${name}: stray endtag "${tag}"`);
      else if (top.tag !== want) errors.push(`${name}: "${top.tag}" closed by "${tag}"`);
    }
  }
  for (const open of stack) {
    const line = body.slice(0, open.index).split('\n').length;
    errors.push(`${name}:${line}: unclosed "${open.tag}"`);
  }

  // Inside a liquid tag, a literal "%}" anywhere -- including inside a
  // comment block -- closes the tag early, and everything after it is
  // reparsed as raw HTML. Flag any liquid tag body holding delimiters.
  for (const [, inner] of body.matchAll(/\{%-?\s*liquid\b([\s\S]*?)-?%\}/g)) {
    if (/\{%|%\}/.test(inner)) {
      errors.push(`${name}: a liquid tag body contains literal tag delimiters, which close it early`);
    }
    for (const rawLine of inner.split('\n')) {
      const line = rawLine.trim();
      if (/^(and|or)\b/.test(line)) {
        errors.push(
          `${name}: continuation line "${line.slice(0, 40)}" inside a liquid tag - each statement needs its own line`
        );
      }
    }
  }

  // Liquid's color.rgb yields space-separated channels ("43 38 33"). Feeding
  // that to the legacy rgba(var(--x), a) form produces invalid CSS, and an
  // invalid var() substitution silently computes the whole declaration to its
  // initial value. Emit .red/.green/.blue instead.
  for (const [, prop] of src.matchAll(/(--[a-z0-9-]*rgb)\s*:\s*\{\{[^}]*\.rgb\s*\}\}/gi)) {
    errors.push(
      `${name}: "${prop}" is set from .rgb, which is space separated and breaks rgba(var(...), a) — use .red/.green/.blue`
    );
  }

  // render / section references
  for (const [, snippet] of src.matchAll(/\{%-?\s*render\s+'([^']+)'/g)) {
    if (!snippets.has(snippet)) errors.push(`${name}: renders missing snippet "${snippet}"`);
  }
  for (const [, sec] of src.matchAll(/\{%-?\s*section\s+'([^']+)'/g)) {
    if (!sections.has(sec)) errors.push(`${name}: references missing section "${sec}"`);
  }
  for (const [, group] of src.matchAll(/\{%-?\s*sections\s+'([^']+)'/g)) {
    if (!sectionGroups.has(group)) errors.push(`${name}: references missing section group "${group}"`);
  }

  // asset references
  for (const [, asset] of src.matchAll(/'([^']+)'\s*\|\s*asset_url/g)) {
    if (!assets.has(asset)) errors.push(`${name}: references missing asset "${asset}"`);
  }

  // translation keys
  for (const [, key] of src.matchAll(/'([a-z0-9_]+(?:\.[a-z0-9_?]+)+)'\s*\|\s*t\b/gi)) {
    if (!storefrontKeys.has(key)) errors.push(`${name}: translation key "${key}" missing from en.default.json`);
  }
}

// -- 4. Templates point at real sections ---------------------------
for (const [name, doc] of Object.entries(parsed)) {
  if (!name.startsWith('templates/') && !/^sections\/.*-group\.json$/.test(name)) continue;
  for (const [id, sec] of Object.entries(doc.sections || {})) {
    if (!sections.has(sec.type)) errors.push(`${name}: section "${id}" has unknown type "${sec.type}"`);
  }
  for (const id of doc.order || []) {
    if (!doc.sections || !doc.sections[id]) errors.push(`${name}: order lists unknown section "${id}"`);
  }
}

// -- 5. Required theme files ---------------------------------------
const required = [
  'layout/theme.liquid',
  'config/settings_schema.json',
  'config/settings_data.json',
  'locales/en.default.json',
  'templates/index.json',
  'templates/product.json',
  'templates/collection.json',
  'templates/cart.json',
  'templates/404.json',
  'templates/page.json',
  'templates/search.json',
  'templates/blog.json',
  'templates/article.json',
  'templates/list-collections.json',
  'templates/password.json',
  'templates/gift_card.liquid'
];
for (const f of required) {
  if (!fs.existsSync(path.join(ROOT, f))) errors.push(`missing required file: ${f}`);
}

// -- report --------------------------------------------------------
console.log(
  `sections: ${sections.size}  snippets: ${snippets.size}  assets: ${assets.size}  ` +
    `liquid files: ${liquidFiles.length}  json files: ${jsonFiles.length}`
);
if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  errors.forEach((e) => console.log('  x ' + e));
  process.exit(1);
}
console.log('\nAll checks passed.');
