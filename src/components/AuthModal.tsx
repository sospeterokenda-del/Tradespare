import React, { useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { User, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register' | 'recovery';
  requiredRole?: UserRole;
  explanationMessage?: string;
  onSuccessfulLogin?: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
  requiredRole,
  explanationMessage,
  onSuccessfulLogin,
}) => {
  const {
    loginWithGoogle,
    loginWithCredentials,
    registerUser,
    requestPasswordResetCode,
    resetPassword,
    fastSwitchUser,
    allUsers,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'recovery'>(defaultTab);
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller'>('buyer');

  // Login inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register inputs
  const [name, setName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');

  // Password Recovery inputs
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [receivedCodeDisplay, setReceivedCodeDisplay] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [recoverySuccessMsg, setRecoverySuccessMsg] = useState<string | null>(null);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await loginWithCredentials(email, password);
      onClose();
      if (onSuccessfulLogin) {
        onSuccessfulLogin(user);
      }
    } catch (err: any) {
      // Do not reveal whether email exists; generic secure message
      setErrorMsg(err.message || 'Invalid email or password. Please verify your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please provide your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (selectedRole === 'seller' && !businessName.trim()) {
      setErrorMsg('Please specify your Store / Business Name for seller verification.');
      return;
    }

    setIsLoading(true);
    try {
      const newUser = await registerUser({
        name,
        email,
        password: regPassword,
        phone: phone || '+254 700 000 000',
        role: selectedRole,
        businessName: selectedRole === 'seller' ? businessName : undefined,
      });
      onClose();
      if (onSuccessfulLogin) {
        onSuccessfulLogin(newUser);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!recoveryEmail.trim() || !emailRegex.test(recoveryEmail.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordResetCode(recoveryEmail);
      if (res.code) {
        setReceivedCodeDisplay(res.code);
        setRecoveryCode(res.code);
      }
      setInfoMsg(res.message);
      setRecoveryStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Password reset request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!recoveryCode.trim()) {
      setErrorMsg('Please enter the 6-digit recovery PIN.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(recoveryEmail, newPassword, recoveryCode);
      setRecoverySuccessMsg(res.message);
      setEmail(recoveryEmail);
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const user = await loginWithGoogle(selectedRole, businessName);
      onClose();
      if (onSuccessfulLogin) {
        onSuccessfulLogin(user);
      }
    } catch (err: any) {
      if (
        err?.message?.includes('cancelled') ||
        err?.message?.includes('popup-closed-by-user')
      ) {
        // Do not display an aggressive error if user intentionally closed the window
        setErrorMsg(null);
      } else {
        setErrorMsg(err.message || 'Google authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFastSwitch = (targetUser: User) => {
    fastSwitchUser(targetUser.id);
    onClose();
    if (onSuccessfulLogin) {
      onSuccessfulLogin(targetUser);
    }
  };

  const autofillDemo = (userEmail: string, userPass = 'Password123!') => {
    setActiveTab('login');
    setEmail(userEmail);
    setPassword(userPass);
    setErrorMsg(null);
    setInfoMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <span className="text-[11px] uppercase font-extrabold tracking-widest text-indigo-200">
              TradeSphere Security
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {activeTab === 'login'
              ? 'Sign in to TradeSphere'
              : activeTab === 'register'
              ? 'Create Your Account'
              : 'Password Recovery'}
          </h2>
          <p className="text-xs text-indigo-100 mt-1">
            {explanationMessage ||
              (activeTab === 'login'
                ? 'Enter your credentials to access role-protected dashboards.'
                : activeTab === 'register'
                ? 'Select your role to access marketplace features securely.'
                : 'Enter your email to receive a secure recovery PIN.')}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1 gap-1">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition text-center min-h-[38px] ${
              activeTab === 'login'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition text-center min-h-[38px] ${
              activeTab === 'register'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => {
              setActiveTab('recovery');
              setErrorMsg(null);
              setInfoMsg(null);
              setRecoveryStep(1);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition text-center min-h-[38px] ${
              activeTab === 'recovery'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Forgot Password
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="font-semibold">{errorMsg}</p>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-2.5 text-indigo-900 text-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <p className="font-medium">{infoMsg}</p>
            </div>
          )}

          {/* Quick Continue with Google */}
          {activeTab !== 'recovery' && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl border border-slate-300 shadow-xs flex items-center justify-center gap-2.5 transition active:scale-98 min-h-[44px]"
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

          {/* Form: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sarah@apextech.co.ke"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition min-h-[44px]"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('recovery');
                      setRecoveryEmail(email);
                      setErrorMsg(null);
                      setInfoMsg(null);
                      setRecoveryStep(1);
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition min-h-[44px]"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition active:scale-98 min-h-[44px] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Select Your Account Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('buyer')}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      selectedRole === 'buyer'
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      {selectedRole === 'buyer' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Buyer / Customer</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                        Instant activation. Browse & order.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('seller')}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      selectedRole === 'seller'
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Store className="w-4 h-4" />
                      </div>
                      {selectedRole === 'seller' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Seller / Merchant</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                        Requires Admin verification.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {selectedRole === 'seller' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2 text-amber-800 text-[11px]">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Approval Policy:</strong> Seller profiles register in <strong>Pending</strong> status and require administrator approval before inventory can be published.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. David Mwangi"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition min-h-[44px]"
                />
              </div>

              {selectedRole === 'seller' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Store / Business Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Apex Electronics Ltd"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition min-h-[44px]"
                    />
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 700 000 000"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition min-h-[44px]"
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
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition min-h-[44px]"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition active:scale-98 min-h-[44px] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Register as {selectedRole === 'seller' ? 'Seller (Pending Approval)' : 'Buyer'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form: PASSWORD RECOVERY */}
          {activeTab === 'recovery' && (
            <div className="space-y-4">
              {recoverySuccessMsg ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2.5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-xs font-extrabold text-emerald-900">
                    Password Reset Complete
                  </h4>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    {recoverySuccessMsg}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoverySuccessMsg(null);
                      setActiveTab('login');
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
                  >
                    Proceed to Sign In
                  </button>
                </div>
              ) : recoveryStep === 1 ? (
                <form onSubmit={handleRequestRecoveryCode} className="space-y-3.5">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enter your account email address. We will generate a 6-digit recovery code to authenticate your new password.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Account Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="e.g. sarah@apextech.co.ke"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition min-h-[44px]"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-98 min-h-[44px] flex items-center justify-center gap-2"
                  >
                    {isLoading ? 'Verifying...' : 'Send Recovery Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCompletePasswordReset} className="space-y-3.5">
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900">
                    <p className="font-semibold">Code sent to: {recoveryEmail}</p>
                    {receivedCodeDisplay && (
                      <p className="mt-1 font-mono text-[11px] font-bold text-indigo-700 bg-white/70 p-1 rounded border border-indigo-200 text-center">
                        Demo PIN: {receivedCodeDisplay}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">6-Digit Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      placeholder="482910"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono text-sm tracking-widest text-slate-900 outline-none transition min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none transition min-h-[44px]"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none transition min-h-[44px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRecoveryStep(1)}
                      className="py-2.5 px-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      {isLoading ? 'Saving...' : 'Set New Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Quick Credential Helpers */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                1-Click Demo Accounts (Fast Testing)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {allUsers.map((u) => {
                let badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                if (u.role === 'admin') badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                else if (u.role === 'seller' && u.status === 'active') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                else if (u.status === 'pending') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => autofillDemo(u.email, u.password || 'Password123!')}
                    className="p-2 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition flex items-center gap-2 group min-h-[44px]"
                  >
                    <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-slate-300 flex-shrink-0" />
                    <div className="overflow-hidden min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 truncate group-hover:text-indigo-600">{u.name}</p>
                      <div className="flex items-center gap-1">
                        <span className={`text-[9px] font-extrabold uppercase px-1 rounded border ${badgeColor}`}>
                          {u.role}
                        </span>
                        {u.status === 'pending' && (
                          <span className="text-[9px] font-bold text-amber-600">Pending</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
