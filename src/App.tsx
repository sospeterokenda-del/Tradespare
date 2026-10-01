import React, { useState } from 'react';
import { AccessDenied } from './components/AccessDenied';
import { AuthModal } from './components/AuthModal';
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
import { LoginPage } from './pages/LoginPage';
import { PostProductPage } from './pages/PostProductPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SellerDashboard } from './pages/SellerDashboard';
import { BusinessProfile, Product } from './types';

function MainApp() {
  const { products, businesses, clearCart, currentUser, isSuperAdmin } = useMarketplace();

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

  // Authentication & RBAC Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authExplanation, setAuthExplanation] = useState<string | undefined>(undefined);

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

  // RBAC Helper Checks
  const isGuest = currentUser.id === 'usr_guest';
  const isAdmin = currentUser.role === 'admin';
  const isSeller = currentUser.role === 'seller';
  const isApprovedSeller = isSeller && currentUser.status === 'active';
  const isPendingSeller = isSeller && currentUser.status === 'pending';
  const isSuspended = currentUser.status === 'suspended';
  const isRejected = currentUser.status === 'rejected';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white overflow-x-hidden w-full relative">
      {/* Toast Notification Layer */}
      <ToastContainer />

      {/* Global Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => {
          setAuthExplanation(undefined);
          setIsAuthModalOpen(true);
        }}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        selectedLocation={selectedLocation}
        onLocationSelect={handleLocationSelect}
      />

      {/* Main Content Router with RBAC Route Guards */}
      <main className="flex-1 overflow-x-hidden w-full">
        {/* Home Page */}
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

        {/* Dedicated Password Login View */}
        {currentView === 'login' && (
          <LoginPage
            onNavigate={handleNavigate}
            initialTab="login"
          />
        )}

        {/* Dedicated Password Recovery View */}
        {currentView === 'forgot-password' && (
          <LoginPage
            onNavigate={handleNavigate}
            initialTab="recovery"
          />
        )}

        {/* Dedicated Account Registration View */}
        {currentView === 'register' && (
          <LoginPage
            onNavigate={handleNavigate}
            initialTab="register"
          />
        )}

        {/* Public Catalog Browse */}
        {currentView === 'browse' && (
          <BrowsePage
            initialCategory={selectedCategory}
            initialSearch={searchQuery}
            initialLocation={selectedLocation}
            onSelectProduct={handleSelectProduct}
            onQuickOrder={handleQuickOrder}
          />
        )}

        {/* Product Detail Page */}
        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => handleNavigate('browse')}
            onSelectProduct={handleSelectProduct}
            onSelectBusiness={handleSelectBusiness}
            onNavigate={handleNavigate}
            onEditProduct={handleEditProduct}
          />
        )}

        {/* Business Storefront Profile */}
        {currentView === 'business-profile' && selectedBusiness && (
          <BusinessProfilePage
            business={selectedBusiness}
            onBack={() => handleNavigate('home')}
            onSelectProduct={handleSelectProduct}
            onQuickOrder={handleQuickOrder}
            onNavigate={handleNavigate}
          />
        )}

        {/* Post / Edit Product (PROTECTED: Approved Sellers & Admins Only) */}
        {currentView === 'post-product' && (
          isGuest ? (
            <AccessDenied
              reason="not_authenticated"
              requiredRole="seller"
              onNavigate={handleNavigate}
              onOpenAuth={() => {
                setAuthExplanation('Sign in as an approved Seller or Admin to publish products.');
                setIsAuthModalOpen(true);
              }}
            />
          ) : isSuspended ? (
            <AccessDenied
              reason="account_suspended"
              onNavigate={handleNavigate}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          ) : isRejected ? (
            <AccessDenied
              reason="account_rejected"
              onNavigate={handleNavigate}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          ) : (!isAdmin && !isSeller) ? (
            <AccessDenied
              reason="role_restricted"
              requiredRole="seller"
              onNavigate={handleNavigate}
              onOpenAuth={() => {
                setAuthExplanation('You are signed in as a Buyer. Switch or register as a Seller to publish products.');
                setIsAuthModalOpen(true);
              }}
            />
          ) : isPendingSeller ? (
            <AccessDenied
              reason="seller_pending"
              onNavigate={handleNavigate}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          ) : editingProduct && editingProduct.sellerId !== currentUser.id && !isAdmin ? (
            <AccessDenied
              reason="not_owner"
              onNavigate={handleNavigate}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          ) : (
            <PostProductPage
              editProduct={editingProduct}
              onBack={() => {
                setEditingProduct(undefined);
                handleNavigate(isAdmin ? 'admin-dashboard' : 'seller-dashboard');
              }}
              onSuccess={(product) => {
                setEditingProduct(undefined);
                handleSelectProduct(product);
              }}
            />
          )
        )}

        {/* Seller Dashboard (PROTECTED: Sellers & Admins Only) */}
        {currentView === 'seller-dashboard' && (
          isGuest ? (
            <AccessDenied
              reason="not_authenticated"
              requiredRole="seller"
              onNavigate={handleNavigate}
              onOpenAuth={() => {
                setAuthExplanation('Sign in to access your Seller Merchant Dashboard.');
                setIsAuthModalOpen(true);
              }}
            />
          ) : isSuspended ? (
            <AccessDenied
              reason="account_suspended"
              onNavigate={handleNavigate}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          ) : isRejected ? (
            <AccessDenied
              reason="account_rejected"
              onNavigate={handleNavigate}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          ) : (!isAdmin && !isSeller) ? (
            <AccessDenied
              reason="role_restricted"
              requiredRole="seller"
              onNavigate={handleNavigate}
              onOpenAuth={() => {
                setAuthExplanation('You are signed in as a Buyer. The Seller Merchant Hub is restricted to Sellers and Admins.');
                setIsAuthModalOpen(true);
              }}
            />
          ) : (
            <SellerDashboard
              onNavigate={handleNavigate}
              onEditProduct={handleEditProduct}
              initialTab={viewParams.tab || 'products'}
            />
          )
        )}

        {/* Customer Dashboard (PROTECTED: Authenticated Customers, Sellers & Admins) */}
        {currentView === 'customer-dashboard' && (
          isGuest ? (
            <AccessDenied
              reason="not_authenticated"
              requiredRole="buyer"
              onNavigate={handleNavigate}
              onOpenAuth={() => {
                setAuthExplanation('Sign in to view your orders, saved searches, and wishlist.');
                setIsAuthModalOpen(true);
              }}
            />
          ) : (
            <CustomerDashboard
              onNavigate={handleNavigate}
              onSelectProduct={handleSelectProduct}
              onQuickOrder={handleQuickOrder}
              initialTab={viewParams.tab || 'orders'}
            />
          )
        )}

        {/* Admin Dashboard (STRICTLY PROTECTED: Super Administrator Only) */}
        {currentView === 'admin-dashboard' && (
          isGuest ? (
            <AccessDenied
              reason="not_authenticated"
              requiredRole="super_admin"
              onNavigate={handleNavigate}
              onOpenAuth={() => {
                setAuthExplanation('Super Admin Mode strictly requires signing in as sospeterokenda@gmail.com.');
                setIsAuthModalOpen(true);
              }}
            />
          ) : !isSuperAdmin ? (
            <AccessDenied
              reason="role_restricted"
              requiredRole="Super Admin (sospeterokenda@gmail.com)"
              onNavigate={handleNavigate}
              onOpenAuth={() => {
                setAuthExplanation('Access Denied: Only the verified Super Admin (sospeterokenda@gmail.com) can enter Super Admin Mode.');
                setIsAuthModalOpen(true);
              }}
            />
          ) : (
            <AdminDashboard
              onNavigate={handleNavigate}
              onSelectProduct={handleSelectProduct}
            />
          )
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} onCategorySelect={handleCategorySelect} />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          if (isGuest) {
            setAuthExplanation('Please sign in or register to place your order securely.');
            setIsAuthModalOpen(true);
          } else {
            setIsCheckoutModalOpen(true);
          }
        }}
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

      {/* Authentication & Role Selection Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        explanationMessage={authExplanation}
        onSuccessfulLogin={(user) => {
          if (user.role === 'admin' || user.email?.toLowerCase() === 'sospeterokenda@gmail.com') {
            handleNavigate('admin-dashboard');
          } else if (user.role === 'seller') {
            handleNavigate('seller-dashboard');
          } else {
            handleNavigate('customer-dashboard');
          }
        }}
      />
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
