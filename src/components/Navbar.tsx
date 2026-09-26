import React, { useState } from 'react';
import {
  Armchair,
  Briefcase,
  Car,
  CheckCircle2,
  ChevronDown,
  Clock,
  Coffee,
  Globe,
  HardHat,
  Heart,
  Layers,
  Lock,
  LogOut,
  MapPin,
  Menu,
  PlusCircle,
  Refrigerator,
  Search,
  Shield,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Sprout,
  Store,
  Tv,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { CATEGORIES } from '../data/mockData';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategorySelect: (catId: string) => void;
  selectedLocation: string;
  onLocationSelect: (loc: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenCart,
  onOpenAuth,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  selectedLocation,
  onLocationSelect,
}) => {
  const {
    currentUser,
    signOutUser,
    wishlist,
    cartCount,
    currency,
    setCurrency,
    adminDetails,
  } = useMarketplace();

  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [tempSearch, setTempSearch] = useState(searchQuery);

  const locations = ['All Locations', 'Nairobi', 'Eldoret', 'Mombasa', 'Kisumu', 'Nakuru'];

  // RBAC Permission Gates
  const isGuest = currentUser.id === 'usr_guest';
  const isAdmin = currentUser.role === 'admin';
  const isSeller = currentUser.role === 'seller';
  const isApprovedSeller = isSeller && currentUser.status === 'active';
  const isPendingSeller = isSeller && currentUser.status === 'pending';
  const canPostProduct = isAdmin || isApprovedSeller;
  const canAccessSellerHub = isAdmin || isSeller;
  const canAccessAdminHub = isAdmin;

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Tv': return Tv;
      case 'Smartphone': return Smartphone;
      case 'Shirt': return Shirt;
      case 'Armchair': return Armchair;
      case 'Car': return Car;
      case 'Sprout': return Sprout;
      case 'Coffee': return Coffee;
      case 'HardHat': return HardHat;
      case 'Sparkles': return Sparkles;
      case 'Refrigerator': return Refrigerator;
      case 'Briefcase': return Briefcase;
      default: return Layers;
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(tempSearch);
    if (currentView !== 'browse') {
      onNavigate('browse');
    }
    setIsMobileSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all w-full">
      {/* Platform Announcement Bar */}
      {isBannerVisible && adminDetails.platformBranding.announcementBanner.active && (
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white text-xs py-2 px-3 sm:px-4 transition-all w-full">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 overflow-hidden truncate">
              <span className="bg-white/20 text-white font-bold px-2 py-0.5 rounded text-[10px] sm:text-[11px] uppercase tracking-wider flex-shrink-0">
                Notice
              </span>
              <p className="truncate font-medium text-[11px] sm:text-xs">
                {adminDetails.platformBranding.announcementBanner.text}
              </p>
            </div>
            <button
              onClick={() => setIsBannerVisible(false)}
              className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0 min-h-[32px] min-w-[32px] flex items-center justify-center"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={() => {
                onCategorySelect('all');
                onSearchChange('');
                setTempSearch('');
                onNavigate('home');
              }}
              className="flex items-center gap-2 text-left group min-h-[44px] py-1"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 font-sans truncate max-w-[120px] sm:max-w-none">
                    {adminDetails.platformBranding.marketplaceName || 'TradeSphere'}
                  </span>
                  <span className="hidden sm:inline-flex bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> RBAC Protected
                  </span>
                </div>
                <p className="hidden md:block text-[11px] text-slate-500 font-medium truncate max-w-[190px]">
                  B2B & B2C Secure Commerce
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Search Form */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              {/* Category Selector */}
              <select
                value={selectedCategory}
                onChange={(e) => onCategorySelect(e.target.value)}
                className="absolute left-2.5 z-10 bg-slate-100/90 hover:bg-slate-200/90 text-xs font-semibold text-slate-700 rounded-lg px-2.5 py-2 border-0 focus:ring-2 focus:ring-indigo-500 outline-none transition cursor-pointer max-w-[130px] truncate"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
                placeholder="What are you looking for?"
                className="w-full pl-40 pr-24 py-2.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-800 rounded-2xl border border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
              />

              <button
                type="submit"
                className="absolute right-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 min-h-[36px]"
              >
                <Search className="w-3.5 h-3.5" />
                Search
              </button>
            </form>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1 sm:gap-2.5 flex-shrink-0">
            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-2 sm:hidden rounded-xl text-slate-700 hover:bg-slate-100 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Location selector (Desktop) */}
            <div className="hidden lg:flex items-center">
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => onLocationSelect(e.target.value)}
                  className="appearance-none bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-semibold pl-7 pr-7 py-2 rounded-xl border-0 cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none min-h-[40px]"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Currency Indicator (Desktop) */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 min-h-[40px]"
              title="TradeSphere default currency: Kenyan Shillings (KES / KSh)"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>KES (KSh)</span>
            </div>

            {/* Authenticated Role Status Badge (Secure, non-editable by client browser) */}
            {!isGuest && (
              <div
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border ${
                  isAdmin
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : isApprovedSeller
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isPendingSeller
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
              >
                {isAdmin ? (
                  <>
                    <Shield className="w-3.5 h-3.5 text-rose-600" />
                    <span>Admin Mode</span>
                  </>
                ) : isApprovedSeller ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Seller (Approved)</span>
                  </>
                ) : isPendingSeller ? (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Seller (Pending)</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Buyer</span>
                  </>
                )}
              </div>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('customer-dashboard', { tab: 'wishlist' })}
              className="relative p-2 sm:p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Saved Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative p-2 sm:p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Shopping Cart"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Post a Product CTA (Desktop) - STRICTLY HIDDEN FOR BUYERS & PENDING USERS */}
            {canPostProduct && (
              <button
                onClick={() => onNavigate('post-product')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-sm shadow-emerald-500/20 active:scale-95 transition-all min-h-[40px]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Product</span>
              </button>
            )}

            {/* If Guest: Sign In Button */}
            {isGuest ? (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={() => onNavigate('login')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 min-h-[40px]"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            ) : (
              /* User Profile Avatar & Menu (Desktop) */
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => {
                    signOutUser();
                    onNavigate('home');
                  }}
                  className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition active:scale-95 min-h-[38px]"
                  title="Sign out of account"
                  aria-label="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 rounded-2xl hover:bg-slate-100 transition border border-slate-200 min-h-[40px]"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-300"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-600 mr-1" />
                  </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {currentUser.role}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            currentUser.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : currentUser.status === 'pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {currentUser.status}
                        </span>
                      </div>
                    </div>

                    {/* Customer Dashboard: Accessible to Buyers and Admins */}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('customer-dashboard');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      <span>Customer Dashboard & Orders</span>
                    </button>

                    {/* Seller Merchant Hub: ONLY accessible to Sellers & Admins (HIDDEN FOR BUYERS) */}
                    {canAccessSellerHub && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('seller-dashboard');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                      >
                        <Store className="w-4 h-4 text-emerald-600" />
                        <span>Seller Merchant Hub</span>
                      </button>
                    )}

                    {/* Admin Governance Center: STRICTLY ADMIN ONLY (HIDDEN FOR BUYERS & SELLERS) */}
                    {canAccessAdminHub && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('admin-dashboard');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                      >
                        <Shield className="w-4 h-4 text-rose-600" />
                        <span>Admin Governance Center</span>
                      </button>
                    )}

                    {canPostProduct && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('post-product');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100/70 flex items-center gap-2.5 my-1"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Create New Product</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    {/* Switch Account (RBAC Demo) */}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <Sparkles className="w-4 h-4 text-violet-600" />
                      <span>Switch / Register (RBAC)</span>
                    </button>

                    {/* Sign Out */}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        signOutUser();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
                </div>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-900" />
              ) : (
                <Menu className="w-6 h-6 text-slate-900" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isMobileSearchOpen && (
          <div className="md:hidden pb-3 pt-1 animate-in fade-in slide-in-from-top-2 duration-150">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="search"
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
                placeholder="What are you looking for?"
                className="w-full pl-10 pr-24 py-3 bg-slate-100 text-slate-900 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none text-base min-h-[44px]"
                autoFocus
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold min-h-[36px] flex items-center justify-center active:scale-95"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Category Navigation Sub-Bar */}
      <div className="bg-slate-50 border-t border-slate-200/80 overflow-x-auto no-scrollbar py-2 px-3 sm:px-6 w-full touch-pan-x">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 whitespace-nowrap min-w-max">
          <button
            onClick={() => {
              onCategorySelect('all');
              if (currentView !== 'browse') onNavigate('browse');
            }}
            className={`px-3 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 min-h-[36px] ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            All Categories
          </button>

          {CATEGORIES.map((cat) => {
            const Icon = getCategoryIcon(cat.iconName);
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onCategorySelect(cat.id);
                  if (currentView !== 'browse') onNavigate('browse');
                }}
                className={`px-3 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 min-h-[36px] ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Full Mobile Hamburger Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[calc(100%+1px)] bg-white border-b border-slate-200 shadow-2xl max-h-[85vh] overflow-y-auto z-50 p-4 space-y-4 animate-in slide-in-from-top duration-200">
          {/* User Profile Quick Card */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-11 h-11 rounded-xl object-cover border border-slate-300 flex-shrink-0"
              />
              <div className="overflow-hidden">
                <p className="font-bold text-sm text-slate-900 truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 block">
                {currentUser.role}
              </span>
              <span className="text-[9px] font-semibold text-slate-500 block mt-0.5 capitalize">
                {currentUser.status}
              </span>
            </div>
          </div>

          {/* Primary Action Button: Post Product - ONLY FOR APPROVED SELLERS AND ADMIN */}
          {canPostProduct && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('post-product');
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold text-center flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-98 transition min-h-[48px]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Post a Product Free</span>
            </button>
          )}

          {/* Kenyan Currency Indicator (Mobile) */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs text-emerald-950 font-bold shadow-2xs">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Currency: Kenyan Shillings</span>
            </div>
            <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">
              KES / KSh
            </span>
          </div>

          {/* Main Navigation Links */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">
              Marketplace Navigation
            </div>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('home');
              }}
              className="w-full text-left px-3 py-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 flex items-center justify-between min-h-[44px]"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                <span>Marketplace Home</span>
              </div>
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('browse');
              }}
              className="w-full text-left px-3 py-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 flex items-center justify-between min-h-[44px]"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-indigo-600" />
                <span>Browse Full Catalog</span>
              </div>
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('customer-dashboard', { tab: 'wishlist' });
              }}
              className="w-full text-left px-3 py-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 flex items-center justify-between min-h-[44px]"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>My Saved Wishlist</span>
              </div>
              {wishlist.length > 0 && (
                <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {wishlist.length}
                </span>
              )}
            </button>
          </div>

          {/* Dashboards Section with RBAC route filtering */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">
              Account Dashboards
            </div>

            {/* Customer Dashboard: Available for Buyers and Admins */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('customer-dashboard');
              }}
              className="w-full text-left px-3 py-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 min-h-[44px]"
            >
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>Customer Dashboard & Orders</span>
            </button>

            {/* Seller Merchant Hub: HIDDEN FOR BUYERS */}
            {canAccessSellerHub && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('seller-dashboard');
                }}
                className="w-full text-left px-3 py-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 min-h-[44px]"
              >
                <Store className="w-4 h-4 text-emerald-600" />
                <span>Seller Merchant Hub & Inventory</span>
              </button>
            )}

            {/* Admin Governance Center: STRICTLY ADMIN ONLY */}
            {canAccessAdminHub && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('admin-dashboard');
                }}
                className="w-full text-left px-3 py-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 min-h-[44px]"
              >
                <Shield className="w-4 h-4 text-rose-600" />
                <span>Admin Governance Center</span>
              </button>
            )}
          </div>

          {/* Role Switching & Account Management Modal Trigger */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            {isGuest ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('login');
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition min-h-[48px]"
              >
                <Lock className="w-4 h-4" />
                <span>Password Login / Register</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  signOutUser();
                  onNavigate('home');
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs flex items-center justify-center gap-2 transition min-h-[48px]"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Sign Out Securely</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Switch Identity / Test RBAC Roles</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
