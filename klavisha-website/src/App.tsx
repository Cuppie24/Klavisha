import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreMetaProvider } from './context/StoreMeta';
import { FavoritesProvider } from './context/FavoritesContext';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductPage } from './pages/ProductPage';
import { FavoritesPage } from './pages/FavoritesPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <StoreMetaProvider>
        <FavoritesProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/:categoryHandle" element={<CatalogPage />} />
            <Route path="/product/:productHandle" element={<ProductPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
        </FavoritesProvider>
      </StoreMetaProvider>
    </BrowserRouter>
  );
}
