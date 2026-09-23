import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Flag, ShieldAlert, X } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product } from '../types';

interface ReportModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ product, isOpen, onClose }) => {
  const { showToast } = useMarketplace();
  const [reason, setReason] = useState('prohibited_item');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      showToast('Thank you. This listing has been flagged for Admin review.', 'info');
      onClose();
      setSubmitted(false);
      setDetails('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        <div className="p-4 sm:p-5 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-white" />
            <h3 className="font-bold text-base">Report Listing</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-900">Report Submitted</h4>
            <p className="text-xs text-slate-500">
              Our Trust & Safety moderators will investigate "{product.title}".
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            <p className="text-xs text-slate-600">
              Help us keep TradeSphere safe, authentic, and verified. Why are you reporting this item?
            </p>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700">Reason for Report</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 outline-none focus:border-rose-500 min-h-[44px]"
              >
                <option value="counterfeit">Suspected counterfeit or fake goods</option>
                <option value="prohibited_item">Prohibited or illegal item</option>
                <option value="misleading_price">Misleading price or description</option>
                <option value="unresponsive_seller">Fraudulent / unresponsive seller</option>
                <option value="copyright">Intellectual property / copyright violation</option>
                <option value="other">Other issue</option>
              </select>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block font-bold text-slate-700">Additional Details</label>
              <textarea
                rows={3}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please describe why this listing should be reviewed..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 min-h-[44px] flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm min-h-[44px] flex items-center justify-center"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
