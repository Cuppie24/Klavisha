// catalog-data.jsx — shared Klavisha catalog data + favorites/filter hook + icons
// Exports to window: PRODUCTS, CATEGORIES, STOCK, useCatalog, Heart, NEON

const NEON = '#00ff9d';

// Enthusiast mechanical keyboard catalogue. `hue` drives the abstract
// colour-block stand-in for each product photo. `shot` is the mono caption.
const PRODUCTS = [
  { id: 'k65', name: 'Klavisha 65 · Lunar',   cat: 'Kits',        tag: '65% · Aluminium',     price: '189', unit: '',          stock: 'in',  hue: 152, shot: 'keyboard render' },
  { id: 'bot', name: 'Botanica Keycaps',      cat: 'Keycaps',     tag: 'PBT · Dye-sub',       price: '145', unit: '',          stock: 'in',  hue: 96,  shot: 'keycap set' },
  { id: 'lin', name: 'Lumen Linear',          cat: 'Switches',    tag: 'Linear · 45g',        price: '0.65', unit: '/ switch', stock: 'low', hue: 168, shot: 'switch macro' },
  { id: 'tac', name: 'Tactile Brew',          cat: 'Switches',    tag: 'Tactile · 55g',       price: '0.70', unit: '/ switch', stock: 'in',  hue: 40,  shot: 'switch macro' },
  { id: 'f75', name: 'Frostbite 75',          cat: 'Kits',        tag: '75% · Hot-swap',      price: '159', unit: '',          stock: 'out', hue: 202, shot: 'keyboard render' },
  { id: 'cab', name: 'Coil Cable · Neon',     cat: 'Accessories', tag: 'Aviator · USB-C',     price: '42',  unit: '',          stock: 'in',  hue: 144, shot: 'cable shot' },
  { id: 'mat', name: 'Grid Deskmat XL',       cat: 'Accessories', tag: '900×400 · Stitched',  price: '29',  unit: '',          stock: 'in',  hue: 286, shot: 'deskmat flatlay' },
  { id: 'stb', name: 'Screw-in Stabilisers',  cat: 'Accessories', tag: 'PCB-mount · Set/4',   price: '19',  unit: '',          stock: 'in',  hue: 22,  shot: 'parts shot' },
];

const CATEGORIES = ['All', 'Kits', 'Keycaps', 'Switches', 'Accessories'];

const STOCK = {
  in:  { label: 'In stock',  tone: 'ok' },
  low: { label: 'Low stock', tone: 'warn' },
  out: { label: 'Sold out',  tone: 'off' },
};

// Heart icon — filled vs outline.
function Heart({ filled, size = 18, color = 'currentColor', stroke = 'currentColor', strokeWidth = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}
         stroke={filled ? 'none' : stroke} strokeWidth={strokeWidth} strokeLinejoin="round"
         style={{ display: 'block' }}>
      <path d="M12 20.5 4.2 12.7a4.8 4.8 0 0 1 6.8-6.8l1 1 1-1a4.8 4.8 0 0 1 6.8 6.8L12 20.5Z" />
    </svg>
  );
}

// Shared catalogue state: favourites + active category + derived list.
function useCatalog() {
  const [favs, setFavs] = React.useState({});
  const [cat, setCat] = React.useState('All');
  const toggle = (id) => setFavs((f) => ({ ...f, [id]: !f[id] }));
  const favCount = Object.values(favs).filter(Boolean).length;
  const items = cat === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.cat === cat);
  const countFor = (c) => (c === 'All' ? PRODUCTS.length : PRODUCTS.filter((p) => p.cat === c).length);
  return { favs, toggle, favCount, cat, setCat, items, countFor };
}

Object.assign(window, { NEON, PRODUCTS, CATEGORIES, STOCK, Heart, useCatalog });
