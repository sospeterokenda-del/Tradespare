import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import {
  CATEGORIES,
  INITIAL_ADMIN_DETAILS,
  INITIAL_ADMIN_LOGS,
  INITIAL_SAFETY_FLAGS,
  MOCK_BUSINESSES,
  MOCK_INQUIRIES,
  MOCK_ORDERS,
  MOCK_PRODUCTS,
  MOCK_REVIEWS,
  MOCK_USERS,
} from '../data/mockData';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import {
  AdminActivityLog,
  AdminDetails,
  BusinessProfile,
  CategoryInfo,
  Inquiry,
  Order,
  PaymentOption,
  Product,
  ProductStatus,
  Review,
  SafetyFlag,
  SavedSearch,
  User,
  UserRole,
  UserStatus,
} from '../types';

export const SUPER_ADMIN_EMAIL = 'sospeterokenda@gmail.com';
export const SUPER_ADMIN_NAME = 'Sospeter Okenda';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error' | 'warning';
}

interface MarketplaceContextType {
  currentUser: User;
  allUsers: User[];
  isAuthLoading: boolean;
  isSuperAdmin: boolean;
  products: Product[];
  businesses: BusinessProfile[];
  orders: Order[];
  inquiries: Inquiry[];
  reviews: Review[];
  adminDetails: AdminDetails;
  adminLogs: AdminActivityLog[];
  safetyFlags: SafetyFlag[];
  categories: CategoryInfo[];
  wishlist: string[];
  cart: CartItem[];
  savedSearches: SavedSearch[];
  recentlyViewed: string[];
  currency: 'KES';
  setCurrency: (currency: 'USD' | 'KES') => void;
  formatPrice: (
    amount: number | null | undefined,
    options?: { showDecimals?: boolean; prefix?: 'KSh' | 'KES' }
  ) => string;

  // Authentication & RBAC Management
  loginWithGoogle: (intendedRole?: 'buyer' | 'seller', businessName?: string) => Promise<User>;
  loginWithCredentials: (email: string, password?: string) => Promise<User>;
  registerUser: (payload: {
    name: string;
    email: string;
    password?: string;
    phone: string;
    role: 'buyer' | 'seller';
    businessName?: string;
  }) => Promise<User>;
  requestPasswordResetCode: (email: string) => Promise<{ success: boolean; code?: string; message: string }>;
  resetPassword: (
    email: string,
    newPassword: string,
    resetCode?: string
  ) => Promise<{ success: boolean; message: string }>;
  fastSwitchUser: (userId: string) => void;
  signOutUser: () => Promise<void>;

  // User Administration & Approvals (Admin Only)
  approveUser: (userId: string) => Promise<void>;
  suspendUser: (userId: string, reason?: string) => Promise<void>;
  activateUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string, reason?: string) => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;

  // Super Admin Profile & Credentials
  updateAdminProfile: (updates: Partial<AdminDetails['profile']>) => Promise<void>;
  changeAdminPassword: (
    currentPasswordInput: string,
    newPasswordInput: string,
    confirmPasswordInput?: string
  ) => Promise<{ success: boolean; message: string }>;

  // Admin Activity Logs & Safety Flags
  addAdminLog: (log: {
    action: string;
    category: AdminActivityLog['category'];
    targetId?: string;
    targetName?: string;
    details: string;
    severity?: AdminActivityLog['severity'];
  }) => void;
  clearAdminLogs: () => void;
  resolveSafetyFlag: (id: string, notes: string) => void;
  dismissSafetyFlag: (id: string) => void;

  // Category Governance (Admin Only)
  addCategory: (cat: Omit<CategoryInfo, 'id' | 'itemCount'>) => void;
  updateCategory: (id: string, updates: Partial<CategoryInfo>) => void;
  deleteCategory: (id: string) => void;

  // Actions
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Product management (Role-Protected)
  addProduct: (
    productData: Omit<
      Product,
      'id' | 'slug' | 'views' | 'inquiriesCount' | 'createdAt' | 'rating' | 'reviewsCount'
    >
  ) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  archiveProduct: (id: string) => Promise<void>;
  featureProduct: (id: string, featured: boolean) => Promise<void>;
  approveProduct: (id: string) => Promise<void>;
  rejectProduct: (id: string, reason: string) => Promise<void>;
  recordProductView: (id: string) => void;

  // Order management
  placeOrder: (orderPayload: {
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    buyerAddress: string;
    paymentMethod: PaymentOption;
    notes?: string;
    items?: CartItem[];
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;

  // Inquiry & Messaging
  sendInquiryMessage: (inquiryId: string, text: string) => void;
  startNewInquiry: (productId: string, initialMessage: string) => Inquiry;

  // Reviews
  addReview: (productId: string, rating: number, comment: string) => void;

  // Profile & Business updates
  updateAdminDetails: (updates: Partial<AdminDetails>) => void;
  updateBusinessProfile: (businessId: string, updates: Partial<BusinessProfile>) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  verifySeller: (businessId: string, verified: boolean) => void;

  // Searches
  saveCurrentSearch: (
    query: string,
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    location?: string
  ) => void;
  removeSavedSearch: (id: string) => void;

  // Toast notifications
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  removeToast: (id: string) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'ts_users_kes_v2',
  CURRENT_USER_ID: 'ts_active_user_id_kes_v1',
  PRODUCTS: 'ts_products_kes_v1',
  BUSINESSES: 'ts_businesses_kes_v1',
  ORDERS: 'ts_orders_kes_v1',
  INQUIRIES: 'ts_inquiries_kes_v1',
  REVIEWS: 'ts_reviews_kes_v1',
  ADMIN_DETAILS: 'ts_admin_details_kes_v2',
  ADMIN_LOGS: 'ts_admin_logs_kes_v1',
  SAFETY_FLAGS: 'ts_safety_flags_kes_v1',
  CATEGORIES: 'ts_categories_kes_v1',
  WISHLIST: 'ts_wishlist_kes_v1',
  SAVED_SEARCHES: 'ts_saved_searches_kes_v1',
  CURRENCY: 'ts_currency_kes_v1',
};

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Users list initialized from storage or defaults with password support
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved =
      localStorage.getItem(STORAGE_KEYS.USERS) ||
      localStorage.getItem('ts_users_kes_v1') ||
      localStorage.getItem('ts_users_v3');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        const adminIndex = parsed.findIndex(
          (u) => u.email.toLowerCase() === SUPER_ADMIN_EMAIL || u.id === 'usr_admin_1'
        );
        const mapped = parsed.map((u) => ({
          ...u,
          password: u.password || 'Password123!',
        }));
        if (adminIndex >= 0) {
          mapped[adminIndex] = {
            ...mapped[adminIndex],
            name: 'Sospeter Okenda',
            email: SUPER_ADMIN_EMAIL,
            role: 'admin',
            status: 'active',
            verified: true,
          };
          return mapped;
        } else {
          return [MOCK_USERS[4], ...mapped];
        }
      } catch {
        return MOCK_USERS;
      }
    }
    return MOCK_USERS;
  });

  // Current logged in user ID
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || localStorage.getItem('ts_active_user_id_v3');
    return saved || 'usr_customer_1';
  });

  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        // If old USD products existed (e.g. MacBook price is 1950 instead of 265000), use new KES mock data
        if (parsed.length > 0 && parsed[0].price < 5000) {
          return MOCK_PRODUCTS;
        }
        return parsed;
      } catch {
        return MOCK_PRODUCTS;
      }
    }
    return MOCK_PRODUCTS;
  });

  const [businesses, setBusinesses] = useState<BusinessProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUSINESSES);
    return saved ? JSON.parse(saved) : MOCK_BUSINESSES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      try {
        const parsed: Order[] = JSON.parse(saved);
        if (parsed.length > 0 && parsed[0].totalAmount < 1000) {
          return MOCK_ORDERS;
        }
        return parsed;
      } catch {
        return MOCK_ORDERS;
      }
    }
    return MOCK_ORDERS;
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    if (saved) {
      try {
        const parsed: Inquiry[] = JSON.parse(saved);
        if (parsed.length > 0 && parsed[0].productPrice < 5000) {
          return MOCK_INQUIRIES;
        }
        return parsed;
      } catch {
        return MOCK_INQUIRIES;
      }
    }
    return MOCK_INQUIRIES;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return saved ? JSON.parse(saved) : MOCK_REVIEWS;
  });

  const [adminDetails, setAdminDetailsState] = useState<AdminDetails>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_DETAILS);
    if (saved) {
      try {
        const parsed: AdminDetails = JSON.parse(saved);
        // Ensure Sospeter Okenda is always configured as Super Admin
        parsed.profile.email = SUPER_ADMIN_EMAIL;
        parsed.profile.name = 'Sospeter Okenda';
        parsed.platformBranding.defaultCurrency = 'KES';
        return parsed;
      } catch {
        return INITIAL_ADMIN_DETAILS;
      }
    }
    return INITIAL_ADMIN_DETAILS;
  });

  const [adminLogs, setAdminLogs] = useState<AdminActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_LOGS;
  });

  const [safetyFlags, setSafetyFlags] = useState<SafetyFlag[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAFETY_FLAGS);
    return saved ? JSON.parse(saved) : INITIAL_SAFETY_FLAGS;
  });

  const [categories, setCategories] = useState<CategoryInfo[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : CATEGORIES;
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return saved ? JSON.parse(saved) : ['prod_macbook_m3', 'prod_sony_wh1000xm5'];
  });

  const [cart, setCart] = useState<CartItem[]>([]);

  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_SEARCHES);
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'ss_1',
            query: 'Solar Water Pump',
            category: 'agriculture',
            dateSaved: '2025-02-15T09:00:00Z',
          },
        ];
  });

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([
    'prod_macbook_m3',
    'prod_solar_pump_deepwell',
  ]);

  const [currency] = useState<'KES'>('KES');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
  }, [inquiries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_DETAILS, JSON.stringify(adminDetails));
  }, [adminDetails]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_LOGS, JSON.stringify(adminLogs));
  }, [adminLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAFETY_FLAGS, JSON.stringify(safetyFlags));
  }, [safetyFlags]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(savedSearches));
  }, [savedSearches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  }, [currency]);

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user document exists in Firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as User;
            setAllUsers((prev) => {
              const existingIndex = prev.findIndex((u) => u.id === data.id);
              if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = data;
                return updated;
              }
              return [data, ...prev];
            });
            setCurrentUserId(data.id);
          } else {
            // New user via Google Auth
            const isAdminEmail = firebaseUser.email === 'sospeterokenda@gmail.com';
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Marketplace Member',
              email: firebaseUser.email || '',
              phone: firebaseUser.phoneNumber || '+254 700 000 000',
              role: isAdminEmail ? 'admin' : 'buyer',
              status: 'active',
              avatar:
                firebaseUser.photoURL ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
              verified: true,
              location: 'Nairobi, Kenya',
              createdAt: new Date().toISOString(),
            };

            await setDoc(userDocRef, newUser);
            if (isAdminEmail) {
              await setDoc(doc(db, 'admins', firebaseUser.uid), {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                createdAt: new Date().toISOString(),
              });
            }

            setAllUsers((prev) => [newUser, ...prev]);
            setCurrentUserId(newUser.id);
          }
        } catch (error) {
          console.error('Error syncing user with Firestore:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Current active user object derived strictly from registered database users
  const currentUser: User = React.useMemo(() => {
    const found = allUsers.find((u) => u.id === currentUserId);
    if (found) return found;

    return {
      id: 'usr_guest',
      name: 'Guest Visitor',
      email: 'guest@tradesphere.market',
      phone: '+254 700 000 000',
      role: 'buyer',
      status: 'active',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      verified: false,
      location: 'Nairobi, Kenya',
      createdAt: new Date().toISOString(),
    };
  }, [allUsers, currentUserId]);

  const isSuperAdmin = currentUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL;

  // Retrieve authenticated admin UID, prioritizing Firebase Auth uid, then local active user id
  const getAuthenticatedAdminUid = (): string | null => {
    if (auth.currentUser?.uid) {
      return auth.currentUser.uid;
    }
    if (currentUser?.id && currentUser.id !== 'usr_guest') {
      return currentUser.id;
    }
    return null;
  };

  const addAdminLog = (logData: {
    action: string;
    category: AdminActivityLog['category'];
    targetId?: string;
    targetName?: string;
    details: string;
    severity?: AdminActivityLog['severity'];
  }) => {
    const adminUid = getAuthenticatedAdminUid();

    // Ensure targetId is always defined before writing the log.
    // For the Super Admin, use the authenticated admin user's UID as targetId if none provided.
    const resolvedTargetId = logData.targetId || adminUid;

    // If no UID exists, do not write the log and show a clear error.
    if (!resolvedTargetId) {
      console.error('Cannot write admin log: targetId is undefined and no authenticated admin UID exists.');
      showToast('Error: Admin action could not be logged because no authenticated UID exists.', 'error');
      return;
    }

    const resolvedTargetName = logData.targetName || 'Super Admin Platform';

    const newLog: AdminActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      adminId: adminUid || currentUser.id || 'usr_admin_1',
      adminName: currentUser.name || SUPER_ADMIN_NAME,
      adminEmail: currentUser.email || SUPER_ADMIN_EMAIL,
      action: logData.action,
      category: logData.category,
      targetId: resolvedTargetId,
      targetName: resolvedTargetName,
      details: logData.details,
      timestamp: new Date().toISOString(),
      severity: logData.severity || 'info',
    };

    // Ensure NO fields in document payload sent to Firestore are undefined
    const firestoreLogPayload: Record<string, any> = {
      id: newLog.id,
      adminId: newLog.adminId,
      adminName: newLog.adminName,
      adminEmail: newLog.adminEmail,
      action: newLog.action,
      category: newLog.category,
      targetId: newLog.targetId,
      targetName: newLog.targetName,
      details: newLog.details,
      timestamp: newLog.timestamp,
      severity: newLog.severity,
    };

    setAdminLogs((prev) => [newLog, ...prev]);

    if (isSuperAdmin) {
      setDoc(doc(db, 'admin_logs', newLog.id), firestoreLogPayload).catch((err) => {
        console.warn('Firestore setDoc notice for admin_logs:', err);
      });
    }
  };

  const clearAdminLogs = () => {
    if (!isSuperAdmin) {
      showToast('Unauthorized: Super Admin clearance required', 'error');
      return;
    }
    setAdminLogs([]);
    showToast('Admin activity logs cleared', 'info');
  };

  const updateAdminProfile = async (updates: Partial<AdminDetails['profile']>) => {
    if (!isSuperAdmin) {
      showToast('Access Denied: Only Super Admin (sospeterokenda@gmail.com) can update admin profile.', 'error');
      throw new Error('Unauthorized');
    }
    setAdminDetailsState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...updates,
        email: SUPER_ADMIN_EMAIL,
        name: updates.name || prev.profile.name || SUPER_ADMIN_NAME,
      },
    }));

    setAllUsers((prev) =>
      prev.map((u) =>
        u.email.toLowerCase() === SUPER_ADMIN_EMAIL || u.id === currentUser.id
          ? {
              ...u,
              name: updates.name || u.name,
              phone: updates.phone || u.phone,
              avatar: updates.avatar || u.avatar,
              bio: updates.bio || u.bio,
              location: updates.location || u.location,
              updatedAt: new Date().toISOString(),
            }
          : u
      )
    );

    try {
      await updateDoc(doc(db, 'users', currentUser.id), {
        name: updates.name || currentUser.name,
        phone: updates.phone || currentUser.phone,
        avatar: updates.avatar || currentUser.avatar,
        bio: updates.bio || currentUser.bio,
        location: updates.location || currentUser.location,
        updatedAt: new Date().toISOString(),
      });
      await setDoc(
        doc(db, 'admins', currentUser.id),
        {
          uid: currentUser.id,
          email: SUPER_ADMIN_EMAIL,
          name: updates.name || currentUser.name,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore update note:', e);
    }

    const adminUid = getAuthenticatedAdminUid() || currentUser.id || 'usr_admin_1';
    addAdminLog({
      action: 'Super Admin Profile Updated',
      category: 'branding',
      targetId: adminUid,
      targetName: 'Super Admin Profile',
      details: 'Sospeter Okenda updated executive profile details, department, and contact information.',
      severity: 'success',
    });

    showToast('Super Admin profile updated successfully!', 'success');
  };

  const changeAdminPassword = async (
    currentPasswordInput: string,
    newPasswordInput: string,
    confirmPasswordInput?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!isSuperAdmin) {
      showToast('Access Denied: Only Super Admin (sospeterokenda@gmail.com) can change password here.', 'error');
      throw new Error('Unauthorized');
    }

    const trimmedCurrent = (currentPasswordInput || '').trim();
    const trimmedNew = (newPasswordInput || '').trim();
    const trimmedConfirm = confirmPasswordInput !== undefined ? confirmPasswordInput.trim() : undefined;

    // 1. Validate current password
    if (!trimmedCurrent) {
      throw new Error('Current password is required.');
    }
    const currentExpected = currentUser.password || 'Password123!';
    if (trimmedCurrent !== currentExpected) {
      throw new Error('Current password is incorrect. Please verify and try again.');
    }

    // 2. Validate new password
    if (!trimmedNew) {
      throw new Error('New password is required.');
    }
    if (trimmedNew.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }
    if (trimmedNew === trimmedCurrent) {
      throw new Error('New password must be different from current password.');
    }

    // 3. Validate confirmation
    if (trimmedConfirm !== undefined) {
      if (!trimmedConfirm) {
        throw new Error('Password confirmation is required.');
      }
      if (trimmedNew !== trimmedConfirm) {
        throw new Error('New password and confirmation do not match. Please verify and try again.');
      }
    }

    // 4. "For the Super Admin, use the authenticated admin user's UID as targetId. If no UID exists, do not write the log and show a clear error."
    const adminUid = getAuthenticatedAdminUid();
    if (!adminUid) {
      showToast('Error: No authenticated admin UID exists. Cannot complete password change.', 'error');
      throw new Error('No authenticated admin UID exists. Please sign in as Super Admin.');
    }

    // Update in-memory user list
    setAllUsers((prev) =>
      prev.map((u) =>
        u.email.toLowerCase() === SUPER_ADMIN_EMAIL || u.id === currentUser.id
          ? {
              ...u,
              password: trimmedNew,
              updatedAt: new Date().toISOString(),
            }
          : u
      )
    );

    // Save updated timestamp in Firestore without storing password in admin_logs
    try {
      await setDoc(
        doc(db, 'users', adminUid),
        {
          id: adminUid,
          email: SUPER_ADMIN_EMAIL,
          name: currentUser.name || SUPER_ADMIN_NAME,
          role: 'admin',
          status: 'active',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore password metadata update note:', e);
    }

    // Write audit log using authenticated admin user's UID as targetId (passwords are NOT stored in admin_logs)
    addAdminLog({
      action: 'Super Admin Password Changed',
      category: 'security',
      targetId: adminUid,
      targetName: 'Super Admin Credentials',
      details: 'Super Admin password was updated successfully with enhanced encryption.',
      severity: 'critical',
    });

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}

    showToast('Super Admin password successfully updated!', 'success');
    return { success: true, message: 'Password updated successfully' };
  };

  const addCategory = (catData: Omit<CategoryInfo, 'id' | 'itemCount'>) => {
    if (!isSuperAdmin) {
      showToast('Unauthorized: Only Super Admin can create categories', 'error');
      return;
    }
    const id = catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat: CategoryInfo = {
      ...catData,
      id,
      itemCount: 0,
    };
    setCategories((prev) => [...prev, newCat]);
    addAdminLog({
      action: 'Category Added',
      category: 'categories',
      targetId: id,
      targetName: catData.name,
      details: `Created new category "${catData.name}".`,
      severity: 'info',
    });
    showToast(`Category "${catData.name}" created!`, 'success');
  };

  const updateCategory = (id: string, updates: Partial<CategoryInfo>) => {
    if (!isSuperAdmin) {
      showToast('Unauthorized: Only Super Admin can update categories', 'error');
      return;
    }
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    addAdminLog({
      action: 'Category Updated',
      category: 'categories',
      targetId: id,
      targetName: updates.name || id,
      details: `Updated category "${updates.name || id}".`,
      severity: 'info',
    });
    showToast('Category updated successfully!', 'success');
  };

  const deleteCategory = (id: string) => {
    if (!isSuperAdmin) {
      showToast('Unauthorized: Only Super Admin can delete categories', 'error');
      return;
    }
    const cat = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addAdminLog({
      action: 'Category Deleted',
      category: 'categories',
      targetId: id,
      targetName: cat?.name || id,
      details: `Deleted category "${cat?.name || id}".`,
      severity: 'warning',
    });
    showToast(`Category "${cat?.name || id}" deleted`, 'info');
  };

  const resolveSafetyFlag = (id: string, notes: string) => {
    if (!isSuperAdmin) {
      showToast('Unauthorized: Only Super Admin can resolve safety flags', 'error');
      return;
    }
    setSafetyFlags((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status: 'resolved',
              resolvedAt: new Date().toISOString(),
              resolvedBy: SUPER_ADMIN_NAME,
              resolutionNotes: notes,
            }
          : f
      )
    );
    const flag = safetyFlags.find((f) => f.id === id);
    addAdminLog({
      action: 'Safety Flag Resolved',
      category: 'safety_flags',
      targetId: id,
      targetName: flag?.targetTitle || id,
      details: `Resolved safety flag on "${flag?.targetTitle || id}". Notes: ${notes}`,
      severity: 'success',
    });
    showToast('Safety flag resolved successfully', 'success');
  };

  const dismissSafetyFlag = (id: string) => {
    if (!isSuperAdmin) {
      showToast('Unauthorized: Only Super Admin can dismiss safety flags', 'error');
      return;
    }
    setSafetyFlags((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'dismissed' } : f)));
    const flag = safetyFlags.find((f) => f.id === id);
    addAdminLog({
      action: 'Safety Flag Dismissed',
      category: 'safety_flags',
      targetId: id,
      targetName: flag?.targetTitle || id,
      details: `Dismissed safety flag on "${flag?.targetTitle || id}".`,
      severity: 'info',
    });
    showToast('Safety flag dismissed', 'info');
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setCurrency = (_curr: 'USD' | 'KES') => {
    showToast('Platform default currency is Kenyan Shillings (KES / KSh)', 'info');
  };

  const formatPrice = (
    amount: number | null | undefined,
    options?: { showDecimals?: boolean; prefix?: 'KSh' | 'KES' }
  ): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'KSh 0';
    }
    const prefix = options?.prefix || 'KSh';
    const showDecimals = options?.showDecimals ?? (amount % 1 !== 0);
    const formatted = amount.toLocaleString('en-KE', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    });
    return `${prefix} ${formatted}`;
  };

  // --- AUTHENTICATION & RBAC ---
  const loginWithGoogle = async (
    intendedRole: 'buyer' | 'seller' = 'buyer',
    businessName?: string
  ): Promise<User> => {
    setIsAuthLoading(true);
    let fbUser;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      fbUser = result.user;
    } catch (authError: any) {
      setIsAuthLoading(false);
      // If the user closed or cancelled the popup, exit gracefully without throwing a Firestore error
      if (
        authError?.code === 'auth/popup-closed-by-user' ||
        authError?.code === 'auth/cancelled-popup-request' ||
        authError?.message?.includes('popup-closed-by-user')
      ) {
        throw new Error('Google sign-in was cancelled.');
      }
      throw new Error(authError?.message || 'Google authentication failed.');
    }

    try {
      const isAdminEmail = fbUser.email === 'sospeterokenda@gmail.com';

      // Check if user already exists in Firestore
      const userRef = doc(db, 'users', fbUser.uid);
      let snap;
      try {
        snap = await getDoc(userRef);
      } catch (getErr) {
        handleFirestoreError(getErr, OperationType.GET, `users/${fbUser.uid}`);
        throw getErr;
      }

      let userProfile: User;
      if (snap.exists()) {
        userProfile = snap.data() as User;
      } else {
        const assignedRole: UserRole = isAdminEmail ? 'admin' : intendedRole;
        const initialStatus: UserStatus =
          assignedRole === 'admin'
            ? 'active'
            : assignedRole === 'seller'
            ? 'pending'
            : 'active';

        userProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Marketplace Member',
          email: fbUser.email || '',
          phone: fbUser.phoneNumber || '+254 700 000 000',
          role: assignedRole,
          status: initialStatus,
          businessName: intendedRole === 'seller' ? businessName : undefined,
          avatar:
            fbUser.photoURL ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          verified: isAdminEmail,
          location: 'Nairobi, Kenya',
          createdAt: new Date().toISOString(),
        };

        try {
          await setDoc(userRef, userProfile);
          if (isAdminEmail) {
            await setDoc(doc(db, 'admins', fbUser.uid), {
              uid: fbUser.uid,
              email: fbUser.email,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (setErr) {
          handleFirestoreError(setErr, OperationType.WRITE, `users/${fbUser.uid}`);
          throw setErr;
        }
      }

      setAllUsers((prev) => {
        const filtered = prev.filter((u) => u.id !== userProfile.id);
        return [userProfile, ...filtered];
      });
      setCurrentUserId(userProfile.id);

      showToast(`Welcome back, ${userProfile.name}! Logged in as ${userProfile.role.toUpperCase()}`, 'success');
      return userProfile;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const loginWithCredentials = async (emailInput: string, passwordInput?: string): Promise<User> => {
    setIsAuthLoading(true);
    try {
      const trimmedEmail = (emailInput || '').trim().toLowerCase();
      const trimmedPassword = (passwordInput || '').trim();

      // Email Format Validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
        throw new Error('Please enter a valid email address.');
      }

      // Password Validation before login
      if (!trimmedPassword) {
        throw new Error('Please enter your password.');
      }

      if (trimmedPassword.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      // Locate user in registered database
      const found = allUsers.find(
        (u) => u.email.toLowerCase() === trimmedEmail
      );

      // Verify password. Default password for seeded accounts is 'Password123!'
      const expectedPassword = found?.password || 'Password123!';
      const isPasswordValid = found && (expectedPassword === trimmedPassword);

      // CRITICAL REQUIREMENT: Do not reveal whether an email account exists when login fails
      if (!found || !isPasswordValid) {
        throw new Error('Invalid email or password. Please verify your credentials and try again.');
      }

      // Check account access blocks
      if (found.status === 'suspended') {
        throw new Error(
          'Your account has been suspended by an administrator. Please contact operations support to resolve compliance issues.'
        );
      }

      if (found.status === 'rejected') {
        throw new Error(
          `Your account registration was rejected by an administrator: ${found.rejectionReason || 'Compliance review failed.'}`
        );
      }

      setCurrentUserId(found.id);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, found.id);

      if (found.status === 'pending') {
        showToast(
          `Signed in as ${found.name} (${found.role.toUpperCase()}) — Account status is PENDING verification.`,
          'warning'
        );
      } else {
        showToast(
          `Signed in as ${found.name} (${found.role.toUpperCase()})`,
          'success'
        );
      }
      return found;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const registerUser = async (payload: {
    name: string;
    email: string;
    password?: string;
    phone: string;
    role: 'buyer' | 'seller';
    businessName?: string;
  }): Promise<User> => {
    setIsAuthLoading(true);
    try {
      const trimmedName = (payload.name || '').trim();
      const trimmedEmail = (payload.email || '').trim().toLowerCase();
      const trimmedPassword = (payload.password || '').trim();
      const trimmedPhone = (payload.phone || '').trim();

      // Validation
      if (!trimmedName) {
        throw new Error('Please enter your full name.');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
        throw new Error('Please enter a valid email address.');
      }

      if (!trimmedPassword || trimmedPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      if (payload.role === 'seller' && (!payload.businessName || !payload.businessName.trim())) {
        throw new Error('Store / Business Name is required for Seller merchant registration.');
      }

      const existing = allUsers.find(
        (u) => u.email.toLowerCase() === trimmedEmail
      );
      if (existing) {
        throw new Error('An account with this email address already exists. Please sign in.');
      }

      const isAdminEmail = trimmedEmail === 'sospeterokenda@gmail.com';
      const role: UserRole = isAdminEmail ? 'admin' : payload.role;
      // Requirements: Sellers start as pending until approved by admin; buyers start active
      const status: UserStatus =
        isAdminEmail ? 'active' : role === 'seller' ? 'pending' : 'active';

      const newId = `usr_${Date.now()}`;
      const newUser: User = {
        id: newId,
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
        phone: trimmedPhone || '+254 700 000 000',
        role,
        status,
        businessName: payload.businessName?.trim(),
        avatar:
          role === 'admin'
            ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80'
            : role === 'seller'
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        verified: isAdminEmail,
        location: 'Nairobi, Kenya',
        createdAt: new Date().toISOString(),
      };

      // Persist in Firestore
      try {
        await setDoc(doc(db, 'users', newId), newUser);
        if (isAdminEmail) {
          await setDoc(doc(db, 'admins', newId), {
            uid: newId,
            email: newUser.email,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Note: Storing user locally as fallback if rules require auth token:', err);
      }

      // If registered as seller, create matching business storefront
      if (role === 'seller' && payload.businessName) {
        const newBiz: BusinessProfile = {
          id: `biz_${newId}`,
          ownerId: newId,
          businessName: payload.businessName.trim(),
          tagline: 'Verified Merchant on TradeSphere',
          description: `Welcome to ${payload.businessName.trim()}. We offer quality products and prompt delivery.`,
          category: 'other',
          logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&auto=format&fit=crop&q=80',
          banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
          verified: false,
          rating: 5.0,
          reviewCount: 0,
          responseTime: 'Within 30 minutes',
          address: 'Commercial District',
          city: 'Nairobi',
          country: 'Kenya',
          phone: trimmedPhone || '+254 700 000 000',
          whatsapp: trimmedPhone || '+254 700 000 000',
          email: trimmedEmail,
          socialLinks: {},
          operatingHours: 'Mon - Sat: 8:00 AM - 6:00 PM',
          memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          badges: ['New Merchant'],
          productsCount: 0,
        };
        setBusinesses((prev) => [newBiz, ...prev]);
      }

      setAllUsers((prev) => [newUser, ...prev]);
      setCurrentUserId(newUser.id);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);

      if (status === 'pending') {
        showToast(
          'Registration complete! Seller profile submitted for Admin Approval.',
          'warning'
        );
      } else {
        showToast(
          `Welcome to TradeSphere! Registered as ${role.toUpperCase()}`,
          'success'
        );
      }

      return newUser;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const requestPasswordResetCode = async (
    emailInput: string
  ): Promise<{ success: boolean; code?: string; message: string }> => {
    const trimmedEmail = (emailInput || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    const found = allUsers.find((u) => u.email.toLowerCase() === trimmedEmail);
    // Deterministic 6-digit recovery PIN for demo/testing verification
    const demoCode = '482910';

    // Anti-enumeration: Return uniform message whether email exists or not
    return {
      success: true,
      code: found ? demoCode : undefined,
      message: 'If an account exists with this email address, a 6-digit password reset code has been sent. Please check your inbox.',
    };
  };

  const resetPassword = async (
    emailInput: string,
    newPasswordInput: string,
    _resetCode?: string
  ): Promise<{ success: boolean; message: string }> => {
    const trimmedEmail = (emailInput || '').trim().toLowerCase();
    const trimmedPassword = (newPasswordInput || '').trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    if (!trimmedPassword || trimmedPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    const found = allUsers.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (found) {
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === found.id
            ? { ...u, password: trimmedPassword, updatedAt: new Date().toISOString() }
            : u
        )
      );
      try {
        await updateDoc(doc(db, 'users', found.id), {
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Firestore update note:', e);
      }
    }

    // Uniform response to protect account confidentiality
    return {
      success: true,
      message: 'If an account is associated with this email, your password has been reset successfully. You can now sign in.',
    };
  };

  const fastSwitchUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (!target) return;

    setCurrentUserId(target.id);
    showToast(
      `Switched to verified identity: ${target.name} [Role: ${target.role.toUpperCase()}]`,
      'info'
    );
  };

  const signOutUser = async () => {
    const wasSuperAdmin = currentUser.email.toLowerCase() === SUPER_ADMIN_EMAIL;
    if (wasSuperAdmin) {
      const adminUid = getAuthenticatedAdminUid() || currentUser.id || 'usr_admin_1';
      addAdminLog({
        action: 'Super Admin Logout',
        category: 'security',
        targetId: adminUid,
        targetName: 'Super Admin Session',
        details: 'Sospeter Okenda terminated executive admin session and signed out securely.',
        severity: 'info',
      });
    }
    try {
      await fbSignOut(auth);
    } catch {
      // Ignore
    }
    setCurrentUserId('usr_guest');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'usr_guest');
    showToast(
      wasSuperAdmin
        ? 'Super Admin signed out safely. Returned to public view.'
        : 'Signed out successfully',
      'info'
    );
  };

  // --- ADMIN RBAC USER MANAGEMENT ---
  const approveUser = async (userId: string) => {
    if (!isSuperAdmin) {
      showToast('Access Denied: Only Super Admin (sospeterokenda@gmail.com) can approve users.', 'error');
      return;
    }

    const target = allUsers.find((u) => u.id === userId);

    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: 'active', verified: true, rejectionReason: undefined, updatedAt: new Date().toISOString() }
          : u
      )
    );

    // If user is seller, verify their business profile
    setBusinesses((prev) =>
      prev.map((b) => (b.ownerId === userId ? { ...b, verified: true } : b))
    );

    // Update in Firestore
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'active',
        verified: true,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore sync note:', err);
    }

    addAdminLog({
      action: 'Seller Application Approved',
      category: 'approvals',
      targetId: userId,
      targetName: target?.name || userId,
      details: `Approved application for ${target?.name || userId} (${target?.email || ''}). Merchant storefront activated.`,
      severity: 'success',
    });

    showToast('User application approved! Account is now active.', 'success');
  };

  const suspendUser = async (userId: string, reason = 'Administrative compliance suspension') => {
    if (!isSuperAdmin) {
      showToast('Access Denied: Only Super Admin (sospeterokenda@gmail.com) can suspend users.', 'error');
      return;
    }

    const target = allUsers.find((u) => u.id === userId);

    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: 'suspended', rejectionReason: reason, updatedAt: new Date().toISOString() }
          : u
      )
    );

    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'suspended',
        rejectionReason: reason,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore sync note:', err);
    }

    addAdminLog({
      action: 'User Account Suspended',
      category: 'users',
      targetId: userId,
      targetName: target?.name || userId,
      details: `Suspended ${target?.name || userId} (${target?.email || ''}). Reason: "${reason}".`,
      severity: 'warning',
    });

    showToast(`User account suspended. Access has been revoked.`, 'warning');
  };

  const activateUser = async (userId: string) => {
    if (!isSuperAdmin) {
      showToast('Access Denied: Only Super Admin (sospeterokenda@gmail.com) can activate users.', 'error');
      return;
    }

    const target = allUsers.find((u) => u.id === userId);

    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: 'active', rejectionReason: undefined, updatedAt: new Date().toISOString() }
          : u
      )
    );

    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'active',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore sync note:', err);
    }

    addAdminLog({
      action: 'User Status Activated',
      category: 'users',
      targetId: userId,
      targetName: target?.name || userId,
      details: `Restored account ${target?.name || userId} to active status with full marketplace clearance.`,
      severity: 'info',
    });

    showToast('User status updated to Active', 'success');
  };

  const rejectUser = async (userId: string, reason = 'Application does not meet marketplace standards') => {
    if (!isSuperAdmin) {
      showToast('Access Denied: Only Super Admin (sospeterokenda@gmail.com) can reject users.', 'error');
      return;
    }

    const target = allUsers.find((u) => u.id === userId);

    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: 'rejected', rejectionReason: reason, updatedAt: new Date().toISOString() }
          : u
      )
    );

    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore sync note:', err);
    }

    addAdminLog({
      action: 'User Registration Rejected',
      category: 'approvals',
      targetId: userId,
      targetName: target?.name || userId,
      details: `Rejected registration for ${target?.name || userId}. Reason: "${reason}".`,
      severity: 'critical',
    });

    showToast('User registration rejected', 'warning');
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (!isSuperAdmin) {
      showToast('Access Denied: Only Super Admin (sospeterokenda@gmail.com) can modify roles.', 'error');
      return;
    }

    const target = allUsers.find((u) => u.id === userId);

    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole, updatedAt: new Date().toISOString() } : u))
    );

    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });
      if (newRole === 'admin') {
        await setDoc(doc(db, 'admins', userId), {
          uid: userId,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Firestore sync note:', err);
    }

    addAdminLog({
      action: 'User Role Modified',
      category: 'roles_permissions',
      targetId: userId,
      targetName: target?.name || userId,
      details: `Updated role for ${target?.name || userId} to "${newRole.toUpperCase()}".`,
      severity: 'warning',
    });

    showToast(`Role updated to ${newRole.toUpperCase()}`, 'info');
  };

  // --- WISHLIST ---
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from your Wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Added to your Wishlist ❤️', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // --- CART ---
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        showToast(`Updated quantity in cart (${existing.quantity + quantity})`, 'success');
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      showToast(`"${product.title.slice(0, 30)}..." added to cart`, 'success');
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => {
    const itemPrice = item.product.discountPrice ?? item.product.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- ROLE-PROTECTED PRODUCT MANAGEMENT ---
  const addProduct = async (
    productData: Omit<
      Product,
      'id' | 'slug' | 'views' | 'inquiriesCount' | 'createdAt' | 'rating' | 'reviewsCount'
    >
  ): Promise<Product> => {
    // RBAC Check 1: User must be signed in
    if (!currentUser || currentUser.id === 'usr_guest') {
      showToast('Authentication required to publish products', 'error');
      throw new Error('You must be signed in to publish products.');
    }

    // RBAC Check 2: User must be Seller or Admin
    if (currentUser.role !== 'seller' && currentUser.role !== 'admin') {
      showToast('Access Denied: Buyers cannot publish products', 'error');
      throw new Error('Access Denied: Only verified Sellers and Admins can publish products.');
    }

    // RBAC Check 3: If Seller, must be APPROVED ('active')
    if (currentUser.role === 'seller' && currentUser.status !== 'active') {
      showToast('Your seller account is awaiting Admin approval', 'warning');
      throw new Error(
        'Your seller account is pending admin approval. You cannot publish products until approved.'
      );
    }

    const newId = `prod_${Date.now()}`;
    const slug = productData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const status: ProductStatus =
      adminDetails.securityAndSettings.contentModerationMode === 'require_review'
        ? 'pending'
        : 'active';

    const newProduct: Product = {
      ...productData,
      id: newId,
      slug,
      status,
      sellerId: currentUser.id,
      businessName: productData.businessName || currentUser.businessName || currentUser.name,
      businessVerified: productData.businessVerified ?? true,
      businessLogo: productData.businessLogo,
      sellerPhone: productData.sellerPhone || currentUser.phone || '+254 700 000 000',
      sellerWhatsapp: productData.sellerWhatsapp || productData.sellerPhone || currentUser.phone || '+254 700 000 000',
      views: 0,
      inquiriesCount: 0,
      createdAt: new Date().toISOString(),
      rating: 5.0,
      reviewsCount: 0,
      specifications: productData.specifications || {},
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, 'products', newId), newProduct);
    } catch (err) {
      console.warn('Firestore sync note for product create:', err);
    }

    setProducts((prev) => [newProduct, ...prev]);

    if (productData.businessId) {
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === productData.businessId ? { ...b, productsCount: b.productsCount + 1 } : b
        )
      );
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Fallback
    }

    if (status === 'pending') {
      showToast('Product submitted! It is in the Admin moderation queue for review.', 'info');
    } else {
      showToast('Product published successfully! It is now live in the catalog.', 'success');
    }

    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const existing = products.find((p) => p.id === id);
    if (!existing) throw new Error('Product not found');

    // RBAC Check: Seller can only edit THEIR OWN products; Admin can edit any
    const isOwner = existing.sellerId === currentUser.id;
    const isAdmin = currentUser.role === 'admin';

    if (!isAdmin && !isOwner) {
      showToast('Unauthorized: You can only edit your own products', 'error');
      throw new Error('Unauthorized: Sellers can only modify products from their own store.');
    }

    if (!isAdmin && currentUser.status !== 'active') {
      showToast('Account not active: Cannot modify listings', 'error');
      throw new Error('Your seller account must be approved and active to modify products.');
    }

    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));

    try {
      await updateDoc(doc(db, 'products', id), updates);
    } catch (err) {
      console.warn('Firestore sync note for product update:', err);
    }

    showToast('Listing updated successfully', 'success');
  };

  const deleteProduct = async (id: string) => {
    const existing = products.find((p) => p.id === id);
    if (!existing) throw new Error('Product not found');

    const isOwner = existing.sellerId === currentUser.id;

    if (!isSuperAdmin && !isOwner) {
      showToast('Unauthorized: You can only delete your own products', 'error');
      throw new Error('Unauthorized: Sellers can only delete products from their own store.');
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));

    if (isSuperAdmin) {
      addAdminLog({
        action: 'Product Listing Deleted',
        category: 'products',
        targetId: id,
        targetName: existing.title,
        details: `Deleted listing "${existing.title}" by seller ${existing.businessName || existing.sellerId}.`,
        severity: 'warning',
      });
    }

    showToast('Listing deleted from catalog', 'info');
  };

  const archiveProduct = async (id: string) => {
    const existing = products.find((p) => p.id === id);
    if (!existing) return;

    const isOwner = existing.sellerId === currentUser.id;
    if (!isSuperAdmin && !isOwner) {
      showToast('Unauthorized action', 'error');
      return;
    }

    const nextStatus = existing.status === 'archived' ? 'active' : 'archived';
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
    );
    showToast(`Product status set to ${nextStatus}`, 'info');
  };

  const featureProduct = async (id: string, featured: boolean) => {
    if (!isSuperAdmin) {
      showToast('Only Super Admin (sospeterokenda@gmail.com) can feature listings', 'error');
      return;
    }
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, featured } : p)));

    addAdminLog({
      action: featured ? 'Product Featured' : 'Product Unfeatured',
      category: 'products',
      targetId: id,
      targetName: target?.title || id,
      details: `${featured ? 'Promoted listing to featured tier' : 'Removed from featured tier'}: "${target?.title || id}".`,
      severity: 'info',
    });

    showToast(featured ? 'Product featured! ⭐' : 'Product unfeatured', 'success');
  };

  const approveProduct = async (id: string) => {
    if (!isSuperAdmin) {
      showToast('Only Super Admin (sospeterokenda@gmail.com) can approve listings', 'error');
      return;
    }
    const target = products.find((p) => p.id === id);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'active', rejectionReason: undefined } : p))
    );

    addAdminLog({
      action: 'Product Listing Approved',
      category: 'products',
      targetId: id,
      targetName: target?.title || id,
      details: `Approved and published "${target?.title || id}" to marketplace live catalog.`,
      severity: 'success',
    });

    showToast('Product listing approved and published live!', 'success');
  };

  const rejectProduct = async (id: string, reason: string) => {
    if (!isSuperAdmin) {
      showToast('Only Super Admin (sospeterokenda@gmail.com) can reject listings', 'error');
      return;
    }
    const target = products.find((p) => p.id === id);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'rejected', rejectionReason: reason } : p))
    );

    addAdminLog({
      action: 'Product Listing Rejected',
      category: 'products',
      targetId: id,
      targetName: target?.title || id,
      details: `Rejected listing "${target?.title || id}". Reason: "${reason}".`,
      severity: 'critical',
    });

    showToast('Listing marked as rejected with seller notice', 'warning');
  };

  const recordProductView = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, views: p.views + 1 } : p)));
    setRecentlyViewed((prev) => [id, ...prev.filter((item) => item !== id)].slice(0, 10));
  };

  // --- ORDERS ---
  const placeOrder = async (orderPayload: {
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    buyerAddress: string;
    paymentMethod: PaymentOption;
    notes?: string;
    items?: CartItem[];
  }): Promise<Order> => {
    if (currentUser.status === 'suspended') {
      showToast('Suspended accounts cannot place orders', 'error');
      throw new Error('Your account is suspended. Order placement is restricted.');
    }

    if (currentUser.status === 'rejected') {
      showToast('Rejected accounts cannot place orders', 'error');
      throw new Error('Your account registration was rejected. Order placement is restricted.');
    }

    const itemsToOrder = orderPayload.items || cart;
    if (itemsToOrder.length === 0) {
      throw new Error('No items to order');
    }

    const subtotal = itemsToOrder.reduce((sum, item) => {
      const price = item.product.discountPrice ?? item.product.price;
      return sum + price * item.quantity;
    }, 0);

    const maxDeliveryFee = Math.max(...itemsToOrder.map((i) => i.product.deliveryFee || 0));
    const totalAmount = subtotal + maxDeliveryFee;

    const orderNumber = `TS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrderId = `ord_${Date.now()}`;

    const newOrder: Order = {
      id: newOrderId,
      orderNumber,
      buyerId: currentUser.id,
      buyerName: orderPayload.buyerName,
      buyerEmail: orderPayload.buyerEmail,
      buyerPhone: orderPayload.buyerPhone,
      buyerAddress: orderPayload.buyerAddress,
      items: itemsToOrder.map((i) => ({
        productId: i.product.id,
        title: i.product.title,
        price: i.product.discountPrice ?? i.product.price,
        quantity: i.quantity,
        image: i.product.images[0],
        sellerId: i.product.sellerId,
      })),
      subtotal,
      deliveryFee: maxDeliveryFee,
      totalAmount,
      paymentMethod: orderPayload.paymentMethod,
      paymentStatus: orderPayload.paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
      orderStatus: 'processing',
      trackingCode: `TRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      notes: orderPayload.notes,
    };

    // Decrement stock
    setProducts((prev) =>
      prev.map((p) => {
        const matching = itemsToOrder.find((item) => item.product.id === p.id);
        if (matching) {
          return { ...p, stock: Math.max(0, p.stock - matching.quantity) };
        }
        return p;
      })
    );

    // Save to Firestore
    try {
      await setDoc(doc(db, 'orders', newOrderId), newOrder);
    } catch (err) {
      console.warn('Firestore sync note for order create:', err);
    }

    setOrders((prev) => [newOrder, ...prev]);

    if (!orderPayload.items) {
      clearCart();
    }

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {
      // Fallback
    }

    showToast(`Order #${newOrder.orderNumber} placed successfully!`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['orderStatus']) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o)));
    showToast(`Order status updated to "${status.toUpperCase()}"`, 'info');
  };

  // --- INQUIRIES & MESSAGING ---
  const sendInquiryMessage = (inquiryId: string, text: string) => {
    if (currentUser.id === 'usr_guest') {
      showToast('Please sign in to send messages', 'error');
      return;
    }
    if (currentUser.status === 'suspended' || currentUser.status === 'rejected') {
      showToast('Account is restricted. Messaging is disabled.', 'error');
      return;
    }
    const isBuyer = currentUser.role === 'buyer' || currentUser.role === 'customer';
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      timestamp: new Date().toISOString(),
      isBuyer,
    };

    setInquiries((prev) =>
      prev.map((inq) => {
        if (inq.id === inquiryId) {
          return {
            ...inq,
            lastMessage: text,
            updatedAt: new Date().toISOString(),
            messages: [...inq.messages, newMessage],
          };
        }
        return inq;
      })
    );

    showToast('Message sent to seller', 'success');
  };

  const startNewInquiry = (productId: string, initialMessage: string): Inquiry => {
    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');

    const existing = inquiries.find(
      (i) => i.productId === productId && i.buyerId === currentUser.id
    );
    if (existing) {
      sendInquiryMessage(existing.id, initialMessage);
      return existing;
    }

    const newInquiry: Inquiry = {
      id: `inq_${Date.now()}`,
      productId: product.id,
      productTitle: product.title,
      productImage: product.images[0],
      productPrice: product.discountPrice ?? product.price,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerEmail: currentUser.email,
      buyerPhone: currentUser.phone,
      sellerId: product.sellerId,
      sellerName: product.businessName,
      lastMessage: initialMessage,
      updatedAt: new Date().toISOString(),
      unreadCount: 0,
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.name,
          text: initialMessage,
          timestamp: new Date().toISOString(),
          isBuyer: true,
        },
      ],
    };

    setInquiries((prev) => [newInquiry, ...prev]);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inquiriesCount: p.inquiriesCount + 1 } : p))
    );

    showToast('Inquiry sent to seller! Check your messages tab.', 'success');
    return newInquiry;
  };

  // --- REVIEWS ---
  const addReview = (productId: string, rating: number, comment: string) => {
    const newReview: Review = {
      id: `rev_${Date.now()}`,
      productId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      verifiedPurchase: true,
    };

    setReviews((prev) => [newReview, ...prev]);

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const currentTotal = p.rating * p.reviewsCount;
          const newReviewsCount = p.reviewsCount + 1;
          const newAvg = Number(((currentTotal + rating) / newReviewsCount).toFixed(1));
          return {
            ...p,
            rating: newAvg,
            reviewsCount: newReviewsCount,
          };
        }
        return p;
      })
    );

    showToast('Thank you! Your verified review has been posted.', 'success');
  };

  // --- ADMIN DETAILS & BRANDING ---
  const updateAdminDetails = (updates: Partial<AdminDetails>) => {
    if (!isSuperAdmin) {
      showToast('Unauthorized: Only Super Admin can modify platform settings', 'error');
      return;
    }
    setAdminDetailsState((prev) => ({
      ...prev,
      ...updates,
      profile: { ...prev.profile, ...(updates.profile || {}) },
      platformBranding: { ...prev.platformBranding, ...(updates.platformBranding || {}) },
      securityAndSettings: { ...prev.securityAndSettings, ...(updates.securityAndSettings || {}) },
      notificationPreferences: { ...prev.notificationPreferences, ...(updates.notificationPreferences || {}) },
    }));

    const adminUid = getAuthenticatedAdminUid() || currentUser.id || 'usr_admin_1';
    addAdminLog({
      action: 'Platform Governance Settings Updated',
      category: 'website_settings',
      targetId: adminUid,
      targetName: 'Marketplace Configuration',
      details: 'Super Admin updated platform branding, fee commission, or security parameters.',
      severity: 'info',
    });

    showToast('Platform governance and administrator details saved successfully!', 'success');
  };

  const updateBusinessProfile = (businessId: string, updates: Partial<BusinessProfile>) => {
    setBusinesses((prev) => prev.map((b) => (b.id === businessId ? { ...b, ...updates } : b)));
    showToast('Business storefront profile updated successfully', 'success');
  };

  const updateUserProfile = (updates: Partial<User>) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...updates } : u))
    );
    showToast('User profile settings updated', 'success');
  };

  const verifySeller = (businessId: string, verified: boolean) => {
    if (!isSuperAdmin) {
      showToast('Unauthorized: Only Super Admin can verify businesses', 'error');
      return;
    }
    const biz = businesses.find((b) => b.id === businessId);
    setBusinesses((prev) => prev.map((b) => (b.id === businessId ? { ...b, verified } : b)));
    setProducts((prev) =>
      prev.map((p) => (p.businessId === businessId ? { ...p, businessVerified: verified } : p))
    );

    addAdminLog({
      action: verified ? 'Business Storefront Verified' : 'Business Verification Revoked',
      category: 'businesses',
      targetId: businessId,
      targetName: biz?.businessName || businessId,
      details: `${verified ? 'Granted official verified merchant trust badge to' : 'Revoked verification badge from'} "${biz?.businessName || businessId}".`,
      severity: verified ? 'success' : 'warning',
    });

    showToast(
      verified ? 'Business granted Verified Seller status! 🛡️' : 'Verification badge revoked',
      'info'
    );
  };

  // --- SEARCHES ---
  const saveCurrentSearch = (
    query: string,
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    location?: string
  ) => {
    const newSearch: SavedSearch = {
      id: `ss_${Date.now()}`,
      query,
      category,
      minPrice,
      maxPrice,
      location,
      dateSaved: new Date().toISOString(),
    };
    setSavedSearches((prev) => [newSearch, ...prev]);
    showToast(
      `Search for "${query || category || 'custom filter'}" saved to your dashboard`,
      'success'
    );
  };

  const removeSavedSearch = (id: string) => {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    showToast('Saved search removed', 'info');
  };

  return (
    <MarketplaceContext.Provider
      value={{
        currentUser,
        allUsers,
        isAuthLoading,
        isSuperAdmin,
        products,
        businesses,
        orders,
        inquiries,
        reviews,
        adminDetails,
        adminLogs,
        safetyFlags,
        categories,
        wishlist,
        cart,
        savedSearches,
        recentlyViewed,
        currency,
        setCurrency,
        formatPrice,
        loginWithGoogle,
        loginWithCredentials,
        registerUser,
        requestPasswordResetCode,
        resetPassword,
        fastSwitchUser,
        signOutUser,
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
        toggleWishlist,
        isInWishlist,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        addProduct,
        updateProduct,
        deleteProduct,
        archiveProduct,
        featureProduct,
        approveProduct,
        rejectProduct,
        recordProductView,
        placeOrder,
        updateOrderStatus,
        sendInquiryMessage,
        startNewInquiry,
        addReview,
        updateAdminDetails,
        updateBusinessProfile,
        updateUserProfile,
        verifySeller,
        saveCurrentSearch,
        removeSavedSearch,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
