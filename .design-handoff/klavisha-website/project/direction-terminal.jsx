// direction-terminal.jsx — Direction A: "Neon Terminal"
// Pure-black, monospace, hairline neon borders, data-dense. Exports: DirectionTerminal

if (!document.getElementById('term-styles')) {
  const s = document.createElement('style');
  s.id = 'term-styles';
  s.textContent = `
  .term{--neon:#00ff9d;--line:rgba(0,255,157,.16);--dim:rgba(233,255,245,.5);
    background:#050706;color:#e9fff5;font-family:'JetBrains Mono',ui-monospace,monospace;
    width:100%;height:100%;box-sizing:border-box;padding:30px 34px 38px;
    background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);
    background-size:46px 46px;background-position:-1px -1px;}
  .term-top{display:flex;justify-content:space-between;align-items:flex-start;
    border-bottom:1px solid var(--line);padding-bottom:18px;}
  .term-mark{font-size:23px;font-weight:700;letter-spacing:.22em;display:flex;align-items:center;gap:2px;}
  .term-cur{display:inline-block;width:11px;height:20px;background:var(--neon);margin-left:6px;
    animation:term-blink 1.1s steps(1) infinite;box-shadow:0 0 12px var(--neon);}
  @keyframes term-blink{50%{opacity:0}}
  .term-sub{color:var(--dim);font-size:11px;letter-spacing:.16em;margin-top:7px;}
  .term-tools{display:flex;gap:10px;align-items:center;}
  .term-chip{border:1px solid var(--line);padding:8px 12px;font-size:11px;letter-spacing:.12em;
    color:var(--dim);display:flex;align-items:center;gap:8px;}
  .term-fav{border:1px solid var(--neon);color:var(--neon);box-shadow:0 0 0 1px rgba(0,255,157,.12),0 0 16px rgba(0,255,157,.14);}
  .term-cats{display:flex;gap:26px;margin:22px 0 26px;border-bottom:1px solid var(--line);}
  .term-cat{background:none;border:none;cursor:pointer;font-family:inherit;color:var(--dim);
    font-size:12px;letter-spacing:.14em;text-transform:uppercase;padding:0 0 14px;position:relative;
    display:flex;gap:8px;align-items:baseline;transition:color .15s;}
  .term-cat:hover{color:#e9fff5;}
  .term-cat .n{font-size:10px;opacity:.6;}
  .term-cat.on{color:var(--neon);}
  .term-cat.on:after{content:'';position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--neon);box-shadow:0 0 10px var(--neon);}
  .term-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
  .term-card{border:1px solid var(--line);background:rgba(8,12,10,.7);display:flex;flex-direction:column;
    transition:border-color .16s,box-shadow .16s,transform .16s;cursor:pointer;position:relative;}
  .term-card:hover{border-color:var(--neon);box-shadow:0 0 0 1px var(--neon),0 0 30px rgba(0,255,157,.16);transform:translateY(-2px);}
  .term-img{height:138px;position:relative;overflow:hidden;border-bottom:1px solid var(--line);}
  .term-img:after{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(0,0,0,.25) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.25) 1px,transparent 1px);background-size:22px 22px;mix-blend-mode:overlay;}
  .term-idx{position:absolute;top:9px;left:11px;font-size:10px;letter-spacing:.1em;color:#d9ffe9;z-index:2;text-shadow:0 1px 4px #000;}
  .term-shot{position:absolute;bottom:8px;left:11px;font-size:9.5px;letter-spacing:.08em;color:rgba(255,255,255,.62);z-index:2;}
  .term-heart{position:absolute;top:7px;right:7px;z-index:3;width:30px;height:30px;border:1px solid var(--line);
    background:rgba(5,7,6,.6);backdrop-filter:blur(3px);color:var(--dim);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.15s;}
  .term-heart:hover{border-color:var(--neon);color:var(--neon);}
  .term-heart.on{border-color:var(--neon);color:var(--neon);box-shadow:0 0 14px rgba(0,255,157,.35);}
  .term-body{padding:13px 13px 14px;display:flex;flex-direction:column;gap:7px;flex:1;}
  .term-tag{font-size:10px;letter-spacing:.13em;color:var(--neon);text-transform:uppercase;}
  .term-name{font-size:14px;font-weight:600;letter-spacing:.01em;color:#fff;line-height:1.25;}
  .term-foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;padding-top:11px;border-top:1px dashed var(--line);}
  .term-price{font-size:16px;font-weight:700;color:#fff;}
  .term-price .u{font-size:10px;font-weight:400;color:var(--dim);margin-left:3px;letter-spacing:.06em;}
  .term-stock{font-size:10px;letter-spacing:.1em;text-transform:uppercase;display:flex;align-items:center;gap:6px;color:var(--dim);}
  .term-dot{width:7px;height:7px;border-radius:50%;}
  .term-stock.ok .term-dot{background:var(--neon);box-shadow:0 0 8px var(--neon);}
  .term-stock.warn .term-dot{background:#ffd23f;box-shadow:0 0 8px #ffd23f;}
  .term-stock.off{color:rgba(255,120,120,.7);}
  .term-stock.off .term-dot{background:#ff5a5a;}
  .term-card.soldout .term-img{filter:grayscale(.6) brightness(.6);}
  `;
  document.head.appendChild(s);
}

function termImg(hue) {
  return {
    background: `radial-gradient(120% 120% at 30% 20%, oklch(0.42 0.13 ${hue}) 0%, oklch(0.22 0.07 ${hue}) 45%, oklch(0.12 0.03 ${hue}) 100%)`,
  };
}

function DirectionTerminal() {
  const { favs, toggle, favCount, cat, setCat, items, countFor } = useCatalog();
  return (
    <div className="term">
      <div className="term-top">
        <div>
          <div className="term-mark">KLAVISHA<span className="term-cur"></span></div>
          <div className="term-sub">// MECHANICAL KEYBOARD WORKS — CATALOG.v3</div>
        </div>
        <div className="term-tools">
          <div className="term-chip">⌘K&nbsp;&nbsp;SEARCH</div>
          <div className="term-chip term-fav">
            <Heart filled size={13} color="#00ff9d" />
            FAVS [{String(favCount).padStart(2, '0')}]
          </div>
        </div>
      </div>

      <div className="term-cats">
        {CATEGORIES.map((c, i) => (
          <button key={c} className={'term-cat' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>
            <span className="n">{String(i + 1).padStart(2, '0')}</span>
            {c}<span className="n">({countFor(c)})</span>
          </button>
        ))}
      </div>

      <div className="term-grid">
        {items.map((p, i) => {
          const st = STOCK[p.stock];
          const out = p.stock === 'out';
          return (
            <div key={p.id} className={'term-card' + (out ? ' soldout' : '')}>
              <div className="term-img" style={termImg(p.hue)}>
                <span className="term-idx">K-{String(i + 1).padStart(2, '0')}</span>
                <span className="term-shot">/ {p.shot}</span>
                <button className={'term-heart' + (favs[p.id] ? ' on' : '')}
                        onClick={(e) => { e.stopPropagation(); toggle(p.id); }}>
                  <Heart filled={!!favs[p.id]} size={15} color="#00ff9d" />
                </button>
              </div>
              <div className="term-body">
                <div className="term-tag">{p.tag}</div>
                <div className="term-name">{p.name}</div>
                <div className="term-foot">
                  <div className="term-price">${p.price}<span className="u">{p.unit}</span></div>
                  <div className={'term-stock ' + st.tone}>
                    <span className="term-dot"></span>{st.label}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.DirectionTerminal = DirectionTerminal;
