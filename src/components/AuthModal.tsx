import React, { useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Shield,
  ShoppingBag,
  Sparkles,
  Store,
  UserCheck,
  X,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
  requiredRole?: UserRole;
  explanationMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
  requiredRole,
  explanationMessage,
}) => {
  const { loginWithGoogle, loginWithCredentials, registerUser, fastSwitchUser, allUsers } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller'>('buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await loginWithCredentials(email, password);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please provide your name and email address.');
      return;
    }
    if (selectedRole === 'seller' && !businessName.trim()) {
      setErrorMsg('Please specify your Store / Business Name for seller verification.');
      return;
    }

    setIsLoading(true);
    try {
      await registerUser({
        name,
        email,
        phone: phone || '+254 700 000 000',
        role: selectedRole,
        businessName: selectedRole === 'seller' ? businessName : undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await loginWithGoogle(selectedRole, businessName);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFastSwitch = (userId: string) => {
    fastSwitchUser(userId);
    onClose();
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
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-200">
              Secure RBAC Access
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {activeTab === 'login' ? 'Sign in to TradeSphere' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-indigo-100 mt-1">
            {explanationMessage ||
              (activeTab === 'login'
                ? 'Access your authenticated dashboard, orders, and products.'
                : 'Select your role to access marketplace features securely.')}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition text-center ${
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
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition text-center ${
              activeTab === 'register'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register with Role
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="font-medium">{errorMsg}</p>
            </div>
          )}

          {/* Google Sign In Quick Button */}
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
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">or email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Form: LOGIN */}
          {activeTab === 'login' ? (
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
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition active:scale-98 min-h-[44px]"
              >
                {isLoading ? 'Verifying Credentials...' : 'Sign In'}
              </button>
            </form>
          ) : (
            /* Form: REGISTER */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Role Selection (Requirement: Let users choose a role during registration) */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Select Your Account Role <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-2.5">
                  Roles are enforced in backend database security rules and cannot be changed via browser tools.
                </p>

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
                        Browse, place orders, chat with sellers. Instant activation.
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
                        Post & sell products. Requires Admin approval before publishing.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {selectedRole === 'seller' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2 text-amber-800 text-[11px]">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Approval Policy:</strong> Seller accounts are registered in <strong>Pending</strong> status. An administrator must approve your merchant profile before you can post or manage inventory.
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
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
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
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
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
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 700 000 000"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition active:scale-98 min-h-[44px]"
              >
                {isLoading ? 'Creating Account & Storing Role...' : `Register as ${selectedRole === 'seller' ? 'Seller (Pending Approval)' : 'Buyer'}`}
              </button>
            </form>
          )}

          {/* Quick RBAC Role Testing Switcher */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Quick Role Testing Switcher (RBAC Review)
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2.5">
              Click any profile to test role restrictions, route protection, and permissions directly:
            </p>

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
                    onClick={() => handleFastSwitch(u.id)}
                    className="p-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-left transition flex items-center gap-2 group min-h-[44px]"
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
