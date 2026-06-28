import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration } from 'react-router-dom';
import { StoreMetaProvider } from './context/StoreMeta';
import { FavoritesProvider } from './context/FavoritesContext';
import { CartProvider } from './context/CartContext';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductPage } from './pages/ProductPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { CartPage } from './pages/CartPage';
import './App.css';

// Root layout. <ScrollRestoration> (a data-router feature) owns scroll save +
// restore for every navigation, including the browser back/forward button.
// Keyed by pathname so returning to a catalog URL — by back button OR by an
// in-app link to the same path — restores where you were. The catalog renders
// at full height synchronously on return (synchronous category + product caches,
// see medusa.ts / CategorySection), which is what lets the restore land exactly.
function RootLayout() {
  return (
    <StoreMetaProvider>
      <FavoritesProvider>
        <CartProvider>
          <Outlet />
          <ScrollRestoration getKey={(location) => location.pathname} />
        </CartProvider>
      </FavoritesProvider>
    </StoreMetaProvider>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/catalog', element: <CatalogPage /> },
      { path: '/catalog/:categoryHandle', element: <CatalogPage /> },
      { path: '/product/:productHandle', element: <ProductPage /> },
      { path: '/favorites', element: <FavoritesPage /> },
      { path: '/cart', element: <CartPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
