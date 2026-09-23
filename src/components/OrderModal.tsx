import React, { useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  Truck,
  User,
  X,
} from 'lucide-react';
import { CartItem, useMarketplace } from '../context/MarketplaceContext';
import { Order, PaymentOption, Product } from '../types';

interface OrderModalProps {
  product?: Product;
  cartItems?: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  product,
  cartItems,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, formatPrice, placeOrder, clearCart } = useMarketplace();

  // If a single product was clicked, create synthetic cart item
  const items: CartItem[] = product
    ? [{ product, quantity: 1 }]
    : cartItems || [];

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discountPrice ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = items.length > 0 ? Math.max(...items.map((i) => i.product.deliveryFee || 0)) : 0;
  const total = subtotal + deliveryFee;

  // Form State
  const [buyerName, setBuyerName] = useState(currentUser.name || '');
  const [buyerEmail, setBuyerEmail] = useState(currentUser.email || '');
  const [buyerPhone, setBuyerPhone] = useState(currentUser.phone || '+254 712 345 678');
  const [buyerAddress, setBuyerAddress] = useState(currentUser.location || 'Nairobi, Kenya');
  const [paymentMethod, setPaymentMethod] = useState<PaymentOption>('mpesa');
  const [notes, setNotes] = useState('');

  // Payment simulation state
  const [mpesaPhone, setMpesaPhone] = useState(currentUser.phone || '+254712345678');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mpesaStep, setMpesaStep] = useState<'idle' | 'push_sent' | 'pin_verified'>('idle');
  const [countdown, setCountdown] = useState(3);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || items.length === 0) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!buyerName || !buyerPhone || !buyerAddress) {
      setErrorMessage('Please fill in all delivery details');
      return;
    }

    setIsProcessing(true);

    if (paymentMethod === 'mpesa') {
      // Simulate M-Pesa STK Push
      setMpesaStep('push_sent');
      setTimeout(() => {
        setMpesaStep('pin_verified');
        setTimeout(async () => {
          try {
            const createdOrder = await placeOrder({
              buyerName,
              buyerEmail,
              buyerPhone,
              buyerAddress,
              paymentMethod: 'mpesa',
              notes,
              items,
            });
            setIsProcessing(false);
            setMpesaStep('idle');
            onSuccess(createdOrder);
          } catch (err: any) {
            setErrorMessage(err.message || 'Payment failed');
            setIsProcessing(false);
          }
        }, 1200);
      }, 2000);
    } else {
      // Other payment methods simulation
      setTimeout(async () => {
        try {
          const createdOrder = await placeOrder({
            buyerName,
            buyerEmail,
            buyerPhone,
            buyerAddress,
            paymentMethod,
            notes,
            items,
          });
          setIsProcessing(false);
          onSuccess(createdOrder);
        } catch (err: any) {
          setErrorMessage(err.message || 'Failed to place order');
          setIsProcessing(false);
        }
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-base leading-none truncate">Complete Your Order</h3>
              <p className="text-xs text-slate-400 mt-1 truncate">Escrow Protected Checkout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Items Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h4>
            <div className="divide-y divide-slate-200/80 max-h-40 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                    />
                    <div className="truncate">
                      <p className="font-bold text-slate-800 truncate">{item.product.title}</p>
                      <p className="text-slate-500 text-[11px]">
                        Qty: {item.quantity} × {formatPrice(item.product.discountPrice ?? item.product.price)}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 flex-shrink-0">
                    {formatPrice((item.product.discountPrice ?? item.product.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery Fee</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1">
                <span>Total Due</span>
                <span className="text-indigo-600">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Buyer Delivery Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none min-h-[44px]"
                    placeholder="e.g. David Mwangi"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number (Required)</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none min-h-[44px]"
                    placeholder="+254 7XX XXX XXX"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Physical Delivery Address (Street / Building / House No.)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none min-h-[44px]"
                    placeholder="e.g. Suite 402, Victoria Plaza, Parklands Rd, Nairobi"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Delivery Notes / Gate Code (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none min-h-[44px]"
                  placeholder="e.g. Call when outside the main gate"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Payment Method</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('mpesa')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 min-h-[56px] ${
                  paymentMethod === 'mpesa'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold">M-Pesa STK</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 min-h-[56px] ${
                  paymentMethod === 'card'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-bold">Card / Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 min-h-[56px] ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-sky-600 bg-sky-50 text-sky-900 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Building2 className="w-5 h-5 text-sky-600" />
                <span className="text-xs font-bold">Bank Wire</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash_on_delivery')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 min-h-[56px] ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <DollarSign className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-bold">Pay on Delivery</span>
              </button>
            </div>

            {/* M-Pesa Specific Input */}
            {paymentMethod === 'mpesa' && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Safaricom M-Pesa Express (STK Push)</span>
                </div>
                <p className="text-emerald-700 text-[11px]">
                  We will send a secure payment prompt directly to your phone. Enter your 4-digit M-Pesa PIN to complete payment.
                </p>
                <div>
                  <label className="block font-semibold text-emerald-900 mb-1">M-Pesa Registered Number</label>
                  <input
                    type="tel"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-emerald-300 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none min-h-[44px]"
                    placeholder="e.g. 0712345678"
                  />
                </div>
              </div>
            )}

            {/* Card Specific Input Simulation */}
            {paymentMethod === 'card' && (
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>256-Bit Encrypted Card Payment</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Card Number: 4242 •••• •••• 4242"
                    defaultValue="4242 4242 4242 4242"
                    className="col-span-2 px-3 py-2.5 rounded-xl bg-white border border-indigo-200 text-slate-800 font-mono text-xs outline-none min-h-[44px]"
                  />
                  <input
                    type="text"
                    placeholder="MM / YY"
                    defaultValue="12/28"
                    className="px-3 py-2.5 rounded-xl bg-white border border-indigo-200 text-slate-800 font-mono text-xs outline-none min-h-[44px]"
                  />
                  <input
                    type="password"
                    placeholder="CVC"
                    defaultValue="123"
                    className="px-3 py-2.5 rounded-xl bg-white border border-indigo-200 text-slate-800 font-mono text-xs outline-none min-h-[44px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Trust Seal */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>TradeSphere Guarantee:</strong> Payments are held safely in escrow until your order is verified and received.
            </span>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition min-h-[48px] flex items-center justify-center"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full sm:w-auto sm:flex-1 py-3.5 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-70 min-h-[48px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mpesaStep === 'push_sent' && 'Waiting for PIN on phone...'}
                  {mpesaStep === 'pin_verified' && 'M-Pesa PIN confirmed! Finalizing order...'}
                  {mpesaStep === 'idle' && 'Securing transaction...'}
                </>
              ) : (
                <>
                  <span>Confirm & Pay {formatPrice(total)}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
