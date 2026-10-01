import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { UserRole } from '../types';

interface LoginPageProps {
  onNavigate: (view: string, params?: any) => void;
  initialTab?: 'login' | 'register' | 'recovery';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigate,
  initialTab = 'login',
}) => {
  const {
    loginWithCredentials,
    registerUser,
    requestPasswordResetCode,
    resetPassword,
    loginWithGoogle,
    fastSwitchUser,
    allUsers,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'recovery'>(initialTab);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<'buyer' | 'seller'>('buyer');
  const [regBusinessName, setRegBusinessName] = useState('');

  // Password Recovery State
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [receivedCodeDisplay, setReceivedCodeDisplay] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [recoverySuccessMsg, setRecoverySuccessMsg] = useState<string | null>(null);

  // Common UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [activePolicyTab, setActivePolicyTab] = useState<'verification' | 'recovery' | 'admin'>('verification');

  // Handle Role-Based Post-Login Navigation
  const handleRoleRedirect = (user: { role: UserRole; status: string; email?: string }) => {
    if (user.role === 'admin' || user.email?.toLowerCase() === 'sospeterokenda@gmail.com') {
      onNavigate('admin-dashboard');
    } else if (user.role === 'seller') {
      onNavigate('seller-dashboard');
    } else {
      onNavigate('customer-dashboard');
    }
  };

  // 1. Submit Login Form
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    // Pre-flight client validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!loginEmail.trim() || !emailRegex.test(loginEmail.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!loginPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    if (loginPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const loggedUser = await loginWithCredentials(loginEmail, loginPassword);
      handleRoleRedirect(loggedUser);
    } catch (err: any) {
      // Requirements: Show clear error for incorrect credentials without revealing email existence
      setErrorMsg(err.message || 'Invalid email or password. Please verify your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Register Form
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!regName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regEmail.trim() || !emailRegex.test(regEmail.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (regRole === 'seller' && !regBusinessName.trim()) {
      setErrorMsg('Store / Business Name is required for Seller merchant registration.');
      return;
    }

    setIsLoading(true);
    try {
      const registeredUser = await registerUser({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone || '+254 700 000 000',
        role: regRole,
        businessName: regRole === 'seller' ? regBusinessName : undefined,
      });

      handleRoleRedirect(registeredUser);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please review your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Password Recovery Step 1: Request Code
  const handleRequestRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!recoveryEmail.trim() || !emailRegex.test(recoveryEmail.trim())) {
      setErrorMsg('Please enter a valid email address to request a reset code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordResetCode(recoveryEmail);
      if (res.code) {
        setReceivedCodeDisplay(res.code);
        setRecoveryCode(res.code); // auto-fill demo PIN for convenience
      }
      setInfoMsg(res.message);
      setRecoveryStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not process password recovery. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Password Recovery Step 2: Complete Reset
  const handleCompletePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!recoveryCode.trim()) {
      setErrorMsg('Please enter the 6-digit recovery code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please retype identical passwords.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(recoveryEmail, newPassword, recoveryCode);
      setRecoverySuccessMsg(res.message);
      setLoginEmail(recoveryEmail);
      setLoginPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Fill Demo Credentials
  const fillCredentials = (email: string, pass = 'Password123!') => {
    setActiveTab('login');
    setLoginEmail(email);
    setLoginPassword(pass);
    setErrorMsg(null);
    setInfoMsg(null);
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setIsLoading(true);
    try {
      const user = await loginWithGoogle(regRole, regBusinessName);
      handleRoleRedirect(user);
    } catch (err: any) {
      if (
        err?.message?.includes('cancelled') ||
        err?.message?.includes('popup-closed-by-user')
      ) {
        // User voluntarily closed popup
        setErrorMsg(null);
      } else {
        setErrorMsg(err.message || 'Google authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex flex-col justify-center">
      {/* Return to Marketplace Catalog */}
      <div className="max-w-4xl mx-auto w-full mb-4">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Authentication Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 p-6 sm:p-8 text-white relative">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-200">
                Secure Authentication
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {activeTab === 'login'
                ? 'Sign In to TradeSphere'
                : activeTab === 'register'
                ? 'Create Your Account'
                : 'Password Recovery'}
            </h1>
            <p className="text-xs text-indigo-100 mt-1.5 max-w-md">
              {activeTab === 'login'
                ? 'Enter your registered email and password to access role-protected dashboards.'
                : activeTab === 'register'
                ? 'Join Kenya’s premier marketplace. Select your account role to get started.'
                : 'Recover your account safely using our anti-enumeration verification flow.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition text-center min-h-[40px] ${
                activeTab === 'login'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition text-center min-h-[40px] ${
                activeTab === 'register'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register Account
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('recovery');
                setErrorMsg(null);
                setInfoMsg(null);
                setRecoveryStep(1);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition text-center min-h-[40px] ${
                activeTab === 'recovery'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Forgot Password
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {/* Error Notification */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <p className="font-semibold leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {/* Information Notification */}
            {infoMsg && (
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-2.5 text-indigo-900 text-xs animate-in fade-in duration-150">
                <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">{infoMsg}</p>
              </div>
            )}

            {/* Quick Continue with Google */}
            {activeTab !== 'recovery' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl border border-slate-300 shadow-xs flex items-center justify-center gap-2.5 transition active:scale-98 min-h-[44px]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">or email & password</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
              </>
            )}

            {/* TAB 1: PASSWORD LOGIN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. sarah@apextech.co.ke"
                      className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition min-h-[44px]"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('recovery');
                        setRecoveryEmail(loginEmail);
                        setErrorMsg(null);
                        setInfoMsg(null);
                        setRecoveryStep(1);
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition min-h-[44px]"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                      aria-label="Toggle password visibility"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span>Keep me logged in securely</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition active:scale-98 min-h-[46px] flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Sign In with Password</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: REGISTER WITH ROLE */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    Select Account Role <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2.5">
                    Roles are enforced server-side. Sellers require admin verification before publishing items.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRegRole('buyer')}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                        regRole === 'buyer'
                          ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        {regRole === 'buyer' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Buyer / Customer</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                          Immediate activation. Browse items, place orders, chat with sellers.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('seller')}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                        regRole === 'seller'
                          ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Store className="w-4 h-4" />
                        </div>
                        {regRole === 'seller' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Seller / Merchant</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                          Post & sell products. Requires Admin approval before publishing.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {regRole === 'seller' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2 text-amber-800 text-[11px]">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p>
                      <strong>KYB Verification Policy:</strong> Seller accounts start in <strong>Pending</strong> status. An administrator must verify and approve your merchant store before your products go live.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. David Mwangi"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition min-h-[44px]"
                  />
                </div>

                {regRole === 'seller' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Store / Business Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={regBusinessName}
                        onChange={(e) => setRegBusinessName(e.target.value)}
                        placeholder="e.g. Apex Electronics Ltd"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition min-h-[44px]"
                      />
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+254 700 000 000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password (min 6 characters) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition min-h-[44px]"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
                      title={showRegPassword ? 'Hide password' : 'Show password'}
                      aria-label="Toggle password visibility"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition active:scale-98 min-h-[46px] flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Register as {regRole === 'seller' ? 'Seller (Pending Approval)' : 'Buyer'}</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 3: PASSWORD RECOVERY FLOW */}
            {activeTab === 'recovery' && (
              <div className="space-y-4">
                {recoverySuccessMsg ? (
                  <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h3 className="text-sm font-extrabold text-emerald-900">
                      Password Reset Complete!
                    </h3>
                    <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
                      {recoverySuccessMsg}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setRecoverySuccessMsg(null);
                        setActiveTab('login');
                      }}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      Proceed to Sign In
                    </button>
                  </div>
                ) : recoveryStep === 1 ? (
                  <form onSubmit={handleRequestRecoveryCode} className="space-y-4">
                    <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-900 space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-indigo-950">
                        <KeyRound className="w-4 h-4 text-indigo-600" />
                        Step 1: Account Email Verification
                      </p>
                      <p className="text-[11px] text-indigo-700">
                        Enter your registered email address. We will send a secure 6-digit recovery PIN to authenticate your password change.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Registered Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          placeholder="e.g. sarah@apextech.co.ke"
                          className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition min-h-[44px]"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition active:scale-98 min-h-[46px] flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating Verification Code...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          <span>Request Password Reset Code</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleCompletePasswordReset} className="space-y-4">
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1.5">
                      <p className="font-bold flex items-center gap-1.5 text-emerald-950">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Step 2: Enter PIN & Set New Password
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        Dispatched to <strong>{recoveryEmail}</strong>.
                        {receivedCodeDisplay && (
                          <span className="block mt-1 bg-white/80 p-1.5 rounded-lg border border-emerald-300 font-mono text-center font-black text-xs text-emerald-700">
                            Demo Verification PIN: {receivedCodeDisplay}
                          </span>
                        )}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        6-Digit Recovery PIN <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        placeholder="482910"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono text-sm tracking-widest text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        New Password (min 6 characters) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition min-h-[44px]"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Confirm New Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition min-h-[44px]"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRecoveryStep(1)}
                        className="py-3 px-4 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition min-h-[44px]"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition min-h-[44px]"
                      >
                        {isLoading ? 'Updating Password...' : 'Save New Password & Sign In'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info: Verification Policies & 1-Click Demo Accounts */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Demo Accounts Switcher & Credential Helper */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-600">
                Demo Accounts (Quick Testing)
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
              Click any profile below to autofill its credentials into the password login form:
            </p>

            <div className="space-y-2">
              {[...allUsers].sort((a, b) => (a.role === 'admin' ? -1 : b.role === 'admin' ? 1 : 0)).slice(0, 5).map((u) => {
                let badgeClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                if (u.role === 'admin') badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                else if (u.role === 'seller' && u.status === 'active') badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                else if (u.status === 'pending') badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => fillCredentials(u.email, u.password || 'Password123!')}
                    className="w-full p-2.5 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-2xl text-left transition flex items-center justify-between group min-h-[46px]"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-300 flex-shrink-0"
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">
                          {u.name}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${badgeClass}`}>
                        {u.role}
                      </span>
                      {u.status === 'pending' && (
                        <span className="block text-[8px] font-bold text-amber-600 mt-0.5">
                          Pending
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verification Requirements & Security Rules Policy Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-800">
                Security Architecture & Requirements
              </h2>
            </div>

            {/* Toggle Policies */}
            <div className="flex border-b border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActivePolicyTab('verification')}
                className={`pb-2 px-2.5 font-bold transition border-b-2 -mb-px ${
                  activePolicyTab === 'verification'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Verification
              </button>
              <button
                type="button"
                onClick={() => setActivePolicyTab('recovery')}
                className={`pb-2 px-2.5 font-bold transition border-b-2 -mb-px ${
                  activePolicyTab === 'recovery'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Password Flow
              </button>
              <button
                type="button"
                onClick={() => setActivePolicyTab('admin')}
                className={`pb-2 px-2.5 font-bold transition border-b-2 -mb-px ${
                  activePolicyTab === 'admin'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Admin Restrictions
              </button>
            </div>

            {/* Verification Content */}
            {activePolicyTab === 'verification' && (
              <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <p>
                  <strong>Buyer Accounts:</strong> Require valid email format and standard password (6+ chars). Buyers receive instant active status to browse items and place orders.
                </p>
                <p>
                  <strong>Seller Accounts:</strong> Must provide a verified Store / Business Name, phone/WhatsApp number, and location. Registered in <strong>Pending</strong> status until vetted by platform administrators to prevent fraud.
                </p>
                <p>
                  <strong>Suspended / Rejected Accounts:</strong> Users marked as Suspended or Rejected cannot post listings, place orders, or access protected management hubs.
                </p>
              </div>
            )}

            {/* Recovery Content */}
            {activePolicyTab === 'recovery' && (
              <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <p>
                  <strong>Anti-Enumeration Protection:</strong> The recovery system responds with uniform success messages regardless of whether an email address exists in the database.
                </p>
                <p>
                  <strong>2-Step Verification:</strong> Users authenticate reset requests via a 6-digit PIN before setting a new password. Passwords must be at least 6 characters and match confirmation.
                </p>
              </div>
            )}

            {/* Admin Content */}
            {activePolicyTab === 'admin' && (
              <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <p>
                  <strong>Strict Privilege Controls:</strong> Administrator access is strictly bound to authorized platform personnel (<code>sospeterokenda@gmail.com</code>).
                </p>
                <p>
                  <strong>Tamper-Proof Rules:</strong> Firestore security rules reject client attempts to elevate roles or self-assign admin capabilities.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
