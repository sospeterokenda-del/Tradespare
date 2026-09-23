import React, { useState, useRef } from 'react';
import {
  Bell,
  Bookmark,
  CheckCircle2,
  Clock,
  Heart,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  RotateCcw,
  Search,
  Send,
  ShoppingBag,
  Trash2,
  Truck,
  Upload,
  User,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product } from '../types';

interface CustomerDashboardProps {
  onNavigate: (view: string, params?: any) => void;
  onSelectProduct: (product: Product) => void;
  onQuickOrder: (product: Product) => void;
  initialTab?: string;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onNavigate,
  onSelectProduct,
  onQuickOrder,
  initialTab = 'orders',
}) => {
  const {
    currentUser,
    updateUserProfile,
    orders,
    wishlist,
    products,
    savedSearches,
    removeSavedSearch,
    inquiries,
    sendInquiryMessage,
    formatPrice,
    recentlyViewed,
    showToast,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'recent' | 'saved_searches' | 'messages'>(
    (initialTab as any) || 'orders'
  );

  // Filter orders made by this buyer
  const myOrders = orders.filter(
    (o) => o.buyerId === currentUser.id || o.buyerEmail === currentUser.email
  );

  // Inquiries sent by this buyer
  const myInquiries = inquiries.filter((i) => i.buyerId === currentUser.id);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string>(myInquiries[0]?.id || '');
  const [replyText, setReplyText] = useState('');

  // Wishlist products
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  // Recently viewed products
  const recentProducts = recentlyViewed
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  const selectedInquiry = myInquiries.find((i) => i.id === selectedInquiryId) || myInquiries[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedInquiry) return;
    sendInquiryMessage(selectedInquiry.id, replyText);
    setReplyText('');
  };

  // Profile fields state
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [location, setLocation] = useState(currentUser.location || 'Nairobi, Kenya');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setAvatar(ev.target.result);
        updateUserProfile({ avatar: ev.target.result });
        showToast('Profile photo updated from internal storage!', 'success');
      }
    };
    reader.readAsDataURL(file);
    if (avatarFileInputRef.current) {
      avatarFileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, email, phone, location, avatar });
    showToast('Profile information successfully updated!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Buyer Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs flex-shrink-0"
          />
          <div className="overflow-hidden">
            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 truncate">{currentUser.name}</h1>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[160px] sm:max-w-none">{currentUser.email}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>{currentUser.location}</span>
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('browse')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition min-h-[44px]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Products</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto text-xs sm:text-sm font-bold no-scrollbar">
          {[
            { id: 'orders', label: `My Orders (${myOrders.length})` },
            { id: 'wishlist', label: `Wishlist (${wishlistProducts.length})` },
            { id: 'messages', label: `Seller Messages (${myInquiries.length})` },
            { id: 'recent', label: `Recently Viewed (${recentProducts.length})` },
            { id: 'saved_searches', label: `Saved Searches (${savedSearches.length})` },
            { id: 'profile', label: 'Account Profile' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3.5 border-b-2 whitespace-nowrap transition px-1 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {myOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-base text-slate-800">No orders placed yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse verified listings and order with confidence using our secure escrow checkout.
                </p>
                <button
                  onClick={() => onNavigate('browse')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              myOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          Order #{ord.orderNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            ord.orderStatus === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.orderStatus === 'shipped'
                              ? 'bg-sky-100 text-sky-800'
                              : ord.orderStatus === 'processing'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Placed on {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900">
                        {formatPrice(ord.totalAmount)}
                      </span>
                      <p className="text-[11px] text-emerald-600 font-semibold uppercase">
                        Paid via {ord.paymentMethod.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Progress tracker */}
                  <div className="py-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2">
                      <span className={ord.orderStatus ? 'text-indigo-600' : ''}>1. Order Placed</span>
                      <span
                        className={
                          ['processing', 'shipped', 'delivered'].includes(ord.orderStatus)
                            ? 'text-indigo-600'
                            : 'text-slate-400'
                        }
                      >
                        2. Processing
                      </span>
                      <span
                        className={
                          ['shipped', 'delivered'].includes(ord.orderStatus)
                            ? 'text-indigo-600'
                            : 'text-slate-400'
                        }
                      >
                        3. Shipped / In Transit
                      </span>
                      <span
                        className={
                          ord.orderStatus === 'delivered' ? 'text-emerald-600' : 'text-slate-400'
                        }
                      >
                        4. Delivered
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-500"
                        style={{
                          width:
                            ord.orderStatus === 'delivered'
                              ? '100%'
                              : ord.orderStatus === 'shipped'
                              ? '75%'
                              : ord.orderStatus === 'processing'
                              ? '50%'
                              : '25%',
                        }}
                      />
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="divide-y divide-slate-100 pt-2">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{item.title}</p>
                            <p className="text-slate-500 text-[11px]">
                              Qty: {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                        <span className="font-extrabold text-slate-900">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery address info */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Delivering to: </span>
                      <span>
                        {ord.buyerName} • {ord.buyerAddress} ({ord.buyerPhone})
                      </span>
                    </div>
                    {ord.trackingCode && (
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 text-[11px]">
                        Track: {ord.trackingCode}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Wishlist */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-base text-slate-800">Your wishlist is empty</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the heart icon on any product to bookmark it for later purchase or price tracking.
                </p>
                <button
                  onClick={() => onNavigate('browse')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Explore Listings
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistProducts.map((p) => (
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

        {/* Tab 3: Messages */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
            {/* Left Thread List */}
            <div className="md:col-span-4 border-r border-slate-200 divide-y divide-slate-100 overflow-y-auto">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
                Inquiries with Sellers ({myInquiries.length})
              </div>
              {myInquiries.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No active inquiries. Click "Contact Seller" or "Message" on any product to start a conversation.
                </div>
              ) : (
                myInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedInquiryId(inq.id)}
                    className={`p-4 cursor-pointer transition text-xs space-y-1 ${
                      selectedInquiry?.id === inq.id ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{inq.sellerName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(inq.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-medium text-slate-800 line-clamp-1">{inq.productTitle}</p>
                    <p className="text-slate-500 text-[11px] line-clamp-1">{inq.lastMessage}</p>
                  </div>
                ))
              )}
            </div>

            {/* Right Chat */}
            <div className="md:col-span-8 flex flex-col justify-between p-6">
              {selectedInquiry ? (
                <>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{selectedInquiry.sellerName}</h4>
                      <p className="text-xs text-slate-500">
                        Listing: {selectedInquiry.productTitle} ({formatPrice(selectedInquiry.productPrice)})
                      </p>
                    </div>
                    {(() => {
                      const prod = products.find((p) => p.id === selectedInquiry.productId);
                      const phone = prod?.sellerWhatsapp || prod?.sellerPhone || '254700000000';
                      return (
                        <a
                          href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold"
                        >
                          WhatsApp
                        </a>
                      );
                    })()}
                  </div>

                  <div className="flex-1 overflow-y-auto py-4 space-y-3">
                    {selectedInquiry.messages.map((msg) => {
                      const isMe = msg.isBuyer;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                              isMe
                                ? 'bg-indigo-600 text-white rounded-br-xs'
                                : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                            }`}
                          >
                            <p className="font-bold text-[10px] opacity-80">{msg.senderName}</p>
                            <p>{msg.text}</p>
                            <p className="text-[9px] opacity-60 text-right">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <form onSubmit={handleSendReply} className="flex gap-2 pt-4 border-t border-slate-200">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type reply to seller..."
                      className="flex-1 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 min-h-[44px]"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs py-12">
                  Select an inquiry thread to chat
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Recently Viewed */}
        {activeTab === 'recent' && (
          <div>
            {recentProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
                You haven't viewed any products yet in this session.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentProducts.map((p) => (
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

        {/* Tab 5: Saved Searches */}
        {activeTab === 'saved_searches' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900">Your Saved Search Alerts</h3>
            {savedSearches.length === 0 ? (
              <p className="text-xs text-slate-400">
                You have not saved any searches yet. When browsing catalog results, click "Save Search" to receive quick access here.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {savedSearches.map((s) => (
                  <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-slate-900">
                          {s.query ? `"${s.query}"` : 'All Products'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Category: {s.category || 'Any'} • Location: {s.location || 'Any'} • Saved on{' '}
                        {new Date(s.dateSaved).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate('browse', { search: s.query, category: s.category })}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs"
                      >
                        Run Search
                      </button>
                      <button
                        onClick={() => removeSavedSearch(s.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Profile */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-xs max-w-2xl">
            <h3 className="font-bold text-base text-slate-900">Personal Information</h3>

            {/* Avatar upload from internal storage */}
            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFile}
              className="hidden"
            />
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <img
                src={avatar}
                alt={name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-200 shadow-xs flex-shrink-0"
              />
              <div className="space-y-1.5">
                <p className="font-bold text-xs text-slate-800">Profile Photo</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition min-h-[38px] cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload from Internal Storage</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 font-semibold min-h-[44px] outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 font-semibold min-h-[44px] outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 font-semibold min-h-[44px] outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Default City / Delivery Area</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 font-semibold min-h-[44px] outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-md hover:bg-indigo-700 transition min-h-[48px] flex items-center justify-center"
            >
              Update Profile Information
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
