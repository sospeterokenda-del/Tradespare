import React from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  MessageCircle,
  Package,
  PlusCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  Truck,
  Users,
  Zap,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useMarketplace } from '../context/MarketplaceContext';
import { CATEGORIES } from '../data/mockData';
import { BusinessProfile, Product } from '../types';

interface HomePageProps {
  onNavigate: (view: string, params?: any) => void;
  onSelectProduct: (product: Product) => void;
  onSelectBusiness: (business: BusinessProfile) => void;
  onQuickOrder: (product: Product) => void;
  onCategorySelect: (catId: string) => void;
  onSearchChange: (query: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectProduct,
  onSelectBusiness,
  onQuickOrder,
  onCategorySelect,
  onSearchChange,
}) => {
  const { products, businesses, adminDetails, formatPrice } = useMarketplace();

  const [activeTabHowItWorks, setActiveTabHowItWorks] = React.useState<'buyers' | 'businesses'>('buyers');
  const [heroSearch, setHeroSearch] = React.useState('');

  const featuredProducts = products.filter((p) => p.featured && p.status === 'active').slice(0, 8);
  const recentProducts = products.filter((p) => p.status === 'active').slice(0, 8);
  const topBusinesses = businesses.slice(0, 4);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      onSearchChange(heroSearch);
      onNavigate('browse');
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 overflow-x-hidden">
      {/* Dynamic Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 text-white pt-10 sm:pt-16 pb-16 sm:pb-24 px-3 sm:px-6 lg:px-8 rounded-b-3xl shadow-xl">
        {/* Decorative background glows */}
        <div className="absolute top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4 sm:space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
            <span className="truncate">The Premier Verified B2B & B2C Marketplace</span>
          </div>

          {/* Headline required by prompt */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Discover Products. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-teal-300 to-emerald-400">
              Connect With Businesses.
            </span>{' '}
            <br className="hidden sm:block" />
            Grow Your Sales.
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-xs sm:text-base leading-relaxed px-1">
            Source genuine electronics, vehicles, agricultural machinery, construction supplies, fashion, and verified services directly from registered enterprises with M-Pesa & Card escrow protection.
          </p>

          {/* Search bar with placeholder required by prompt */}
          <div className="max-w-2xl mx-auto pt-2">
            <form
              onSubmit={handleHeroSearch}
              className="bg-white p-2 rounded-2xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-slate-100"
            >
              <div className="flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 w-full min-h-[44px]">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="What are you looking for?"
                  className="w-full py-2 bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none font-medium min-h-[44px]"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-xl sm:rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 min-h-[44px]"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick popular tags */}
            <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 mt-4 text-xs text-slate-400">
              <span className="font-semibold text-slate-300 text-[11px] sm:text-xs">Popular:</span>
              {['Solar Pumps', 'MacBook Pro', 'DeWalt Drills', 'Toyota Prado', 'Leather Bags'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    onSearchChange(term);
                    onNavigate('browse');
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition text-[11px] min-h-[30px]"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Required CTAs: “Post a Product” and “Explore Products” */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
            <button
              onClick={() => onNavigate('post-product')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95 min-h-[48px]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Post a Product</span>
            </button>

            <button
              onClick={() => onNavigate('browse')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-xs flex items-center justify-center gap-2 transition-all active:scale-95 min-h-[48px]"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Explore Products</span>
            </button>
          </div>

          {/* Trust KPI Strip */}
          <div className="pt-8 sm:pt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto border-t border-white/10">
            <div className="p-2">
              <p className="text-xl sm:text-3xl font-black text-white">12,400+</p>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Verified Businesses</p>
            </div>
            <div className="p-2">
              <p className="text-xl sm:text-3xl font-black text-white">45,000+</p>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Active Products</p>
            </div>
            <div className="p-2">
              <p className="text-xl sm:text-3xl font-black text-white">99.4%</p>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Delivery Satisfaction</p>
            </div>
            <div className="p-2">
              <p className="text-xl sm:text-3xl font-black text-white">&lt; 15 mins</p>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Avg Seller Response</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Explore Categories</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Browse top industrial, commercial, and consumer marketplace sectors
            </p>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group min-h-[44px] pl-2"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                onCategorySelect(cat.id);
                onNavigate('browse');
              }}
              className="group bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-2 sm:mb-3 bg-slate-100 w-full max-w-full">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">{cat.itemCount}+ listings</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-100 text-amber-800 text-[10px] sm:text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Promoted
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Featured Products</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Top-ranked products from verified premium sellers
            </p>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group min-h-[44px] pl-2"
          >
            <span>See More</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onQuickOrder={onQuickOrder}
            />
          ))}
        </div>
      </section>

      {/* Top Verified Businesses Showcase */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-5 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Verified Merchant Network</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-1">
                Featured Verified Businesses
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Partner with authenticated enterprises, direct manufacturers, and certified distributors.
              </p>
            </div>
            <button
              onClick={() => onNavigate('post-product')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition min-h-[44px]"
            >
              <Store className="w-4 h-4 text-indigo-600" />
              <span>Register Your Business</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {topBusinesses.map((biz) => (
              <div
                key={biz.id}
                onClick={() => onSelectBusiness(biz)}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 hover:bg-white/15 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={biz.logo}
                    alt={biz.businessName}
                    className="w-12 h-12 rounded-xl object-cover border border-white/20 flex-shrink-0"
                  />
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1">
                      <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors truncate">
                        {biz.businessName}
                      </h4>
                      {biz.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-300 font-medium">{biz.category}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {biz.tagline}
                </p>

                <div className="pt-2 border-t border-white/10 space-y-2 text-[11px] text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-amber-300 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {biz.rating} ({biz.reviewCount} reviews)
                    </span>
                    <span className="text-slate-400">{biz.productsCount} listings</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-300 text-[10px]">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span>Responds {biz.responseTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings Grid */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Recent Listings</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Fresh inventory published by vetted businesses and sellers today
            </p>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group min-h-[44px] pl-2"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {recentProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onQuickOrder={onQuickOrder}
            />
          ))}
        </div>
      </section>

      {/* "How It Works" Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-3xl p-5 sm:p-12 border border-slate-200/80">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Simple & Safe Commerce
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900">How TradeSphere Works</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              A seamless bridge connecting buyers seeking authentic goods with credible suppliers.
            </p>

            {/* Toggle Tabs */}
            <div className="inline-flex p-1 bg-white rounded-2xl border border-slate-200 shadow-xs mt-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTabHowItWorks('buyers')}
                className={`flex-1 sm:flex-initial px-3 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition min-h-[44px] ${
                  activeTabHowItWorks === 'buyers'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                For Customers & Buyers
              </button>
              <button
                onClick={() => setActiveTabHowItWorks('businesses')}
                className={`flex-1 sm:flex-initial px-3 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition min-h-[44px] ${
                  activeTabHowItWorks === 'businesses'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                For Sellers & Businesses
              </button>
            </div>
          </div>

          {activeTabHowItWorks === 'buyers' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-lg sm:text-xl shadow-inner">
                  1
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">Search & Compare</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Browse thousands of verified products. Filter by price, category, condition, location, and seller rating.
                </p>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-lg sm:text-xl shadow-inner">
                  2
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">Direct Contact or Instant Order</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Chat directly with sellers on WhatsApp, make a direct phone call, or checkout securely with M-Pesa or Card.
                </p>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-extrabold text-lg sm:text-xl shadow-inner">
                  3
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">Protected Delivery</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your funds are protected in escrow until your goods arrive as described. Rate and review your experience.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-lg sm:text-xl shadow-inner">
                  1
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">Create Business Profile</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload your logo, verified physical address, operating hours, phone, and WhatsApp contact to get your Verified Seal.
                </p>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-lg sm:text-xl shadow-inner">
                  2
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">Publish Products with Live Preview</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  List items with multi-image galleries, video embeds, delivery options, and accepted payment preferences in seconds.
                </p>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-extrabold text-lg sm:text-xl shadow-inner">
                  3
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">Receive Inquiries & Fulfill Orders</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Track orders in your Merchant Dashboard, receive automated notifications, and withdraw earnings directly to M-Pesa or Bank.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            Real Feedback
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900">Loved by Buyers & Sellers</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            See how TradeSphere empowers thousands of merchants and shoppers everyday.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "We ordered three 3HP solar pumps for our Eldoret irrigation project through Verdant Agro. The seller replied on WhatsApp in 5 minutes and delivery arrived the next morning. Absolutely 10/10!"
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="Patrick Koech"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="font-bold text-xs text-slate-900">Patrick Koech</h4>
                <p className="text-[11px] text-slate-400">Farm Director, Rift Valley</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "As an electronics importer, TradeSphere gave Apex Tech instant regional credibility. The direct M-Pesa STK integration doubled our online conversion rate without merchant chargeback risks."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                alt="Sarah Kimani"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="font-bold text-xs text-slate-900">Sarah Kimani</h4>
                <p className="text-[11px] text-slate-400">Founder, Apex Electronics Hub</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "Bought a handcrafted weekend leather duffle bag. The quality of Ethiopian leather is exceptional and being able to inspect the seller's storefront and reviews before ordering gave me complete peace of mind."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="David Mwangi"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="font-bold text-xs text-slate-900">David Mwangi</h4>
                <p className="text-[11px] text-slate-400">Verified Consumer, Nairobi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Monetization / Sell With Us CTA Banner */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-6 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-400/30">
              Zero Listing Fees for New Merchants
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold">Ready to Expand Your Business?</h2>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              Join thousands of vetted merchants already selling on TradeSphere. Post products, get verified, receive direct inquiries, and manage all your orders from one unified dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0 w-full md:w-auto">
            <button
              onClick={() => onNavigate('post-product')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-indigo-900 hover:bg-slate-50 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Post Your First Product</span>
            </button>
            <button
              onClick={() => onNavigate('seller-dashboard', { tab: 'subscriptions' })}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-indigo-500/30 hover:bg-indigo-500/50 text-white font-bold text-xs sm:text-sm border border-white/20 transition active:scale-95 min-h-[44px]"
            >
              <span>Explore Seller Plans</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
