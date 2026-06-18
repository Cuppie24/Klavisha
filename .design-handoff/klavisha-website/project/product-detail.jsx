// product-detail.jsx — Klavisha product page (Editorial Dark)
// Photo gallery + price block + description/specs + interaction buttons.

// ── per-category detail content (kept data-light; templated from the product) ──
const DETAIL = {
  kits: {
    shots: ['three-quarter', 'top-down', 'side profile', 'typing angle', 'in the box'],
    colorways: [
      { name: 'Lunar', hue: 152 }, { name: 'Slate', hue: 232 },
      { name: 'Carbon', hue: 268 }, { name: 'Ember', hue: 32 },
    ],
    blurb: (p) => `A ${p.tag.toLowerCase()} enthusiast kit, CNC-machined and ready to build. Gasket-mounted for a soft, even keystroke with a deep, muted profile straight out of the box — bring your own switches and caps to make it yours.`,
    story: (p) => `Tuned on QMK/VIA, it wakes instantly over wired or wireless and holds a charge for weeks. An internal weight and dual-layer foam give it a planted, low-pitched signature that's easy to live with all day.`,
    specs: (p) => [
      ['Layout', p.tag.split(' · ')[0]],
      ['Case', (p.tag.split(' · ')[1] || 'Aluminium')],
      ['Mount', 'Gasket · 5°'],
      ['Connectivity', 'USB-C · 2.4GHz · BT5'],
      ['PCB', 'Hot-swap · per-key RGB'],
      ['Weight', '1.4 kg'],
    ],
    box: ['Barebones kit (assembled)', 'Screw-in stabilisers', 'Spare gasket set', 'Hex & switch tools', 'USB-C coiled cable', 'Carry pouch'],
  },
  keycaps: {
    shots: ['hero set', 'side legends', 'novelties', 'on a board', 'in the tray'],
    colorways: [
      { name: 'Stock', hue: null }, { name: 'Olive', hue: 110 },
      { name: 'Ink', hue: 250 }, { name: 'Rose', hue: 350 },
    ],
    blurb: (p) => `${p.name} is a ${p.tag.toLowerCase()} keycap set in Cherry profile, sculpted for comfort and tuned for a crisp, consistent legend. Covers standard ANSI plus a sheet of novelties and accent caps.`,
    story: (p) => `Legends are sharp and shine-resistant, and the set ships in a reusable tray so the spares stay organised between builds.`,
    specs: (p) => [
      ['Profile', 'Cherry'],
      ['Material', p.tag.split(' · ')[0]],
      ['Process', p.tag.split(' · ')[1] || 'Dye-sub'],
      ['Count', '172 keys'],
      ['Compatibility', 'MX · ANSI / ISO'],
      ['Thickness', '1.5 mm'],
    ],
    box: ['Base kit (130 keys)', 'Novelty & accent caps', 'ISO / 40s support', 'Wire keycap puller', 'Reusable storage case'],
  },
  switches: {
    shots: ['macro', 'cutaway', 'underside', 'on PCB', 'bag of 70'],
    blurb: (p) => `${p.name} — a ${p.tag.toLowerCase()} switch with a smooth, rounded travel and a factory-lubed stem. Sold loose per switch so you can spec exactly the count your board needs.`,
    story: (p) => `Each batch is hand-sorted for consistency and lightly broken in, so they feel settled from the first keystroke — no spring crunch, no scratch.`,
    specs: (p) => [
      ['Type', p.tag.split(' · ')[0]],
      ['Actuation', p.tag.split(' · ')[1] || '45g'],
      ['Travel', '4.0 mm'],
      ['Stem', 'POM · factory lubed'],
      ['Housing', 'Nylon / PC'],
      ['Mount', '5-pin PCB'],
    ],
    box: ['Loose switches (your count)', 'Resealable anti-static bag', 'Spec & break-in card'],
  },
  access: {
    shots: ['product', 'detail', 'in use', 'packaging'],
    blurb: (p) => `${p.name} — ${p.tag.toLowerCase()}. A considered accessory built to the same standard as the rest of the bench: useful, durable, and quietly good-looking.`,
    story: (p) => `Designed in-house and tested on our own boards before it ever reaches the shelf.`,
    specs: (p) => [
      ['Type', p.tag.split(' · ')[0]],
      ['Detail', p.tag.split(' · ')[1] || '—'],
      ['Material', 'Mixed'],
      ['Compatibility', 'Universal'],
    ],
    box: ['The item', 'Spare hardware where relevant', 'Klavisha sticker'],
  },
};

function galleryBg(hue, i) {
  const pos = ['30% 22%', '70% 28%', '40% 72%', '62% 48%', '22% 80%'][i % 5];
  const l = [0.6, 0.55, 0.5, 0.62, 0.47][i % 5];
  return { background: `radial-gradient(135% 120% at ${pos}, oklch(${l} 0.14 ${hue}) 0%, oklch(${(l - 0.18).toFixed(2)} 0.11 ${hue}) 42%, oklch(0.22 0.06 ${hue}) 100%)` };
}

function fmt(n) { return n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }

if (!document.getElementById('pdp-styles')) {
  const s = document.createElement('style');
  s.id = 'pdp-styles';
  s.textContent = `
  :root{--neon:#00ff9d;--bg:#101012;--ink:#f4f4f2;--mut:#9a9a97;--line:rgba(255,255,255,.09);}
  *{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:'Hanken Grotesk',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
  .wrap{max-width:1320px;margin:0 auto;padding:0 40px;}
  a{color:inherit;}

  .navbar{position:sticky;top:0;z-index:50;background:rgba(16,16,18,.78);backdrop-filter:blur(14px) saturate(1.4);border-bottom:1px solid var(--line);}
  .nav-in{max-width:1320px;margin:0 auto;padding:0 40px;height:68px;display:flex;align-items:center;gap:18px;}
  .nav-back{display:flex;align-items:center;gap:9px;text-decoration:none;color:var(--mut);font-size:13.5px;font-weight:500;transition:.15s;}
  .nav-back:hover{color:var(--ink);}
  .nav-brand{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:18px;letter-spacing:-.02em;margin-left:6px;}
  .nav-brand b{color:var(--neon);}
  .nav-sp{flex:1;}
  .nav-pill{display:flex;align-items:center;gap:9px;border:1px solid rgba(255,255,255,.14);border-radius:100px;padding:8px 15px 8px 13px;font-size:13.5px;font-weight:500;background:rgba(255,255,255,.02);text-decoration:none;}
  .nav-pill .c{font-family:'Space Grotesk',sans-serif;font-weight:600;color:var(--neon);font-variant-numeric:tabular-nums;}
  .nav-pill.empty .c{color:var(--mut);}

  .pdp{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:56px;padding:40px 0 20px;}

  /* gallery */
  .gallery{position:sticky;top:88px;align-self:start;}
  .g-main{position:relative;border-radius:22px;overflow:hidden;aspect-ratio:3/4;box-shadow:0 1px 0 rgba(255,255,255,.06) inset, 0 30px 70px rgba(0,0,0,.45);}
  .g-main:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 60%,rgba(0,0,0,.4));}
  .g-cap{position:absolute;left:18px;bottom:16px;z-index:2;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.06em;color:rgba(255,255,255,.8);}
  .g-soldtag{position:absolute;top:16px;left:16px;z-index:2;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);color:#ff8b8b;padding:6px 12px;border-radius:100px;}
  .g-thumbs{display:flex;gap:12px;margin-top:14px;}
  .g-thumb{position:relative;flex:1;aspect-ratio:1/1;border-radius:13px;overflow:hidden;cursor:pointer;border:2px solid transparent;transition:border-color .15s,transform .15s;padding:0;background:none;}
  .g-thumb:hover{transform:translateY(-2px);}
  .g-thumb.on{border-color:var(--neon);}
  .g-thumb span{position:absolute;left:7px;bottom:5px;font-family:'JetBrains Mono',monospace;font-size:8.5px;color:rgba(255,255,255,.75);}

  /* info */
  .crumb{display:flex;align-items:center;gap:9px;font-size:13px;color:var(--mut);margin-bottom:18px;}
  .crumb a{text-decoration:none;}
  .crumb a:hover{color:var(--ink);}
  .crumb .neon{color:var(--neon);}
  .p-name{font-family:'Space Grotesk',sans-serif;font-size:clamp(34px,4.4vw,52px);font-weight:600;letter-spacing:-.025em;line-height:1;margin:0;}
  .p-specline{display:flex;align-items:center;gap:16px;margin-top:16px;flex-wrap:wrap;}
  .p-tag{font-size:15px;color:var(--mut);}
  .p-stock{display:flex;align-items:center;gap:8px;font-size:13.5px;color:var(--mut);}
  .p-sd{width:9px;height:9px;border-radius:50%;}
  .p-stock.ok .p-sd{background:var(--neon);} .p-stock.warn .p-sd{background:#ffce4a;} .p-stock.warn{color:#d9b24a;}
  .p-stock.off{color:#d98c8c;} .p-stock.off .p-sd{background:#e96868;}

  .priceblock{display:flex;align-items:baseline;gap:14px;margin:26px 0 8px;padding-bottom:24px;border-bottom:1px solid var(--line);}
  .price-big{font-family:'Space Grotesk',sans-serif;font-size:40px;font-weight:600;letter-spacing:-.02em;}
  .price-unit{font-size:15px;color:var(--mut);}
  .price-ship{margin-left:auto;font-size:12.5px;color:var(--mut);display:flex;align-items:center;gap:7px;}
  .price-ship .dot{width:6px;height:6px;border-radius:50%;background:var(--neon);}

  .p-desc{font-size:15.5px;line-height:1.62;color:#cfcfcb;margin:24px 0 28px;}

  .opt{margin-bottom:24px;}
  .opt-label{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--mut);font-weight:600;margin-bottom:12px;display:flex;justify-content:space-between;}
  .opt-label b{color:var(--ink);font-weight:600;letter-spacing:0;text-transform:none;font-size:13.5px;}
  .sw-row{display:flex;gap:12px;}
  .sw{width:38px;height:38px;border-radius:50%;cursor:pointer;border:2px solid rgba(255,255,255,.16);padding:0;position:relative;transition:transform .15s,border-color .15s;}
  .sw:hover{transform:scale(1.07);}
  .sw.on{border-color:var(--neon);box-shadow:0 0 0 4px rgba(0,255,157,.12);}

  .buyrow{display:flex;gap:12px;align-items:stretch;margin-top:8px;}
  .qty{display:flex;align-items:center;border:1px solid rgba(255,255,255,.14);border-radius:14px;overflow:hidden;background:rgba(255,255,255,.02);}
  .qty button{width:46px;background:none;border:none;color:var(--ink);font-size:22px;cursor:pointer;transition:.15s;font-family:inherit;}
  .qty button:hover{background:rgba(255,255,255,.06);color:var(--neon);}
  .qty input{width:54px;text-align:center;background:none;border:none;color:var(--ink);font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:600;-moz-appearance:textfield;}
  .qty input::-webkit-outer-spin-button,.qty input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
  .btn-cart{flex:1;background:var(--neon);color:#05140d;border:none;border-radius:14px;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:12px;transition:.15s;letter-spacing:-.01em;}
  .btn-cart:hover{filter:brightness(1.08);}
  .btn-cart .tot{opacity:.7;font-weight:500;}
  .btn-cart.added{background:#1c5a3f;color:var(--neon);}
  .btn-cart.sold{background:rgba(255,255,255,.06);color:var(--mut);cursor:not-allowed;}
  .btn-fav{width:56px;flex:0 0 auto;border:1px solid rgba(255,255,255,.16);border-radius:14px;background:rgba(255,255,255,.02);color:#cfcfcb;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s;}
  .btn-fav:hover{border-color:rgba(255,255,255,.3);color:#fff;}
  .btn-fav.on{color:var(--neon);border-color:rgba(0,255,157,.4);background:rgba(0,255,157,.08);}

  .reassure{display:flex;gap:24px;margin-top:22px;flex-wrap:wrap;}
  .reassure span{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--mut);}
  .reassure .dot{width:6px;height:6px;border-radius:50%;background:var(--neon);opacity:.8;}

  /* description */
  .p-description{margin-top:34px;padding-top:30px;border-top:1px solid var(--line);}
  .desc-h{font-family:'Space Grotesk',sans-serif;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:var(--neon);margin:0 0 16px;font-weight:600;}
  .p-description p{font-size:15.5px;line-height:1.64;color:#cfcfcb;margin:0 0 18px;}
  .p-description p:last-child{margin-bottom:0;}

  /* related */
  .related{padding:50px 0 90px;border-top:1px solid var(--line);}
  .related-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:28px;}
  .related-head h3{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:600;letter-spacing:-.02em;margin:0;}
  .related-head a{font-size:14px;color:var(--mut);text-decoration:none;}
  .related-head a:hover{color:var(--neon);}
  .rel-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;}
  .rel-card{text-decoration:none;color:inherit;transition:transform .2s;}
  .rel-card:hover{transform:translateY(-4px);}
  .rel-img{border-radius:14px;aspect-ratio:3/4;position:relative;overflow:hidden;}
  .rel-meta{display:flex;justify-content:space-between;align-items:baseline;margin-top:12px;gap:10px;}
  .rel-name{font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:600;letter-spacing:-.01em;}
  .rel-price{font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;white-space:nowrap;}

  @media (max-width:900px){
    .pdp{grid-template-columns:1fr;gap:34px;}
    .gallery{position:static;}
    .rel-grid{grid-template-columns:repeat(2,1fr);}
  }
  @media (max-width:680px){.wrap,.nav-in{padding-left:22px;padding-right:22px;}.nav-brand{display:none;}}
  `;
  document.head.appendChild(s);
}

function ProductPage() {
  const params = new URLSearchParams(location.search);
  const product = byId(params.get('id')) || CATALOG[0];
  const meta = DETAIL[product.cat];
  const out = product.stock === 'out';
  const st = STOCK2[product.stock];
  const catName = (CATS.find((c) => c.id === product.cat) || {}).name;

  const hasColor = !!meta.colorways;

  const [colorway, setColorway] = React.useState(0);
  const baseHue = hasColor && meta.colorways[colorway].hue != null ? meta.colorways[colorway].hue : product.hue;

  const [qty, setQty] = React.useState(1);

  const [shot, setShot] = React.useState(0);
  const [favs, setFavs] = React.useState(() => Store.getFavs());
  const fav = !!favs[product.id];
  const toggleFav = () => setFavs((f) => { const n = { ...f, [product.id]: !f[product.id] }; Store.setFavs(n); return n; });
  const favCount = Object.values(favs).filter(Boolean).length;

  const [cart, setCart] = React.useState(() => Store.getCart());
  const [added, setAdded] = React.useState(false);
  const addToCart = () => {
    if (out) return;
    const n = cart + qty; setCart(n); Store.setCart(n);
    setAdded(true); setTimeout(() => setAdded(false), 1600);
  };

  const unitPrice = parseFloat(product.price);
  const subtotal = unitPrice * qty;

  return (
    <React.Fragment>
      <SiteHeader activePage="catalog" favCount={favCount} cartCount={cart} />

      <main className="wrap">
        <div className="pdp">
          {/* gallery */}
          <div className="gallery">
            <div className="g-main" style={galleryBg(baseHue, shot)}>
              {out && <span className="g-soldtag">Sold out</span>}
              <span className="g-cap">/ {meta.shots[shot]}</span>
            </div>
            <div className="g-thumbs">
              {meta.shots.map((sname, i) => (
                <button key={i} className={'g-thumb' + (shot === i ? ' on' : '')} style={galleryBg(baseHue, i)} onClick={() => setShot(i)} aria-label={sname}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* info */}
          <div className="info">
            <div className="crumb">
              <a href="Klavisha Catalog.html">Catalogue</a><span>/</span>
              <a href={'Klavisha Catalog.html#sec-' + product.cat} className="neon">{catName}</a>
            </div>
            <h1 className="p-name">{product.name}</h1>
            <div className="p-specline">
              <span className="p-tag">{product.tag}</span>
              <span className={'p-stock ' + st.tone}><span className="p-sd"></span>{st.label}</span>
            </div>

            <div className="priceblock">
              <span className="price-big">${fmt(unitPrice)}</span>
              <span className="price-unit">{product.unit ? product.unit : 'each'}</span>
              <span className="price-ship"><span className="dot"></span>Free shipping over $150</span>
            </div>

            {hasColor && (
              <div className="opt">
                <div className="opt-label">Colourway <b>{meta.colorways[colorway].name}</b></div>
                <div className="sw-row">
                  {meta.colorways.map((c, i) => (
                    <button key={i} className={'sw' + (colorway === i ? ' on' : '')}
                            style={galleryBg(c.hue != null ? c.hue : product.hue, 0)}
                            onClick={() => setColorway(i)} aria-label={c.name}></button>
                  ))}
                </div>
              </div>
            )}

            <div className="opt">
              <div className="opt-label">Quantity</div>
              <div className="buyrow">
                <div className="qty">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
                  <input type="number" value={qty} min="1" onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))} />
                  <button onClick={() => setQty((q) => q + 1)} aria-label="Increase">+</button>
                </div>
                <button className={'btn-cart' + (out ? ' sold' : '') + (added ? ' added' : '')} onClick={addToCart} disabled={out}>
                  {out ? 'Sold out' : added ? 'Added ✓' : <React.Fragment>Add to cart <span className="tot">· ${fmt(subtotal)}</span></React.Fragment>}
                </button>
                <button className={'btn-fav' + (fav ? ' on' : '')} onClick={toggleFav} aria-label="Favourite">
                  <Heart2 filled={fav} size={22} color="#00ff9d" stroke="#cfcfcb" />
                </button>
              </div>
            </div>

            <div className="reassure">
              <span><span className="dot"></span>Ships in 2–3 days</span>
              <span><span className="dot"></span>30-day returns</span>
              <span><span className="dot"></span>2-year warranty</span>
            </div>

            <div className="p-description">
              <h3 className="desc-h">Description</h3>
              <p>{meta.blurb(product)}</p>
              <p>{meta.story(product)}</p>
              <p>Every Klavisha order is bench-checked and hand-packed in our workshop before it ships.</p>
            </div>
          </div>
        </div>

        {/* related */}
        <div className="related">
          <div className="related-head">
            <h3>More in {catName}</h3>
            <a href={'Klavisha Catalog.html#sec-' + product.cat}>View all →</a>
          </div>
          <div className="rel-grid">
            {related(product.id, 4).map((r) => (
              <a className="rel-card" key={r.id} href={'Klavisha Product.html?id=' + r.id}>
                <div className="rel-img" style={edtImg2(r.hue)}></div>
                <div className="rel-meta">
                  <span className="rel-name">{r.name}</span>
                  <span className="rel-price">${r.price}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ProductPage />);
