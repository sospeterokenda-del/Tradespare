import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Home,
  Lock,
  LogOut,
  ShieldAlert,
  ShoppingBag,
  Store,
  UserCheck,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

interface AccessDeniedProps {
  reason: 'not_authenticated' | 'role_restricted' | 'seller_pending' | 'account_suspended' | 'not_owner';
  requiredRole?: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth?: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  reason,
  requiredRole,
  onNavigate,
  onOpenAuth,
}) => {
  const { currentUser, signOutUser } = useMarketplace();

  let title = 'Access Restricted';
  let message = 'You do not have permission to view this section of TradeSphere.';
  let icon = <ShieldAlert className="w-12 h-12 text-rose-600" />;
  let badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
  let badgeText = '403 Forbidden';

  if (reason === 'not_authenticated') {
    title = 'Authentication Required';
    message = 'You must be signed in to your TradeSphere account to access this page.';
    icon = <Lock className="w-12 h-12 text-indigo-600" />;
    badgeColor = 'bg-indigo-100 text-indigo-800 border-indigo-300';
    badgeText = '401 Unauthorized';
  } else if (reason === 'seller_pending') {
    title = 'Seller Account Pending Approval';
    message =
      'Your seller merchant registration is currently in the platform verification queue. For safety and compliance, only admin-approved sellers can publish and manage inventory.';
    icon = <Clock className="w-12 h-12 text-amber-600" />;
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
    badgeText = 'Pending Verification';
  } else if (reason === 'account_suspended') {
    title = 'Account Suspended';
    message =
      'This account has been suspended by a platform administrator. Please contact operations support to resolve any compliance issues.';
    icon = <AlertTriangle className="w-12 h-12 text-rose-600" />;
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
    badgeText = 'Account Suspended';
  } else if (reason === 'role_restricted') {
    title = 'Unauthorized Access';
    message = `This page requires ${requiredRole ? requiredRole.toUpperCase() : 'elevated'} clearance. Your current role is "${currentUser.role.toUpperCase()}". Buyers cannot access seller or administrative management features.`;
    icon = <ShieldAlert className="w-12 h-12 text-rose-600" />;
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
    badgeText = 'Role Access Restricted';
  } else if (reason === 'not_owner') {
    title = 'Permission Denied: Not Your Product';
    message = 'Sellers can only view, edit, or delete listings that belong to their own store. You cannot modify merchandise published by another merchant.';
    icon = <ShieldAlert className="w-12 h-12 text-rose-600" />;
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
    badgeText = 'Resource Ownership Enforced';
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center">
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center shadow-inner">
            {icon}
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-4 shadow-2xs">
          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider ${badgeColor}`}>
            {badgeText}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
          {title}
        </h1>

        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed mb-8">
          {message}
        </p>

        {/* Current Active Identity Info */}
        {currentUser && currentUser.id !== 'usr_guest' && (
          <div className="max-w-md mx-auto mb-8 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-300"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                {currentUser.role}
              </span>
              <p className="text-[10px] font-semibold text-slate-400 capitalize mt-0.5">
                Status: {currentUser.status}
              </p>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {reason === 'not_authenticated' && onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition active:scale-95 flex items-center gap-2 min-h-[44px]"
            >
              <Lock className="w-4 h-4" />
              <span>Sign In to Continue</span>
            </button>
          )}

          {reason === 'seller_pending' && (
            <button
              onClick={() => onNavigate('browse')}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition active:scale-95 flex items-center gap-2 min-h-[44px]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Marketplace Catalog</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('home')}
            className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs transition active:scale-95 flex items-center gap-2 min-h-[44px]"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Return Home</span>
          </button>

          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition active:scale-95 flex items-center gap-2 min-h-[44px]"
            >
              <UserCheck className="w-4 h-4 text-slate-500" />
              <span>Switch / Register Account</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
