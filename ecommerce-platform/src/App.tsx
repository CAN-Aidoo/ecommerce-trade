import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { HomePage } from '@/pages/home/HomePage';
import { ProductDetailPage } from '@/pages/products/ProductDetailPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { CartPage } from '@/pages/cart/CartPage';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';
import { OrderConfirmationPage } from '@/pages/checkout/OrderConfirmationPage';
import { SearchPage } from '@/pages/search/SearchPage';
import { SellerDashboardPage } from '@/pages/seller/DashboardPage';
import { SellerProductsPage } from '@/pages/seller/ProductsPage';
import { SellerOrdersPage } from '@/pages/seller/OrdersPage';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes without layout */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        
        {/* Main routes with layout */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
              <Route path="/seller" element={<SellerDashboardPage />} />
              <Route path="/seller/products" element={<SellerProductsPage />} />
              <Route path="/seller/orders" element={<SellerOrdersPage />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}
