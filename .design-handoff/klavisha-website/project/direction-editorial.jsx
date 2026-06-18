// direction-editorial.jsx — Direction B: "Editorial Dark"
// Refined charcoal, big Space Grotesk display, generous air, neon used sparingly.
// Exports: DirectionEditorial

if (!document.getElementById('edt-styles')) {
  const s = document.createElement('style');
  s.id = 'edt-styles';
  s.textContent = `
  .edt{--neon:#00ff9d;background:#101012;color:#f4f4f2;width:100%;height:100%;box-sizing:border-box;
    padding:44px 48px 56px;font-family:'Hanken Grotesk',system-ui,sans-serif;}
  .edt-top{display:flex;justify-content:space-between;align-items:flex-end;padding-bottom:30px;border-bottom:1px solid rgba(255,255,255,.09);}
  .edt-brand{display:flex;flex-direction:column;gap:10px;}
  .edt-kicker{font-size:12px;letter-spacing:.32em;text-transform:uppercase;color:var(--neon);font-weight:600;}
  .edt-mark{font-family:'Space Grotesk',sans-serif;font-size:46px;font-weight:600;letter-spacing:-.02em;line-height:.9;}
  .edt-mark b{color:var(--neon);}
  .edt-fav{display:flex;align-items:center;gap:12px;border:1px solid rgba(255,255,255,.14);border-radius:100px;
    padding:11px 20px 11px 16px;color:#f4f4f2;font-size:14px;font-weight:500;background:rgba(255,255,255,.02);}
  .edt-fav .c{font-family:'Space Grotesk',sans-serif;font-weight:600;color:var(--neon);font-size:15px;}
  .edt-cats{display:flex;gap:10px;flex-wrap:wrap;margin:28px 0 34px;}
  .edt-chip{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:100px;
    padding:9px 18px;font-size:13.5px;font-weight:500;color:#bdbdba;cursor:pointer;transition:.16s;display:flex;gap:8px;align-items:center;}
  .edt-chip:hover{color:#fff;border-color:rgba(255,255,255,.22);}
  .edt-chip .n{font-size:11px;opacity:.55;font-variant-numeric:tabular-nums;}
  .edt-chip.on{background:var(--neon);border-color:var(--neon);color:#05140d;}
  .edt-chip.on .n{opacity:.7;}
  .edt-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;}
  .edt-card{display:flex;flex-direction:column;cursor:pointer;transition:transform .2s;}
  .edt-card:hover{transform:translateY(-5px);}
  .edt-imgwrap{position:relative;border-radius:18px;overflow:hidden;aspect-ratio:4/3;
    box-shadow:0 1px 0 rgba(255,255,255,.06) inset;}
  .edt-imgwrap:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(0,0,0,.45));}
  .edt-shot{position:absolute;left:16px;bottom:14px;z-index:2;font-family:'JetBrains Mono',monospace;
    font-size:10.5px;letter-spacing:.06em;color:rgba(255,255,255,.78);}
  .edt-heart{position:absolute;top:13px;right:13px;z-index:3;width:40px;height:40px;border-radius:50%;
    border:none;background:rgba(10,12,11,.5);backdrop-filter:blur(8px);color:#fff;cursor:pointer;
    display:flex;align-items:center;justify-content:center;transition:.16s;}
  .edt-heart:hover{background:rgba(10,12,11,.75);transform:scale(1.06);}
  .edt-heart.on{color:var(--neon);background:rgba(0,255,157,.12);}
  .edt-soldtag{position:absolute;top:14px;left:14px;z-index:2;font-size:11px;font-weight:600;letter-spacing:.1em;
    text-transform:uppercase;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);color:#ff8b8b;padding:6px 11px;border-radius:100px;}
  .edt-meta{padding:18px 4px 0;display:flex;flex-direction:column;gap:6px;}
  .edt-row{display:flex;justify-content:space-between;align-items:baseline;gap:14px;}
  .edt-name{font-family:'Space Grotesk',sans-serif;font-size:21px;font-weight:600;letter-spacing:-.01em;line-height:1.1;}
  .edt-price{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:600;white-space:nowrap;}
  .edt-price .u{font-size:12px;font-weight:400;color:#8c8c89;margin-left:3px;font-family:'Hanken Grotesk',sans-serif;}
  .edt-sub{display:flex;align-items:center;gap:12px;margin-top:2px;}
  .edt-cat2{font-size:13px;color:#9a9a97;}
  .edt-stock{display:flex;align-items:center;gap:7px;font-size:12.5px;color:#9a9a97;}
  .edt-sd{width:8px;height:8px;border-radius:50%;}
  .edt-stock.ok .edt-sd{background:var(--neon);}
  .edt-stock.warn .edt-sd{background:#ffce4a;}
  .edt-stock.off{color:#d98c8c;}
  .edt-stock.off .edt-sd{background:#e96868;}
  .edt-card.soldout .edt-imgwrap{filter:saturate(.5) brightness(.7);}
  `;
  document.head.appendChild(s);
}

function edtImg(hue) {
  return {
    background: `radial-gradient(135% 120% at 28% 22%, oklch(0.58 0.14 ${hue}) 0%, oklch(0.4 0.11 ${hue}) 42%, oklch(0.24 0.06 ${hue}) 100%)`,
  };
}

function DirectionEditorial() {
  const { favs, toggle, favCount, cat, setCat, items, countFor } = useCatalog();
  return (
    <div className="edt">
      <div className="edt-top">
        <div className="edt-brand">
          <div className="edt-kicker">Mechanical Keyboard Works</div>
          <div className="edt-mark">Klavisha<b>.</b></div>
        </div>
        <div className="edt-fav">
          <Heart filled={favCount > 0} size={18} color="#00ff9d" stroke="#f4f4f2" />
          Favourites <span className="c">{favCount}</span>
        </div>
      </div>

      <div className="edt-cats">
        {CATEGORIES.map((c) => (
          <button key={c} className={'edt-chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>
            {c}<span className="n">{countFor(c)}</span>
          </button>
        ))}
      </div>

      <div className="edt-grid">
        {items.map((p) => {
          const st = STOCK[p.stock];
          const out = p.stock === 'out';
          return (
            <div key={p.id} className={'edt-card' + (out ? ' soldout' : '')}>
              <div className="edt-imgwrap" style={edtImg(p.hue)}>
                {out && <span className="edt-soldtag">Sold out</span>}
                <button className={'edt-heart' + (favs[p.id] ? ' on' : '')}
                        onClick={(e) => { e.stopPropagation(); toggle(p.id); }}>
                  <Heart filled={!!favs[p.id]} size={19} color="#00ff9d" stroke="#fff" />
                </button>
                <span className="edt-shot">/ {p.shot}</span>
              </div>
              <div className="edt-meta">
                <div className="edt-row">
                  <div className="edt-name">{p.name}</div>
                  <div className="edt-price">${p.price}<span className="u">{p.unit}</span></div>
                </div>
                <div className="edt-sub">
                  <span className="edt-cat2">{p.tag}</span>
                  <span className={'edt-stock ' + st.tone}><span className="edt-sd"></span>{st.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.DirectionEditorial = DirectionEditorial;
