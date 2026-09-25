import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import {
  INITIAL_ADMIN_DETAILS,
  MOCK_BUSINESSES,
  MOCK_INQUIRIES,
  MOCK_ORDERS,
  MOCK_PRODUCTS,
  MOCK_REVIEWS,
  MOCK_USERS,
} from '../data/mockData';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import {
  AdminDetails,
  BusinessProfile,
  Inquiry,
  Order,
  PaymentOption,
  Product,
  ProductStatus,
  Review,
  SavedSearch,
  User,
  UserRole,
  UserStatus,
} from '../types';

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
  products: Product[];
  businesses: BusinessProfile[];
  orders: Order[];
  inquiries: Inquiry[];
  reviews: Review[];
  adminDetails: AdminDetails;
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
    phone: string;
    role: 'buyer' | 'seller';
    businessName?: string;
  }) => Promise<User>;
  fastSwitchUser: (userId: string) => void;
  signOutUser: () => Promise<void>;

  // User Administration & Approvals (Admin Only)
  approveUser: (userId: string) => Promise<void>;
  suspendUser: (userId: string, reason?: string) => Promise<void>;
  activateUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string, reason?: string) => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;

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
  USERS: 'ts_users_kes_v1',
  CURRENT_USER_ID: 'ts_active_user_id_kes_v1',
  PRODUCTS: 'ts_products_kes_v1',
  BUSINESSES: 'ts_businesses_kes_v1',
  ORDERS: 'ts_orders_kes_v1',
  INQUIRIES: 'ts_inquiries_kes_v1',
  REVIEWS: 'ts_reviews_kes_v1',
  ADMIN_DETAILS: 'ts_admin_details_kes_v1',
  WISHLIST: 'ts_wishlist_kes_v1',
  SAVED_SEARCHES: 'ts_saved_searches_kes_v1',
  CURRENCY: 'ts_currency_kes_v1',
};

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Users list initialized from storage or defaults
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS) || localStorage.getItem('ts_users_v3');
    return saved ? JSON.parse(saved) : MOCK_USERS;
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
        parsed.platformBranding.defaultCurrency = 'KES';
        return parsed;
      } catch {
        return INITIAL_ADMIN_DETAILS;
      }
    }
    return INITIAL_ADMIN_DETAILS;
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
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const isAdminEmail = fbUser.email === 'sospeterokenda@gmail.com';

      // Check if user already exists in Firestore
      const userRef = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(userRef);

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

        await setDoc(userRef, userProfile);
        if (isAdminEmail) {
          await setDoc(doc(db, 'admins', fbUser.uid), {
            uid: fbUser.uid,
            email: fbUser.email,
            createdAt: new Date().toISOString(),
          });
        }
      }

      setAllUsers((prev) => {
        const filtered = prev.filter((u) => u.id !== userProfile.id);
        return [userProfile, ...filtered];
      });
      setCurrentUserId(userProfile.id);

      showToast(`Welcome back, ${userProfile.name}! Logged in as ${userProfile.role.toUpperCase()}`, 'success');
      return userProfile;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const loginWithCredentials = async (emailInput: string): Promise<User> => {
    setIsAuthLoading(true);
    try {
      const found = allUsers.find(
        (u) => u.email.toLowerCase() === emailInput.trim().toLowerCase()
      );
      if (!found) {
        throw new Error(
          'No user account registered with this email address. Please register a new account.'
        );
      }

      if (found.status === 'suspended') {
        throw new Error(
          'Your account has been suspended by an administrator. Please contact support.'
        );
      }

      setCurrentUserId(found.id);
      showToast(
        `Signed in as ${found.name} (${found.role.toUpperCase()})`,
        'success'
      );
      return found;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const registerUser = async (payload: {
    name: string;
    email: string;
    phone: string;
    role: 'buyer' | 'seller';
    businessName?: string;
  }): Promise<User> => {
    setIsAuthLoading(true);
    try {
      const existing = allUsers.find(
        (u) => u.email.toLowerCase() === payload.email.trim().toLowerCase()
      );
      if (existing) {
        throw new Error('An account with this email address already exists. Please sign in.');
      }

      const isAdminEmail = payload.email.trim().toLowerCase() === 'sospeterokenda@gmail.com';
      const role: UserRole = isAdminEmail ? 'admin' : payload.role;
      // Requirements: Sellers start as pending until approved by admin; buyers start active
      const status: UserStatus =
        isAdminEmail ? 'active' : role === 'seller' ? 'pending' : 'active';

      const newId = `usr_${Date.now()}`;
      const newUser: User = {
        id: newId,
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone.trim() || '+254 700 000 000',
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
          businessName: payload.businessName,
          tagline: 'Verified Merchant on TradeSphere',
          description: `Welcome to ${payload.businessName}. We offer quality products and prompt delivery.`,
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
          phone: payload.phone || '+254 700 000 000',
          whatsapp: payload.phone || '+254 700 000 000',
          email: payload.email,
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
    try {
      await fbSignOut(auth);
    } catch {
      // Ignore
    }
    setCurrentUserId('usr_guest');
    showToast('Signed out successfully', 'info');
  };

  // --- ADMIN RBAC USER MANAGEMENT ---
  const approveUser = async (userId: string) => {
    if (currentUser.role !== 'admin') {
      showToast('Unauthorized: Only administrators can approve users', 'error');
      return;
    }

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

    showToast('User application approved! Account is now active.', 'success');
  };

  const suspendUser = async (userId: string, reason = 'Administrative compliance suspension') => {
    if (currentUser.role !== 'admin') {
      showToast('Unauthorized: Only administrators can suspend users', 'error');
      return;
    }

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

    showToast(`User account suspended. Access has been revoked.`, 'warning');
  };

  const activateUser = async (userId: string) => {
    if (currentUser.role !== 'admin') {
      showToast('Unauthorized: Only administrators can activate users', 'error');
      return;
    }

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

    showToast('User status updated to Active', 'success');
  };

  const rejectUser = async (userId: string, reason = 'Application does not meet marketplace standards') => {
    if (currentUser.role !== 'admin') {
      showToast('Unauthorized: Only administrators can reject users', 'error');
      return;
    }

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

    showToast('User registration rejected', 'warning');
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (currentUser.role !== 'admin') {
      showToast('Unauthorized: Only administrators can modify roles', 'error');
      return;
    }

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
      businessName: currentUser.businessName || currentUser.name,
      views: 1,
      inquiriesCount: 0,
      createdAt: new Date().toISOString(),
      rating: 5.0,
      reviewsCount: 0,
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
    const isAdmin = currentUser.role === 'admin';

    if (!isAdmin && !isOwner) {
      showToast('Unauthorized: You can only delete your own products', 'error');
      throw new Error('Unauthorized: Sellers can only delete products from their own store.');
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Listing deleted from catalog', 'info');
  };

  const archiveProduct = async (id: string) => {
    const existing = products.find((p) => p.id === id);
    if (!existing) return;

    const isOwner = existing.sellerId === currentUser.id;
    const isAdmin = currentUser.role === 'admin';
    if (!isAdmin && !isOwner) {
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
    if (currentUser.role !== 'admin') {
      showToast('Admin clearance required to feature listings', 'error');
      return;
    }
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, featured } : p)));
    showToast(featured ? 'Product featured! ⭐' : 'Product unfeatured', 'success');
  };

  const approveProduct = async (id: string) => {
    if (currentUser.role !== 'admin') {
      showToast('Admin clearance required to moderate products', 'error');
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'active', rejectionReason: undefined } : p))
    );
    showToast('Product listing approved and published live!', 'success');
  };

  const rejectProduct = async (id: string, reason: string) => {
    if (currentUser.role !== 'admin') {
      showToast('Admin clearance required to moderate products', 'error');
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'rejected', rejectionReason: reason } : p))
    );
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
    if (currentUser.role !== 'admin') {
      showToast('Unauthorized: Admin access required', 'error');
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
    if (currentUser.role !== 'admin') {
      showToast('Unauthorized: Admin access required', 'error');
      return;
    }
    setBusinesses((prev) => prev.map((b) => (b.id === businessId ? { ...b, verified } : b)));
    setProducts((prev) =>
      prev.map((p) => (p.businessId === businessId ? { ...p, businessVerified: verified } : p))
    );
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
        products,
        businesses,
        orders,
        inquiries,
        reviews,
        adminDetails,
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
        fastSwitchUser,
        signOutUser,
        approveUser,
        suspendUser,
        activateUser,
        rejectUser,
        updateUserRole,
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
