// site-chrome.jsx — shared header + footer for the Klavisha store
// Exports to window: Announcement, SiteHeader, SiteFooter, HEADER_H

const HEADER_H = 64;

if (!document.getElementById('chrome-styles')) {
  const s = document.createElement('style');
  s.id = 'chrome-styles';
  s.textContent = `
  .sc-ann{background:#0a0a0b;border-bottom:1px solid rgba(255,255,255,.07);color:#cfcfcb;
    font-size:12.5px;letter-spacing:.02em;display:flex;justify-content:center;align-items:center;gap:12px;
    padding:9px 20px;text-align:center;}
  .sc-ann .neon{color:var(--neon,#00ff9d);font-weight:600;}
  .sc-ann .sep{opacity:.4;}
  @media (max-width:560px){.sc-ann .alt{display:none;}.sc-ann .sep{display:none;}}

  .sc-head{position:sticky;top:0;z-index:60;background:rgba(16,16,18,.8);backdrop-filter:blur(14px) saturate(1.4);
    border-bottom:1px solid rgba(255,255,255,.09);}
  .sc-head-in{max-width:1320px;margin:0 auto;padding:0 40px;height:${HEADER_H}px;display:flex;align-items:center;gap:22px;}
  .sc-brand{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:21px;letter-spacing:-.02em;
    text-decoration:none;color:#f4f4f2;flex:0 0 auto;}
  .sc-brand b{color:var(--neon,#00ff9d);}
  .sc-nav{display:flex;gap:4px;flex:1 1 auto;min-width:0;overflow-x:auto;scrollbar-width:none;}
  .sc-nav::-webkit-scrollbar{display:none;}
  .sc-link{flex:0 0 auto;background:none;border:none;font-family:inherit;font-size:14px;font-weight:500;
    color:#bdbdba;cursor:pointer;padding:8px 14px;border-radius:100px;transition:.15s;white-space:nowrap;
    text-decoration:none;display:inline-flex;align-items:center;}
  .sc-link:hover{color:#fff;background:rgba(255,255,255,.05);}
  .sc-link.on{color:var(--neon,#00ff9d);}
  .sc-utils{display:flex;align-items:center;gap:10px;flex:0 0 auto;}
  .sc-icon{width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.02);
    color:#cfcfcb;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s;}
  .sc-icon:hover{border-color:rgba(255,255,255,.28);color:#fff;}
  .sc-pill{display:flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.14);border-radius:100px;
    padding:8px 14px 8px 12px;font-size:13.5px;font-weight:500;background:rgba(255,255,255,.02);text-decoration:none;
    color:#f4f4f2;cursor:pointer;transition:.15s;}
  .sc-pill:hover{border-color:rgba(255,255,255,.28);}
  .sc-pill .c{font-family:'Space Grotesk',sans-serif;font-weight:600;color:var(--neon,#00ff9d);font-variant-numeric:tabular-nums;}
  .sc-pill.empty .c{color:#9a9a97;}
  @media (max-width:600px){.sc-head-in{padding-left:22px;padding-right:22px;gap:14px;}.sc-fav-pill{display:none;}}

  /* footer */
  .sc-foot{background:#0c0c0e;border-top:1px solid rgba(255,255,255,.09);margin-top:20px;}
  .sc-foot-top{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:40px;padding:64px 0 48px;}
  .sc-foot-mark{font-family:'Space Grotesk',sans-serif;font-size:30px;font-weight:600;letter-spacing:-.02em;}
  .sc-foot-mark b{color:var(--neon,#00ff9d);}
  .sc-foot-blurb{font-size:14px;line-height:1.6;color:#9a9a97;margin:14px 0 22px;max-width:340px;}
  .sc-news{display:flex;gap:8px;max-width:360px;}
  .sc-news input{flex:1;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:11px;
    padding:12px 14px;color:#f4f4f2;font-family:inherit;font-size:14px;outline:none;transition:.15s;}
  .sc-news input:focus{border-color:var(--neon,#00ff9d);}
  .sc-news input::placeholder{color:#6f706a;}
  .sc-news button{background:var(--neon,#00ff9d);color:#05140d;border:none;border-radius:11px;padding:0 20px;
    font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:14px;cursor:pointer;transition:.15s;}
  .sc-news button:hover{filter:brightness(1.08);}
  .sc-col h4{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#6f706a;font-weight:600;margin:6px 0 16px;}
  .sc-col a{display:block;text-decoration:none;color:#cfcfcb;font-size:14px;padding:7px 0;transition:.15s;}
  .sc-col a:hover{color:var(--neon,#00ff9d);}
  .sc-foot-bottom{border-top:1px solid rgba(255,255,255,.08);padding:22px 0 36px;display:flex;
    justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;font-size:13px;color:#7c7d76;}
  .sc-foot-bottom .links{display:flex;gap:20px;}
  .sc-foot-bottom a{text-decoration:none;color:#9a9a97;transition:.15s;}
  .sc-foot-bottom a:hover{color:#f4f4f2;}
  @media (max-width:820px){.sc-foot-top{grid-template-columns:1fr 1fr;gap:32px;}.sc-foot-brand{grid-column:1/-1;}}
  @media (max-width:520px){.sc-foot-top{grid-template-columns:1fr;}}
  `;
  document.head.appendChild(s);
}

function Announcement() {
  return (
    <div className="sc-ann">
      <span><span className="neon">Free shipping</span> on orders over $150</span>
      <span className="sep">·</span>
      <span className="alt">Build service now open — book a custom board</span>
    </div>
  );
}

const _searchIcon = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" />
  </svg>
);
const _cartIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f4f4f2" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2 3h2.2l2.3 12.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.2L21 7H5.3" />
  </svg>
);

function SiteHeader({ activePage, favCount = 0, cartCount = 0 }) {
  return (
    <header className="sc-head">
      <div className="sc-head-in">
        <a className="sc-brand" href="Klavisha.html">Klavisha<b>.</b></a>
        <nav className="sc-nav">
          <a className={'sc-link' + (activePage === 'catalog' ? ' on' : '')} href="Klavisha Catalog.html">Catalog</a>
        </nav>
        <div className="sc-utils">
          <button className="sc-icon" aria-label="Search">{_searchIcon}</button>
          <a className={'sc-pill sc-fav-pill' + (favCount ? '' : ' empty')} href="Klavisha Catalog.html" aria-label="Favourites">
            <Heart2 filled={favCount > 0} size={15} color="#00ff9d" stroke="#f4f4f2" />
            <span className="c">{favCount}</span>
          </a>
          <span className="sc-pill" aria-label="Cart">
            {_cartIcon}<span className="c">{cartCount}</span>
          </span>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="sc-foot">
      <div className="wrap sc-foot-top">
        <div className="sc-foot-brand">
          <div className="sc-foot-mark">Klavisha<b>.</b></div>
          <p className="sc-foot-blurb">Mechanical keyboard works — kits, caps, switches and the small parts, built and shipped from our workshop.</p>
          <form className="sc-news" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Email for drops & restocks" aria-label="Email" />
            <button type="submit">Join</button>
          </form>
        </div>
        <div className="sc-col">
          <h4>Shop</h4>
          {CATS.map((c) => <a key={c.id} href={'Klavisha Catalog.html#sec-' + c.id}>{c.name}</a>)}
          <a href="Klavisha Catalog.html">All products</a>
        </div>
        <div className="sc-col">
          <h4>Support</h4>
          <a href="#">Shipping</a><a href="#">Returns</a><a href="#">Warranty</a><a href="#">Contact</a>
        </div>
        <div className="sc-col">
          <h4>Studio</h4>
          <a href="#">Build service</a><a href="#">Guides</a><a href="#">Journal</a><a href="#">Wholesale</a>
        </div>
      </div>
      <div className="wrap sc-foot-bottom">
        <span>© 2026 Klavisha — Mechanical Keyboard Works</span>
        <div className="links">
          <a href="#">Instagram</a><a href="#">YouTube</a><a href="#">Discord</a>
        </div>
        <div className="links">
          <a href="#">Privacy</a><a href="#">Terms</a>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { HEADER_H, Announcement, SiteHeader, SiteFooter });
