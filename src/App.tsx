import React, { useState } from 'react';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { OrderModal } from './components/OrderModal';
import { ToastContainer } from './components/ToastContainer';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { AdminDashboard } from './pages/AdminDashboard';
import { BrowsePage } from './pages/BrowsePage';
import { BusinessProfilePage } from './pages/BusinessProfilePage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { HomePage } from './pages/HomePage';
import { PostProductPage } from './pages/PostProductPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SellerDashboard } from './pages/SellerDashboard';
import { BusinessProfile, Product } from './types';

function MainApp() {
  const { products, businesses, clearCart } = useMarketplace();

  // Navigation state
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>({});

  // Selected entities
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessProfile | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  // Cart & Order Modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [quickOrderProduct, setQuickOrderProduct] = useState<Product | null>(null);

  // Search & Filter bridge state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');

  const handleNavigate = (view: string, params: any = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBusiness = (business: BusinessProfile) => {
    setSelectedBusiness(business);
    setCurrentView('business-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setCurrentView('post-product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickOrder = (product: Product) => {
    setQuickOrderProduct(product);
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentView('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLocationSelect = (loc: string) => {
    setSelectedLocation(loc);
    setCurrentView('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white overflow-x-hidden w-full relative">
      {/* Toast Notification Layer */}
      <ToastContainer />

      {/* Global Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        selectedLocation={selectedLocation}
        onLocationSelect={handleLocationSelect}
      />

      {/* Main Content Router */}
      <main className="flex-1 overflow-x-hidden w-full">
        {currentView === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
            onSelectBusiness={handleSelectBusiness}
            onQuickOrder={handleQuickOrder}
            onCategorySelect={handleCategorySelect}
            onSearchChange={handleSearchChange}
          />
        )}

        {currentView === 'browse' && (
          <BrowsePage
            initialCategory={selectedCategory}
            initialSearch={searchQuery}
            initialLocation={selectedLocation}
            onSelectProduct={handleSelectProduct}
            onQuickOrder={handleQuickOrder}
          />
        )}

        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => handleNavigate('browse')}
            onSelectProduct={handleSelectProduct}
            onSelectBusiness={handleSelectBusiness}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'business-profile' && selectedBusiness && (
          <BusinessProfilePage
            business={selectedBusiness}
            onBack={() => handleNavigate('home')}
            onSelectProduct={handleSelectProduct}
            onQuickOrder={handleQuickOrder}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'post-product' && (
          <PostProductPage
            editProduct={editingProduct}
            onBack={() => {
              setEditingProduct(undefined);
              handleNavigate('seller-dashboard');
            }}
            onSuccess={(product) => {
              setEditingProduct(undefined);
              handleSelectProduct(product);
            }}
          />
        )}

        {currentView === 'seller-dashboard' && (
          <SellerDashboard
            onNavigate={handleNavigate}
            onEditProduct={handleEditProduct}
            initialTab={viewParams.tab || 'products'}
          />
        )}

        {currentView === 'customer-dashboard' && (
          <CustomerDashboard
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
            onQuickOrder={handleQuickOrder}
            initialTab={viewParams.tab || 'orders'}
          />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboard
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} onCategorySelect={handleCategorySelect} />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => setIsCheckoutModalOpen(true)}
        onSelectProduct={handleSelectProduct}
      />

      {/* Cart Checkout Modal */}
      <OrderModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onSuccess={() => {
          clearCart();
          setIsCheckoutModalOpen(false);
          handleNavigate('customer-dashboard', { tab: 'orders' });
        }}
      />

      {/* 1-Click Quick Order Modal */}
      {quickOrderProduct && (
        <OrderModal
          product={quickOrderProduct}
          isOpen={true}
          onClose={() => setQuickOrderProduct(null)}
          onSuccess={() => {
            setQuickOrderProduct(null);
            handleNavigate('customer-dashboard', { tab: 'orders' });
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <MarketplaceProvider>
      <MainApp />
    </MarketplaceProvider>
  );
}
