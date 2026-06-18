// landing.jsx — Klavisha home / landing page (Editorial Dark)
// Reuses CATALOG, CATS, Heart2, edtImg2, Store, SiteHeader, SiteFooter.

const FEATURED = ['k65', 'cbot', 'sthk', 'acab']; // bench favourites
const CAT_HUE = { kits: 152, keycaps: 96, switches: 200, access: 280 };

if (!document.getElementById('lp-styles')) {
  const s = document.createElement('style');
  s.id = 'lp-styles';
  s.textContent = `
  :root{--neon:#00ff9d;--bg:#101012;--ink:#f4f4f2;--mut:#9a9a97;--line:rgba(255,255,255,.09);}
  *{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:'Hanken Grotesk',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
  .wrap{max-width:1320px;margin:0 auto;padding:0 40px;}
  .lp-btn{padding:15px 26px;border-radius:13px;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:15.5px;
    text-decoration:none;display:inline-flex;align-items:center;gap:10px;transition:.15s;cursor:pointer;border:none;letter-spacing:-.01em;}
  .lp-btn.primary{background:var(--neon);color:#05140d;}
  .lp-btn.primary:hover{filter:brightness(1.08);transform:translateY(-1px);}
  .lp-btn.ghost{border:1px solid rgba(255,255,255,.18);color:#f4f4f2;background:transparent;}
  .lp-btn.ghost:hover{border-color:rgba(255,255,255,.42);}

  /* hero */
  .lp-hero{display:grid;grid-template-columns:1.08fr .92fr;gap:56px;align-items:center;padding:72px 0 84px;}
  .lp-kicker{font-size:12px;letter-spacing:.34em;text-transform:uppercase;color:var(--neon);font-weight:600;}
  .lp-h1{font-family:'Space Grotesk',sans-serif;font-size:clamp(46px,6.4vw,82px);font-weight:600;letter-spacing:-.03em;
    line-height:.98;margin:22px 0 0;}
  .lp-h1 b{color:var(--neon);font-weight:600;}
  .lp-sub{font-size:17.5px;line-height:1.55;color:#c4c4c0;max-width:520px;margin:26px 0 0;}
  .lp-cta{display:flex;gap:14px;margin-top:34px;flex-wrap:wrap;}
  .lp-stats{display:flex;gap:34px;margin-top:42px;padding-top:26px;border-top:1px solid var(--line);flex-wrap:wrap;}
  .lp-stat .v{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:600;letter-spacing:-.02em;}
  .lp-stat .v b{color:var(--neon);}
  .lp-stat .k{font-size:13px;color:var(--mut);margin-top:3px;}
  .lp-hero-img{position:relative;border-radius:24px;overflow:hidden;aspect-ratio:4/5;
    box-shadow:0 1px 0 rgba(255,255,255,.06) inset,0 40px 90px rgba(0,0,0,.5);}
  .lp-hero-img:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(0,0,0,.4));}
  .lp-hero-cap{position:absolute;left:20px;bottom:18px;z-index:2;font-family:'JetBrains Mono',monospace;font-size:11.5px;
    letter-spacing:.05em;color:rgba(255,255,255,.8);}
  .lp-hero-badge{position:absolute;top:20px;left:20px;z-index:2;background:rgba(5,7,6,.5);backdrop-filter:blur(8px);
    border:1px solid rgba(255,255,255,.14);border-radius:100px;padding:8px 15px;font-size:12.5px;font-weight:500;
    display:flex;align-items:center;gap:8px;}
  .lp-hero-badge .dot{width:7px;height:7px;border-radius:50%;background:var(--neon);box-shadow:0 0 10px var(--neon);}

  /* section heads */
  .lp-sec{padding:60px 0;border-top:1px solid var(--line);}
  .lp-sechead{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:34px;flex-wrap:wrap;}
  .lp-sectitle{font-family:'Space Grotesk',sans-serif;font-size:34px;font-weight:600;letter-spacing:-.025em;margin:0;line-height:1;}
  .lp-seclabel{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--neon);font-weight:600;margin-bottom:12px;}
  .lp-seclink{font-size:14.5px;color:var(--mut);text-decoration:none;transition:.15s;white-space:nowrap;}
  .lp-seclink:hover{color:var(--neon);}

  /* category tiles */
  .lp-cats{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
  .lp-cat{position:relative;border-radius:18px;overflow:hidden;aspect-ratio:3/4;text-decoration:none;color:#fff;
    display:flex;flex-direction:column;justify-content:flex-end;padding:22px;transition:transform .2s;}
  .lp-cat:hover{transform:translateY(-5px);}
  .lp-cat:before{content:'';position:absolute;inset:0;z-index:0;}
  .lp-cat:after{content:'';position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(0,0,0,.05) 30%,rgba(0,0,0,.62));}
  .lp-cat>*{position:relative;z-index:2;}
  .lp-cat .num{font-family:'JetBrains Mono',monospace;font-size:11px;color:rgba(255,255,255,.7);margin-bottom:auto;}
  .lp-cat .nm{font-family:'Space Grotesk',sans-serif;font-size:23px;font-weight:600;letter-spacing:-.01em;}
  .lp-cat .ct{font-size:13px;color:rgba(255,255,255,.72);margin-top:5px;display:flex;align-items:center;gap:8px;}
  .lp-cat .go{margin-top:14px;font-size:13.5px;font-weight:600;color:var(--neon);}

  /* product cards */
  .lp-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;}
  .lp-card{display:flex;flex-direction:column;text-decoration:none;color:inherit;transition:transform .2s;}
  .lp-card:hover{transform:translateY(-5px);}
  .lp-imgwrap{position:relative;border-radius:18px;overflow:hidden;aspect-ratio:3/4;box-shadow:0 1px 0 rgba(255,255,255,.06) inset;}
  .lp-imgwrap:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 60%,rgba(0,0,0,.4));}
  .lp-shot{position:absolute;left:15px;bottom:13px;z-index:2;font-family:'JetBrains Mono',monospace;font-size:10.5px;color:rgba(255,255,255,.78);}
  .lp-heart{position:absolute;top:12px;right:12px;z-index:3;width:38px;height:38px;border-radius:50%;border:none;
    background:rgba(10,12,11,.5);backdrop-filter:blur(8px);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s;}
  .lp-heart:hover{background:rgba(10,12,11,.75);transform:scale(1.06);}
  .lp-heart.on{color:var(--neon);background:rgba(0,255,157,.12);}
  .lp-meta{padding:16px 4px 0;display:flex;justify-content:space-between;align-items:baseline;gap:12px;}
  .lp-name{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:600;letter-spacing:-.01em;line-height:1.12;}
  .lp-sub2{font-size:13px;color:var(--mut);margin-top:5px;}
  .lp-price{font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:600;white-space:nowrap;}
  .lp-price .u{font-size:11px;font-weight:400;color:#8c8c89;margin-left:2px;font-family:'Hanken Grotesk',sans-serif;}

  /* build spotlight */
  .lp-spot{display:grid;grid-template-columns:1fr 1fr;gap:0;border-radius:24px;overflow:hidden;border:1px solid var(--line);background:#16161a;}
  .lp-spot-img{position:relative;min-height:420px;}
  .lp-spot-img .cap{position:absolute;left:20px;bottom:18px;font-family:'JetBrains Mono',monospace;font-size:11px;color:rgba(255,255,255,.8);}
  .lp-spot-body{padding:56px 52px;display:flex;flex-direction:column;justify-content:center;}
  .lp-spot-body .lp-seclabel{margin-bottom:16px;}
  .lp-spot-body h3{font-family:'Space Grotesk',sans-serif;font-size:32px;font-weight:600;letter-spacing:-.02em;margin:0 0 18px;line-height:1.05;}
  .lp-spot-body p{font-size:16px;line-height:1.6;color:#c4c4c0;margin:0 0 18px;}
  .lp-spot-steps{display:flex;flex-direction:column;gap:11px;margin:6px 0 30px;}
  .lp-spot-steps span{display:flex;align-items:center;gap:12px;font-size:14.5px;color:#cfcfcb;}
  .lp-spot-steps .dot{width:7px;height:7px;border-radius:50%;background:var(--neon);flex:0 0 auto;}

  /* promise strip */
  .lp-promise{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;padding:46px 0 64px;}
  .lp-promise .it{display:flex;flex-direction:column;gap:7px;}
  .lp-promise .it h4{font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:600;margin:0;letter-spacing:-.01em;}
  .lp-promise .it p{font-size:14px;color:var(--mut);margin:0;line-height:1.5;}
  .lp-promise .it .ic{width:34px;height:34px;border-radius:9px;background:rgba(0,255,157,.1);border:1px solid rgba(0,255,157,.3);
    display:flex;align-items:center;justify-content:center;color:var(--neon);margin-bottom:6px;}

  @media (max-width:900px){
    .lp-hero{grid-template-columns:1fr;gap:38px;}
    .lp-cats,.lp-grid{grid-template-columns:repeat(2,1fr);}
    .lp-spot{grid-template-columns:1fr;}
    .lp-spot-img{min-height:280px;}
    .lp-spot-body{padding:40px 32px;}
    .lp-promise{grid-template-columns:1fr;gap:20px;}
  }
  @media (max-width:680px){.wrap{padding-left:22px;padding-right:22px;}.lp-cats,.lp-grid{grid-template-columns:1fr 1fr;}}
  `;
  document.head.appendChild(s);
}

function FeatCard({ p, fav, onToggle }) {
  return (
    <a className="lp-card" href={'Klavisha Product.html?id=' + p.id}>
      <div className="lp-imgwrap" style={edtImg2(p.hue)}>
        <button className={'lp-heart' + (fav ? ' on' : '')} aria-label="Favourite"
                onClick={(e) => { e.preventDefault(); onToggle(p.id); }}>
          <Heart2 filled={fav} size={18} color="#00ff9d" stroke="#fff" />
        </button>
        <span className="lp-shot">/ {p.shot}</span>
      </div>
      <div className="lp-meta">
        <div>
          <div className="lp-name">{p.name}</div>
          <div className="lp-sub2">{p.tag}</div>
        </div>
        <div className="lp-price">${p.price}<span className="u">{p.unit}</span></div>
      </div>
    </a>
  );
}

function Landing() {
  const [favs, setFavs] = React.useState(() => Store.getFavs());
  const [cart] = React.useState(() => Store.getCart());
  const toggle = (id) => setFavs((f) => { const n = { ...f, [id]: !f[id] }; Store.setFavs(n); return n; });
  const favCount = Object.values(favs).filter(Boolean).length;
  const countFor = (id) => CATALOG.filter((p) => p.cat === id).length;
  const featured = FEATURED.map((id) => byId(id)).filter(Boolean);

  return (
    <React.Fragment>
      <SiteHeader favCount={favCount} cartCount={cart} />

      {/* hero */}
      <section className="wrap lp-hero">
        <div className="lp-hero-text">
          <div className="lp-kicker">Mechanical Keyboard Works</div>
          <h1 className="lp-h1">Type on something<br />you actually built<b>.</b></h1>
          <p className="lp-sub">Kits, keycaps, switches and the small parts — curated, bench-tested and packed in our workshop. Everything you need to make a board that sounds and feels like yours.</p>
          <div className="lp-cta">
            <a className="lp-btn primary" href="Klavisha Catalog.html">Shop the catalogue</a>
            <a className="lp-btn ghost" href="#build">Book a build →</a>
          </div>
          <div className="lp-stats">
            <div className="lp-stat"><div className="v"><b>{CATALOG.length}</b></div><div className="k">Products in stock</div></div>
            <div className="lp-stat"><div className="v"><b>{CATS.length}</b></div><div className="k">Categories</div></div>
            <div className="lp-stat"><div className="v">2yr</div><div className="k">Warranty</div></div>
          </div>
        </div>
        <div className="lp-hero-img" style={edtImg2(150)}>
          <span className="lp-hero-badge"><span className="dot"></span>New · Klavisha 65 · Lunar</span>
          <span className="lp-hero-cap">/ hero — KLV 65 build</span>
        </div>
      </section>

      {/* categories */}
      <section className="wrap lp-sec">
        <div className="lp-sechead">
          <div>
            <div className="lp-seclabel">Browse</div>
            <h2 className="lp-sectitle">Shop by category</h2>
          </div>
          <a className="lp-seclink" href="Klavisha Catalog.html">All products →</a>
        </div>
        <div className="lp-cats">
          {CATS.map((c, i) => (
            <a className="lp-cat" key={c.id} href={'Klavisha Catalog.html#sec-' + c.id}>
              <div className="lp-cat-bg" style={{ ...edtImg2(CAT_HUE[c.id]), position: 'absolute', inset: 0, zIndex: 0 }}></div>
              <div className="num">{String(i + 1).padStart(2, '0')}</div>
              <div className="nm">{c.name}</div>
              <div className="ct">{countFor(c.id)} products</div>
              <div className="go">Browse →</div>
            </a>
          ))}
        </div>
      </section>

      {/* featured */}
      <section className="wrap lp-sec">
        <div className="lp-sechead">
          <div>
            <div className="lp-seclabel">This week</div>
            <h2 className="lp-sectitle">Bench favourites</h2>
          </div>
          <a className="lp-seclink" href="Klavisha Catalog.html">View all →</a>
        </div>
        <div className="lp-grid">
          {featured.map((p) => <FeatCard key={p.id} p={p} fav={!!favs[p.id]} onToggle={toggle} />)}
        </div>
      </section>

      {/* build spotlight */}
      <section className="wrap lp-sec" id="build">
        <div className="lp-spot">
          <div className="lp-spot-img" style={edtImg2(176)}>
            <span className="cap">/ build service — assembled &amp; tuned</span>
          </div>
          <div className="lp-spot-body">
            <div className="lp-seclabel">The Build Service</div>
            <h3>You pick the parts.<br />We make it sing.</h3>
            <p>Not ready to solder? Send us a kit, switches and caps — or pick from the catalogue — and our team assembles, lubes, tunes and bench-tests the whole board before it ships to your door.</p>
            <div className="lp-spot-steps">
              <span><span className="dot"></span>Choose your kit, switches &amp; keycaps</span>
              <span><span className="dot"></span>We assemble, lube &amp; stabilise</span>
              <span><span className="dot"></span>Sound-tested and shipped in 5–7 days</span>
            </div>
            <a className="lp-btn primary" href="Klavisha Catalog.html#sec-kits" style={{ alignSelf: 'flex-start' }}>Start a build →</a>
          </div>
        </div>
      </section>

      {/* promise */}
      <section className="wrap lp-promise">
        <div className="it">
          <div className="ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
          <h4>Bench-tested</h4>
          <p>Every board and batch is checked and hand-packed before it leaves the workshop.</p>
        </div>
        <div className="it">
          <div className="ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="15" height="12" rx="2"/><path d="M16 9h4l3 3v6h-7"/><circle cx="6" cy="19" r="1.6"/><circle cx="18" cy="19" r="1.6"/></svg></div>
          <h4>Free shipping over $150</h4>
          <p>Fast, tracked delivery worldwide, with carbon-neutral options at checkout.</p>
        </div>
        <div className="it">
          <div className="ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg></div>
          <h4>2-year warranty</h4>
          <p>We stand behind the hardware. Real support from people who build too.</p>
        </div>
      </section>

      <SiteFooter />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Landing />);
