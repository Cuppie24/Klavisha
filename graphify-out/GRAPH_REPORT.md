# Graph Report - D:\Projects\Klavisha.uz medusa\klavisha-website  (2026-06-23)

## Corpus Check
- Large corpus: 62 files · ~591,157 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 320 nodes · 539 edges · 19 communities (15 shown, 4 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 53 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Catalog & Filtering UI|Catalog & Filtering UI]]
- [[_COMMUNITY_Header, Cart & Favorites|Header, Cart & Favorites]]
- [[_COMMUNITY_Product Catalog & Brands|Product Catalog & Brands]]
- [[_COMMUNITY_Cart Context & Medusa API|Cart Context & Medusa API]]
- [[_COMMUNITY_Dependencies & Package Config|Dependencies & Package Config]]
- [[_COMMUNITY_Tooling, Linting & Deployment|Tooling, Linting & Deployment]]
- [[_COMMUNITY_App TypeScript Config|App TypeScript Config]]
- [[_COMMUNITY_AJAZZ AK820 Variants|AJAZZ AK820 Variants]]
- [[_COMMUNITY_Node TypeScript Config|Node TypeScript Config]]
- [[_COMMUNITY_Footer & Interactive Keyboard|Footer & Interactive Keyboard]]
- [[_COMMUNITY_Brand & Hero Assets|Brand & Hero Assets]]
- [[_COMMUNITY_Category Cards View|Category Cards View]]
- [[_COMMUNITY_Product Data Schema|Product Data Schema]]
- [[_COMMUNITY_AJAZZ AK820 CS Editions|AJAZZ AK820 CS Editions]]
- [[_COMMUNITY_Bubble Button Component|Bubble Button Component]]
- [[_COMMUNITY_TypeScript Config Root|TypeScript Config Root]]
- [[_COMMUNITY_Vercel Deployment Config|Vercel Deployment Config]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 23 edges
2. `compilerOptions` - 18 edges
3. `MedusaProduct` - 14 edges
4. `MedusaCategory` - 14 edges
5. `getCheapestPrice()` - 10 edges
6. `useFavoritesContext()` - 9 edges
7. `WOMIER S-K80 KANAGAWA Black Edition` - 9 edges
8. `AppHeader()` - 8 edges
9. `formatPrice()` - 8 edges
10. `ProductPage()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Klavisha.uz Favicon SVG` --references--> `Klavisha.uz — магазин техники (store brand/title)`  [INFERRED]
  public/favicon.svg → index.html
- `React + TypeScript + Vite stack` --conceptually_related_to--> `Docker frontend service (port 3000:80)`  [INFERRED]
  README.md → compose.yaml
- `SPA root div and module script entry` --conceptually_related_to--> `React + TypeScript + Vite stack`  [INFERRED]
  index.html → README.md
- `Nginx serving SPA on port 80 inside container` --conceptually_related_to--> `SPA root div and module script entry`  [INFERRED]
  compose.yaml → index.html
- `Klavisha.uz Favicon SVG` --conceptually_related_to--> `Vite Logo SVG`  [INFERRED]
  public/favicon.svg → src/assets/vite.svg

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Frontend Stack Deployment (React + Vite → Docker/Nginx → Port 3000)** — concept_react_typescript_vite, concept_frontend_docker_service, concept_nginx_serving, concept_spa_entry_point [INFERRED 0.85]
- **ESLint React Linting Configuration (type-aware + react-x + react-dom)** — concept_eslint_type_aware, concept_eslint_plugin_react_x, concept_eslint_plugin_react_dom [EXTRACTED 0.95]
- **Klavisha Frontend Tech Stack Assets** — assets_react_svg, assets_vite_svg, public_favicon_svg [INFERRED 0.85]
- **SVG Icon Sprite Sheet Symbols** — public_icons_svg, concept_icon_bluesky, concept_icon_discord, concept_icon_documentation, concept_icon_github, concept_icon_social, concept_icon_x [EXTRACTED 1.00]

## Communities (19 total, 4 thin omitted)

### Community 0 - "Catalog & Filtering UI"
Cohesion: 0.13
Nodes (29): AllCategoriesView(), Props, CatalogFilter(), CatalogSort, Props, SORTS, CategorySection(), Props (+21 more)

### Community 1 - "Header, Cart & Favorites"
Cohesion: 0.12
Nodes (23): AppHeader(), AppHeaderProps, useCartContext(), FavoritesContext, FavoritesContextValue, FavoritesProvider(), useFavoritesContext(), FavoriteItem (+15 more)

### Community 2 - "Product Catalog & Brands"
Cohesion: 0.08
Nodes (35): AJAZZ AK820 White Wave Edition, AULA Wolf Spider WIN60, AJAZZ, AULA, DAGK, WOMIER (Brand), XINMENG (Brand), YK (Brand) (+27 more)

### Community 3 - "Cart Context & Medusa API"
Cohesion: 0.10
Nodes (27): CartContext, CartContextValue, CartProvider(), addToCart(), CatalogPriceItem, clearCartId(), getActiveCategoryIds(), getCartId() (+19 more)

### Community 4 - "Dependencies & Package Config"
Cohesion: 0.06
Nodes (30): dependencies, embla-carousel-react, gsap, lucide-react, react, react-dom, react-phone-number-input, react-router-dom (+22 more)

### Community 5 - "Tooling, Linting & Deployment"
Cohesion: 0.08
Nodes (30): React Logo SVG, Vite Logo SVG, eslint-plugin-react-dom, eslint-plugin-react-x, ESLint type-aware lint rules (tseslint.configs.recommendedTypeChecked), Site Favicon / Brand Icon, Docker frontend service (port 3000:80), Google Fonts Inter (400;500;600;700) (+22 more)

### Community 6 - "App TypeScript Config"
Cohesion: 0.08
Nodes (25): compilerOptions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, jsx, lib, module (+17 more)

### Community 7 - "AJAZZ AK820 Variants"
Cohesion: 0.21
Nodes (20): AJAZZ AK820, AJAZZ AK820 Cyberpunk Edition, AJAZZ AK820 Earth Edition, AJAZZ AK820 Japan Edition, AJAZZ AK820 Jett Edition, AJAZZ AK820 Levi Edition, AJAZZ AK820 Nippon Edition, AJAZZ AK820 Reyna Edition (+12 more)

### Community 8 - "Node TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+11 more)

### Community 9 - "Footer & Interactive Keyboard"
Cohesion: 0.13
Nodes (12): AppFooter(), getAC(), InteractiveKeyboard(), KeyDef, playClick(), ROWS, StoreMeta, StoreMetaContext (+4 more)

### Community 10 - "Brand & Hero Assets"
Cohesion: 0.38
Nodes (7): Hero Keycap Isometric Illustration, Mechanical Keyboard Product Photo (white/black TKL), Klavisha Brand Logo (src/assets), Hero Section Visual — Keycap/Layer Concept, Klavisha Brand Identity, Mechanical Keyboard Product, Klavisha Brand Logo (public)

### Community 12 - "Product Data Schema"
Cohesion: 0.40
Nodes (4): CATEGORIES, Category, Product, products

### Community 13 - "AJAZZ AK820 CS Editions"
Cohesion: 1.00
Nodes (4): AJAZZ AK820 Black Edition - 75% mechanical keyboard, all-black colorway, white backlight, hot-swap, wired, AJAZZ AK820 Black Wave Edition - 75% mechanical keyboard, black case with white wave art on keycaps, USB Type-C, red linear switches shown, AJAZZ AK820 Counter-Strike 2 Edition - 75% mechanical keyboard, white base with orange and red accent keycaps, CS2 branding, USB Type-C, blue tactile switches shown, AJAZZ AK820 CS Edition - 75% mechanical keyboard, black-and-white two-tone keycaps, CS branding, USB Type-C, red linear switches shown

## Knowledge Gaps
- **135 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+130 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `MedusaCategory` connect `Catalog & Filtering UI` to `Cart Context & Medusa API`, `Category Cards View`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `MedusaProduct` connect `Catalog & Filtering UI` to `Header, Cart & Favorites`, `Cart Context & Medusa API`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _135 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Catalog & Filtering UI` be split into smaller, more focused modules?**
  _Cohesion score 0.1282051282051282 - nodes in this community are weakly interconnected._
- **Should `Header, Cart & Favorites` be split into smaller, more focused modules?**
  _Cohesion score 0.11861861861861862 - nodes in this community are weakly interconnected._
- **Should `Product Catalog & Brands` be split into smaller, more focused modules?**
  _Cohesion score 0.07563025210084033 - nodes in this community are weakly interconnected._
- **Should `Cart Context & Medusa API` be split into smaller, more focused modules?**
  _Cohesion score 0.1010752688172043 - nodes in this community are weakly interconnected._