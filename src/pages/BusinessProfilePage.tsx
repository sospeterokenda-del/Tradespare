import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Twitter,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useMarketplace } from '../context/MarketplaceContext';
import { BusinessProfile, Product } from '../types';

interface BusinessProfilePageProps {
  business: BusinessProfile;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onQuickOrder: (product: Product) => void;
  onNavigate: (view: string, params?: any) => void;
}

export const BusinessProfilePage: React.FC<BusinessProfilePageProps> = ({
  business,
  onBack,
  onSelectProduct,
  onQuickOrder,
  onNavigate,
}) => {
  const { products, currentUser } = useMarketplace();
  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'reviews'>('products');

  const businessProducts = products.filter(
    (p) => (p.businessId === business.id || p.sellerId === business.ownerId) && p.status === 'active'
  );

  const isOwner = currentUser.id === business.ownerId || currentUser.businessId === business.id;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition min-h-[44px] pr-3"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Hero Header & Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Banner Cover Image */}
        <div className="h-36 sm:h-64 w-full relative bg-slate-900">
          <img
            src={business.banner}
            alt={business.businessName}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Business Info Header */}
        <div className="px-4 sm:px-10 pb-6 sm:pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-20 mb-6">
            <div className="flex items-end gap-3 sm:gap-4">
              <img
                src={business.logo}
                alt={business.businessName}
                className="w-20 h-20 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl object-cover border-4 border-white shadow-xl bg-white flex-shrink-0"
              />
              <div className="mb-1 sm:mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900">
                    {business.businessName}
                  </h1>
                  {business.verified && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium line-clamp-1">{business.tagline}</p>
              </div>
            </div>

            {/* Direct Contact CTAs */}
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`tel:${business.phone}`}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition min-h-[44px]"
              >
                <Phone className="w-4 h-4 text-slate-600" />
                <span>Call ({business.phone})</span>
              </a>

              {isOwner && (
                <button
                  onClick={() => onNavigate('seller-dashboard', { tab: 'profile' })}
                  className="px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs border border-indigo-200 min-h-[44px]"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100 text-xs">
            <div className="space-y-0.5">
              <p className="text-slate-400">Rating & Trust</p>
              <div className="flex items-center gap-1 font-extrabold text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span>{business.rating}</span>
                <span className="text-slate-400 font-normal">({business.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <p className="text-slate-400">Response Speed</p>
              <p className="font-bold text-slate-800 flex items-center gap-1 text-emerald-600">
                <Clock className="w-3.5 h-3.5" />
                {business.responseTime}
              </p>
            </div>

            <div className="space-y-0.5">
              <p className="text-slate-400">Location</p>
              <p className="font-bold text-slate-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                {business.city}, {business.country}
              </p>
            </div>

            <div className="space-y-0.5">
              <p className="text-slate-400">Member Since</p>
              <p className="font-bold text-slate-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {business.memberSince}
              </p>
            </div>
          </div>

          {/* Badges strip */}
          <div className="flex items-center gap-2 flex-wrap pt-4">
            {business.badges.map((badge, idx) => (
              <span
                key={idx}
                className="bg-slate-100 text-slate-700 font-semibold text-[11px] px-3 py-1 rounded-full flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-200 gap-4 sm:gap-6 text-xs sm:text-sm font-bold overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 border-b-2 transition flex-shrink-0 min-h-[44px] ${
              activeTab === 'products'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Product Catalog ({businessProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-3 border-b-2 transition flex-shrink-0 min-h-[44px] ${
              activeTab === 'about'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            About & Operating Hours
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition flex-shrink-0 min-h-[44px] ${
              activeTab === 'reviews'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Verified Reviews ({business.reviewCount})
          </button>
        </div>

        {/* Tab 1: Products */}
        {activeTab === 'products' && (
          <div>
            {businessProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
                No active listings published right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {businessProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onSelect={onSelectProduct}
                    onQuickOrder={onQuickOrder}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: About & Operating Hours */}
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-base text-slate-900">About {business.businessName}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {business.description}
              </p>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-bold text-xs text-slate-900 mb-2">Physical Business Address</h4>
                <p className="text-xs text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  {business.address}, {business.city}, {business.country}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-900">Business Hours & Links</h3>
              <div>
                <span className="text-slate-400 block mb-1">Operating Hours</span>
                <span className="font-bold text-slate-800">{business.operatingHours}</span>
              </div>

              {business.website && (
                <div>
                  <span className="text-slate-400 block mb-1">Official Website</span>
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <span>{business.website.replace('https://', '')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div>
                <span className="text-slate-400 block mb-1">Direct Inquiries</span>
                <p className="font-semibold text-slate-800">{business.email}</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block mb-2">Social Channels</span>
                <div className="flex gap-2">
                  {business.socialLinks?.instagram && (
                    <a
                      href="#"
                      className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-indigo-600"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {business.socialLinks?.facebook && (
                    <a
                      href="#"
                      className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-indigo-600"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {business.socialLinks?.linkedin && (
                    <a
                      href="#"
                      className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-indigo-600"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {business.socialLinks?.twitter && (
                    <a
                      href="#"
                      className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-indigo-600"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Verified Seller Feedback</h3>
            <p className="text-xs text-slate-500">
              Customers who completed orders with {business.businessName} gave an average satisfaction rating of {business.rating} / 5.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
