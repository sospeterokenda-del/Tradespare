import React, { useState } from 'react';
import {
  Armchair,
  Briefcase,
  Car,
  CheckCircle2,
  ChevronDown,
  Coffee,
  Globe,
  HardHat,
  Heart,
  Layers,
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
  X,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { CATEGORIES } from '../data/mockData';
import { UserRole } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenCart: () => void;
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
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  selectedLocation,
  onLocationSelect,
}) => {
  const {
    currentUser,
    switchRole,
    wishlist,
    cartCount,
    currency,
    setCurrency,
    adminDetails,
  } = useMarketplace();

  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [tempSearch, setTempSearch] = useState(searchQuery);

  const locations = ['All Locations', 'Nairobi', 'Eldoret', 'Mombasa', 'Kisumu', 'Nakuru'];

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
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                  </span>
                </div>
                <p className="hidden md:block text-[11px] text-slate-500 font-medium truncate max-w-[190px]">
                  B2B & B2C Commerce Engine
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

            {/* Currency Switcher (Desktop) */}
            <button
              onClick={() => setCurrency(currency === 'USD' ? 'KES' : 'USD')}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition min-h-[40px]"
              title="Click to switch currency"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{currency}</span>
            </button>

            {/* Role Switcher (Desktop) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border min-h-[40px] ${
                  currentUser.role === 'admin'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    : currentUser.role === 'seller'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                }`}
                title="Switch active role to test features"
              >
                <span className="w-2 h-2 rounded-full animate-pulse bg-current" />
                <span className="capitalize">{currentUser.role} Mode</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Role Testing Switcher
                  </div>
                  <button
                    onClick={() => {
                      switchRole('customer');
                      setIsRoleMenuOpen(false);
                      onNavigate('customer-dashboard');
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                      currentUser.role === 'customer'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Customer Profile</span>
                    {currentUser.role === 'customer' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      switchRole('seller');
                      setIsRoleMenuOpen(false);
                      onNavigate('seller-dashboard');
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                      currentUser.role === 'seller'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Seller / Merchant</span>
                    {currentUser.role === 'seller' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      switchRole('admin');
                      setIsRoleMenuOpen(false);
                      onNavigate('admin-dashboard');
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                      currentUser.role === 'admin'
                        ? 'bg-rose-50 text-rose-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Admin Control Hub</span>
                    {currentUser.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

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

            {/* Post a Product CTA (Desktop) */}
            <button
              onClick={() => onNavigate('post-product')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-sm shadow-emerald-500/20 active:scale-95 transition-all min-h-[40px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Product</span>
            </button>

            {/* User Profile Avatar / Menu (Desktop) */}
            <div className="relative hidden md:block">
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
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {currentUser.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('customer-dashboard');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    Customer Dashboard
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('seller-dashboard');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <Store className="w-4 h-4 text-emerald-600" />
                    Seller Merchant Hub
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('admin-dashboard');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <Shield className="w-4 h-4 text-rose-600" />
                    Admin Governance Center
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('post-product');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-2.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Create New Product
                  </button>
                </div>
              )}
            </div>

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

        {/* Mobile Search Bar (Expandable or always visible below header on small screens) */}
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

      {/* Category Pills Navigation Sub-Bar */}
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
            <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 flex-shrink-0">
              {currentUser.role}
            </span>
          </div>

          {/* Primary Action Button: Post Product */}
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

          {/* Dashboards Section */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">
              Account Dashboards
            </div>
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
          </div>

          {/* Role Switcher in Mobile Drawer */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Role Testing Switcher
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => {
                  switchRole('customer');
                  setIsMobileMenuOpen(false);
                  onNavigate('customer-dashboard');
                }}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold text-center border min-h-[44px] flex items-center justify-center ${
                  currentUser.role === 'customer'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => {
                  switchRole('seller');
                  setIsMobileMenuOpen(false);
                  onNavigate('seller-dashboard');
                }}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold text-center border min-h-[44px] flex items-center justify-center ${
                  currentUser.role === 'seller'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Seller
              </button>
              <button
                onClick={() => {
                  switchRole('admin');
                  setIsMobileMenuOpen(false);
                  onNavigate('admin-dashboard');
                }}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold text-center border min-h-[44px] flex items-center justify-center ${
                  currentUser.role === 'admin'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Location & Currency Preferences in Drawer */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5 text-xs text-slate-700">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 min-h-[44px]">
              <span className="font-semibold flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>Region:</span>
              </span>
              <select
                value={selectedLocation}
                onChange={(e) => onLocationSelect(e.target.value)}
                className="bg-transparent font-bold text-slate-800 outline-none text-xs"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 min-h-[44px]">
              <span className="font-semibold flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-slate-500" />
                <span>Currency:</span>
              </span>
              <button
                onClick={() => setCurrency(currency === 'USD' ? 'KES' : 'USD')}
                className="font-bold text-indigo-600 px-3 py-1 bg-white rounded-lg border border-slate-200"
              >
                Switch to {currency === 'USD' ? 'KES (KSh)' : 'USD ($)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
