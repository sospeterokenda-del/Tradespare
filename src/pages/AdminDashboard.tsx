import React, { useState, useRef, useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  Building,
  CheckCircle2,
  Clock,
  Banknote,
  DollarSign,
  Download,
  Edit,
  Eye,
  EyeOff,
  Filter,
  Flag,
  Globe,
  HelpCircle,
  Key,
  Layers,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { AdminActivityLog, CategoryInfo, Product, SafetyFlag, User, UserRole } from '../types';
import { AccessDenied } from '../components/AccessDenied';

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
    adminLogs,
    safetyFlags,
    categories,
    updateAdminDetails,
    approveProduct,
    rejectProduct,
    featureProduct,
    deleteProduct,
    verifySeller,
    formatPrice,
    showToast,
    allUsers,
    currentUser,
    isSuperAdmin,
    approveUser,
    suspendUser,
    activateUser,
    rejectUser,
    updateUserRole,
    updateAdminProfile,
    changeAdminPassword,
    addAdminLog,
    clearAdminLogs,
    resolveSafetyFlag,
    dismissSafetyFlag,
    addCategory,
    updateCategory,
    deleteCategory,
    signOutUser,
  } = useMarketplace();

  // STRICT ACCESS CONTROL: Only sospeterokenda@gmail.com can access Super Admin Mode
  if (!isSuperAdmin) {
    return (
      <AccessDenied
        reason="role_restricted"
        requiredRole="Super Admin (sospeterokenda@gmail.com)"
        onNavigate={onNavigate}
        onOpenAuth={() => onNavigate('login')}
      />
    );
  }

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    | 'users_rbac'
    | 'moderation'
    | 'categories'
    | 'businesses'
    | 'announcements'
    | 'reports'
    | 'financial_kpis'
    | 'branding_settings'
    | 'activity_logs'
  >('users_rbac');

  // Top Action Modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Edit Admin Profile Form States
  const [profileName, setProfileName] = useState(adminDetails.profile.name || 'Sospeter Okenda');
  const [profilePhone, setProfilePhone] = useState(adminDetails.profile.phone || '+254 700 123 000');
  const [profileDepartment, setProfileDepartment] = useState(adminDetails.profile.department || 'Executive Platform Governance');
  const [profileBio, setProfileBio] = useState(adminDetails.profile.bio || 'TradeSphere Authorized Super Administrator with full governance control over platform safety, users, products, and financial operations.');
  const [profileLocation, setProfileLocation] = useState(adminDetails.profile.location || 'Nairobi, Kenya');
  const [profileAvatar, setProfileAvatar] = useState(adminDetails.profile.avatar);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  // Change Password Form States
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // Stats calculation
  const totalGMV = useMemo(() => orders.reduce((sum, o) => sum + o.totalAmount, 0), [orders]);
  const platformRevenue = useMemo(() => totalGMV * 0.035, [totalGMV]); // 3.5% commission
  const averageOrderValue = useMemo(() => (orders.length > 0 ? totalGMV / orders.length : 0), [totalGMV, orders]);
  const pendingProducts = useMemo(() => products.filter((p) => p.status === 'pending'), [products]);
  const activeProducts = useMemo(() => products.filter((p) => p.status === 'active'), [products]);
  const verifiedBizCount = useMemo(() => businesses.filter((b) => b.verified).length, [businesses]);
  const pendingUsers = useMemo(() => allUsers.filter((u) => u.status === 'pending'), [allUsers]);
  const activeUsers = useMemo(() => allUsers.filter((u) => u.status === 'active'), [allUsers]);
  const suspendedUsers = useMemo(() => allUsers.filter((u) => u.status === 'suspended' || u.status === 'rejected'), [allUsers]);
  const pendingSafetyFlags = useMemo(() => safetyFlags.filter((f) => f.status === 'pending'), [safetyFlags]);

  // Users & RBAC management states
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'seller' | 'buyer' | 'admin'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'pending' | 'active' | 'suspended' | 'rejected'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [actionUserModal, setActionUserModal] = useState<{ user: User; action: 'suspend' | 'reject' } | null>(null);
  const [userActionReason, setUserActionReason] = useState('Requires compliance review');

  // Listings moderation filter
  const [modFilter, setModFilter] = useState<'all' | 'pending' | 'active'>('pending');
  const [rejectModalProduct, setRejectModalProduct] = useState<Product | null>(null);
  const [rejectReason, setRejectReason] = useState('Missing required product certifications or unclear photos');

  // Category management modal
  const [categoryModal, setCategoryModal] = useState<{ mode: 'add' | 'edit'; category?: CategoryInfo } | null>(null);
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catIcon, setCatIcon] = useState('Layers');
  const [catPopular, setCatPopular] = useState(false);

  // Safety flag resolve modal
  const [resolveFlagModal, setResolveFlagModal] = useState<SafetyFlag | null>(null);
  const [flagNotes, setFlagNotes] = useState('');
  const [flagFilter, setFlagFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');

  // Activity logs filter & search
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>('all');
  const [logSeverityFilter, setLogSeverityFilter] = useState<string>('all');

  // Platform branding settings states
  const [brandName, setBrandName] = useState(adminDetails.platformBranding.marketplaceName);
  const [brandSlogan, setBrandSlogan] = useState(adminDetails.platformBranding.tagline);
  const [supportEmail, setSupportEmail] = useState(adminDetails.platformBranding.supportEmail);
  const [supportPhone, setSupportPhone] = useState(adminDetails.platformBranding.supportPhone);
  const [businessAddress, setBusinessAddress] = useState(adminDetails.platformBranding.businessAddress);
  const [timeZone, setTimeZone] = useState(adminDetails.platformBranding.timeZone);
  const [emailAlerts, setEmailAlerts] = useState(adminDetails.notificationPreferences.emailOnNewListing);
  const [smsAlerts, setSmsAlerts] = useState(adminDetails.notificationPreferences.smsOnHighValueOrder);
  const [moderationMode, setModerationMode] = useState(adminDetails.securityAndSettings.contentModerationMode);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Announcement state
  const [announcementText, setAnnouncementText] = useState(
    adminDetails.platformBranding.announcementBanner.text ||
    'Special Promo: Verified Businesses enjoy 0% listing fees this month on all equipment and solar machinery!'
  );
  const [announcementActive, setAnnouncementActive] = useState(
    adminDetails.platformBranding.announcementBanner.active
  );

  // Profile avatar upload
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setProfileAvatar(ev.target.result);
        showToast('Super Admin avatar uploaded', 'success');
      }
    };
    reader.readAsDataURL(file);
    if (profileFileInputRef.current) {
      profileFileInputRef.current.value = '';
    }
  };

  // Submit Admin Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateAdminProfile({
        name: profileName.trim() || 'Sospeter Okenda',
        phone: profilePhone.trim(),
        department: profileDepartment.trim(),
        bio: profileBio.trim(),
        location: profileLocation.trim(),
        avatar: profileAvatar,
      });
      setIsEditProfileOpen(false);
    } catch {
      // Error handled in context
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Submit Change Password
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');

    const trimmedCurrent = currentPwd.trim();
    const trimmedNew = newPwd.trim();
    const trimmedConfirm = confirmPwd.trim();

    if (!trimmedCurrent) {
      setPwdError('Current password is required.');
      return;
    }
    if (!trimmedNew) {
      setPwdError('New password is required.');
      return;
    }
    if (trimmedNew.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }
    if (trimmedNew === trimmedCurrent) {
      setPwdError('New password must be different from current password.');
      return;
    }
    if (!trimmedConfirm) {
      setPwdError('Please confirm your new password.');
      return;
    }
    if (trimmedNew !== trimmedConfirm) {
      setPwdError('New passwords do not match. Please verify and try again.');
      return;
    }

    setIsChangingPwd(true);
    try {
      await changeAdminPassword(trimmedCurrent, trimmedNew, trimmedConfirm);
      setIsChangePasswordOpen(false);
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (err: any) {
      setPwdError(err.message || 'Failed to update password');
    } finally {
      setIsChangingPwd(false);
    }
  };

  // Submit Branding & Platform Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setTimeout(() => {
      updateAdminDetails({
        platformBranding: {
          ...adminDetails.platformBranding,
          marketplaceName: brandName,
          tagline: brandSlogan,
          supportEmail,
          supportPhone,
          businessAddress,
          timeZone,
          announcementBanner: {
            text: announcementText,
            active: announcementActive,
            type: 'info',
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
      addAdminLog({
        action: 'Platform Settings Updated',
        category: 'website_settings',
        targetId: currentUser.id,
        targetName: 'Marketplace Branding & Governance',
        details: `Super Admin updated platform branding (${brandName}) and operational controls.`,
        severity: 'info',
      });
      setIsSavingSettings(false);
      showToast('Platform settings saved successfully!', 'success');
    }, 400);
  };

  // Category submission
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (categoryModal?.mode === 'edit' && categoryModal.category) {
      updateCategory(categoryModal.category.id, {
        name: catName.trim(),
        description: catDescription.trim(),
        iconName: catIcon,
        popular: catPopular,
      });
    } else {
      addCategory({
        name: catName.trim(),
        description: catDescription.trim(),
        iconName: catIcon,
        popular: catPopular,
        image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&auto=format&fit=crop&q=80',
        popularSearchTerms: [catName.toLowerCase()],
      });
    }
    setCategoryModal(null);
    setCatName('');
    setCatDescription('');
  };

  // Export Activity Logs to CSV
  const handleExportLogs = () => {
    const headers = ['Timestamp', 'Admin Name', 'Admin Email', 'Action', 'Category', 'Target', 'Severity', 'Details'];
    const rows = adminLogs.map((log) => [
      `"${log.timestamp}"`,
      `"${log.adminName}"`,
      `"${log.adminEmail}"`,
      `"${log.action.replace(/"/g, '""')}"`,
      `"${log.category}"`,
      `"${(log.targetName || log.targetId || '').replace(/"/g, '""')}"`,
      `"${log.severity}"`,
      `"${log.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tradesphere_admin_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Admin activity audit trail exported to CSV', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* ============================================================== */}
      {/* PERSONALIZED SUPER ADMIN EXECUTIVE HEADER (SOSPETER OKENDA)     */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-7 rounded-3xl shadow-2xl border border-indigo-900/40 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Identity & Super Admin Authority details */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="relative flex-shrink-0">
              <img
                src={adminDetails.profile.avatar}
                alt={adminDetails.profile.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-400 shadow-xl"
              />
              <span
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-slate-950 shadow-md"
                title="Verified Super Admin Authority"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="overflow-hidden min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white truncate">
                  {adminDetails.profile.name}
                </h1>
                <span className="bg-rose-500/20 text-rose-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-rose-500/40 uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
                  <Shield className="w-3 h-3 text-rose-400" />
                  Super Administrator
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 flex-shrink-0">
                  <Lock className="w-2.5 h-2.5" />
                  Server-Side Enforced
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-indigo-200 mt-1 flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span>{adminDetails.profile.email}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">{adminDetails.profile.department}</span>
              </p>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {adminDetails.profile.location || 'Nairobi, Kenya'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {adminDetails.platformBranding.timeZone}
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Full Governance Access
                </span>
              </div>
            </div>
          </div>

          {/* Quick Super Admin Actions: Edit Profile, Change Password, Activity Logs, Logout */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
            {/* Edit Profile Button */}
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-2 border border-white/15 shadow-xs min-h-[40px]"
            >
              <Edit className="w-3.5 h-3.5 text-indigo-300" />
              <span>Edit Admin Profile</span>
            </button>

            {/* Change Password Button */}
            <button
              onClick={() => {
                setPwdError('');
                setIsChangePasswordOpen(true);
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-2 border border-white/15 shadow-xs min-h-[40px]"
            >
              <Key className="w-3.5 h-3.5 text-amber-300" />
              <span>Change Password</span>
            </button>

            {/* Quick Link to Activity Logs */}
            <button
              onClick={() => setActiveTab('activity_logs')}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 border shadow-xs min-h-[40px] ${
                activeTab === 'activity_logs'
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-cyan-300" />
              <span>Activity Logs ({adminLogs.length})</span>
            </button>

            {/* Super Admin Logout */}
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to sign out of the Super Admin session?')) {
                  await signOutUser();
                  onNavigate('home');
                }
              }}
              className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-rose-900/30 min-h-[40px]"
              title="Securely terminate Super Admin session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Global Pending Moderation Strip */}
        {(pendingUsers.length > 0 || pendingProducts.length > 0 || pendingSafetyFlags.length > 0) && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5 mr-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Attention Required:
            </span>

            {pendingUsers.length > 0 && (
              <button
                onClick={() => {
                  setActiveTab('users_rbac');
                  setUserStatusFilter('pending');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Users className="w-3 h-3 text-amber-400" />
                <span>{pendingUsers.length} Seller Application{pendingUsers.length > 1 ? 's' : ''} Pending</span>
              </button>
            )}

            {pendingProducts.length > 0 && (
              <button
                onClick={() => {
                  setActiveTab('moderation');
                  setModFilter('pending');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Package className="w-3 h-3 text-amber-400" />
                <span>{pendingProducts.length} Product Listing{pendingProducts.length > 1 ? 's' : ''} to Review</span>
              </button>
            )}

            {pendingSafetyFlags.length > 0 && (
              <button
                onClick={() => {
                  setActiveTab('reports');
                  setFlagFilter('pending');
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Flag className="w-3 h-3 text-rose-400" />
                <span>{pendingSafetyFlags.length} Trust & Safety Flag{pendingSafetyFlags.length > 1 ? 's' : ''}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* COMPREHENSIVE SUPER ADMIN TAB NAVIGATION                       */}
      {/* ============================================================== */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-200 gap-1 sm:gap-4 overflow-x-auto text-xs sm:text-sm font-bold no-scrollbar">
          {[
            {
              id: 'users_rbac',
              label: 'Users & RBAC',
              badge: pendingUsers.length > 0 ? `${pendingUsers.length}` : `${allUsers.length}`,
              badgeColor: pendingUsers.length > 0 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-700',
              icon: Users,
            },
            {
              id: 'moderation',
              label: 'Listings',
              badge: pendingProducts.length > 0 ? `${pendingProducts.length}` : `${products.length}`,
              badgeColor: pendingProducts.length > 0 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-700',
              icon: Package,
            },
            {
              id: 'categories',
              label: 'Categories',
              badge: `${categories.length}`,
              badgeColor: 'bg-slate-100 text-slate-700',
              icon: Layers,
            },
            {
              id: 'businesses',
              label: 'Businesses',
              badge: `${businesses.length}`,
              badgeColor: 'bg-slate-100 text-slate-700',
              icon: Store,
            },
            {
              id: 'reports',
              label: 'Safety Flags',
              badge: pendingSafetyFlags.length > 0 ? `${pendingSafetyFlags.length}` : `${safetyFlags.length}`,
              badgeColor: pendingSafetyFlags.length > 0 ? 'bg-rose-500 text-white font-black' : 'bg-slate-100 text-slate-700',
              icon: Flag,
            },
            {
              id: 'financial_kpis',
              label: 'Financial KPIs',
              icon: Banknote,
            },
            {
              id: 'announcements',
              label: 'Announcements',
              icon: Megaphone,
            },
            {
              id: 'branding_settings',
              label: 'Branding & Settings',
              icon: Settings,
            },
            {
              id: 'activity_logs',
              label: 'Activity Logs',
              badge: `${adminLogs.length}`,
              badgeColor: 'bg-indigo-100 text-indigo-700',
              icon: Clock,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3.5 border-b-2 whitespace-nowrap transition px-2.5 min-h-[44px] flex items-center gap-2 ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: USERS & RBAC (APPROVALS, ROLES, SUSPENSION, ACTIVATION)   */}
        {/* ============================================================== */}
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
                  {pendingUsers.length > 0 ? 'Action required by Super Admin' : 'Queue clear'}
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
                        const isSuperAdminAccount = u.email.toLowerCase() === 'sospeterokenda@gmail.com';
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
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-bold text-slate-900 truncate">{u.name}</p>
                                    {isSuperAdminAccount && (
                                      <span className="bg-rose-100 text-rose-800 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                                        Super Admin
                                      </span>
                                    )}
                                  </div>
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
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  u.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : u.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800 animate-pulse'
                                    : u.status === 'suspended'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {u.status}
                              </span>
                              {u.rejectionReason && (
                                <p className="text-[10px] text-rose-500 mt-0.5 truncate max-w-xs">
                                  Note: {u.rejectionReason}
                                </p>
                              )}
                            </td>

                            {/* Storefront Info */}
                            <td className="py-3.5 px-4">
                              {u.businessName ? (
                                <div>
                                  <p className="font-semibold text-slate-800 truncate">{u.businessName}</p>
                                  <span className="text-[10px] text-slate-400">Merchant Store</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[11px]">—</span>
                              )}
                            </td>

                            {/* Registered */}
                            <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active Member'}
                            </td>

                            {/* Administrative Actions */}
                            <td className="py-3.5 px-4 text-right">
                              {isSuperAdminAccount ? (
                                <span className="text-[11px] font-bold text-slate-400 italic">
                                  Sole Authority
                                </span>
                              ) : (
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Approve Pending Seller */}
                                  {u.status === 'pending' && (
                                    <button
                                      onClick={() => approveUser(u.id)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-2xs"
                                    >
                                      Approve
                                    </button>
                                  )}

                                  {/* Activate Suspended or Rejected */}
                                  {(u.status === 'suspended' || u.status === 'rejected') && (
                                    <button
                                      onClick={() => activateUser(u.id)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px] transition"
                                    >
                                      Activate
                                    </button>
                                  )}

                                  {/* Suspend Active User */}
                                  {u.status === 'active' && (
                                    <button
                                      onClick={() => setActionUserModal({ user: u, action: 'suspend' })}
                                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition"
                                    >
                                      Suspend
                                    </button>
                                  )}

                                  {/* Reject Pending */}
                                  {u.status === 'pending' && (
                                    <button
                                      onClick={() => setActionUserModal({ user: u, action: 'reject' })}
                                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-[11px] transition"
                                    >
                                      Reject
                                    </button>
                                  )}

                                  {/* Role Switch Dropdown */}
                                  <select
                                    value={u.role}
                                    onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg border border-slate-200 outline-none"
                                  >
                                    <option value="buyer">Buyer</option>
                                    <option value="seller">Seller</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                </div>
                              )}
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

        {/* ============================================================== */}
        {/* TAB 2: PRODUCTS & LISTINGS MODERATION                           */}
        {/* ============================================================== */}
        {activeTab === 'moderation' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Filter buttons */}
            <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Filter Listings:</span>
                {(['pending', 'active', 'all'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setModFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition min-h-[36px] ${
                      modFilter === filter
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter === 'pending' ? `Pending Review (${pendingProducts.length})` : filter}
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Total Catalog: <strong>{products.length}</strong> items
              </span>
            </div>

            {/* Product listings grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products
                .filter((p) => (modFilter === 'all' ? true : p.status === modFilter))
                .map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between space-y-3 hover:shadow-md transition"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100">
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                        <span
                          className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            product.status === 'active'
                              ? 'bg-emerald-500 text-white'
                              : product.status === 'pending'
                              ? 'bg-amber-500 text-slate-950 font-extrabold'
                              : 'bg-rose-500 text-white'
                          }`}
                        >
                          {product.status}
                        </span>

                        {product.featured && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Featured
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                          {product.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {product.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-slate-400 capitalize bg-slate-100 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                          {product.category}
                        </span>
                      </div>
                    </div>

                    {/* Moderation Controls */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <button
                        onClick={() => onSelectProduct(product)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="View Live Listing"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1.5">
                        {product.status === 'pending' && (
                          <button
                            onClick={() => approveProduct(product.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {product.status !== 'rejected' && (
                          <button
                            onClick={() => {
                              setRejectModalProduct(product);
                              setRejectReason('Missing required certifications or unclear photos');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}

                        <button
                          onClick={() => featureProduct(product.id, !product.featured)}
                          className={`p-2 rounded-xl text-xs font-bold transition ${
                            product.featured
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                          title={product.featured ? 'Unfeature' : 'Feature on homepage'}
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Permanently delete "${product.title}"?`)) {
                              deleteProduct(product.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: CATEGORIES MANAGEMENT                                    */}
        {/* ============================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">TradeSphere Marketplace Categories</h3>
                <p className="text-xs text-slate-500">
                  Manage active catalog verticals, iconography, and featured highlights across the marketplace.
                </p>
              </div>

              <button
                onClick={() => {
                  setCategoryModal({ mode: 'add' });
                  setCatName('');
                  setCatDescription('');
                  setCatIcon('Layers');
                  setCatPopular(false);
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          <Layers className="w-5 h-5" />
                        </div>
                        {cat.popular && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Popular
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-black text-slate-900 text-base">{cat.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {cat.description || 'No description provided'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <span className="font-bold text-slate-700">{count} Active Listing{count !== 1 ? 's' : ''}</span>
                        <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                          id: {cat.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setCategoryModal({ mode: 'edit', category: cat });
                          setCatName(cat.name);
                          setCatDescription(cat.description || '');
                          setCatIcon(cat.iconName || 'Layers');
                          setCatPopular(!!cat.popular);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                            deleteCategory(cat.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: BUSINESS DIRECTORY & MERCHANT PROFILES                   */}
        {/* ============================================================== */}
        {activeTab === 'businesses' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">TradeSphere Verified Business Directory</h3>
                <p className="text-xs text-slate-500">
                  Review seller store credentials, phone contacts, location compliance, and merchant badges.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                {verifiedBizCount} of {businesses.length} Verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((biz) => {
                const owner = allUsers.find((u) => u.id === biz.ownerId);
                return (
                  <div
                    key={biz.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={biz.logo}
                          alt={biz.businessName}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                        />
                        <div className="overflow-hidden min-w-0">
                          <h4 className="font-extrabold text-slate-900 text-sm truncate">
                            {biz.businessName}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">{biz.city}, {biz.country}</p>
                          <p className="text-[10px] text-slate-400">Owner: {owner?.name || biz.ownerId}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2">{biz.description}</p>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <span className="text-slate-500">Phone: {biz.phone}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            biz.verified
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {biz.verified ? 'Verified Merchant' : 'Unverified'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => verifySeller(biz.id, !biz.verified)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          biz.verified
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{biz.verified ? 'Revoke Verification' : 'Verify Merchant'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: TRUST, SAFETY & RISK FLAGS                               */}
        {/* ============================================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Safety & Compliance Incident Log</h3>
                <p className="text-xs text-slate-500">
                  Review reported violations, counterfeit product alerts, and merchant compliance reports.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {(['all', 'pending', 'resolved', 'dismissed'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFlagFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition min-h-[34px] ${
                      flagFilter === filter
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter === 'pending' ? `Pending (${pendingSafetyFlags.length})` : filter}
                  </button>
                ))}
              </div>
            </div>

            {safetyFlags.filter((f) => (flagFilter === 'all' ? true : f.status === flagFilter)).length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Trust & Safety Queue Clear</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  All reported items and users have been audited. No pending complaints remain unresolved.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {safetyFlags
                  .filter((f) => (flagFilter === 'all' ? true : f.status === flagFilter))
                  .map((flag) => (
                    <div
                      key={flag.id}
                      className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 overflow-hidden">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              flag.severity === 'critical'
                                ? 'bg-rose-100 text-rose-800'
                                : flag.severity === 'high'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {flag.severity}
                          </span>
                          <span className="text-xs font-extrabold text-slate-900 capitalize">
                            {flag.type.toUpperCase()}: {flag.targetTitle}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              flag.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : flag.status === 'dismissed'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-amber-100 text-amber-800 animate-pulse'
                            }`}
                          >
                            {flag.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 font-medium">
                          Reason: <strong>{flag.reason}</strong>
                        </p>
                        <p className="text-xs text-slate-500">{flag.details}</p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                          <span>Reported by: {flag.reportedBy}</span>
                          <span>•</span>
                          <span>{new Date(flag.createdAt).toLocaleString()}</span>
                          {flag.resolvedBy && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 font-semibold">
                                Resolved by: {flag.resolvedBy} ({flag.resolutionNotes})
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      {flag.status === 'pending' ? (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setResolveFlagModal(flag);
                              setFlagNotes('Verified compliant after moderator investigation.');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Resolve</span>
                          </button>

                          <button
                            onClick={() => dismissSafetyFlag(flag.id)}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                          >
                            Dismiss
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 italic">
                          Case Closed
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: FINANCIAL KPIS & PLATFORM ANALYTICS                       */}
        {/* ============================================================== */}
        {activeTab === 'financial_kpis' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top Financial Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total GMV</span>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Banknote className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900">{formatPrice(totalGMV)}</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Gross Merchandise Value
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Platform Take (3.5%)</span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-emerald-600">{formatPrice(platformRevenue)}</p>
                <p className="text-[11px] text-slate-400 mt-1">Platform Commission Revenue</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Average Order Value</span>
                  <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900">{formatPrice(averageOrderValue)}</p>
                <p className="text-[11px] text-slate-400 mt-1">Per Completed Checkout</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Orders</span>
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900">{orders.length}</p>
                <p className="text-[11px] text-slate-400 mt-1">Processed Transactions</p>
              </div>
            </div>

            {/* Financial Ledger & Orders Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Recent Platform Transactions</h4>
                  <p className="text-xs text-slate-500">Live order disbursements and commission calculations.</p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Currency: KES (Kenyan Shilling)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider text-[10px]">
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Buyer</th>
                      <th className="py-3 px-4">Gross Amount</th>
                      <th className="py-3 px-4">3.5% Commission</th>
                      <th className="py-3 px-4">Seller Payout</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 10).map((ord) => {
                      const comm = ord.totalAmount * 0.035;
                      const payout = ord.totalAmount - comm;
                      return (
                        <tr key={ord.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-800">{ord.buyerName}</p>
                            <p className="text-[10px] text-slate-400">{ord.buyerPhone}</p>
                          </td>
                          <td className="py-3 px-4 font-extrabold text-slate-900">{formatPrice(ord.totalAmount)}</td>
                          <td className="py-3 px-4 font-bold text-emerald-600">{formatPrice(comm)}</td>
                          <td className="py-3 px-4 font-bold text-slate-700">{formatPrice(payout)}</td>
                          <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-500">
                            {ord.paymentMethod.replace('_', ' ')}
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                              {ord.orderStatus}
                            </span>
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

        {/* ============================================================== */}
        {/* TAB 7: ANNOUNCEMENTS & BROADCAST BANNER                        */}
        {/* ============================================================== */}
        {activeTab === 'announcements' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Platform Broadcast Announcement</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Displays a prominent promotional or notice banner across all TradeSphere pages for all users.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Announcement Text
                </label>
                <textarea
                  rows={3}
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="Enter notice text to display platform-wide..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="activeAnnouncement"
                  checked={announcementActive}
                  onChange={(e) => setAnnouncementActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="activeAnnouncement" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Activate Banner Platform-Wide
                </label>
              </div>

              {/* Live Preview */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <p className="text-[10px] font-extrabold uppercase text-slate-400">Live Preview:</p>
                <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white text-xs py-2 px-3 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="bg-white/20 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                      Notice
                    </span>
                    <span className="truncate">{announcementText}</span>
                  </div>
                  <X className="w-3.5 h-3.5 opacity-70" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingSettings ? 'Publishing...' : 'Publish Announcement'}</span>
              </button>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 8: BRANDING, PERMISSIONS & PLATFORM SETTINGS               */}
        {/* ============================================================== */}
        {activeTab === 'branding_settings' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Marketplace Branding & Operational Settings</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure brand name, contacts, compliance moderation mode, and platform policies.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Marketplace Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={brandSlogan}
                    onChange={(e) => setBrandSlogan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Support Phone</label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Headquarters Address</label>
                  <input
                    type="text"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Content Moderation Mode</label>
                  <select
                    value={moderationMode}
                    onChange={(e) => setModerationMode(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none font-bold"
                  >
                    <option value="strict">Strict (All products require Admin approval before live publication)</option>
                    <option value="standard">Standard (Auto-publish verified sellers, review unverified)</option>
                    <option value="permissive">Permissive (Auto-publish with post-moderation)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSettings ? 'Saving Settings...' : 'Save Platform Settings'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 9: ADMIN ACTIVITY LOGS (AUDIT TRAIL & COMPLIANCE)          */}
        {/* ============================================================== */}
        {activeTab === 'activity_logs' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Super Admin Audit Trail & Activity Logs
                </h3>
                <p className="text-xs text-slate-500">
                  Cryptographically trackable log of all governance actions taken by Sospeter Okenda.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportLogs}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  title="Export audit logs to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all activity logs? This action is audited.')) {
                      clearAdminLogs();
                    }
                  }}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Logs</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    placeholder="Search logs by action, details, target, or admin email..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={logCategoryFilter}
                    onChange={(e) => setLogCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="users">Users</option>
                    <option value="approvals">Approvals</option>
                    <option value="products">Products</option>
                    <option value="categories">Categories</option>
                    <option value="safety_flags">Safety Flags</option>
                    <option value="security">Security & Credentials</option>
                    <option value="settings">Settings & Branding</option>
                  </select>

                  <select
                    value={logSeverityFilter}
                    onChange={(e) => setLogSeverityFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold outline-none"
                  >
                    <option value="all">All Severities</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider text-[10px]">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Admin</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Target Entity</th>
                      <th className="py-3 px-4">Severity</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminLogs
                      .filter((log) => {
                        if (logCategoryFilter !== 'all' && log.category !== logCategoryFilter) return false;
                        if (logSeverityFilter !== 'all' && log.severity !== logSeverityFilter) return false;
                        if (logSearchQuery.trim()) {
                          const q = logSearchQuery.toLowerCase();
                          const matchAction = log.action.toLowerCase().includes(q);
                          const matchDetails = log.details.toLowerCase().includes(q);
                          const matchTarget = (log.targetName || '').toLowerCase().includes(q);
                          const matchAdmin = log.adminEmail.toLowerCase().includes(q);
                          if (!matchAction && !matchDetails && !matchTarget && !matchAdmin) return false;
                        }
                        return true;
                      })
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{log.adminName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{log.adminEmail}</p>
                          </td>
                          <td className="py-3 px-4 font-extrabold text-slate-800 whitespace-nowrap">
                            {log.action}
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                              {log.category.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-semibold truncate max-w-xs">
                            {log.targetName || log.targetId || 'Platform'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                log.severity === 'critical'
                                  ? 'bg-rose-100 text-rose-800'
                                  : log.severity === 'warning'
                                  ? 'bg-amber-100 text-amber-800'
                                  : log.severity === 'success'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {log.severity}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-md">
                            {log.details}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: EDIT ADMIN PROFILE                                    */}
      {/* ============================================================== */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Edit Super Admin Profile</h3>
                  <p className="text-xs text-slate-500">Update executive credentials and contact info</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Profile Avatar Picker */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <img
                  src={profileAvatar}
                  alt={profileName}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-300 shadow-xs"
                />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">Profile Photo</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => profileFileInputRef.current?.click()}
                      className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                    <input
                      ref={profileFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Authorized Super Admin Email <span className="text-slate-400 font-normal">(Immutable)</span>
                </label>
                <input
                  type="email"
                  disabled
                  value="sospeterokenda@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Single verified authority email for TradeSphere Super Admin governance.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={profileLocation}
                    onChange={(e) => setProfileLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department / Executive Office</label>
                <input
                  type="text"
                  value={profileDepartment}
                  onChange={(e) => setProfileDepartment(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Executive Bio</label>
                <textarea
                  rows={2}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: CHANGE ADMIN PASSWORD                                  */}
      {/* ============================================================== */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Change Super Admin Password</h3>
                  <p className="text-xs text-slate-500">Enhance credentials for Sospeter Okenda</p>
                </div>
              </div>
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pwdError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPwd ? 'text' : 'password'}
                    required
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password (min 6 chars)</label>
                <div className="relative">
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    required
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? 'text' : 'password'}
                    required
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPwd}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                >
                  {isChangingPwd ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: REJECT LISTING MODAL                                  */}
      {/* ============================================================== */}
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
                onClick={() => {
                  rejectProduct(rejectModalProduct.id, rejectReason);
                  setRejectModalProduct(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: USER ACTION MODAL (SUSPEND OR REJECT USER)             */}
      {/* ============================================================== */}
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
                Official Reason / Compliance Notes <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={userActionReason}
                onChange={(e) => setUserActionReason(e.target.value)}
                placeholder="Specify reason..."
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

      {/* ============================================================== */}
      {/* MODAL 5: CATEGORY ADD / EDIT MODAL                             */}
      {/* ============================================================== */}
      {categoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900">
                {categoryModal.mode === 'add' ? 'Create New Category' : `Edit Category: ${categoryModal.category?.name}`}
              </h4>
              <button onClick={() => setCategoryModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Solar Energy, Heavy Machinery"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Describe category items..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="catPopular"
                  checked={catPopular}
                  onChange={(e) => setCatPopular(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <label htmlFor="catPopular" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Highlight as Popular Category
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCategoryModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  {categoryModal.mode === 'add' ? 'Create Category' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: RESOLVE SAFETY FLAG MODAL                             */}
      {/* ============================================================== */}
      {resolveFlagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h4 className="font-extrabold text-sm text-slate-900">
              Resolve Safety Flag on {resolveFlagModal.targetTitle}
            </h4>
            <p className="text-xs text-slate-500">
              Reason reported: <strong>{resolveFlagModal.reason}</strong>
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resolution Investigation Notes
              </label>
              <textarea
                rows={3}
                required
                value={flagNotes}
                onChange={(e) => setFlagNotes(e.target.value)}
                placeholder="Enter actions taken by Super Admin..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResolveFlagModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resolveSafetyFlag(resolveFlagModal.id, flagNotes);
                  setResolveFlagModal(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
