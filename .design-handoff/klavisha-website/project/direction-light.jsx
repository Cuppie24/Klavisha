// direction-light.jsx — Direction C: "Soft Light"
// Off-white, clean minimal, neon green as the action/accent colour. Exports: DirectionLight

if (!document.getElementById('lit-styles')) {
  const s = document.createElement('style');
  s.id = 'lit-styles';
  s.textContent = `
  .lit{--neon:#00ff9d;--neon-ink:#00603b;--ink:#16170f;--mut:#6c6d63;--line:#e4e3db;
    background:#f4f4ef;color:var(--ink);width:100%;height:100%;box-sizing:border-box;
    padding:36px 42px 46px;font-family:'Hanken Grotesk',system-ui,sans-serif;}
  .lit-top{display:flex;justify-content:space-between;align-items:center;padding-bottom:24px;border-bottom:1px solid var(--line);}
  .lit-brand{display:flex;align-items:baseline;gap:14px;}
  .lit-mark{font-family:'Space Grotesk',sans-serif;font-size:30px;font-weight:600;letter-spacing:-.02em;position:relative;}
  .lit-mark:after{content:'';position:absolute;left:0;right:0;bottom:3px;height:8px;background:var(--neon);opacity:.85;z-index:-1;}
  .lit-tagline{font-size:12.5px;color:var(--mut);letter-spacing:.04em;}
  .lit-fav{display:flex;align-items:center;gap:10px;background:var(--ink);color:#fff;border-radius:100px;
    padding:10px 18px 10px 15px;font-size:14px;font-weight:500;}
  .lit-fav .c{background:var(--neon);color:var(--neon-ink);font-weight:700;border-radius:100px;
    min-width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:13px;padding:0 6px;}
  .lit-cats{display:flex;gap:9px;flex-wrap:wrap;margin:24px 0 28px;}
  .lit-chip{background:#fff;border:1px solid var(--line);border-radius:100px;padding:9px 17px;font-size:13.5px;
    font-weight:500;color:#54554c;cursor:pointer;transition:.15s;display:flex;gap:7px;align-items:center;}
  .lit-chip:hover{border-color:#bdbcb2;color:var(--ink);}
  .lit-chip .n{font-size:11px;color:#a6a69c;font-variant-numeric:tabular-nums;}
  .lit-chip.on{background:var(--neon);border-color:var(--neon);color:var(--neon-ink);font-weight:600;}
  .lit-chip.on .n{color:var(--neon-ink);opacity:.7;}
  .lit-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;}
  .lit-card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:12px;display:flex;flex-direction:column;
    cursor:pointer;transition:box-shadow .16s,transform .16s,border-color .16s;}
  .lit-card:hover{box-shadow:0 14px 34px rgba(20,22,12,.1);transform:translateY(-3px);border-color:#d6d5cb;}
  .lit-imgwrap{position:relative;border-radius:10px;overflow:hidden;aspect-ratio:1/.82;}
  .lit-shot{position:absolute;left:11px;bottom:9px;font-family:'JetBrains Mono',monospace;font-size:10px;
    letter-spacing:.04em;color:rgba(255,255,255,.92);text-shadow:0 1px 3px rgba(0,0,0,.4);z-index:2;}
  .lit-heart{position:absolute;top:10px;right:10px;z-index:3;width:34px;height:34px;border-radius:50%;border:none;
    background:rgba(255,255,255,.9);backdrop-filter:blur(4px);color:#4a4b42;cursor:pointer;
    display:flex;align-items:center;justify-content:center;transition:.15s;box-shadow:0 2px 8px rgba(0,0,0,.12);}
  .lit-heart:hover{transform:scale(1.08);}
  .lit-heart.on{color:var(--neon-ink);background:var(--neon);}
  .lit-body{padding:13px 5px 5px;display:flex;flex-direction:column;gap:8px;flex:1;}
  .lit-tag{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--neon-ink);}
  .lit-name{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;letter-spacing:-.01em;line-height:1.2;color:var(--ink);}
  .lit-foot{margin-top:auto;display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--line);}
  .lit-price{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:600;}
  .lit-price .u{font-size:11px;font-weight:400;color:var(--mut);margin-left:2px;font-family:'Hanken Grotesk',sans-serif;}
  .lit-stock{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--mut);}
  .lit-sd{width:7px;height:7px;border-radius:50%;}
  .lit-stock.ok .lit-sd{background:#11b277;}
  .lit-stock.warn .lit-sd{background:#e0a400;}
  .lit-stock.warn{color:#9a7400;}
  .lit-stock.off{color:#c0584f;}
  .lit-stock.off .lit-sd{background:#dc5a4f;}
  .lit-card.soldout .lit-imgwrap{filter:saturate(.55) brightness(1.04) opacity(.78);}
  `;
  document.head.appendChild(s);
}

function litImg(hue) {
  return {
    background: `radial-gradient(125% 120% at 30% 22%, oklch(0.78 0.13 ${hue}) 0%, oklch(0.64 0.13 ${hue}) 48%, oklch(0.5 0.1 ${hue}) 100%)`,
  };
}

function DirectionLight() {
  const { favs, toggle, favCount, cat, setCat, items, countFor } = useCatalog();
  return (
    <div className="lit">
      <div className="lit-top">
        <div className="lit-brand">
          <div className="lit-mark">Klavisha</div>
          <div className="lit-tagline">Mechanical keyboard works</div>
        </div>
        <div className="lit-fav">
          <Heart filled={favCount > 0} size={17} color="#00ff9d" stroke="#fff" />
          Favourites <span className="c">{favCount}</span>
        </div>
      </div>

      <div className="lit-cats">
        {CATEGORIES.map((c) => (
          <button key={c} className={'lit-chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>
            {c}<span className="n">{countFor(c)}</span>
          </button>
        ))}
      </div>

      <div className="lit-grid">
        {items.map((p) => {
          const st = STOCK[p.stock];
          const out = p.stock === 'out';
          return (
            <div key={p.id} className={'lit-card' + (out ? ' soldout' : '')}>
              <div className="lit-imgwrap" style={litImg(p.hue)}>
                <button className={'lit-heart' + (favs[p.id] ? ' on' : '')}
                        onClick={(e) => { e.stopPropagation(); toggle(p.id); }}>
                  <Heart filled={!!favs[p.id]} size={17} color="#00603b" stroke="#4a4b42" />
                </button>
                <span className="lit-shot">/ {p.shot}</span>
              </div>
              <div className="lit-body">
                <div className="lit-tag">{p.tag}</div>
                <div className="lit-name">{p.name}</div>
                <div className="lit-foot">
                  <div className="lit-price">${p.price}<span className="u">{p.unit}</span></div>
                  <div className={'lit-stock ' + st.tone}><span className="lit-sd"></span>{st.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.DirectionLight = DirectionLight;
