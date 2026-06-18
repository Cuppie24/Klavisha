// catalog-page.jsx — Klavisha scrollable catalogue (Editorial Dark)
// Sticky category nav with scroll-spy highlight + click-to-scroll, live favourites counter.

const BAR_H = 64; // on-page category nav bar height
const NAV_TOP = typeof HEADER_H !== 'undefined' ? HEADER_H : 64; // global header height it sticks under
const STICK = NAV_TOP + BAR_H; // combined sticky offset (header + category nav)

if (!document.getElementById('cat-styles')) {
  const s = document.createElement('style');
  s.id = 'cat-styles';
  s.textContent = `
  :root{--neon:#00ff9d;--bg:#101012;--ink:#f4f4f2;--mut:#9a9a97;--line:rgba(255,255,255,.09);}
  *{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:'Hanken Grotesk',system-ui,sans-serif;
    -webkit-font-smoothing:antialiased;}
  .wrap{max-width:1320px;margin:0 auto;padding:0 40px;}

  /* hero */
  .hero{padding:64px 0 40px;}
  .hero-kicker{font-size:12px;letter-spacing:.34em;text-transform:uppercase;color:var(--neon);font-weight:600;}
  .hero-mark{font-family:'Space Grotesk',sans-serif;font-size:clamp(56px,9vw,104px);font-weight:600;
    letter-spacing:-.03em;line-height:.88;margin:18px 0 0;}
  .hero-mark b{color:var(--neon);}
  .hero-row{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-top:26px;flex-wrap:wrap;}
  .hero-tag{font-size:17px;color:var(--mut);max-width:520px;line-height:1.5;}
  .hero-count{font-family:'Space Grotesk',sans-serif;font-size:15px;color:var(--ink);white-space:nowrap;}
  .hero-count b{color:var(--neon);}

  /* sticky nav */
  .navbar{position:sticky;top:${NAV_TOP}px;z-index:50;background:rgba(16,16,18,.78);backdrop-filter:blur(14px) saturate(1.4);
    border-bottom:1px solid var(--line);border-top:1px solid var(--line);}
  .nav-in{max-width:1320px;margin:0 auto;padding:0 40px;height:${BAR_H}px;display:flex;align-items:center;gap:16px;}
  .nav-lab{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;
    color:var(--mut);flex:0 0 auto;}
  .nav-cats{display:flex;gap:8px;flex:1 1 auto;min-width:0;overflow-x:auto;scrollbar-width:none;padding:0 4px;}
  .nav-cats::-webkit-scrollbar{display:none;}
  .nav-chip{flex:0 0 auto;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:100px;
    padding:8px 16px;font-size:13.5px;font-weight:500;color:#bdbdba;cursor:pointer;transition:.16s;
    display:flex;gap:8px;align-items:center;white-space:nowrap;font-family:inherit;}
  .nav-chip:hover{color:#fff;border-color:rgba(255,255,255,.22);}
  .nav-chip .n{font-size:11px;opacity:.55;font-variant-numeric:tabular-nums;}
  .nav-chip.on{background:var(--neon);border-color:var(--neon);color:#05140d;}
  .nav-chip.on .n{opacity:.7;}
  .nav-fav{flex:0 0 auto;display:flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,.14);
    border-radius:100px;padding:8px 16px 8px 13px;color:var(--ink);font-size:13.5px;font-weight:500;cursor:pointer;
    background:rgba(255,255,255,.02);transition:.16s;font-family:inherit;}
  .nav-fav:hover{border-color:rgba(255,255,255,.28);}
  .nav-fav .c{font-family:'Space Grotesk',sans-serif;font-weight:600;color:var(--neon);font-size:14px;
    font-variant-numeric:tabular-nums;}
  .nav-fav.empty .c{color:var(--mut);}

  /* sections */
  .section{padding:54px 0 8px;scroll-margin-top:${STICK}px;border-top:1px solid var(--line);}
  .section:first-of-type{border-top:none;}
  .sec-head{display:flex;align-items:flex-start;justify-content:space-between;gap:32px;margin-bottom:34px;flex-wrap:wrap;}
  .sec-left{display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;}
  .sec-num{font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--neon);letter-spacing:.1em;}
  .sec-title{font-family:'Space Grotesk',sans-serif;font-size:38px;font-weight:600;letter-spacing:-.02em;margin:0;line-height:1;}
  .sec-count{font-size:14px;color:var(--mut);}
  .sec-desc{font-size:15px;color:var(--mut);max-width:440px;line-height:1.5;margin:0;text-align:right;flex:1 1 280px;}

  /* grid + cards */
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(286px,1fr));gap:26px 24px;}
  .card{display:flex;flex-direction:column;cursor:pointer;transition:transform .2s;text-decoration:none;color:inherit;}
  .card:hover{transform:translateY(-5px);}
  .imgwrap{position:relative;border-radius:18px;overflow:hidden;aspect-ratio:3/4;box-shadow:0 1px 0 rgba(255,255,255,.06) inset;}
  .imgwrap:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(0,0,0,.45));}
  .shot{position:absolute;left:16px;bottom:14px;z-index:2;font-family:'JetBrains Mono',monospace;font-size:10.5px;
    letter-spacing:.06em;color:rgba(255,255,255,.78);}
  .heart{position:absolute;top:13px;right:13px;z-index:3;width:40px;height:40px;border-radius:50%;border:none;
    background:rgba(10,12,11,.5);backdrop-filter:blur(8px);color:#fff;cursor:pointer;display:flex;align-items:center;
    justify-content:center;transition:.16s;}
  .heart:hover{background:rgba(10,12,11,.75);transform:scale(1.06);}
  .heart.on{color:var(--neon);background:rgba(0,255,157,.12);}
  .soldtag{position:absolute;top:14px;left:14px;z-index:2;font-size:11px;font-weight:600;letter-spacing:.1em;
    text-transform:uppercase;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);color:#ff8b8b;padding:6px 11px;border-radius:100px;}
  .meta{padding:18px 4px 0;display:flex;flex-direction:column;gap:6px;}
  .m-row{display:flex;justify-content:space-between;align-items:baseline;gap:14px;}
  .m-name{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:600;letter-spacing:-.01em;line-height:1.1;}
  .m-price{font-family:'Space Grotesk',sans-serif;font-size:19px;font-weight:600;white-space:nowrap;}
  .m-price .u{font-size:11px;font-weight:400;color:#8c8c89;margin-left:3px;font-family:'Hanken Grotesk',sans-serif;}
  .m-sub{display:flex;align-items:center;gap:12px;margin-top:2px;}
  .m-tag{font-size:13px;color:var(--mut);}
  .m-stock{display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--mut);}
  .m-sd{width:8px;height:8px;border-radius:50%;}
  .m-stock.ok .m-sd{background:var(--neon);}
  .m-stock.warn .m-sd{background:#ffce4a;}
  .m-stock.off{color:#d98c8c;}
  .m-stock.off .m-sd{background:#e96868;}
  .card.soldout .imgwrap{filter:saturate(.5) brightness(.7);}

  /* controls toolbar */
  .toolbar{display:flex;align-items:center;justify-content:space-between;gap:28px 36px;flex-wrap:wrap;
    padding:26px 0 6px;margin-top:30px;border-top:1px solid var(--line);}
  .tb-group{display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
  .tb-label{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--mut);}
  .tb-sort{display:flex;gap:4px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:100px;padding:4px;}
  .tb-sort button{background:none;border:none;font-family:inherit;font-size:13px;font-weight:500;color:#bdbdba;cursor:pointer;
    padding:7px 15px;border-radius:100px;transition:.15s;white-space:nowrap;font-variant-numeric:tabular-nums;}
  .tb-sort button:hover{color:#fff;}
  .tb-sort button.on{background:var(--neon);color:#05140d;}
  .tb-price{display:flex;align-items:center;gap:16px;}
  .range{position:relative;width:230px;height:30px;display:flex;align-items:center;}
  .range .track{position:absolute;left:0;right:0;height:4px;border-radius:4px;background:rgba(255,255,255,.12);}
  .range .fill{position:absolute;height:4px;border-radius:4px;background:var(--neon);}
  .range input[type=range]{position:absolute;left:0;width:100%;margin:0;height:30px;background:none;pointer-events:none;
    -webkit-appearance:none;appearance:none;}
  .range input[type=range]:focus{outline:none;}
  .range input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;pointer-events:auto;width:18px;height:18px;
    border-radius:50%;background:var(--ink);border:3px solid var(--neon);cursor:grab;box-shadow:0 1px 5px rgba(0,0,0,.55);}
  .range input[type=range]::-webkit-slider-thumb:active{cursor:grabbing;}
  .range input[type=range]::-moz-range-thumb{pointer-events:auto;width:18px;height:18px;border-radius:50%;background:var(--ink);
    border:3px solid var(--neon);cursor:grab;box-shadow:0 1px 5px rgba(0,0,0,.55);}
  .tb-readout{font-family:'Space Grotesk',sans-serif;font-size:14.5px;font-weight:600;font-variant-numeric:tabular-nums;
    white-space:nowrap;min-width:118px;}
  .tb-readout .u{color:var(--mut);font-weight:500;}
  .tb-inputs{display:flex;align-items:center;gap:9px;}
  .tb-inputs .u{color:var(--mut);font-weight:500;}
  .pricebox{display:flex;align-items:center;gap:2px;background:rgba(255,255,255,.03);border:1px solid var(--line);
    border-radius:10px;padding:7px 11px;transition:.15s;}
  .pricebox:focus-within{border-color:var(--neon);background:rgba(0,255,157,.05);}
  .pricebox .d{font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:var(--mut);}
  .pricebox input{width:52px;background:none;border:none;outline:none;color:var(--ink);font-family:'Space Grotesk',sans-serif;
    font-size:14.5px;font-weight:600;font-variant-numeric:tabular-nums;padding:0;-moz-appearance:textfield;appearance:textfield;}
  .pricebox input::-webkit-outer-spin-button,.pricebox input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
  .tb-reset{background:none;border:1px solid var(--line);color:var(--mut);border-radius:100px;padding:7px 15px;
    font-family:inherit;font-size:12.5px;font-weight:500;cursor:pointer;transition:.15s;}
  .tb-reset:hover{color:#fff;border-color:rgba(255,255,255,.28);}
  .tb-results{font-size:13px;color:var(--mut);font-variant-numeric:tabular-nums;}
  .tb-results b{color:var(--ink);font-weight:600;}
  /* category nav + filter dropdown */
  .nav-cats{flex:1 1 auto;}
  .filter-anchor{position:relative;flex:0 0 auto;}
  .filter-btn{display:flex;align-items:center;gap:9px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.14);
    border-radius:100px;padding:8px 15px;color:var(--ink);font-family:inherit;font-size:13.5px;font-weight:500;cursor:pointer;
    transition:.15s;white-space:nowrap;}
  .filter-btn:hover{border-color:rgba(255,255,255,.3);}
  .filter-btn.act,.filter-btn.open{border-color:var(--neon);color:#fff;}
  .filter-btn svg{display:block;color:var(--neon);}
  .fb-dot{min-width:18px;height:18px;padding:0 5px;border-radius:100px;background:var(--neon);color:#05140d;
    font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;
    font-variant-numeric:tabular-nums;}
  .filter-panel{position:absolute;top:calc(100% + 12px);right:0;width:384px;max-width:calc(100vw - 44px);
    background:#16161a;border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:20px;z-index:55;
    box-shadow:0 26px 64px rgba(0,0,0,.6);}
  .fp-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:4px;}
  .fp-title{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;letter-spacing:-.01em;white-space:nowrap;}
  .fp-count{flex:0 0 auto;}
  .fp-count{font-size:12.5px;color:var(--mut);font-variant-numeric:tabular-nums;}
  .fp-count b{color:var(--neon);font-weight:600;}
  .fp-sec{display:flex;flex-direction:column;gap:13px;padding:18px 0;border-top:1px solid var(--line);margin-top:14px;}
  .fp-lab{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--mut);}
  .fp-sec .tb-sort{align-self:flex-start;flex-wrap:wrap;}
  .fp-sec .range{width:100%;}
  .fp-foot{display:flex;gap:10px;padding-top:18px;border-top:1px solid var(--line);}
  .fp-reset{flex:0 0 auto;background:none;border:1px solid var(--line);color:var(--mut);border-radius:11px;padding:11px 18px;
    font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;transition:.15s;}
  .fp-reset:hover{color:#fff;border-color:rgba(255,255,255,.28);}
  .fp-apply{flex:1 1 auto;background:var(--neon);color:#05140d;border:none;border-radius:11px;padding:11px 18px;
    font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:.15s;}
  .fp-apply:hover{filter:brightness(1.08);}

  .empty-state{padding:90px 0 60px;text-align:center;}
  .empty-state .es-t{font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:600;letter-spacing:-.01em;}
  .empty-state .es-s{font-size:15px;color:var(--mut);margin-top:10px;}
  @media (max-width:680px){.range{width:200px;}.filter-btn span:not(.fb-dot){display:none;}}
  @media (max-width:520px){.filter-panel{right:auto;left:0;}.fp-sec .range{width:100%;}}

  .footer{padding:70px 0 80px;color:var(--mut);font-size:13px;display:flex;justify-content:space-between;
    border-top:1px solid var(--line);margin-top:40px;flex-wrap:wrap;gap:12px;}
  .footer b{color:var(--ink);font-weight:500;}

  @media (max-width:680px){
    .wrap,.nav-in{padding-left:22px;padding-right:22px;}
    .nav-brand{display:none;}
    .sec-desc{text-align:left;}
  }
  `;
  document.head.appendChild(s);
}

function Card({ p, fav, onToggle }) {
  const st = STOCK2[p.stock];
  const out = p.stock === 'out';
  return (
    <a className={'card' + (out ? ' soldout' : '')} href={'Klavisha Product.html?id=' + p.id}>
      <div className="imgwrap" style={edtImg2(p.hue)}>
        {out && <span className="soldtag">Sold out</span>}
        <button className={'heart' + (fav ? ' on' : '')} aria-label="Toggle favourite"
        onClick={(e) => {e.preventDefault();e.stopPropagation();onToggle(p.id);}}>
          <Heart2 filled={fav} size={19} color="#00ff9d" stroke="#fff" />
        </button>
        <span className="shot">/ {p.shot}</span>
      </div>
      <div className="meta">
        <div className="m-row">
          <div className="m-name">{p.name}</div>
          <div className="m-price">${p.price}<span className="u">{p.unit}</span></div>
        </div>
        <div className="m-sub">
          <span className="m-tag">{p.tag}</span>
          <span className={'m-stock ' + st.tone}><span className="m-sd"></span>{st.label}</span>
        </div>
      </div>
    </a>);

}

// price bounds across the whole catalogue (dollar value)
const PRICES = CATALOG.map((p) => parseFloat(p.price));
const PMIN = 0;
const PMAX = Math.ceil(Math.max(...PRICES));

const SORTS = [
{ id: 'feat', label: 'Featured' },
{ id: 'plo', label: 'Price ↑' },
{ id: 'phi', label: 'Price ↓' },
{ id: 'az', label: 'A–Z' }];

const SORT_FNS = {
  plo: (a, b) => parseFloat(a.price) - parseFloat(b.price),
  phi: (a, b) => parseFloat(b.price) - parseFloat(a.price),
  az: (a, b) => a.name.localeCompare(b.name)
};
const fmtPrice = (v) => '$' + (v >= PMAX ? PMAX : v).toLocaleString();

function PriceInput({ value, onCommit }) {
  const [draft, setDraft] = React.useState(String(value));
  React.useEffect(() => {setDraft(String(value));}, [value]);
  const commit = () => {
    const n = parseInt(draft, 10);
    if (Number.isFinite(n)) onCommit(n);else setDraft(String(value));
  };
  return (
    <span className="pricebox">
      <span className="d">$</span>
      <input type="number" inputMode="numeric" value={draft} aria-label="Price"
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {if (e.key === 'Enter') e.target.blur();}} />
    </span>);

}

function RangeSlider({ min, max, value, onChange }) {
  const [lo, hi] = value;
  const pct = (v) => (v - min) / (max - min) * 100;
  return (
    <div className="range">
      <div className="track"></div>
      <div className="fill" style={{ left: pct(lo) + '%', right: 100 - pct(hi) + '%' }}></div>
      <input type="range" min={min} max={max} value={lo} aria-label="Minimum price"
      style={{ zIndex: lo > max - (max - min) * 0.1 ? 4 : 3 }}
      onChange={(e) => onChange([Math.min(+e.target.value, hi), hi])} />
      <input type="range" min={min} max={max} value={hi} aria-label="Maximum price"
      onChange={(e) => onChange([lo, Math.max(+e.target.value, lo)])} style={{ opacity: "1" }} />
    </div>);

}

const _filterIcon =
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 6h11M19 6h2M3 12h2M9 12h12M3 18h7M15 18h6" />
    <circle cx="16.5" cy="6" r="2.1" /><circle cx="6.5" cy="12" r="2.1" /><circle cx="12.5" cy="18" r="2.1" />
  </svg>;


function FilterMenu({ sort, range, total, onApply }) {
  const [open, setOpen] = React.useState(false);
  const [dSort, setDSort] = React.useState(sort);
  const [dRange, setDRange] = React.useState(range);
  const ref = React.useRef(null);
  const activeCount = (sort !== 'feat' ? 1 : 0) + (range[0] !== PMIN || range[1] !== PMAX ? 1 : 0);
  const preview = CATALOG.filter((p) => {const v = parseFloat(p.price);return v >= dRange[0] && v <= dRange[1];}).length;

  const openMenu = () => {setDSort(sort);setDRange(range);setOpen(true);};
  const toggle = () => open ? setOpen(false) : openMenu();
  const apply = () => {onApply(dSort, dRange);setOpen(false);};
  const reset = () => {setDSort('feat');setDRange([PMIN, PMAX]);};

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e) => {if (ref.current && !ref.current.contains(e.target)) setOpen(false);};
    const onKey = (e) => {if (e.key === 'Escape') setOpen(false);};
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {document.removeEventListener('mousedown', onDown);document.removeEventListener('keydown', onKey);};
  }, [open]);

  return (
    <div className="filter-anchor" ref={ref}>
      <button className={'filter-btn' + (activeCount ? ' act' : '') + (open ? ' open' : '')} onClick={toggle} aria-expanded={open}>
        {_filterIcon}
        <span>Filter &amp; Sort</span>
        {activeCount > 0 && <span className="fb-dot">{activeCount}</span>}
      </button>
      {open &&
      <div className="filter-panel">
          <div className="fp-head">
            <span className="fp-title">Filter &amp; sort</span>
            <span className="fp-count"><b>{preview}</b> of {total}</span>
          </div>
          <div className="fp-sec">
            <span className="fp-lab">Sort by</span>
            <div className="tb-sort">
              {SORTS.map((s) =>
            <button key={s.id} className={dSort === s.id ? 'on' : ''} onClick={() => setDSort(s.id)}>{s.label}</button>
            )}
            </div>
          </div>
          <div className="fp-sec">
            <span className="fp-lab">Price range</span>
            <RangeSlider min={PMIN} max={PMAX} value={dRange} onChange={setDRange} />
            <div className="tb-inputs">
              <PriceInput value={dRange[0]} onCommit={(v) => setDRange([Math.min(Math.max(PMIN, v), dRange[1]), dRange[1]])} />
              <span className="u">–</span>
              <PriceInput value={dRange[1]} onCommit={(v) => setDRange([dRange[0], Math.min(PMAX, Math.max(dRange[0], v))])} />
            </div>
          </div>
          <div className="fp-foot">
            <button className="fp-reset" onClick={reset}>Reset</button>
            <button className="fp-apply" onClick={apply}>Apply</button>
          </div>
        </div>
      }
    </div>);

}

function CatalogPage() {
  const [favs, setFavs] = React.useState(() => Store.getFavs());
  const [active, setActive] = React.useState(CATS[0].id);
  const [cart] = React.useState(() => Store.getCart());
  const [sort, setSort] = React.useState('feat');
  const [range, setRange] = React.useState([PMIN, PMAX]);
  const toggle = (id) => setFavs((f) => {const next = { ...f, [id]: !f[id] };Store.setFavs(next);return next;});
  const favCount = Object.values(favs).filter(Boolean).length;

  // apply price filter + sort, then group surviving products back into categories
  const inRange = (p) => {const v = parseFloat(p.price);return v >= range[0] && v <= range[1];};
  const sortList = (arr) => sort === 'feat' ? arr : [...arr].sort(SORT_FNS[sort]);
  const visible = CATS.
  map((c) => ({ ...c, items: sortList(CATALOG.filter((p) => p.cat === c.id && inRange(p))) })).
  filter((c) => c.items.length > 0);
  const totalVisible = visible.reduce((n, c) => n + c.items.length, 0);
  const visKey = visible.map((c) => c.id).join(',');

  // scroll-spy: highlight the section whose top has passed under the nav bar.
  React.useEffect(() => {
    const ids = visKey ? visKey.split(',') : [];
    if (!ids.length) return;
    const sections = ids.map((id) => document.getElementById('sec-' + id)).filter(Boolean);
    let raf = 0;
    const compute = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const probe = STICK + 24;
        let cur = ids[0];
        for (const id of ids) {
          const el = document.getElementById('sec-' + id);
          if (el && el.getBoundingClientRect().top <= probe) cur = id;
        }
        const doc = document.documentElement;
        if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) {
          cur = ids[ids.length - 1]; // pin last section at page bottom
        }
        setActive(cur);
      });
    };
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    const io = new IntersectionObserver(compute, { threshold: [0, 0.2, 0.5, 1] });
    sections.forEach((s) => io.observe(s));
    compute();
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
      io.disconnect();
    };
  }, [visKey]);

  const goTo = (id) => {
    const el = document.getElementById('sec-' + id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - STICK + 2;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <React.Fragment>
      <SiteHeader activePage="catalog" favCount={favCount} cartCount={cart} />
      <header className="wrap hero">
        <div className="hero-kicker">Mechanical Keyboard Works</div>
        <h1 className="hero-mark">Klavisha<b>.</b></h1>
        <div className="hero-row">
          <p className="hero-tag">Kits, caps, switches and the small parts — everything to build a board that sounds and feels like yours.</p>
          <div className="hero-count">Catalogue · <b>{CATALOG.length}</b> products in stock</div>
        </div>
      </header>

      <nav className="navbar" aria-label="Categories &amp; filters">
        <div className="nav-in">
          {visible.length > 0 && <span className="nav-lab">Browse</span>}
          <div className="nav-cats">
            {visible.map((c) =>
            <button key={c.id} className={'nav-chip' + (active === c.id ? ' on' : '')} onClick={() => goTo(c.id)}>
                {c.name}<span className="n">{c.items.length}</span>
              </button>
            )}
          </div>
          <FilterMenu sort={sort} range={range} total={CATALOG.length} onApply={(s, r) => {setSort(s);setRange(r);}} />
        </div>
      </nav>

      <main className="wrap">
        {visible.map((c, i) =>
        <section key={c.id} id={'sec-' + c.id} className="section">
            <div className="sec-head">
              <div className="sec-left">
                <span className="sec-num">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="sec-title">{c.name}</h2>
                <span className="sec-count">{c.items.length} products</span>
              </div>
              <p className="sec-desc">{c.desc}</p>
            </div>
            <div className="grid">
              {c.items.map((p) =>
            <Card key={p.id} p={p} fav={!!favs[p.id]} onToggle={toggle} />
            )}
            </div>
          </section>
        )}
        {visible.length === 0 &&
        <div className="empty-state">
            <div className="es-t">No products in this price range</div>
            <div className="es-s">Try widening the price filter to see more of the catalogue.</div>
          </div>
        }
      </main>
      <SiteFooter />
    </React.Fragment>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<CatalogPage />);