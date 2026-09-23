import React, { useState } from 'react';
import {
  Check,
  Copy,
  Facebook,
  Linkedin,
  MessageCircle,
  QrCode,
  Share2,
  Twitter,
  X,
} from 'lucide-react';
import { Product } from '../types';

interface ShareModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ product, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = `Check out "${product.title}" on TradeSphere!`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">Share Listing</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Product Mini Preview */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
            />
            <div className="overflow-hidden">
              <h4 className="font-bold text-xs text-slate-800 truncate">{product.title}</h4>
              <p className="text-[11px] text-slate-500">{product.businessName}</p>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 sm:p-3 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex flex-col items-center justify-center gap-1 font-semibold transition min-h-[56px]"
            >
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <span className="text-[11px]">WhatsApp</span>
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 sm:p-3 rounded-2xl bg-sky-50 text-sky-700 hover:bg-sky-100 flex flex-col items-center justify-center gap-1 font-semibold transition min-h-[56px]"
            >
              <Twitter className="w-5 h-5 text-sky-600" />
              <span className="text-[11px]">Twitter</span>
            </a>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 sm:p-3 rounded-2xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex flex-col items-center justify-center gap-1 font-semibold transition min-h-[56px]"
            >
              <Facebook className="w-5 h-5 text-indigo-600" />
              <span className="text-[11px]">Facebook</span>
            </a>

            <button
              onClick={() => setShowQr(!showQr)}
              className="p-2.5 sm:p-3 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex flex-col items-center justify-center gap-1 font-semibold transition min-h-[56px]"
            >
              <QrCode className="w-5 h-5 text-slate-600" />
              <span className="text-[11px]">QR Code</span>
            </button>
          </div>

          {/* QR Code view */}
          {showQr && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
              <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow-xs border border-slate-200 flex items-center justify-center">
                {/* SVG QR Code pattern simulation */}
                <div className="w-32 h-32 bg-slate-900 rounded-lg p-2 flex flex-wrap gap-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-xs ${
                        i % 2 === 0 ? 'bg-white' : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Scan to open on smartphone</p>
            </div>
          )}

          {/* Copy Link Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Direct Listing URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 px-3 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-600 truncate outline-none min-h-[44px]"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition min-h-[44px] ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
