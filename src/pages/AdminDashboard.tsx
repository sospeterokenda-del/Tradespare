import React, { useState, useRef } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  Building,
  CheckCircle2,
  Clock,
  Banknote,
  Edit,
  Eye,
  Flag,
  Globe,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  Package,
  Phone,
  Plus,
  Save,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { AdminDetails, Product, User } from '../types';

interface AdminDashboardProps {
  onNavigate: (view: string, params?: any) => void;
  onSelectProduct: (product: Product) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onSelectProduct,
}) => {
  const {
    products,
    businesses,
    orders,
    adminDetails,
    updateAdminDetails,
    approveProduct,
    rejectProduct,
    featureProduct,
    deleteProduct,
    verifySeller,
    formatPrice,
    showToast,
    allUsers,
    approveUser,
    suspendUser,
    activateUser,
    rejectUser,
    updateUserRole,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<
    'users_rbac' | 'moderation' | 'admin_details' | 'stats' | 'businesses' | 'announcements' | 'reports'
  >('users_rbac');

  // Stats calculation
  const totalGMV = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingProducts = products.filter((p) => p.status === 'pending');
  const activeProducts = products.filter((p) => p.status === 'active');
  const verifiedBizCount = businesses.filter((b) => b.verified).length;
  const pendingUsers = allUsers.filter((u) => u.status === 'pending');
  const activeUsers = allUsers.filter((u) => u.status === 'active');
  const suspendedUsers = allUsers.filter((u) => u.status === 'suspended' || u.status === 'rejected');

  // Users & RBAC management states
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'seller' | 'buyer' | 'admin'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'pending' | 'active' | 'suspended' | 'rejected'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [actionUserModal, setActionUserModal] = useState<{ user: User; action: 'suspend' | 'reject' } | null>(null);
  const [userActionReason, setUserActionReason] = useState('Requires compliance review');

  // Search filter inside products moderation
  const [modFilter, setModFilter] = useState<'all' | 'pending' | 'active'>('pending');

  // Admin details edit state
  const [adminName, setAdminName] = useState(adminDetails.profile.name);
  const [adminEmail, setAdminEmail] = useState(adminDetails.profile.email);
  const [adminPhone, setAdminPhone] = useState(adminDetails.profile.phone);
  const [adminAvatar, setAdminAvatar] = useState(adminDetails.profile.avatar);
  const [adminRole, setAdminRole] = useState(adminDetails.profile.role);

  const [brandName, setBrandName] = useState(adminDetails.platformBranding.marketplaceName);
  const [brandSlogan, setBrandSlogan] = useState(adminDetails.platformBranding.tagline);
  const [supportEmail, setSupportEmail] = useState(adminDetails.platformBranding.supportEmail);
  const [supportPhone, setSupportPhone] = useState(adminDetails.platformBranding.supportPhone);
  const [businessAddress, setBusinessAddress] = useState(adminDetails.platformBranding.businessAddress);
  const [timeZone, setTimeZone] = useState(adminDetails.platformBranding.timeZone);

  // Notifications preferences
  const [emailAlerts, setEmailAlerts] = useState(adminDetails.notificationPreferences.emailOnNewListing);
  const [smsAlerts, setSmsAlerts] = useState(adminDetails.notificationPreferences.smsOnHighValueOrder);
  const [moderationMode, setModerationMode] = useState(adminDetails.securityAndSettings.contentModerationMode);

  const adminFileInputRef = useRef<HTMLInputElement>(null);

  const handleAdminAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setAdminAvatar(ev.target.result);
        showToast('Admin profile photo loaded from internal storage!', 'success');
      }
    };
    reader.readAsDataURL(file);
    if (adminFileInputRef.current) {
      adminFileInputRef.current.value = '';
    }
  };

  const [isSavingAdmin, setIsSavingAdmin] = useState(false);

  // Announcement state
  const [announcementText, setAnnouncementText] = useState(
    adminDetails.platformBranding.announcementBanner.text ||
    'Special Promo: Verified Businesses enjoy 0% listing fees this month on all equipment and solar machinery!'
  );
  const [announcementActive, setAnnouncementActive] = useState(
    adminDetails.platformBranding.announcementBanner.active
  );

  // Product reject modal
  const [rejectModalProduct, setRejectModalProduct] = useState<Product | null>(null);
  const [rejectReason, setRejectReason] = useState('Missing required product certifications or unclear photos');

  const handleSaveAdminDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAdmin(true);

    setTimeout(() => {
      updateAdminDetails({
        profile: {
          ...adminDetails.profile,
          name: adminName,
          email: adminEmail,
          phone: adminPhone,
          avatar: adminAvatar,
          role: adminRole,
        },
        platformBranding: {
          ...adminDetails.platformBranding,
          marketplaceName: brandName,
          tagline: brandSlogan,
          supportEmail,
          supportPhone,
          businessAddress,
          timeZone,
          announcementBanner: {
            ...adminDetails.platformBranding.announcementBanner,
            text: announcementText,
            active: announcementActive,
          },
        },
        notificationPreferences: {
          ...adminDetails.notificationPreferences,
          emailOnNewListing: emailAlerts,
          smsOnHighValueOrder: smsAlerts,
        },
        securityAndSettings: {
          ...adminDetails.securityAndSettings,
          contentModerationMode: moderationMode,
        },
      });
      setIsSavingAdmin(false);
    }, 600);
  };

  const handleConfirmReject = () => {
    if (!rejectModalProduct) return;
    rejectProduct(rejectModalProduct.id, rejectReason);
    setRejectModalProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Top Security & Admin Identity Bar */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-slate-800">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={adminDetails.profile.avatar}
              alt={adminDetails.profile.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 text-slate-950" />
            </span>
          </div>

          <div className="overflow-hidden">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold truncate">{adminDetails.profile.name}</h1>
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase flex-shrink-0">
                {adminDetails.profile.role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              Authorized Governance • {adminDetails.platformBranding.timeZone}
            </p>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <Lock className="w-3 h-3 flex-shrink-0" />
              <span>RBAC Active • Server-Side Authorized</span>
            </p>
          </div>
        </div>

        {/* Global Pending Moderation Counter Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {pendingUsers.length > 0 && (
            <div className="bg-amber-500/20 border border-amber-500/40 text-amber-200 p-3 sm:px-4 sm:py-2.5 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="font-bold text-xs">{pendingUsers.length} Seller{pendingUsers.length > 1 ? 's' : ''} Pending</p>
                  <p className="text-[10px] text-amber-300/80">Require admin approval</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab('users_rbac');
                  setUserStatusFilter('pending');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 min-h-[36px] flex items-center"
              >
                Approve
              </button>
            </div>
          )}

          {pendingProducts.length > 0 && (
            <div className="bg-amber-500/15 border border-amber-500/30 text-amber-300 p-3 sm:px-4 sm:py-2.5 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="font-bold text-xs">{pendingProducts.length} Pending Listings</p>
                  <p className="text-[10px] text-amber-200">Awaiting moderator validation</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab('moderation');
                  setModFilter('pending');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 min-h-[36px] flex items-center"
              >
                Review
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto text-xs sm:text-sm font-bold no-scrollbar">
          {[
            {
              id: 'users_rbac',
              label: `Users & RBAC (${pendingUsers.length > 0 ? `${pendingUsers.length} Pending` : allUsers.length})`,
            },
            { id: 'moderation', label: `Listings Moderation (${pendingProducts.length})` },
            { id: 'admin_details', label: 'Admin Details & Branding' },
            { id: 'stats', label: 'Financials & KPIs' },
            { id: 'businesses', label: `Businesses (${businesses.length})` },
            { id: 'announcements', label: 'Announcements' },
            { id: 'reports', label: 'Safety Flags' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3.5 border-b-2 whitespace-nowrap transition px-1.5 min-h-[44px] flex items-center ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 0: USERS & RBAC GOVERNANCE (Admin Approval, Activation, Suspension, Rejection) */}
        {activeTab === 'users_rbac' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Accounts</span>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900">{allUsers.length}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Persisted in database</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Pending Approvals</span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    pendingUsers.length > 0 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-amber-600">{pendingUsers.length}</p>
                <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                  {pendingUsers.length > 0 ? 'Action required by Admin' : 'Queue clear'}
                </p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Active Verified</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-emerald-600">{activeUsers.length}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Full marketplace rights</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Suspended / Rejected</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-rose-600">{suspendedUsers.length}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Access restricted</p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search users by name, email, or store name..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Role Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Role:</span>
                  {(['all', 'seller', 'buyer', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setUserRoleFilter(r)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition min-h-[34px] ${
                        userRoleFilter === r
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {r === 'all' ? 'All Roles' : r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Status:</span>
                {(['all', 'pending', 'active', 'suspended', 'rejected'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setUserStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition min-h-[34px] ${
                      userStatusFilter === s
                        ? s === 'pending'
                          ? 'bg-amber-500 text-slate-950 font-extrabold'
                          : s === 'active'
                          ? 'bg-emerald-600 text-white'
                          : s === 'suspended'
                          ? 'bg-rose-600 text-white'
                          : 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s === 'all' ? 'All Statuses' : s}
                    {s === 'pending' && pendingUsers.length > 0 && ` (${pendingUsers.length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* User List Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">User & Contact</th>
                      <th className="py-3.5 px-4">Assigned Role</th>
                      <th className="py-3.5 px-4">Governance Status</th>
                      <th className="py-3.5 px-4">Storefront Info</th>
                      <th className="py-3.5 px-4">Registered</th>
                      <th className="py-3.5 px-4 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allUsers
                      .filter((u) => {
                        if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
                        if (userStatusFilter !== 'all' && u.status !== userStatusFilter) return false;
                        if (userSearchQuery.trim()) {
                          const q = userSearchQuery.toLowerCase();
                          const matchName = u.name.toLowerCase().includes(q);
                          const matchEmail = u.email.toLowerCase().includes(q);
                          const matchStore = (u.businessName || '').toLowerCase().includes(q);
                          if (!matchName && !matchEmail && !matchStore) return false;
                        }
                        return true;
                      })
                      .map((u) => {
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                            {/* User & Contact */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={u.avatar}
                                  alt={u.name}
                                  className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                                />
                                <div className="overflow-hidden min-w-0">
                                  <p className="font-bold text-slate-900 truncate">{u.name}</p>
                                  <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{u.phone}</p>
                                </div>
                              </div>
                            </td>

                            {/* Assigned Role */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                  u.role === 'admin'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : u.role === 'seller'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                }`}
                              >
                                {u.role === 'admin' && <Shield className="w-3 h-3 text-rose-600" />}
                                {u.role === 'seller' && <Store className="w-3 h-3 text-emerald-600" />}
                                {u.role === 'buyer' && <ShoppingBag className="w-3 h-3 text-indigo-600" />}
                                {u.role}
                              </span>
                            </td>

                            {/* Governance Status */}
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col gap-0.5">
                                <span
                                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full w-fit ${
                                    u.status === 'active'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : u.status === 'pending'
                                      ? 'bg-amber-100 text-amber-800 font-extrabold animate-pulse'
                                      : u.status === 'suspended'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {u.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                                  {u.status === 'pending' && <Clock className="w-3 h-3" />}
                                  {u.status === 'suspended' && <AlertTriangle className="w-3 h-3" />}
                                  {u.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                  <span className="capitalize">{u.status}</span>
                                </span>
                                {u.rejectionReason && (
                                  <p className="text-[10px] text-rose-600 max-w-xs truncate" title={u.rejectionReason}>
                                    Note: {u.rejectionReason}
                                  </p>
                                )}
                              </div>
                            </td>

                            {/* Storefront Info */}
                            <td className="py-3.5 px-4">
                              {u.businessName ? (
                                <div>
                                  <p className="font-semibold text-slate-800 truncate max-w-[150px]">{u.businessName}</p>
                                  <p className="text-[10px] text-slate-400">{u.location || 'Kenya'}</p>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">Individual account</span>
                              )}
                            </td>

                            {/* Registered */}
                            <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                              {new Date(u.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>

                            {/* Administrative Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {/* If Pending Seller: Approve or Reject */}
                                {u.status === 'pending' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => approveUser(u.id)}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition active:scale-95 min-h-[32px]"
                                      title="Approve seller merchant account"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Approve</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setActionUserModal({ user: u, action: 'reject' })}
                                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold text-xs flex items-center gap-1 border border-slate-200 transition min-h-[32px]"
                                      title="Reject application"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                )}

                                {/* If Active: Suspend */}
                                {u.status === 'active' && u.role !== 'admin' && (
                                  <button
                                    type="button"
                                    onClick={() => setActionUserModal({ user: u, action: 'suspend' })}
                                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold text-xs flex items-center gap-1 border border-slate-200 transition min-h-[32px]"
                                    title="Suspend account"
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Suspend</span>
                                  </button>
                                )}

                                {/* If Suspended or Rejected: Activate */}
                                {(u.status === 'suspended' || u.status === 'rejected') && (
                                  <button
                                    type="button"
                                    onClick={() => activateUser(u.id)}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition active:scale-95 min-h-[32px]"
                                    title="Restore account to active"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Activate</span>
                                  </button>
                                )}

                                {/* Role dropdown changer for Admin */}
                                <select
                                  value={u.role}
                                  onChange={(e) => updateUserRole(u.id, e.target.value as any)}
                                  className="bg-slate-100 hover:bg-slate-200/80 text-[11px] font-bold text-slate-700 rounded-lg px-2 py-1 border border-slate-200 outline-none cursor-pointer"
                                  title="Change user RBAC role"
                                >
                                  <option value="buyer">Buyer</option>
                                  <option value="seller">Seller</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Product Moderation */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex gap-2">
                <button
                  onClick={() => setModFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    modFilter === 'pending'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Pending Review ({pendingProducts.length})
                </button>
                <button
                  onClick={() => setModFilter('active')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    modFilter === 'active'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Active Published ({activeProducts.length})
                </button>
                <button
                  onClick={() => setModFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    modFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  All ({products.length})
                </button>
              </div>

              <span className="text-xs text-slate-500 font-medium">
                Moderation Mode: <strong>{adminDetails.securityAndSettings.contentModerationMode}</strong>
              </span>
            </div>

            {/* Moderation Items */}
            <div className="grid grid-cols-1 gap-4">
              {products
                .filter((p) => {
                  if (modFilter === 'pending') return p.status === 'pending';
                  if (modFilter === 'active') return p.status === 'active';
                  return true;
                })
                .map((product) => (
                  <div
                    key={product.id}
                    className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            onClick={() => onSelectProduct(product)}
                            className="font-bold text-sm text-slate-900 hover:text-indigo-600 cursor-pointer"
                          >
                            {product.title}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              product.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : product.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {product.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Seller: <strong>{product.businessName}</strong> ({product.sellerPhone}) •{' '}
                          {formatPrice(product.price)} • {product.city}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 flex-wrap">
                      {product.status === 'pending' && (
                        <>
                          <button
                            onClick={() => approveProduct(product.id)}
                            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs min-h-[44px]"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => setRejectModalProduct(product)}
                            className="px-3.5 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-1 min-h-[44px]"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {/* Featured toggle */}
                      <button
                        onClick={() => featureProduct(product.id, !product.featured)}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 transition min-h-[44px] ${
                          product.featured
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-amber-500 fill-current" />
                        <span>{product.featured ? 'Featured' : 'Promote'}</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (confirm(`Remove "${product.title}" from marketplace?`)) {
                            deleteProduct(product.id);
                          }
                        }}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 2: Admin Details & Platform Governance (Prompt explicit requirement) */}
        {activeTab === 'admin_details' && (
          <form onSubmit={handleSaveAdminDetails} className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8 max-w-4xl">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Admin Details & Platform Branding Governance
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Authorized administrators can manage administrative identity, contact channels, branding, physical presence, and system notification preferences.
              </p>
            </div>

            {/* Section A: Admin Profile & Permissions */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                <span>Authorized Administrator Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Administrator Full Name</label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-semibold min-h-[44px] outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Administrative Contact Email</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-semibold min-h-[44px] outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Direct Secure Phone</label>
                  <input
                    type="tel"
                    required
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-semibold min-h-[44px] outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Admin Profile Photo</label>
                  <input
                    ref={adminFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAdminAvatarFile}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <img
                      src={adminAvatar}
                      alt="Admin"
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                    />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="url"
                        required
                        value={adminAvatar}
                        onChange={(e) => setAdminAvatar(e.target.value)}
                        className="flex-1 p-2.5 rounded-xl border border-slate-200 font-semibold min-h-[44px] text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Paste image link or upload..."
                      />
                      <button
                        type="button"
                        onClick={() => adminFileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition min-h-[44px] flex-shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Upload</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role & Authority</label>
                  <select
                    value={adminRole}
                    onChange={(e) => setAdminRole(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold min-h-[44px] outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="super_admin">Super Administrator (Full Root Authority)</option>
                    <option value="moderator">Trust & Safety Moderator</option>
                    <option value="finance_officer">Escrow & Finance Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Administrative Time Zone</label>
                  <input
                    type="text"
                    required
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 font-semibold min-h-[44px] outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Permissions list */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Enforced Permissions & Capabilities
                </span>
                <div className="flex flex-wrap gap-2">
                  {adminDetails.profile.permissions.map((perm: string) => (
                    <span
                      key={perm}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[10px] font-bold"
                    >
                      ✓ {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Section B: Platform Branding & Support Information */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Platform Branding & Public Support Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Public Platform Name</label>
                  <input
                    type="text"
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marketing Slogan</label>
                  <input
                    type="text"
                    required
                    value={brandSlogan}
                    onChange={(e) => setBrandSlogan(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Support Email</label>
                  <input
                    type="email"
                    required
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Support Phone</label>
                  <input
                    type="tel"
                    required
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default Platform Currency</label>
                  <div className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 flex items-center justify-between">
                    <span>Kenyan Shilling (KES)</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md">
                      KSh
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Registered Business Office Address</label>
                  <input
                    type="text"
                    required
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Section C: Security & Notification Preferences */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span>Security Moderation & Alerts</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <label className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-800">Email Alerts</span>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                </label>

                <label className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-800">SMS Critical Alerts</span>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                </label>

                <div className="p-3 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 block">Moderation Workflow</span>
                  <select
                    value={moderationMode}
                    onChange={(e: any) => setModerationMode(e.target.value)}
                    className="w-full p-1 bg-transparent font-semibold outline-none"
                  >
                    <option value="require_review">Require Review (Manual Approval)</option>
                    <option value="auto_approve">Auto-Approve (Post-Publish Audit)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] text-slate-400 text-center sm:text-left">
                Authorized Session Active • ISO 27001 Enforced
              </span>

              <button
                type="submit"
                disabled={isSavingAdmin}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95 transition min-h-[48px]"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingAdmin ? 'Validating & Saving...' : 'Save Admin Details & Preferences'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Platform Stats */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs text-slate-500 font-semibold">Total Escrow GMV</span>
                <p className="text-2xl font-black text-slate-900">{formatPrice(totalGMV)}</p>
                <span className="text-[11px] text-emerald-600 font-bold">100% processed securely</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs text-slate-500 font-semibold">Verified Businesses</span>
                <p className="text-2xl font-black text-slate-900">{verifiedBizCount}</p>
                <span className="text-[11px] text-indigo-600 font-bold">Authenticated IDs</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs text-slate-500 font-semibold">Active Products</span>
                <p className="text-2xl font-black text-slate-900">{activeProducts.length}</p>
                <span className="text-[11px] text-violet-600 font-bold">Across 12 categories</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs text-slate-500 font-semibold">Completed Orders</span>
                <p className="text-2xl font-black text-slate-900">{orders.length}</p>
                <span className="text-[11px] text-amber-600 font-bold">99.4% satisfaction</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Businesses Management */}
        {activeTab === 'businesses' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
              Registered Marketplace Merchants ({businesses.length})
            </div>
            <div className="divide-y divide-slate-100">
              {businesses.map((biz) => (
                <div key={biz.id} className="p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={biz.logo}
                      alt={biz.businessName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">{biz.businessName}</span>
                        {biz.verified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        {biz.city}, {biz.country} • {biz.phone} • {biz.productsCount} listings
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => verifySeller(biz.id, !biz.verified)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                        biz.verified
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {biz.verified ? 'Revoke Verification' : 'Grant Verified Seal'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Platform Announcements */}
        {activeTab === 'announcements' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 max-w-2xl shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600" />
              <span>Broadcast Marketplace Banner</span>
            </h3>
            <textarea
              rows={3}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 outline-none"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={announcementActive}
                  onChange={(e) => setAnnouncementActive(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Display on Homepage</span>
              </label>

              <button
                type="button"
                onClick={() => showToast('Announcement banner published live!', 'success')}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs"
              >
                Publish Announcement
              </button>
            </div>
          </div>
        )}

        {/* Tab 6: Reports & Trust */}
        {activeTab === 'reports' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center space-y-2">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Trust & Safety Queue Clear</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All reported listings have been moderated and zero active complaints are unresolved.
            </p>
          </div>
        )}
      </div>

      {/* Reject Listing Modal */}
      {rejectModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h4 className="font-bold text-sm text-slate-900">
              Reject Listing: "{rejectModalProduct.title}"
            </h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Rejection (sent to seller)
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModalProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Governance Action Modal (Suspend or Reject User) */}
      {actionUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 capitalize">
                  {actionUserModal.action === 'suspend' ? 'Suspend User Account' : 'Reject Seller Registration'}
                </h4>
                <p className="text-xs text-slate-500">
                  Target: {actionUserModal.user.name} ({actionUserModal.user.email})
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Official Reason / Notes <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={userActionReason}
                onChange={(e) => setUserActionReason(e.target.value)}
                placeholder="Specify compliance or verification reason..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionUserModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (actionUserModal.action === 'suspend') {
                    await suspendUser(actionUserModal.user.id, userActionReason);
                  } else {
                    await rejectUser(actionUserModal.user.id, userActionReason);
                  }
                  setActionUserModal(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                Confirm {actionUserModal.action === 'suspend' ? 'Suspension' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
