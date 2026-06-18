// Fetches ALL products of the Uzum shop into .uzum-import/raw.json.
// Token via env:  UZUM_TOKEN="Bearer eyJ..."  node ./src/scripts/uzum-fetch.mjs [shopId]
// Handles the search-gateway 429 throttle with long backoff; product detail
// (productPage) goes through a different, non-throttled subgraph.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const SHOP_ID = process.argv[2] || '60240';
const TOKEN = process.env.UZUM_TOKEN;
if (!TOKEN) { console.error('Set UZUM_TOKEN env var'); process.exit(1); }
const URL = 'https://graphql.uzum.uz/';
const STAGE = path.join(process.cwd(), '.uzum-import');
fs.mkdirSync(STAGE, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Mimic the real web client as closely as possible (some quotas key off these).
const headers = {
  Authorization: TOKEN,
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'Accept-Language': 'ru-RU,ru;q=0.9',
  'apollographql-client-name': 'web-customers',
  'apollographql-client-version': '1.0',
  'x-iid': crypto.randomUUID(),
  version: '3.5.3',
  'x-experiments': '',
  Origin: 'https://uzum.uz',
  Referer: 'https://uzum.uz/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0',
};

async function gql(query, { retries = 60, waitMs = 90000, label = '' } = {}) {
  for (let i = 0; i < retries; i++) {
    let j;
    try {
      const res = await fetch(URL, { method: 'POST', headers, body: JSON.stringify({ query }) });
      j = await res.json();
    } catch (e) {
      console.log(`  net error ${label}: ${e.message}; wait 15s`); await sleep(15000); continue;
    }
    const is429 = j.errors && JSON.stringify(j.errors).includes('429');
    if (j.data && !is429) return j.data;
    if (is429) { console.log(`  429 ${label} (try ${i + 1}/${retries}) wait ${waitMs / 1000}s`); await sleep(waitMs); continue; }
    throw new Error(`GQL error ${label}: ${JSON.stringify(j.errors).slice(0, 300)}`);
  }
  throw new Error(`exhausted retries ${label}`);
}

const PRODUCT_FIELDS = `id title shortDescription description minSellPrice minFullPrice rating ordersQuantity
  category { id title }
  characteristics { id title values { id title value } }
  photos { key link(trans: ORIGINAL) { high } }
  skuList { id sellPrice fullPrice availableAmount skuTitle barcode
    characteristicValues { id title value characteristic { id title } }
    photo { key link(trans: ORIGINAL) { high } } }`;

async function enumerateIds() {
  const ids = [];
  const limit = 60;
  let offset = 0, total = Infinity;
  while (offset < total) {
    const q = `query{ makeSearch(query:{shopId:"${SHOP_ID}", filters:[], showAdultContent:NONE, sort:BY_RELEVANCE_DESC, pagination:{offset:${offset},limit:${limit}}}){ total items{ catalogCard{ productId title } } } }`;
    const data = await gql(q, { label: `makeSearch@${offset}` });
    const m = data.makeSearch;
    total = m.total;
    for (const it of m.items) ids.push({ id: it.catalogCard.productId, title: it.catalogCard.title });
    console.log(`enumerated ${ids.length}/${total}`);
    offset += limit;
    if (m.items.length < limit) break;
    await sleep(2000);
  }
  return ids;
}

(async () => {
  console.log(`Enumerating shop ${SHOP_ID}...`);
  const ids = await enumerateIds();
  fs.writeFileSync(path.join(STAGE, 'ids.json'), JSON.stringify(ids, null, 2));
  console.log(`\nFetching details for ${ids.length} products...`);
  const out = { data: {} };
  let n = 0;
  for (const { id } of ids) {
    const data = await gql(`query{ productPage(id:${id}){ product { ${PRODUCT_FIELDS} } } }`, { label: `product ${id}`, waitMs: 30000, retries: 10 });
    out.data['p' + id] = data.productPage;
    n++;
    if (n % 5 === 0 || n === ids.length) console.log(`  fetched ${n}/${ids.length}`);
    await sleep(1500);
  }
  fs.writeFileSync(path.join(STAGE, 'raw.json'), JSON.stringify(out));
  console.log(`\nDONE: wrote raw.json with ${n} products.`);
})();
