// catalog-products.jsx — full Klavisha catalogue (Editorial Dark build)
// Self-contained: products + categories + stock + Heart icon + image helper.
// Exports to window: CATS, CATALOG, STOCK2, Heart2, edtImg2

const CATS = [
  { id: 'kits',   name: 'Keyboard Kits', desc: 'Barebones & gasket-mount kits — bring your own switches and caps.' },
  { id: 'keycaps',name: 'Keycaps',       desc: 'PBT, ABS and resin profiles to finish the look and feel.' },
  { id: 'switches',name:'Switches',      desc: 'Linear, tactile and clicky — sold per switch, lubed on request.' },
  { id: 'access', name: 'Accessories',   desc: 'Cables, mats, tools and the small parts that hold a build together.' },
];

// price `unit` empty = each; '/ switch' = per-switch pricing.
const CATALOG = [
  // ── Keyboard Kits ──────────────────────────────────────────────
  { id: 'k65',  cat: 'kits', name: 'Klavisha 65 · Lunar',  tag: '65% · Aluminium',     price: '189', unit: '', stock: 'in',  hue: 152, shot: 'keyboard render' },
  { id: 'kf75', cat: 'kits', name: 'Frostbite 75',          tag: '75% · Hot-swap',      price: '159', unit: '', stock: 'out', hue: 202, shot: 'keyboard render' },
  { id: 'ktkl', cat: 'kits', name: 'Klavisha TKL · Slate',  tag: 'TKL · Gasket',        price: '219', unit: '', stock: 'in',  hue: 232, shot: 'keyboard render' },
  { id: 'k40',  cat: 'kits', name: 'Pocket 40',             tag: '40% · Brass plate',   price: '139', unit: '', stock: 'low', hue: 320, shot: 'keyboard render' },
  { id: 'k60',  cat: 'kits', name: 'Klavisha 60 · Carbon',  tag: '60% · Polycarb',      price: '129', unit: '', stock: 'in',  hue: 268, shot: 'keyboard render' },
  { id: 'k96',  cat: 'kits', name: 'Southpaw 1800',         tag: '96% · Aluminium',     price: '249', unit: '', stock: 'in',  hue: 32,  shot: 'keyboard render' },
  { id: 'kerg', cat: 'kits', name: 'Split Ergo · Halo',     tag: 'Split · Wireless',    price: '289', unit: '', stock: 'low', hue: 184, shot: 'keyboard render' },
  { id: 'k75a', cat: 'kits', name: 'Klavisha 75 · Aero',    tag: '75% · Top-mount',     price: '199', unit: '', stock: 'in',  hue: 104, shot: 'keyboard render' },
  { id: 'knum', cat: 'kits', name: 'Numpad · Mini',         tag: 'Macropad · Hot-swap', price: '69',  unit: '', stock: 'in',  hue: 52,  shot: 'macropad render' },

  // ── Keycaps ────────────────────────────────────────────────────
  { id: 'cbot', cat: 'keycaps', name: 'Botanica',           tag: 'PBT · Dye-sub',       price: '145', unit: '', stock: 'in',  hue: 96,  shot: 'keycap set' },
  { id: 'cmono',cat: 'keycaps', name: 'Monochrome MX',      tag: 'PBT · Doubleshot',    price: '119', unit: '', stock: 'in',  hue: 222, shot: 'keycap set' },
  { id: 'csun', cat: 'keycaps', name: 'Sunset Gradient',    tag: 'ABS · Doubleshot',    price: '109', unit: '', stock: 'low', hue: 42,  shot: 'keycap set' },
  { id: 'cnor', cat: 'keycaps', name: 'Nordic ISO',         tag: 'PBT · Dye-sub',       price: '129', unit: '', stock: 'in',  hue: 210, shot: 'keycap set' },
  { id: 'ccyb', cat: 'keycaps', name: 'Cyber Mecha',        tag: 'PBT · Dye-sub',       price: '139', unit: '', stock: 'out', hue: 162, shot: 'keycap set' },
  { id: 'cmilk',cat: 'keycaps', name: 'Milk Tea',           tag: 'PBT · Doubleshot',    price: '99',  unit: '', stock: 'in',  hue: 62,  shot: 'keycap set' },
  { id: 'cret', cat: 'keycaps', name: 'Retro Beige',        tag: 'PBT · Dye-sub',       price: '89',  unit: '', stock: 'in',  hue: 50,  shot: 'keycap set' },
  { id: 'cvap', cat: 'keycaps', name: 'Vaporwave',          tag: 'ABS · Doubleshot',    price: '115', unit: '', stock: 'in',  hue: 300, shot: 'keycap set' },
  { id: 'cart', cat: 'keycaps', name: 'Artisan · Resin Cap',tag: 'Resin · Single',      price: '35',  unit: '', stock: 'low', hue: 132, shot: 'artisan macro' },

  // ── Switches (per switch) ─────────────────────────────────────
  { id: 'slin', cat: 'switches', name: 'Lumen Linear',      tag: 'Linear · 45g',        price: '0.65', unit: '/ switch', stock: 'low', hue: 168, shot: 'switch macro' },
  { id: 'stac', cat: 'switches', name: 'Tactile Brew',      tag: 'Tactile · 55g',       price: '0.70', unit: '/ switch', stock: 'in',  hue: 40,  shot: 'switch macro' },
  { id: 'ssil', cat: 'switches', name: 'Cloud Silent',      tag: 'Silent linear · 42g', price: '0.85', unit: '/ switch', stock: 'in',  hue: 200, shot: 'switch macro' },
  { id: 'sthk', cat: 'switches', name: 'Thock Heavy',       tag: 'Linear · 63g',        price: '0.75', unit: '/ switch', stock: 'in',  hue: 282, shot: 'switch macro' },
  { id: 'sclk', cat: 'switches', name: 'Click Classic',     tag: 'Clicky · 50g',        price: '0.60', unit: '/ switch', stock: 'in',  hue: 20,  shot: 'switch macro' },
  { id: 'sgla', cat: 'switches', name: 'Glacier Frosted',   tag: 'Linear · 50g',        price: '0.90', unit: '/ switch', stock: 'out', hue: 190, shot: 'switch macro' },
  { id: 'seme', cat: 'switches', name: 'Emerald Tactile',   tag: 'Tactile · 67g',       price: '0.80', unit: '/ switch', stock: 'low', hue: 150, shot: 'switch macro' },
  { id: 'shon', cat: 'switches', name: 'Honey Linear',      tag: 'Linear · 48g',        price: '0.72', unit: '/ switch', stock: 'in',  hue: 70,  shot: 'switch macro' },
  { id: 'sspd', cat: 'switches', name: 'Speed Silver',      tag: 'Linear · 1.2mm',      price: '0.68', unit: '/ switch', stock: 'in',  hue: 240, shot: 'switch macro' },

  // ── Accessories ───────────────────────────────────────────────
  { id: 'acab', cat: 'access', name: 'Coil Cable · Neon',   tag: 'Aviator · USB-C',     price: '42', unit: '', stock: 'in',  hue: 144, shot: 'cable shot' },
  { id: 'amat', cat: 'access', name: 'Grid Deskmat XL',     tag: '900×400 · Stitched',  price: '29', unit: '', stock: 'in',  hue: 286, shot: 'deskmat flatlay' },
  { id: 'astb', cat: 'access', name: 'Screw-in Stabilisers',tag: 'PCB-mount · Set/4',   price: '19', unit: '', stock: 'in',  hue: 22,  shot: 'parts shot' },
  { id: 'apul', cat: 'access', name: 'Switch Puller',       tag: 'Steel · Anti-slip',   price: '9',  unit: '', stock: 'in',  hue: 350, shot: 'tool shot' },
  { id: 'alub', cat: 'access', name: 'Lube Station',        tag: 'Brush · Tray kit',    price: '24', unit: '', stock: 'low', hue: 90,  shot: 'kit flatlay' },
  { id: 'afoa', cat: 'access', name: 'Foam Kit',            tag: 'Case + plate foam',   price: '14', unit: '', stock: 'in',  hue: 110, shot: 'parts shot' },
  { id: 'acas', cat: 'access', name: 'Carrying Case',       tag: '65% · Hard shell',    price: '49', unit: '', stock: 'in',  hue: 250, shot: 'case shot' },
  { id: 'awgt', cat: 'access', name: 'Brass Weight',        tag: '65% · Mirror polish', price: '59', unit: '', stock: 'out', hue: 46,  shot: 'parts macro' },
  { id: 'atap', cat: 'access', name: 'Tape Mod Pack',       tag: 'PCB tape · ×3',       price: '7',  unit: '', stock: 'in',  hue: 172, shot: 'parts shot' },
];

const STOCK2 = {
  in:  { label: 'In stock',  tone: 'ok' },
  low: { label: 'Low stock', tone: 'warn' },
  out: { label: 'Sold out',  tone: 'off' },
};

function Heart2({ filled, size = 18, color = 'currentColor', stroke = 'currentColor', strokeWidth = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}
         stroke={filled ? 'none' : stroke} strokeWidth={strokeWidth} strokeLinejoin="round"
         style={{ display: 'block' }}>
      <path d="M12 20.5 4.2 12.7a4.8 4.8 0 0 1 6.8-6.8l1 1 1-1a4.8 4.8 0 0 1 6.8 6.8L12 20.5Z" />
    </svg>
  );
}

function edtImg2(hue) {
  return {
    background: `radial-gradient(135% 120% at 28% 22%, oklch(0.58 0.14 ${hue}) 0%, oklch(0.4 0.11 ${hue}) 42%, oklch(0.24 0.06 ${hue}) 100%)`,
  };
}

// Tiny cross-page store (favourites + cart count) persisted to localStorage so
// the catalogue and the product page stay in sync.
const Store = {
  FAV: 'klavisha.favs',
  CART: 'klavisha.cart',
  getFavs() { try { return JSON.parse(localStorage.getItem(Store.FAV)) || {}; } catch (e) { return {}; } },
  setFavs(o) { try { localStorage.setItem(Store.FAV, JSON.stringify(o)); } catch (e) {} },
  getCart() { return parseInt(localStorage.getItem(Store.CART), 10) || 0; },
  setCart(n) { try { localStorage.setItem(Store.CART, String(n)); } catch (e) {} },
};

function byId(id) { return CATALOG.find((p) => p.id === id); }
function related(id, n = 4) {
  const p = byId(id);
  if (!p) return [];
  return CATALOG.filter((q) => q.cat === p.cat && q.id !== id).slice(0, n);
}

Object.assign(window, { CATS, CATALOG, STOCK2, Heart2, edtImg2, Store, byId, related });
