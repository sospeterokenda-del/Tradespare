import React from 'react';
import {
  CheckCircle2,
  CreditCard,
  Facebook,
  Heart,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Twitter,
  Zap,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { CATEGORIES } from '../data/mockData';

interface FooterProps {
  onNavigate: (view: string, params?: any) => void;
  onCategorySelect: (catId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onCategorySelect }) => {
  const { adminDetails, isSuperAdmin } = useMarketplace();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Verified Businesses</h4>
              <p className="text-xs text-slate-400">Strict vetting & physical registration verification</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">M-Pesa & Card Security</h4>
              <p className="text-xs text-slate-400">Instant STK push & bank-grade 256-bit encryption</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Direct Seller Contact</h4>
              <p className="text-xs text-slate-400">Instant WhatsApp chat, phone calls & inquiry forms</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Buyer Protection</h4>
              <p className="text-xs text-slate-400">Escrow support & rapid dispute resolution team</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                {adminDetails.platformBranding.marketplaceName}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {adminDetails.platformBranding.tagline} Connecting thousands of vetted enterprises, farmers, artisans, and consumers with seamless trade.
            </p>
            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>{adminDetails.platformBranding.businessAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>{adminDetails.platformBranding.supportPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>{adminDetails.platformBranding.supportEmail}</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-white font-bold text-sm mb-4 tracking-wide uppercase">Top Categories</h5>
            <ul className="space-y-2.5 text-xs">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onCategorySelect(cat.id);
                      onNavigate('browse');
                    }}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For Businesses & Sellers */}
          <div>
            <h5 className="text-white font-bold text-sm mb-4 tracking-wide uppercase">For Businesses</h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('post-product')} className="hover:text-white transition-colors">
                  Post a Product Free
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('seller-dashboard')} className="hover:text-white transition-colors">
                  Seller Merchant Hub
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('seller-dashboard', { tab: 'subscriptions' })} className="hover:text-white transition-colors">
                  Merchant Subscription Plans
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('seller-dashboard', { tab: 'analytics' })} className="hover:text-white transition-colors">
                  Analytics & Sales Reports
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('seller-dashboard', { tab: 'profile' })} className="hover:text-white transition-colors">
                  Business Verification Seal
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Governance */}
          <div>
            <h5 className="text-white font-bold text-sm mb-4 tracking-wide uppercase">Trust & Support</h5>
            <ul className="space-y-2.5 text-xs">
              {isSuperAdmin && (
                <li>
                  <button onClick={() => onNavigate('admin-dashboard')} className="hover:text-white transition-colors flex items-center gap-1.5 text-rose-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Admin Governance Portal
                  </button>
                </li>
              )}
              <li>
                <button onClick={() => onNavigate('customer-dashboard', { tab: 'orders' })} className="hover:text-white transition-colors">
                  Track My Orders
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('customer-dashboard', { tab: 'saved-searches' })} className="hover:text-white transition-colors">
                  Saved Search Alerts
                </button>
              </li>
              <li>
                <span className="text-slate-500">Terms of Service & Escrow</span>
              </li>
              <li>
                <span className="text-slate-500">Privacy & Data Compliance</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Payment Gateways & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center md:justify-start">
            <span className="font-semibold text-slate-400 w-full md:w-auto text-center md:text-left">Accepted Payments:</span>
            <span className="px-2.5 py-1.5 bg-slate-800 rounded-lg text-emerald-400 font-bold border border-slate-700 text-[11px]">
              M-Pesa STK
            </span>
            <span className="px-2.5 py-1.5 bg-slate-800 rounded-lg text-slate-300 font-bold border border-slate-700 text-[11px]">
              Visa / Card
            </span>
            <span className="px-2.5 py-1.5 bg-slate-800 rounded-lg text-amber-400 font-bold border border-slate-700 text-[11px]">
              Airtel Money
            </span>
            <span className="px-2.5 py-1.5 bg-slate-800 rounded-lg text-sky-400 font-bold border border-slate-700 text-[11px]">
              Bank Transfer
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <a href="#" className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[11px]">© {new Date().getFullYear()} {adminDetails.platformBranding.marketplaceName}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
