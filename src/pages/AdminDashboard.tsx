import React, { useState, useRef, useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  BarChart3,
  Bell,
  Building,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
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
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  Menu,
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
  UserX,
  X,
  XCircle,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { CategoryInfo, Product, SafetyFlag, User, UserRole } from '../types';
import { AccessDenied } from '../components/AccessDenied';

interface AdminDashboardProps {
  onNavigate: (view: string, params?: any) => void;
  onSelectProduct: (product: Product) => void;
}

type AdminTab =
  | 'overview'
  | 'users_rbac'
  | 'moderation'
  | 'categories'
  | 'businesses'
  | 'reports'
  | 'financial_kpis'
  | 'announcements'
  | 'branding_settings'
  | 'activity_logs'
  | 'profile_settings';

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

  // STRICT ACCESS CONTROL: Only authorized Super Admin can access
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
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Sidebar responsive state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Top Action Modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // User detail view modal
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);

  // Edit Admin Profile Form States
  const [profileName, setProfileName] = useState(adminDetails.profile.name || 'Sospeter Okenda');
  const [profilePhone, setProfilePhone] = useState(adminDetails.profile.phone || '+254 700 123 000');
  const [profileDepartment, setProfileDepartment] = useState(
    adminDetails.profile.department || 'Executive Platform Governance'
  );
  const [profileBio, setProfileBio] = useState(
    adminDetails.profile.bio ||
      'TradeSphere Authorized Super Administrator with full governance control over platform safety, users, products, and financial operations.'
  );
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
  const approvedAccounts = useMemo(() => allUsers.filter((u) => u.status === 'active'), [allUsers]);
  const suspendedUsers = useMemo(
    () => allUsers.filter((u) => u.status === 'suspended' || u.status === 'rejected'),
    [allUsers]
  );
  const pendingSafetyFlags = useMemo(() => safetyFlags.filter((f) => f.status === 'pending'), [safetyFlags]);

  // Users & RBAC management states
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'seller' | 'buyer' | 'admin'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'pending' | 'active' | 'suspended' | 'rejected'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [actionUserModal, setActionUserModal] = useState<{
    user: User;
    action: 'suspend' | 'reject' | 'activate' | 'approve';
  } | null>(null);
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

  // Navigation Items with Icons, Labels, and Dynamic Badges
  const navigationItems = [
    {
      group: 'Governance',
      items: [
        {
          id: 'overview' as AdminTab,
          label: 'Dashboard Overview',
          icon: LayoutDashboard,
          badge: null,
          badgeColor: '',
        },
        {
          id: 'users_rbac' as AdminTab,
          label: 'User Management',
          icon: Users,
          badge: pendingUsers.length > 0 ? `${pendingUsers.length}` : null,
          badgeColor: 'bg-amber-500 text-slate-950 font-black',
        },
        {
          id: 'moderation' as AdminTab,
          label: 'Product Listings',
          icon: Package,
          badge: pendingProducts.length > 0 ? `${pendingProducts.length}` : null,
          badgeColor: 'bg-amber-500 text-slate-950 font-black',
        },
        {
          id: 'reports' as AdminTab,
          label: 'Trust & Safety Flags',
          icon: Flag,
          badge: pendingSafetyFlags.length > 0 ? `${pendingSafetyFlags.length}` : null,
          badgeColor: 'bg-rose-500 text-white font-black',
        },
      ],
    },
    {
      group: 'Commerce & Content',
      items: [
        {
          id: 'businesses' as AdminTab,
          label: 'Business Directory',
          icon: Store,
          badge: null,
          badgeColor: '',
        },
        {
          id: 'categories' as AdminTab,
          label: 'Categories',
          icon: Layers,
          badge: null,
          badgeColor: '',
        },
        {
          id: 'financial_kpis' as AdminTab,
          label: 'Financial KPIs',
          icon: Banknote,
          badge: null,
          badgeColor: '',
        },
        {
          id: 'announcements' as AdminTab,
          label: 'Announcements',
          icon: Megaphone,
          badge: null,
          badgeColor: '',
        },
      ],
    },
    {
      group: 'System & Security',
      items: [
        {
          id: 'branding_settings' as AdminTab,
          label: 'Branding & Settings',
          icon: Settings,
          badge: null,
          badgeColor: '',
        },
        {
          id: 'activity_logs' as AdminTab,
          label: 'Activity Logs',
          icon: Clock,
          badge: adminLogs.length > 0 ? `${adminLogs.length}` : null,
          badgeColor: 'bg-slate-700 text-slate-200',
        },
        {
          id: 'profile_settings' as AdminTab,
          label: 'Admin Profile & Security',
          icon: ShieldCheck,
          badge: null,
          badgeColor: '',
        },
      ],
    },
  ];

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
      showToast('Super Admin password successfully updated.', 'success');
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
    }, 350);
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

  // Safe Logout Handler
  const handlePerformLogout = async () => {
    setIsLogoutConfirmOpen(false);
    await signOutUser();
    onNavigate('login', {
      redirectReason: 'Super Admin session terminated safely. Fresh email and password sign-in required to enter Super Admin Mode.',
    });
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
      if (userStatusFilter !== 'all' && u.status !== userStatusFilter) return false;
      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchStore = (u.businessName || '').toLowerCase().includes(q);
        const matchPhone = (u.phone || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchStore && !matchPhone) return false;
      }
      return true;
    });
  }, [allUsers, userRoleFilter, userStatusFilter, userSearchQuery]);

  // Total pending count across moderation queues
  const totalPendingActionCount = pendingUsers.length + pendingProducts.length + pendingSafetyFlags.length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row w-full overflow-x-hidden text-slate-900">
      {/* ============================================================== */}
      {/* 1. DESKTOP SIDEBAR (COLLAPSIBLE, SLEEK, ORGANIZED)             */}
      {/* ============================================================== */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-slate-950 border-r border-slate-800 text-slate-300 transition-all duration-300 ease-in-out sticky top-[64px] sm:top-[72px] lg:top-[80px] h-[calc(100vh-64px)] sm:h-[calc(100vh-72px)] lg:h-[calc(100vh-80px)] z-30 select-none ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header / Brand */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md shadow-indigo-600/30">
                <Shield className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="font-black text-sm text-white tracking-tight block truncate">
                  TradeSphere
                </span>
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
                  Super Admin
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
              <Shield className="w-4 h-4" />
            </div>
          )}

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition hidden lg:inline-flex"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Navigation Links Grouped */}
        <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5 no-scrollbar">
          {navigationItems.map((group) => (
            <div key={group.group} className="space-y-1">
              {!isSidebarCollapsed && (
                <p className="px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  {group.group}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative group ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                    } ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                    {item.badge && !isSidebarCollapsed && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                    {item.badge && isSidebarCollapsed && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer with Super Admin Identity & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
          {!isSidebarCollapsed ? (
            <div className="space-y-2.5">
              <div
                onClick={() => setActiveTab('profile_settings')}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-900 transition cursor-pointer"
              >
                <img
                  src={adminDetails.profile.avatar}
                  alt={adminDetails.profile.name}
                  className="w-8 h-8 rounded-full object-cover border border-indigo-400/50 flex-shrink-0"
                />
                <div className="overflow-hidden min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{adminDetails.profile.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{adminDetails.profile.email}</p>
                </div>
              </div>

              <button
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/30 border border-rose-900/40 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setActiveTab('profile_settings')}
                title="Super Admin Profile"
                className="p-1 rounded-full hover:ring-2 hover:ring-indigo-400 transition"
              >
                <img
                  src={adminDetails.profile.avatar}
                  alt={adminDetails.profile.name}
                  className="w-8 h-8 rounded-full object-cover border border-indigo-400/50"
                />
              </button>
              <button
                onClick={() => setIsLogoutConfirmOpen(true)}
                title="Sign Out Super Admin"
                className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/40 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MOBILE NAVIGATION DRAWER (SLIDE-OUT)                         */}
      {/* ============================================================== */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-out drawer menu */}
          <div className="relative w-72 max-w-[85vw] bg-slate-950 text-slate-300 h-full flex flex-col z-10 shadow-2xl border-r border-slate-800 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-sm text-white block">TradeSphere</span>
                  <span className="text-[10px] font-bold text-indigo-400 block uppercase">Super Admin Portal</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
              {navigationItems.map((group) => (
                <div key={group.group} className="space-y-1">
                  <p className="px-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    {group.group}
                  </p>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileDrawerOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition min-h-[44px] ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Drawer User identity and logout */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
              <div
                onClick={() => {
                  setActiveTab('profile_settings');
                  setIsMobileDrawerOpen(false);
                }}
                className="flex items-center gap-3 cursor-pointer"
              >
                <img
                  src={adminDetails.profile.avatar}
                  alt={adminDetails.profile.name}
                  className="w-9 h-9 rounded-full object-cover border border-indigo-400"
                />
                <div className="overflow-hidden min-w-0">
                  <p className="text-xs font-bold text-white truncate">{adminDetails.profile.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{adminDetails.profile.email}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  setIsLogoutConfirmOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Super Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MAIN DASHBOARD CONTENT AREA                                 */}
      {/* ============================================================== */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
        {/* ============================================================== */}
        {/* STICKY TOP ADMINISTRATIVE HEADER BAR                           */}
        {/* ============================================================== */}
        <header className="sticky top-[64px] sm:top-[72px] lg:top-[80px] z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3 shadow-2xs">
          {/* Left: Mobile hamburger menu & Section breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition min-h-[40px] min-w-[40px] flex items-center justify-center border border-slate-200"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold">
                <span>Super Admin</span>
                <span>/</span>
                <span className="text-indigo-600 capitalize">
                  {activeTab.replace('_', ' ')}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                {activeTab === 'overview' && 'Executive Overview'}
                {activeTab === 'users_rbac' && 'User Management & Approvals'}
                {activeTab === 'moderation' && 'Product Listings Moderation'}
                {activeTab === 'categories' && 'Catalog Categories'}
                {activeTab === 'businesses' && 'Business Storefront Directory'}
                {activeTab === 'reports' && 'Trust, Safety & Incident Flags'}
                {activeTab === 'financial_kpis' && 'Financial KPIs & Order Ledger'}
                {activeTab === 'announcements' && 'Platform Announcements'}
                {activeTab === 'branding_settings' && 'Platform Branding & Policies'}
                {activeTab === 'activity_logs' && 'Super Admin Activity Audit Trail'}
                {activeTab === 'profile_settings' && 'Super Admin Profile & Security'}
              </h1>
            </div>
          </div>

          {/* Right: Security indicators, quick actions, Profile button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Attention indicator */}
            {totalPendingActionCount > 0 && (
              <button
                onClick={() => {
                  if (pendingUsers.length > 0) setActiveTab('users_rbac');
                  else if (pendingProducts.length > 0) setActiveTab('moderation');
                  else setActiveTab('reports');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition"
                title={`${totalPendingActionCount} items pending moderation`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">{totalPendingActionCount} Action{totalPendingActionCount > 1 ? 's' : ''} Needed</span>
                <span className="sm:hidden font-extrabold">{totalPendingActionCount}</span>
              </button>
            )}

            {/* Quick Edit Profile */}
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
              title="Edit Super Admin Profile"
            >
              <Edit className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Edit Profile</span>
            </button>

            {/* Quick Change Password */}
            <button
              onClick={() => {
                setPwdError('');
                setIsChangePasswordOpen(true);
              }}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
              title="Update Credentials"
            >
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Password</span>
            </button>

            {/* Quick Logout Button */}
            <button
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition"
              title="Terminate Super Admin Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* ============================================================== */}
        {/* MAIN BODY CONTAINER WITH RESPONSIVE PADDING & SPACING          */}
        {/* ============================================================== */}
        <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* ============================================================== */}
          {/* ATTENTION REQUIRED BANNER (IF ANY PENDING ITEMS)               */}
          {/* ============================================================== */}
          {totalPendingActionCount > 0 && activeTab !== 'users_rbac' && activeTab !== 'moderation' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-800">
                    Administrative Action Queue
                  </h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {pendingUsers.length > 0 && `${pendingUsers.length} seller application${pendingUsers.length > 1 ? 's' : ''} awaiting approval. `}
                    {pendingProducts.length > 0 && `${pendingProducts.length} product listing${pendingProducts.length > 1 ? 's' : ''} awaiting review. `}
                    {pendingSafetyFlags.length > 0 && `${pendingSafetyFlags.length} safety incident flag${pendingSafetyFlags.length > 1 ? 's' : ''} unresolved.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {pendingUsers.length > 0 && (
                  <button
                    onClick={() => {
                      setActiveTab('users_rbac');
                      setUserStatusFilter('pending');
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Review Users ({pendingUsers.length})
                  </button>
                )}
                {pendingProducts.length > 0 && (
                  <button
                    onClick={() => {
                      setActiveTab('moderation');
                      setModFilter('pending');
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Review Listings ({pendingProducts.length})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 1: DASHBOARD OVERVIEW (ALL 6 REQUESTED STAT CARDS & PULSE) */}
          {/* ============================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Executive Welcome Hero Card */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-7 rounded-3xl shadow-xl border border-indigo-900/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <img
                      src={adminDetails.profile.avatar}
                      alt={adminDetails.profile.name}
                      className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-indigo-400 shadow-lg flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                          {adminDetails.profile.name}
                        </h2>
                        <span className="bg-rose-500/20 text-rose-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-rose-500/30 uppercase tracking-wider flex items-center gap-1">
                          <Shield className="w-3 h-3 text-rose-400" />
                          Super Administrator
                        </span>
                      </div>
                      <p className="text-xs text-indigo-200 mt-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{adminDetails.profile.email}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-300">{adminDetails.profile.department}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Server-Side Enforced · Full Platform Governance Authority</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <button
                      onClick={() => setActiveTab('users_rbac')}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Manage Users</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('moderation')}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/15"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Review Catalog</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('activity_logs')}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/15"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Audit Logs</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ---------------------------------------------------------- */}
              {/* 6 KEY STATISTICS IN RESPONSIVE CARDS (EXACT USER PROMPT)  */}
              {/* ---------------------------------------------------------- */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Core Platform Metrics
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">Real-time database sync</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                  {/* Card 1: Total Registered Users */}
                  <div
                    onClick={() => setActiveTab('users_rbac')}
                    className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                        Total Users
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900 tracking-tight">{allUsers.length}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                        <span>Registered</span>
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Pending Account Approvals */}
                  <div
                    onClick={() => {
                      setActiveTab('users_rbac');
                      setUserStatusFilter('pending');
                    }}
                    className={`bg-white p-4 rounded-2xl border shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group ${
                      pendingUsers.length > 0 ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200/90'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-amber-700 uppercase tracking-tight">
                        Pending Approvals
                      </span>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        pendingUsers.length > 0 ? 'bg-amber-100 text-amber-700 font-bold' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-amber-600 tracking-tight">{pendingUsers.length}</p>
                      <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                        {pendingUsers.length > 0 ? 'Review required' : 'Queue clear'}
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Approved Accounts */}
                  <div
                    onClick={() => {
                      setActiveTab('users_rbac');
                      setUserStatusFilter('active');
                    }}
                    className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                        Approved Accounts
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                        <UserCheck className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-emerald-600 tracking-tight">{approvedAccounts.length}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Verified rights</p>
                    </div>
                  </div>

                  {/* Card 4: Active Users */}
                  <div
                    onClick={() => {
                      setActiveTab('users_rbac');
                      setUserStatusFilter('active');
                    }}
                    className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                        Active Users
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900 tracking-tight">{activeUsers.length}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Live sessions</p>
                    </div>
                  </div>

                  {/* Card 5: Suspended Accounts */}
                  <div
                    onClick={() => {
                      setActiveTab('users_rbac');
                      setUserStatusFilter('suspended');
                    }}
                    className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                        Suspended / Restr.
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition">
                        <UserX className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-rose-600 tracking-tight">{suspendedUsers.length}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Access locked</p>
                    </div>
                  </div>

                  {/* Card 6: Total Products or Listings */}
                  <div
                    onClick={() => setActiveTab('moderation')}
                    className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                        Total Listings
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900 tracking-tight">{products.length}</p>
                      <p className="text-[11px] text-amber-600 font-medium mt-0.5">
                        {pendingProducts.length > 0 ? `${pendingProducts.length} pending review` : 'All approved'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Commerce Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-400 block">Total GMV</span>
                    <p className="text-lg font-black text-slate-900 mt-0.5">{formatPrice(totalGMV)}</p>
                    <span className="text-[11px] text-emerald-600 font-semibold">{orders.length} transactions</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Banknote className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-400 block">Platform Revenue (3.5%)</span>
                    <p className="text-lg font-black text-emerald-600 mt-0.5">{formatPrice(platformRevenue)}</p>
                    <span className="text-[11px] text-slate-400">Commission earned</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-400 block">Verified Businesses</span>
                    <p className="text-lg font-black text-slate-900 mt-0.5">{verifiedBizCount} of {businesses.length}</p>
                    <span className="text-[11px] text-slate-400">Merchant storefronts</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-400 block">Trust & Safety Queue</span>
                    <p className={`text-lg font-black mt-0.5 ${pendingSafetyFlags.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {pendingSafetyFlags.length} Pending
                    </p>
                    <span className="text-[11px] text-slate-400">{safetyFlags.length} total logged incidents</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Flag className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Activity Split Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Pending Sellers Quick Triage Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-amber-600" />
                        Pending Seller Applications
                      </h4>
                      <p className="text-xs text-slate-500">Requires Super Admin approval before selling</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('users_rbac');
                        setUserStatusFilter('pending');
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      View All ({pendingUsers.length})
                    </button>
                  </div>

                  {pendingUsers.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                      <p className="text-xs font-semibold text-slate-600">No pending seller registrations.</p>
                      <p className="text-[11px] text-slate-400">All registered users are currently reviewed.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {pendingUsers.slice(0, 4).map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => setSelectedUserDetail(user)}
                              className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition"
                            >
                              View
                            </button>
                            <button
                              onClick={() => approveUser(user.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs"
                            >
                              Approve
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Super Admin Audit Activity Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        Recent Audit Trail
                      </h4>
                      <p className="text-xs text-slate-500">Live governance actions by Sospeter Okenda</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('activity_logs')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      All Logs ({adminLogs.length})
                    </button>
                  </div>

                  {adminLogs.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 space-y-2">
                      <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-semibold text-slate-600">No activity recorded yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {adminLogs.slice(0, 4).map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-extrabold text-slate-900">{log.action}</span>
                              <span className="text-[10px] font-bold uppercase text-slate-400">· {log.category}</span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-1">{log.details}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                              log.severity === 'critical'
                                ? 'bg-rose-100 text-rose-800'
                                : log.severity === 'warning'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {log.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: USER MANAGEMENT (SEARCHABLE, FILTERABLE, DESKTOP TABLE, */}
          {/* MOBILE RESPONSIVE CARDS, DETAILED VIEW MODAL, ACTIONS)         */}
          {/* ============================================================== */}
          {activeTab === 'users_rbac' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Header with summary stats */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">User Management & Role Permissions</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review registered members, approve sellers, update roles, or suspend non-compliant accounts.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                    Total: <strong>{allUsers.length}</strong>
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                    Pending: <strong>{pendingUsers.length}</strong>
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    Active: <strong>{activeUsers.length}</strong>
                  </span>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Search input */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Search users by name, email, phone, or store name..."
                      className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    {userSearchQuery && (
                      <button
                        onClick={() => setUserSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Role filter buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Role:</span>
                    {(['all', 'seller', 'buyer', 'admin'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setUserRoleFilter(r)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition min-h-[36px] ${
                          userRoleFilter === r
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {r === 'all' ? 'All Roles' : r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status filter buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Status:</span>
                  {(['all', 'pending', 'active', 'suspended', 'rejected'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setUserStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition min-h-[34px] flex items-center gap-1.5 ${
                        userStatusFilter === s
                          ? s === 'pending'
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                            : s === 'active'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : s === 'suspended'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{s === 'all' ? 'All Statuses' : s}</span>
                      {s === 'pending' && pendingUsers.length > 0 && (
                        <span className="bg-slate-950 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                          {pendingUsers.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Results: DESKTOP & TABLET TABLE (hidden on mobile) */}
              <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider text-[10px]">
                        <th className="py-3.5 px-4">User Name</th>
                        <th className="py-3.5 px-4">Email Address</th>
                        <th className="py-3.5 px-4">Account Type</th>
                        <th className="py-3.5 px-4">Registered Date</th>
                        <th className="py-3.5 px-4">Email Verification</th>
                        <th className="py-3.5 px-4">Approval Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-semibold text-slate-600">No users match your criteria.</p>
                            <p className="text-[11px] text-slate-400">Try adjusting your search query or filters.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isSuperAdminAccount = u.email.toLowerCase() === 'sospeterokenda@gmail.com';
                          const isEmailVerified = !!u.verified;
                          return (
                            <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                              {/* 1. Name with Avatar */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  {u.profilePhotoURL || u.avatar ? (
                                    <img
                                      src={u.profilePhotoURL || u.avatar || undefined}
                                      alt={u.name}
                                      className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs flex-shrink-0">
                                      {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                  )}
                                  <div className="overflow-hidden min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="font-bold text-slate-900 truncate">{u.name}</p>
                                      {isSuperAdminAccount && (
                                        <span className="bg-rose-100 text-rose-800 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                                          Super Admin
                                        </span>
                                      )}
                                    </div>
                                    {u.businessName && (
                                      <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                                        <Store className="w-2.5 h-2.5 text-slate-400" />
                                        <span>{u.businessName}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* 2. Email Address */}
                              <td className="py-3.5 px-4 text-slate-700 font-mono text-[11px] truncate max-w-xs">
                                {u.email}
                              </td>

                              {/* 3. Account Type (Role) */}
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
                                  {u.role === 'admin' && <Shield className="w-2.5 h-2.5 text-rose-600" />}
                                  {u.role === 'seller' && <Store className="w-2.5 h-2.5 text-emerald-600" />}
                                  {u.role === 'buyer' && <ShoppingBag className="w-2.5 h-2.5 text-indigo-600" />}
                                  {u.role}
                                </span>
                              </td>

                              {/* 4. Registration Date */}
                              <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active Member'}
                              </td>

                              {/* 5. Email Verification Status */}
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isEmailVerified
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}
                                >
                                  {isEmailVerified ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>Verified</span>
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="w-3 h-3 text-slate-400" />
                                      <span>Unverified</span>
                                    </>
                                  )}
                                </span>
                              </td>

                              {/* 6. Approval Status */}
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
                              </td>

                              {/* 7. Actions: View, Approve, Reject, Suspend, Activate */}
                              <td className="py-3.5 px-4 text-right">
                                {isSuperAdminAccount ? (
                                  <span className="text-[11px] font-bold text-slate-400 italic">
                                    Platform Authority
                                  </span>
                                ) : (
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* VIEW BUTTON */}
                                    <button
                                      onClick={() => setSelectedUserDetail(u)}
                                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition flex items-center gap-1"
                                      title="View User Details"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>View</span>
                                    </button>

                                    {/* APPROVE BUTTON (Pending) */}
                                    {u.status === 'pending' && (
                                      <button
                                        onClick={() => setActionUserModal({ user: u, action: 'approve' })}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-2xs"
                                        title="Approve User Registration"
                                      >
                                        Approve
                                      </button>
                                    )}

                                    {/* REJECT BUTTON (Pending) */}
                                    {u.status === 'pending' && (
                                      <button
                                        onClick={() => {
                                          setUserActionReason('Application does not meet platform merchant criteria.');
                                          setActionUserModal({ user: u, action: 'reject' });
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-[11px] transition"
                                        title="Reject User Registration"
                                      >
                                        Reject
                                      </button>
                                    )}

                                    {/* SUSPEND BUTTON (Active) */}
                                    {u.status === 'active' && (
                                      <button
                                        onClick={() => {
                                          setUserActionReason('Account suspended pending compliance review.');
                                          setActionUserModal({ user: u, action: 'suspend' });
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition"
                                        title="Suspend User Account"
                                      >
                                        Suspend
                                      </button>
                                    )}

                                    {/* ACTIVATE BUTTON (Suspended / Rejected) */}
                                    {(u.status === 'suspended' || u.status === 'rejected') && (
                                      <button
                                        onClick={() => setActionUserModal({ user: u, action: 'activate' })}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px] transition"
                                        title="Re-activate User Account"
                                      >
                                        Activate
                                      </button>
                                    )}

                                    {/* Role dropdown switcher */}
                                    <select
                                      value={u.role}
                                      onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                                      className="px-1.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg border border-slate-200 outline-none transition"
                                      title="Switch Assigned Role"
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
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Users Results: MOBILE RESPONSIVE CARDS (strictly used on small screens) */}
              <div className="md:hidden space-y-3">
                {filteredUsers.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 space-y-2">
                    <Users className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">No users match your criteria.</p>
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isSuperAdminAccount = u.email.toLowerCase() === 'sospeterokenda@gmail.com';
                    const isEmailVerified = !!u.verified;
                    return (
                      <div
                        key={u.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {u.profilePhotoURL || u.avatar ? (
                              <img
                                src={u.profilePhotoURL || u.avatar || undefined}
                                alt={u.name}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs flex-shrink-0">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-bold text-slate-900 text-xs truncate">{u.name}</h4>
                                {isSuperAdminAccount && (
                                  <span className="bg-rose-100 text-rose-800 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                                    Super Admin
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 truncate font-mono">{u.email}</p>
                              {u.businessName && (
                                <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                  <Store className="w-3 h-3 text-slate-400" />
                                  <span>{u.businessName}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
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
                        </div>

                        {/* Metadata row */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 text-slate-600">
                          <div>
                            <span className="text-slate-400 block text-[10px] font-bold uppercase">Account Type</span>
                            <span className="font-bold capitalize">{u.role}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] font-bold uppercase">Email Status</span>
                            <span className={isEmailVerified ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                              {isEmailVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] font-bold uppercase">Registered</span>
                            <span>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active Member'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] font-bold uppercase">Phone</span>
                            <span className="truncate block">{u.phone || '—'}</span>
                          </div>
                        </div>

                        {/* Action buttons on mobile */}
                        {!isSuperAdminAccount && (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                            <button
                              onClick={() => setSelectedUserDetail(u)}
                              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold text-center transition flex items-center justify-center gap-1 min-h-[40px]"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Profile</span>
                            </button>

                            {u.status === 'pending' && (
                              <button
                                onClick={() => setActionUserModal({ user: u, action: 'approve' })}
                                className="py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold transition flex items-center justify-center gap-1 min-h-[40px]"
                              >
                                Approve
                              </button>
                            )}

                            {u.status === 'pending' && (
                              <button
                                onClick={() => {
                                  setUserActionReason('Application does not meet platform merchant criteria.');
                                  setActionUserModal({ user: u, action: 'reject' });
                                }}
                                className="py-2 px-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold transition min-h-[40px]"
                              >
                                Reject
                              </button>
                            )}

                            {u.status === 'active' && (
                              <button
                                onClick={() => {
                                  setUserActionReason('Account suspended pending compliance review.');
                                  setActionUserModal({ user: u, action: 'suspend' });
                                }}
                                className="py-2 px-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold transition min-h-[40px]"
                              >
                                Suspend
                              </button>
                            )}

                            {(u.status === 'suspended' || u.status === 'rejected') && (
                              <button
                                onClick={() => setActionUserModal({ user: u, action: 'activate' })}
                                className="py-2 px-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold transition min-h-[40px]"
                              >
                                Activate
                              </button>
                            )}

                            <select
                              value={u.role}
                              onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                              className="py-2 px-2.5 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 outline-none min-h-[40px]"
                            >
                              <option value="buyer">Buyer</option>
                              <option value="seller">Seller</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: PRODUCTS & LISTINGS MODERATION                           */}
          {/* ============================================================== */}
          {activeTab === 'moderation' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <span className="text-xs font-bold text-slate-500 mr-1">Filter:</span>
                  {(['pending', 'active', 'all'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setModFilter(filter)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition min-h-[36px] ${
                        modFilter === filter
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter === 'pending' ? `Pending Review (${pendingProducts.length})` : filter}
                    </button>
                  ))}
                </div>

                <span className="text-xs text-slate-500 font-medium">
                  Catalog Total: <strong>{products.length}</strong> listings
                </span>
              </div>

              {/* Product cards grid */}
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
                          <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{product.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">{product.description}</p>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                          <span className="font-extrabold text-slate-900 text-sm">{formatPrice(product.price)}</span>
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
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
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
          {/* TAB 4: CATEGORY MANAGEMENT                                     */}
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
                  <span>Create Category</span>
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
          {/* TAB 5: BUSINESS STOREFRONT DIRECTORY                            */}
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
                            <h4 className="font-extrabold text-slate-900 text-sm truncate">{biz.businessName}</h4>
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

                      <div className="pt-2 border-t border-slate-100">
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
          {/* TAB 6: TRUST & SAFETY FLAGS                                     */}
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
                          ? 'bg-indigo-600 text-white shadow-xs'
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
                          <span className="text-xs font-bold text-slate-400 italic">Case Closed</span>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 7: FINANCIAL KPIS & TRANSACTION LEDGER                     */}
          {/* ============================================================== */}
          {activeTab === 'financial_kpis' && (
            <div className="space-y-6 animate-in fade-in duration-150">
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

              {/* Transactions Ledger Table */}
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
          {/* TAB 8: ANNOUNCEMENTS BROADCAST BANNER                           */}
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Announcement Text</label>
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
          {/* TAB 9: BRANDING & SETTINGS                                      */}
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
          {/* TAB 10: ACTIVITY AUDIT LOGS                                     */}
          {/* ============================================================== */}
          {activeTab === 'activity_logs' && (
            <div className="space-y-5 animate-in fade-in duration-150">
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
                            <td className="py-3 px-4 text-slate-600 max-w-md">{log.details}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 11: SUPER ADMIN PROFILE & SECURITY SETTINGS                */}
          {/* ============================================================== */}
          {activeTab === 'profile_settings' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Profile Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={adminDetails.profile.avatar}
                        alt={adminDetails.profile.name}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
                      />
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-black text-slate-900">{adminDetails.profile.name}</h3>
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                          Super Admin
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{adminDetails.profile.email}</p>
                      <p className="text-xs font-semibold text-indigo-600 mt-1">{adminDetails.profile.department}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditProfileOpen(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setPwdError('');
                        setIsChangePasswordOpen(true);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Change Password</span>
                    </button>
                  </div>
                </div>

                {/* Profile Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Phone Contact</span>
                    <p className="font-bold text-slate-800 text-sm">{adminDetails.profile.phone || '+254 700 123 000'}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Location Headquarters</span>
                    <p className="font-bold text-slate-800 text-sm">{adminDetails.profile.location || 'Nairobi, Kenya'}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1 md:col-span-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">Governance Bio</span>
                    <p className="text-slate-700 leading-relaxed">
                      {adminDetails.profile.bio ||
                        'Authorized Super Administrator with full governance control over platform safety, users, products, and financial operations.'}
                    </p>
                  </div>
                </div>

                {/* Security Restrictions Banner */}
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-indigo-700 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-indigo-900 space-y-0.5">
                    <p className="font-bold">Strict Authority Separation</p>
                    <p className="text-indigo-700">
                      Super Admin controls are restricted to the verified account (sospeterokenda@gmail.com). Ordinary buyer and seller accounts cannot elevate permissions or access this console.
                    </p>
                  </div>
                </div>

                {/* Session Sign-out button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setIsLogoutConfirmOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out of Super Admin Session</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ============================================================== */}
      {/* MODAL: USER DETAILS MODAL (REQUESTED VIEW ACTION)               */}
      {/* ============================================================== */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {selectedUserDetail.profilePhotoURL || selectedUserDetail.avatar ? (
                  <img
                    src={selectedUserDetail.profilePhotoURL || selectedUserDetail.avatar || undefined}
                    alt={selectedUserDetail.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-black text-sm">
                    {selectedUserDetail.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-black text-base text-slate-900">{selectedUserDetail.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedUserDetail.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUserDetail(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Meta Information Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Account Type</span>
                <p className="font-bold text-slate-800 capitalize">{selectedUserDetail.role}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Approval Status</span>
                <span
                  className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    selectedUserDetail.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedUserDetail.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedUserDetail.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Email Verification</span>
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  {selectedUserDetail.verified ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Verified</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500">Unverified</span>
                    </>
                  )}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Phone Number</span>
                <p className="font-bold text-slate-800">{selectedUserDetail.phone || 'Not provided'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Store / Business</span>
                <p className="font-bold text-slate-800">{selectedUserDetail.businessName || 'None'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Registration Date</span>
                <p className="font-bold text-slate-800">
                  {selectedUserDetail.createdAt
                    ? new Date(selectedUserDetail.createdAt).toLocaleString()
                    : 'Active Member'}
                </p>
              </div>

              {selectedUserDetail.rejectionReason && (
                <div className="col-span-2 p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-rose-700">Rejection / Suspension Reason</span>
                  <p className="text-xs text-rose-800">{selectedUserDetail.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Action buttons inside details modal */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 flex-wrap">
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>

              {selectedUserDetail.status === 'pending' && (
                <button
                  onClick={() => {
                    approveUser(selectedUserDetail.id);
                    setSelectedUserDetail(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Approve Account
                </button>
              )}

              {selectedUserDetail.status === 'active' && selectedUserDetail.email !== 'sospeterokenda@gmail.com' && (
                <button
                  onClick={() => {
                    setActionUserModal({ user: selectedUserDetail, action: 'suspend' });
                    setSelectedUserDetail(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                >
                  Suspend Account
                </button>
              )}

              {(selectedUserDetail.status === 'suspended' || selectedUserDetail.status === 'rejected') && (
                <button
                  onClick={() => {
                    activateUser(selectedUserDetail.id);
                    setSelectedUserDetail(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Re-Activate Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: SENSITIVE ACTION CONFIRMATION DIALOG (SUSPEND / REJECT) */}
      {/* ============================================================== */}
      {actionUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  actionUserModal.action === 'approve' || actionUserModal.action === 'activate'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {actionUserModal.action === 'approve' || actionUserModal.action === 'activate' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 capitalize">
                  {actionUserModal.action === 'suspend' && 'Suspend User Account'}
                  {actionUserModal.action === 'reject' && 'Reject Seller Application'}
                  {actionUserModal.action === 'approve' && 'Approve Seller Account'}
                  {actionUserModal.action === 'activate' && 'Re-Activate User Account'}
                </h4>
                <p className="text-xs text-slate-500">
                  Target: {actionUserModal.user.name} ({actionUserModal.user.email})
                </p>
              </div>
            </div>

            {(actionUserModal.action === 'suspend' || actionUserModal.action === 'reject') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Official Reason / Compliance Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={userActionReason}
                  onChange={(e) => setUserActionReason(e.target.value)}
                  placeholder="Specify clear administrative reason..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none"
                />
              </div>
            )}

            {(actionUserModal.action === 'approve' || actionUserModal.action === 'activate') && (
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                This user will immediately be granted full active status and access to their appropriate dashboard.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
                  } else if (actionUserModal.action === 'reject') {
                    await rejectUser(actionUserModal.user.id, userActionReason);
                  } else if (actionUserModal.action === 'approve') {
                    await approveUser(actionUserModal.user.id);
                  } else if (actionUserModal.action === 'activate') {
                    await activateUser(actionUserModal.user.id);
                  }
                  setActionUserModal(null);
                }}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs ${
                  actionUserModal.action === 'suspend' || actionUserModal.action === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Confirm {actionUserModal.action.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT SUPER ADMIN PROFILE                                */}
      {/* ============================================================== */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
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
                  Authorized Super Admin Email <span className="text-slate-400 font-normal">(Server Enforced)</span>
                </label>
                <input
                  type="email"
                  disabled
                  value="sospeterokenda@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono cursor-not-allowed"
                />
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={profileDepartment}
                  onChange={(e) => setProfileDepartment(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Governance Bio</label>
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
      {/* MODAL: CHANGE ADMIN PASSWORD                                    */}
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
                  <p className="text-xs text-slate-500">Secure credentials for Sospeter Okenda</p>
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
      {/* MODAL: LOGOUT CONFIRMATION DIALOG                              */}
      {/* ============================================================== */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-extrabold text-base text-slate-900">Sign Out Super Admin?</h4>
              <p className="text-xs text-slate-500">
                This will safely clear your in-memory session. You will be redirected to the sign-in page.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePerformLogout}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-xs"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: REJECT LISTING MODAL                                     */}
      {/* ============================================================== */}
      {rejectModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
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
      {/* MODAL: CATEGORY ADD / EDIT MODAL                               */}
      {/* ============================================================== */}
      {categoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
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
      {/* MODAL: RESOLVE SAFETY FLAG MODAL                               */}
      {/* ============================================================== */}
      {resolveFlagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
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
