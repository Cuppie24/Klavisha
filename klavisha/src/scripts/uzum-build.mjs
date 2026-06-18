// Normalizes a raw Uzum GraphQL productPage response into import-ready JSON and
// downloads product images. No auth needed (the images CDN is public).
// Run from the klavisha/ dir:  node ./src/scripts/uzum-build.mjs [raw.json] [maxImagesPerProduct]
// Reads/writes the staging dir ./.uzum-import (raw.json in, data.json + images/ out).
import fs from 'node:fs';
import path from 'node:path';

const STAGE = path.join(process.cwd(), '.uzum-import');
const rawPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(STAGE, 'raw.json');
const MAX_IMG = Number(process.argv[3] || 20);
const imgDir = path.join(STAGE, 'images');
fs.mkdirSync(imgDir, { recursive: true });

const TRANSLIT = {
  а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',
  н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',
  ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya',
};
const slugify = (s) =>
  s.toLowerCase()
    .split('').map((c) => (c in TRANSLIT ? TRANSLIT[c] : c)).join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/g, '');

const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
const products = Object.values(raw.data).map((n) => n.product).filter(Boolean);

async function download(url, dest) {
  if (fs.existsSync(dest)) return true;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) { console.warn('  ! image', res.status, url); return false; }
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  return true;
}

const out = [];
for (const p of products) {
  console.log(`\n# ${p.title} (uzum ${p.id})`);
  // Options derived from actual SKU values (guarantees variant<->option consistency).
  const optionMap = new Map(); // title -> Map(value -> hex)
  for (const sku of p.skuList) {
    for (const cv of sku.characteristicValues) {
      const t = cv.characteristic.title;
      if (!optionMap.has(t)) optionMap.set(t, new Map());
      optionMap.get(t).set(cv.title, cv.value || null);
    }
  }
  const options = [...optionMap.entries()].map(([title, vals]) => ({ title, values: [...vals.keys()] }));

  // Gallery: first MAX_IMG product photos; ensure each SKU's own photo is included.
  const galleryKeys = [];
  const seen = new Set();
  const pushKey = (key, url) => { if (key && !seen.has(key)) { seen.add(key); galleryKeys.push({ key, url }); } };
  for (const ph of p.photos) pushKey(ph.key, ph.link?.high);
  let gallery = galleryKeys.slice(0, MAX_IMG);
  for (const sku of p.skuList) {
    const k = sku.photo?.key;
    if (k && !gallery.find((g) => g.key === k)) gallery.push({ key: k, url: sku.photo.link?.high });
  }
  if (galleryKeys.length > MAX_IMG) console.log(`  gallery capped ${galleryKeys.length} -> ${gallery.length} (incl. variant photos)`);

  const images = [];
  for (const g of gallery) {
    const file = `${g.key}.jpg`;
    if (await download(g.url, path.join(imgDir, file))) images.push({ key: g.key, file });
  }
  console.log(`  downloaded ${images.length} images`);

  const variants = p.skuList.map((sku) => ({
    sku: sku.skuTitle,
    barcode: sku.barcode || null,
    title: sku.characteristicValues.map((c) => c.title).join(' / ') || p.title,
    options: Object.fromEntries(sku.characteristicValues.map((c) => [c.characteristic.title, c.title])),
    price: sku.sellPrice,
    fullPrice: sku.fullPrice,
    stock: sku.availableAmount ?? 0,
    photoKey: sku.photo?.key || null,
  }));

  out.push({
    uzumId: p.id,
    title: p.title,
    handle: slugify(p.title) + '-' + p.id,
    description: p.description || p.shortDescription || '',
    category: p.category?.title || null,
    rating: p.rating ?? null,
    orders: p.ordersQuantity ?? 0,
    options,
    thumbnailKey: images[0]?.key || null,
    images,
    variants,
  });
  console.log(`  options: ${options.map((o) => o.title + '(' + o.values.length + ')').join(', ')} | variants: ${variants.length}`);
}

fs.writeFileSync(path.join(STAGE, 'data.json'), JSON.stringify(out, null, 2));
console.log(`\nWrote ${path.join(STAGE, 'data.json')}: ${out.length} products`);
