import React, { useMemo, useState } from 'react';
import {
  Bookmark,
  Check,
  ChevronDown,
  Filter,
  Grid,
  List,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useMarketplace } from '../context/MarketplaceContext';
import { CATEGORIES } from '../data/mockData';
import { Product, ProductCondition } from '../types';

interface BrowsePageProps {
  onSelectProduct: (product: Product) => void;
  onQuickOrder: (product: Product) => void;
  initialCategory?: string;
  initialSearch?: string;
  initialLocation?: string;
}

export const BrowsePage: React.FC<BrowsePageProps> = ({
  onSelectProduct,
  onQuickOrder,
  initialCategory = 'all',
  initialSearch = '',
  initialLocation = 'All Locations',
}) => {
  const { products, saveCurrentSearch, formatPrice } = useMarketplace();

  // Filters state
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState(initialLocation);
  const [condition, setCondition] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'popular' | 'rating'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSearchSaved, setIsSearchSaved] = useState(false);

  // Sync if initialCategory changes
  React.useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  React.useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  const locationsList = ['All Locations', 'Nairobi', 'Eldoret', 'Mombasa', 'Kisumu', 'Nakuru'];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (p.status !== 'active') return false;

        // Query match
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = p.title.toLowerCase().includes(q);
          const matchesDesc = p.description.toLowerCase().includes(q);
          const matchesBiz = p.businessName.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesBiz) return false;
        }

        // Category match
        if (category !== 'all' && p.category !== category) {
          return false;
        }

        // Location match
        if (location !== 'All Locations' && !p.city.toLowerCase().includes(location.toLowerCase())) {
          return false;
        }

        // Condition match
        if (condition !== 'all' && p.condition !== condition) {
          return false;
        }

        // Price match
        const effectivePrice = p.discountPrice ?? p.price;
        if (minPrice !== '' && effectivePrice < Number(minPrice)) {
          return false;
        }
        if (maxPrice !== '' && effectivePrice > Number(maxPrice)) {
          return false;
        }

        // Verified seller match
        if (verifiedOnly && !p.businessVerified) {
          return false;
        }

        // In Stock match
        if (inStockOnly && p.stock <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.discountPrice ?? a.price;
        const priceB = b.discountPrice ?? b.price;

        if (sortBy === 'price_asc') return priceA - priceB;
        if (sortBy === 'price_desc') return priceB - priceA;
        if (sortBy === 'popular') return b.views - a.views;
        if (sortBy === 'rating') return b.rating - a.rating;
        // default: newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [
    products,
    searchQuery,
    category,
    location,
    condition,
    minPrice,
    maxPrice,
    verifiedOnly,
    inStockOnly,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setCategory('all');
    setLocation('All Locations');
    setCondition('all');
    setMinPrice('');
    setMaxPrice('');
    setVerifiedOnly(false);
    setInStockOnly(false);
    setSortBy('newest');
  };

  const handleSaveSearch = () => {
    saveCurrentSearch(
      searchQuery,
      category !== 'all' ? category : undefined,
      minPrice !== '' ? Number(minPrice) : undefined,
      maxPrice !== '' ? Number(maxPrice) : undefined,
      location !== 'All Locations' ? location : undefined
    );
    setIsSearchSaved(true);
    setTimeout(() => setIsSearchSaved(false), 2500);
  };

  const activeFiltersCount =
    (category !== 'all' ? 1 : 0) +
    (location !== 'All Locations' ? 1 : 0) +
    (condition !== 'all' ? 1 : 0) +
    (minPrice !== '' ? 1 : 0) +
    (maxPrice !== '' ? 1 : 0) +
    (verifiedOnly ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 overflow-x-hidden">
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        {/* Search input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within results..."
            className="w-full pl-10 pr-10 py-3 sm:py-2.5 bg-slate-100 rounded-2xl text-sm sm:text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition min-h-[44px]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Controls right */}
        <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 min-h-[44px]"
          >
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>

          {/* Save this search */}
          <button
            onClick={handleSaveSearch}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border min-h-[44px] ${
              isSearchSaved
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Save this search to your customer dashboard"
          >
            {isSearchSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5 text-indigo-600" />}
            <span className="hidden sm:inline">{isSearchSaved ? 'Saved!' : 'Save Search'}</span>
          </button>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="appearance-none bg-slate-100 hover:bg-slate-200/60 text-xs font-bold text-slate-700 pl-3 pr-8 py-2.5 rounded-xl border-0 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* View Mode Toggle (Grid/List) */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition min-h-[40px] min-w-[40px] flex items-center justify-center ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'
              }`}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition min-h-[40px] min-w-[40px] flex items-center justify-center ${
                viewMode === 'list' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout (Sidebar + Results) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs h-fit sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Filters</h3>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50 outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50 outline-none focus:border-indigo-500"
            >
              {locationsList.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block">Price Range (KSh)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                placeholder="Min (KSh)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full p-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 bg-slate-50"
              />
              <input
                type="number"
                min="0"
                placeholder="Max (KSh)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full p-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 bg-slate-50"
              />
            </div>
          </div>

          {/* Condition Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block">Condition</label>
            <div className="space-y-1.5 text-xs text-slate-600">
              {['all', 'new', 'refurbished', 'used'].map((cond) => (
                <label key={cond} className="flex items-center gap-2 cursor-pointer capitalize">
                  <input
                    type="radio"
                    name="condition"
                    checked={condition === cond}
                    onChange={() => setCondition(cond)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{cond === 'all' ? 'All Conditions' : cond}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-slate-700">Verified Sellers Only</span>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-slate-700">In Stock Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>
        </aside>

        {/* Product Catalog Display */}
        <div className="md:col-span-3 space-y-4">
          {/* Header count */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong>{filteredProducts.length}</strong> matching products
            </span>
            {activeFiltersCount > 0 && (
              <span className="text-indigo-600 font-semibold">{activeFiltersCount} filters active</span>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base text-slate-800">No products match your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price range, clearing specific filters, or checking back later as new products are added daily.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={onSelectProduct}
                  onQuickOrder={onQuickOrder}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row gap-4 cursor-pointer"
                >
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full sm:w-44 h-40 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>{p.businessName}</span>
                        <span className="capitalize">{p.condition}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                      <div className="text-base font-extrabold text-slate-900">
                        {formatPrice(p.discountPrice ?? p.price)}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickOrder(p);
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />
          <div className="relative ml-auto w-full max-w-sm bg-white h-full p-5 shadow-2xl overflow-y-auto space-y-5 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">Filters</h3>
                </div>
                <div className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 min-h-[44px] px-2 flex items-center"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-indigo-500 min-h-[44px]"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 block">Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-indigo-500 min-h-[44px]"
                >
                  {locationsList.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 block">Price Range (KSh)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min (KSh)"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 bg-slate-50 min-h-[44px]"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Max (KSh)"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 bg-slate-50 min-h-[44px]"
                  />
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 block">Condition</label>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  {['all', 'new', 'refurbished', 'used'].map((cond) => (
                    <label
                      key={cond}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer capitalize min-h-[44px] ${
                        condition === cond
                          ? 'border-indigo-600 bg-indigo-50/50 font-bold text-indigo-700'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="mobileCondition"
                        checked={condition === cond}
                        onChange={() => setCondition(cond)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{cond === 'all' ? 'All' : cond}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-slate-50 border border-slate-200 min-h-[44px]">
                  <span className="font-semibold text-slate-700">Verified Sellers Only</span>
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-slate-50 border border-slate-200 min-h-[44px]">
                  <span className="font-semibold text-slate-700">In Stock Only</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md active:scale-98 transition min-h-[48px] flex items-center justify-center"
              >
                Apply Filters ({filteredProducts.length} results)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
