import React, { useState, useRef } from 'react';
import {
  Archive,
  Banknote,
  BarChart3,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  Layers,
  MessageCircle,
  MessageSquare,
  Package,
  PlusCircle,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  TrendingUp,
  Truck,
  Upload,
  Users,
  X,
  Zap,
  LogOut,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { BusinessProfile, Order, OrderStatus, Product, ProductStatus } from '../types';

interface SellerDashboardProps {
  onNavigate: (view: string, params?: any) => void;
  onEditProduct: (product: Product) => void;
  initialTab?: string;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  onNavigate,
  onEditProduct,
  initialTab = 'products',
}) => {
  const {
    currentUser,
    products,
    orders,
    inquiries,
    businesses,
    formatPrice,
    deleteProduct,
    archiveProduct,
    featureProduct,
    updateOrderStatus,
    sendInquiryMessage,
    updateBusinessProfile,
    showToast,
    signOutUser,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'inquiries' | 'analytics' | 'subscriptions' | 'profile'>(
    (initialTab as any) || 'products'
  );

  // Filter products for this seller/business
  const myBusiness = businesses.find((b) => b.ownerId === currentUser.id || b.id === currentUser.businessId) || businesses[0];
  const myProducts = products.filter(
    (p) => currentUser.role === 'admin' || p.sellerId === currentUser.id || (myBusiness && p.businessId === myBusiness.id)
  );

  const isPending = currentUser.role === 'seller' && currentUser.status === 'pending';
  const isSuspended = currentUser.status === 'suspended';

  // Status filter for products table
  const [productSearch, setProductSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all');

  // Inquiry selected in chat
  const myInquiries = inquiries.filter((i) => i.sellerId === currentUser.id || i.sellerName === myBusiness?.businessName);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string>(myInquiries[0]?.id || '');
  const [replyText, setReplyText] = useState('');

  // Seller's orders
  const myOrders = orders.filter((o) => o.items.some((i) => i.sellerId === currentUser.id));

  // KPI calculations
  const totalRevenue = myOrders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalViews = myProducts.reduce((sum, p) => sum + p.views, 0);
  const totalInquiriesCount = myProducts.reduce((sum, p) => sum + p.inquiriesCount, 0);

  // Filtered products list
  const displayedProducts = myProducts.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (productSearch.trim()) {
      return p.title.toLowerCase().includes(productSearch.toLowerCase());
    }
    return true;
  });

  const selectedInquiry = myInquiries.find((i) => i.id === selectedInquiryId) || myInquiries[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedInquiry) return;
    sendInquiryMessage(selectedInquiry.id, replyText);
    setReplyText('');
  };

  // Profile Form state
  const [bizName, setBizName] = useState(myBusiness?.businessName || '');
  const [bizTagline, setBizTagline] = useState(myBusiness?.tagline || '');
  const [bizDesc, setBizDesc] = useState(myBusiness?.description || '');
  const [bizPhone, setBizPhone] = useState(myBusiness?.phone || '');
  const [bizWhatsapp, setBizWhatsapp] = useState(myBusiness?.whatsapp || '');
  const [bizAddress, setBizAddress] = useState(myBusiness?.address || '');
  const [bizHours, setBizHours] = useState(myBusiness?.operatingHours || '');
  const [bizLogo, setBizLogo] = useState(
    myBusiness?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'
  );
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setBizLogo(ev.target.result);
        if (myBusiness) {
          updateBusinessProfile(myBusiness.id, { logo: ev.target.result });
        }
        showToast('Store logo updated from internal storage!', 'success');
      }
    };
    reader.readAsDataURL(file);
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myBusiness) return;
    updateBusinessProfile(myBusiness.id, {
      businessName: bizName,
      tagline: bizTagline,
      description: bizDesc,
      phone: bizPhone,
      whatsapp: bizWhatsapp,
      address: bizAddress,
      operatingHours: bizHours,
      logo: bizLogo,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Top Banner / Store identity */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src={myBusiness?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'}
            alt="Business Logo"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md flex-shrink-0"
          />
          <div className="overflow-hidden">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-extrabold truncate">{myBusiness?.businessName}</h1>
              {myBusiness?.verified && (
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/30 flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Merchant
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1 line-clamp-1">{myBusiness?.tagline}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              City: {myBusiness?.city} • Speed: {myBusiness?.responseTime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isPending ? (
            <div className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pending Admin Approval</span>
            </div>
          ) : isSuspended ? (
            <div className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-bold flex items-center justify-center gap-2">
              <span>Account Suspended</span>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('post-product')}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95 min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Product</span>
            </button>
          )}

          <button
            onClick={() => {
              signOutUser();
              onNavigate('home');
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 border border-white/10 min-h-[44px]"
            title="Sign out of seller session"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Pending Account Notice Banner */}
      {isPending && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 flex items-start gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 flex-shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-amber-900">
                Seller Account Pending Administrator Approval
              </h3>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                Pending Verification
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              Your merchant profile has been submitted and is currently in the moderation review queue.
              In accordance with platform security policies, you cannot post new products or edit catalog inventory until an administrator verifies and activates your seller account.
            </p>
          </div>
        </div>
      )}

      {/* Suspended Notice Banner */}
      {isSuspended && (
        <div className="bg-rose-50 border border-rose-300 rounded-3xl p-5 flex items-start gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-800 flex-shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-extrabold text-sm text-rose-900">
              Account Suspended by Operations Governance
            </h3>
            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
              Product creation and order fulfillment permissions have been suspended. Please contact operations support to resolve any compliance issues.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Sales GMV</span>
            <Banknote className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{formatPrice(totalRevenue)}</p>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4% vs last month
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Listing Impressions</span>
            <Eye className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{totalViews.toLocaleString()}</p>
          <p className="text-[11px] text-indigo-600 font-bold">From organic & direct search</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Active Inquiries</span>
            <MessageSquare className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{totalInquiriesCount}</p>
          <p className="text-[11px] text-amber-600 font-bold">100% response rate</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Orders</span>
            <Package className="w-4 h-4 text-violet-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{myOrders.length}</p>
          <p className="text-[11px] text-violet-600 font-bold">All fulfilled on schedule</p>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto text-xs sm:text-sm font-bold no-scrollbar">
          {[
            { id: 'products', label: `Inventory (${myProducts.length})` },
            { id: 'orders', label: `Orders (${myOrders.length})` },
            { id: 'inquiries', label: `Buyer Inquiries (${myInquiries.length})` },
            { id: 'analytics', label: 'Performance Analytics' },
            { id: 'subscriptions', label: 'Subscription & Monetization' },
            { id: 'profile', label: 'Storefront Settings' },
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

        {/* Tab 1: Product Inventory Management */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Table controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Filter listings..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Status filter pills */}
              <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                {(['all', 'active', 'pending', 'draft', 'archived'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                      statusFilter === st
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Views / Inquiries</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          No products found in this status.
                        </td>
                      </tr>
                    ) : (
                      displayedProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.images[0]}
                                alt={p.title}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                              />
                              <div className="max-w-xs">
                                <h4 className="font-bold text-slate-900 line-clamp-1">{p.title}</h4>
                                <span className="text-[11px] text-slate-400 capitalize">
                                  {p.category.replace('-', ' ')} • {p.condition}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-extrabold text-slate-900">
                            {formatPrice(p.discountPrice ?? p.price)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                                p.stock > 0
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {p.stock} units
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                                p.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : p.status === 'archived'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            <span>{p.views} views</span> •{' '}
                            <span className="text-indigo-600 font-bold">{p.inquiriesCount} inq</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit */}
                              <button
                                onClick={() => onEditProduct(p)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                                title="Edit Listing"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {/* Archive toggle */}
                              <button
                                onClick={() => archiveProduct(p.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                                title={p.status === 'archived' ? 'Unarchive' : 'Archive Listing'}
                              >
                                <Archive className="w-4 h-4" />
                              </button>

                              {/* Feature Boost */}
                              <button
                                onClick={() => featureProduct(p.id, !p.featured)}
                                className={`p-1.5 rounded-lg ${
                                  p.featured
                                    ? 'text-amber-500 hover:bg-amber-50'
                                    : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                                }`}
                                title={p.featured ? 'Featured active' : 'Boost to Featured'}
                              >
                                <Sparkles className="w-4 h-4 fill-current" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete "${p.title}"?`)) {
                                    deleteProduct(p.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Delete Listing"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders Management */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
                Customer Orders Log
              </div>

              <div className="divide-y divide-slate-100">
                {myOrders.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-500">
                    No orders placed yet. As soon as buyers checkout via M-Pesa or Card, they will appear here.
                  </div>
                ) : (
                  myOrders.map((ord) => (
                    <div key={ord.id} className="p-6 space-y-4 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <span className="font-extrabold text-sm text-slate-900">
                            Order #{ord.orderNumber}
                          </span>
                          <span className="text-slate-400 ml-2">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px] uppercase">
                            Paid via {ord.paymentMethod}
                          </span>
                          <select
                            value={ord.orderStatus}
                            onChange={(e: any) => updateOrderStatus(ord.id, e.target.value)}
                            className="bg-slate-100 text-slate-800 font-bold text-xs p-1.5 rounded-xl border border-slate-300 outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Items & Buyer */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="font-bold text-slate-700 block">Ordered Items</span>
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                              />
                              <div>
                                <p className="font-bold text-slate-900">{item.title}</p>
                                <p className="text-slate-500 text-[11px]">
                                  Qty: {item.quantity} × {formatPrice(item.price)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                          <span className="font-bold text-slate-700 block">Buyer & Delivery Address</span>
                          <p className="font-semibold text-slate-900">{ord.buyerName}</p>
                          <p className="text-slate-500">{ord.buyerPhone}</p>
                          <p className="text-slate-600">{ord.buyerAddress}</p>
                          {ord.notes && (
                            <p className="text-indigo-600 text-[11px] italic">Note: "{ord.notes}"</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Buyer Inquiries & Chat */}
        {activeTab === 'inquiries' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
            {/* Left Thread List */}
            <div className="md:col-span-4 border-r border-slate-200 divide-y divide-slate-100 overflow-y-auto">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
                Inquiry Threads ({myInquiries.length})
              </div>
              {myInquiries.map((inq) => (
                <div
                  key={inq.id}
                  onClick={() => setSelectedInquiryId(inq.id)}
                  className={`p-4 cursor-pointer transition text-xs space-y-1 ${
                    selectedInquiry?.id === inq.id ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{inq.buyerName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(inq.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="font-medium text-slate-800 line-clamp-1">{inq.productTitle}</p>
                  <p className="text-slate-500 text-[11px] line-clamp-1">{inq.lastMessage}</p>
                </div>
              ))}
            </div>

            {/* Right Chat Window */}
            <div className="md:col-span-8 flex flex-col justify-between p-6">
              {selectedInquiry ? (
                <>
                  {/* Chat header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{selectedInquiry.buyerName}</h4>
                      <p className="text-xs text-slate-500">
                        Inquiring about: {selectedInquiry.productTitle} ({formatPrice(selectedInquiry.productPrice)})
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`https://wa.me/${selectedInquiry.buyerPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Messages Bubble Area */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-3">
                    {selectedInquiry.messages.map((msg) => {
                      const isMe = !msg.isBuyer;
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

                  {/* Send reply form */}
                  <form onSubmit={handleSendReply} className="flex gap-2 pt-4 border-t border-slate-200">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type reply to buyer..."
                      className="flex-1 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 min-h-[44px]"
                    >
                      <Send className="w-4 h-4" />
                      <span>Reply</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs py-12">
                  Select an inquiry thread to respond
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Analytics */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Revenue & Order Volume (30 Days)</h3>
              {/* Visual mock chart */}
              <div className="h-48 flex items-end gap-2 sm:gap-3 pt-6 pb-2 border-b border-slate-200 overflow-x-auto">
                {[45, 60, 30, 85, 95, 70, 110, 80, 130, 120, 145, 160].map((val, i) => (
                  <div key={i} className="flex-1 min-w-[16px] flex flex-col items-center gap-1">
                    <div
                      style={{ height: `${(val / 160) * 100}%` }}
                      className="w-full bg-indigo-600 rounded-t-lg transition-all hover:bg-indigo-500"
                    />
                    <span className="text-[9px] text-slate-400">W{i + 1}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                Peak sales occurred on weekdays following WhatsApp direct outreach campaigns.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Top Performing Listings</h3>
              <div className="divide-y divide-slate-100 text-xs">
                {myProducts.slice(0, 4).map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 truncate max-w-xs">{p.title}</span>
                    <span className="font-extrabold text-indigo-600 flex-shrink-0">{p.views} views</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Subscriptions & Monetization */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            <div className="text-center max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">Merchant Growth Plans</h3>
              <p className="text-xs text-slate-500">
                Upgrade to boost product impressions, lower escrow commission fees, and receive verified badges.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Plan 1 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-900">Starter Merchant</h4>
                  <p className="text-xs text-slate-500 mt-1">For casual sellers & individual artisans</p>
                  <p className="text-3xl font-black text-slate-900 mt-4">Free</p>
                  <ul className="space-y-2 text-xs text-slate-600 mt-4">
                    <li>✓ Up to 10 active listings</li>
                    <li>✓ Direct WhatsApp & phone contacts</li>
                    <li>✓ M-Pesa & Card escrow protection</li>
                    <li>✕ No priority search placement</li>
                  </ul>
                </div>
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs min-h-[44px]"
                >
                  Current Plan
                </button>
              </div>

              {/* Plan 2 */}
              <div className="bg-white p-6 rounded-3xl border-2 border-indigo-600 space-y-4 flex flex-col justify-between shadow-lg relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-full">
                  Most Popular
                </span>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Pro Merchant</h4>
                  <p className="text-xs text-slate-500 mt-1">For growing commercial businesses</p>
                  <p className="text-3xl font-black text-indigo-600 mt-4">
                    KSh 2,500.00 <span className="text-xs text-slate-400 font-normal">/ month</span>
                  </p>
                  <ul className="space-y-2 text-xs text-slate-600 mt-4">
                    <li>✓ Unlimited active product listings</li>
                    <li>✓ Verified Business Seal & Trust Badge</li>
                    <li>✓ 5 Free "Featured Boost" credits/month</li>
                    <li>✓ Priority WhatsApp & phone leads</li>
                    <li>✓ 0% escrow fee discount</li>
                  </ul>
                </div>
                <button
                  onClick={() => showToast('Upgraded to Pro Merchant plan! 🚀', 'success')}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition min-h-[44px]"
                >
                  Activate Pro Merchant
                </button>
              </div>

              {/* Plan 3 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-900">Enterprise Platinum</h4>
                  <p className="text-xs text-slate-500 mt-1">For large manufacturers & import franchises</p>
                  <p className="text-3xl font-black text-slate-900 mt-4">
                    KSh 6,500.00 <span className="text-xs text-slate-400 font-normal">/ month</span>
                  </p>
                  <ul className="space-y-2 text-xs text-slate-600 mt-4">
                    <li>✓ All Pro Merchant perks</li>
                    <li>✓ Homepage Carousel Banner Sponsor</li>
                    <li>✓ Dedicated Account Relationship Manager</li>
                    <li>✓ ERP & automated inventory API integration</li>
                  </ul>
                </div>
                <button
                  onClick={() => showToast('Enterprise inquiry sent to sales team!', 'info')}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition min-h-[44px]"
                >
                  Contact Enterprise Sales
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Storefront Profile Editor */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-xs max-w-3xl">
            <h3 className="font-bold text-base text-slate-900">Business Storefront Profile</h3>

            {/* Store Logo upload from internal storage */}
            <input
              ref={logoFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoFile}
              className="hidden"
            />
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <img
                src={bizLogo}
                alt={bizName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-200 shadow-xs flex-shrink-0"
              />
              <div className="space-y-1.5 flex-1">
                <p className="font-bold text-xs text-slate-800">Storefront Logo & Avatar</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition min-h-[38px] cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo from Internal Storage</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 font-semibold min-h-[44px] outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={bizTagline}
                  onChange={(e) => setBizTagline(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 min-h-[44px] outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">About the Business</label>
                <textarea
                  rows={3}
                  value={bizDesc}
                  onChange={(e) => setBizDesc(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 resize-none outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={bizPhone}
                  onChange={(e) => setBizPhone(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 min-h-[44px] outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp Business Number</label>
                <input
                  type="tel"
                  value={bizWhatsapp}
                  onChange={(e) => setBizWhatsapp(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 min-h-[44px] outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Physical Office / Shop Address</label>
                <input
                  type="text"
                  value={bizAddress}
                  onChange={(e) => setBizAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 min-h-[44px] outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={bizHours}
                  onChange={(e) => setBizHours(e.target.value)}
                  placeholder="e.g. Mon - Sat: 8:30 AM - 6:30 PM"
                  className="w-full p-3 rounded-xl border border-slate-200 min-h-[44px] outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-md hover:bg-indigo-700 transition min-h-[48px] flex items-center justify-center"
            >
              Save Storefront Details
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
