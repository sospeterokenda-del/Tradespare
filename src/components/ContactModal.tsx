import React, { useState } from 'react';
import {
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product } from '../types';

interface ContactModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onInquiryCreated?: (inquiryId: string) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  product,
  isOpen,
  onClose,
  onInquiryCreated,
}) => {
  const { startNewInquiry, formatPrice } = useMarketplace();
  const [activeTab, setActiveTab] = useState<'message' | 'whatsapp' | 'call'>('message');
  const [messageText, setMessageText] = useState(
    `Hello ${product.businessName}, I saw your listing for "${product.title}" on TradeSphere and would like to confirm availability and delivery timeframe.`
  );
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      const inq = startNewInquiry(product.id, messageText);
      setIsSending(false);
      onClose();
      if (onInquiryCreated) {
        onInquiryCreated(inq.id);
      }
    }, 600);
  };

  const whatsappUrl = `https://wa.me/${product.sellerWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hi ${product.businessName}, I am inquiring about "${product.title}" (${formatPrice(
      product.discountPrice ?? product.price
    )}) on TradeSphere.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Contact {product.businessName}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                {product.businessVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                <span>Verified Seller</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product mini header */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-3 text-xs">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
          />
          <div className="overflow-hidden">
            <p className="font-bold text-slate-900 truncate">{product.title}</p>
            <p className="text-indigo-600 font-extrabold mt-0.5">
              {formatPrice(product.discountPrice ?? product.price)}
            </p>
          </div>
        </div>

        {/* Contact Method Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-100/60 p-1 m-3 sm:m-4 rounded-2xl gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('message')}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeTab === 'message'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Message</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeTab === 'whatsapp'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('call')}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeTab === 'call'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-sky-600" />
            <span>Call</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="px-4 sm:px-6 pb-5 sm:pb-6">
          {activeTab === 'message' && (
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Send Direct Inquiry (In-App Messaging)
                </label>
                <textarea
                  rows={4}
                  required
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none resize-none"
                  placeholder="Ask about price negotiation, delivery, or custom orders..."
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  Seller typically replies in under 15 minutes
                </span>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3.5 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-sm transition active:scale-98 min-h-[48px]"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Sending Inquiry...' : 'Submit Inquiry'}</span>
              </button>
            </form>
          )}

          {activeTab === 'whatsapp' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <MessageCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Direct WhatsApp Business</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Click below to open WhatsApp with a prefilled inquiry message including product details.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono text-slate-800">
                {product.sellerWhatsapp}
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition active:scale-98 min-h-[48px]"
              >
                <span>Continue on WhatsApp Web / Mobile</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {activeTab === 'call' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-600 mx-auto flex items-center justify-center shadow-inner">
                <Phone className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Direct Phone Inquiry</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Call the verified sales representative during normal working hours (Mon - Sat: 8 AM - 6:30 PM).
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-bold font-mono text-slate-900">
                {product.sellerPhone}
              </div>

              <a
                href={`tel:${product.sellerPhone}`}
                className="w-full py-3.5 rounded-2xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition active:scale-98 min-h-[48px]"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now ({product.sellerPhone})</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
