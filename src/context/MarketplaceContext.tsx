import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  INITIAL_ADMIN_DETAILS,
  MOCK_BUSINESSES,
  MOCK_INQUIRIES,
  MOCK_ORDERS,
  MOCK_PRODUCTS,
  MOCK_REVIEWS,
  MOCK_USERS,
} from '../data/mockData';
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
  switchRole: (role: UserRole) => void;
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
  currency: 'USD' | 'KES';
  setCurrency: (currency: 'USD' | 'KES') => void;
  formatPrice: (usdPrice: number) => string;
  
  // Actions
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Product management
  addProduct: (productData: Omit<Product, 'id' | 'slug' | 'views' | 'inquiriesCount' | 'createdAt' | 'rating' | 'reviewsCount'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  archiveProduct: (id: string) => void;
  featureProduct: (id: string, featured: boolean) => void;
  approveProduct: (id: string) => void;
  rejectProduct: (id: string, reason: string) => void;
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
  saveCurrentSearch: (query: string, category?: string, minPrice?: number, maxPrice?: number, location?: string) => void;
  removeSavedSearch: (id: string) => void;

  // Toast notifications
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  removeToast: (id: string) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'ts_products_v2',
  BUSINESSES: 'ts_businesses_v2',
  ORDERS: 'ts_orders_v2',
  INQUIRIES: 'ts_inquiries_v2',
  REVIEWS: 'ts_reviews_v2',
  ADMIN_DETAILS: 'ts_admin_details_v2',
  WISHLIST: 'ts_wishlist_v2',
  SAVED_SEARCHES: 'ts_saved_searches_v2',
  CURRENCY: 'ts_currency_v2',
  ROLE: 'ts_user_role_v2',
};

// Exchange rate: 1 USD = 130 KES
const KES_EXCHANGE_RATE = 130;

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with localStorage or defaults
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    return (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'customer';
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
  });

  const [businesses, setBusinesses] = useState<BusinessProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUSINESSES);
    return saved ? JSON.parse(saved) : MOCK_BUSINESSES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : MOCK_ORDERS;
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    return saved ? JSON.parse(saved) : MOCK_INQUIRIES;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return saved ? JSON.parse(saved) : MOCK_REVIEWS;
  });

  const [adminDetails, setAdminDetailsState] = useState<AdminDetails>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_DETAILS);
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_DETAILS;
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

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(['prod_macbook_m3', 'prod_solar_pump_deepwell']);
  const [currency, setCurrencyState] = useState<'USD' | 'KES'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.CURRENCY) as 'USD' | 'KES') || 'USD';
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentUserRole);
  }, [currentUserRole]);

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

  // Current user derived from role
  const currentUser: User = React.useMemo(() => {
    const found = MOCK_USERS.find((u) => u.role === currentUserRole);
    return (
      found || {
        id: 'usr_guest',
        name: 'Guest User',
        email: 'guest@tradesphere.market',
        phone: '+254 700 000 000',
        role: currentUserRole,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        verified: true,
        location: 'Nairobi, Kenya',
        createdAt: new Date().toISOString(),
      }
    );
  }, [currentUserRole]);

  const switchRole = (role: UserRole) => {
    setCurrentUserRole(role);
    showToast(`Switched active profile to ${role.toUpperCase()}`, 'info');
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setCurrency = (curr: 'USD' | 'KES') => {
    setCurrencyState(curr);
    showToast(`Currency changed to ${curr}`, 'info');
  };

  const formatPrice = (usdPrice: number): string => {
    if (currency === 'KES') {
      const kes = Math.round(usdPrice * KES_EXCHANGE_RATE);
      return `KES ${kes.toLocaleString()}`;
    }
    return `$${usdPrice.toLocaleString(undefined, { minimumFractionDigits: usdPrice % 1 === 0 ? 0 : 2 })}`;
  };

  // Wishlist
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

  // Cart
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
    setCart((prev) => prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item)));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => {
    const itemPrice = item.product.discountPrice ?? item.product.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Product Management
  const addProduct = (
    productData: Omit<Product, 'id' | 'slug' | 'views' | 'inquiriesCount' | 'createdAt' | 'rating' | 'reviewsCount'>
  ): Product => {
    const newId = `prod_${Date.now()}`;
    const slug = productData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Moderation status based on admin setting
    const status: ProductStatus =
      adminDetails.securityAndSettings.contentModerationMode === 'require_review'
        ? 'pending'
        : 'active';

    const newProduct: Product = {
      ...productData,
      id: newId,
      slug,
      status,
      views: 1,
      inquiriesCount: 0,
      createdAt: new Date().toISOString(),
      rating: 5.0,
      reviewsCount: 0,
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Update business product count if applicable
    if (productData.businessId) {
      setBusinesses((prev) =>
        prev.map((b) => (b.id === productData.businessId ? { ...b, productsCount: b.productsCount + 1 } : b))
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

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast('Listing updated successfully', 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Listing deleted from catalog', 'info');
  };

  const archiveProduct = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: p.status === 'archived' ? 'active' : 'archived' } : p))
    );
    showToast('Product status updated', 'info');
  };

  const featureProduct = (id: string, featured: boolean) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, featured } : p)));
    showToast(featured ? 'Product promoted to Featured status! ⭐' : 'Product removed from Featured', 'success');
  };

  const approveProduct = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'active', rejectionReason: undefined } : p)));
    showToast('Product listing approved and published live!', 'success');
  };

  const rejectProduct = (id: string, reason: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'rejected', rejectionReason: reason } : p)));
    showToast('Listing marked as rejected with seller notice', 'warning');
  };

  const recordProductView = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, views: p.views + 1 } : p)));
    setRecentlyViewed((prev) => [id, ...prev.filter((item) => item !== id)].slice(0, 10));
  };

  // Orders
  const placeOrder = async (orderPayload: {
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    buyerAddress: string;
    paymentMethod: PaymentOption;
    notes?: string;
    items?: CartItem[];
  }): Promise<Order> => {
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

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
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

    // Decrement stock for ordered items
    setProducts((prev) =>
      prev.map((p) => {
        const matching = itemsToOrder.find((item) => item.product.id === p.id);
        if (matching) {
          return { ...p, stock: Math.max(0, p.stock - matching.quantity) };
        }
        return p;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);

    // Clear cart if items came from cart
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

  // Inquiries
  const sendInquiryMessage = (inquiryId: string, text: string) => {
    const isBuyer = currentUser.role === 'customer';
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

    // Check if inquiry already exists
    const existing = inquiries.find((i) => i.productId === productId && i.buyerId === currentUser.id);
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

    // Update product inquiries count
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, inquiriesCount: p.inquiriesCount + 1 } : p)));

    showToast('Inquiry sent to seller! Check your messages tab.', 'success');
    return newInquiry;
  };

  // Reviews
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

    // Recalculate product rating
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

  // Admin & Governance updates
  const updateAdminDetails = (updates: Partial<AdminDetails>) => {
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
    showToast('User profile settings updated', 'success');
  };

  const verifySeller = (businessId: string, verified: boolean) => {
    setBusinesses((prev) => prev.map((b) => (b.id === businessId ? { ...b, verified } : b)));
    setProducts((prev) => prev.map((p) => (p.businessId === businessId ? { ...p, businessVerified: verified } : p)));
    showToast(verified ? 'Business granted Verified Seller status! 🛡️' : 'Verification badge revoked', 'info');
  };

  // Searches
  const saveCurrentSearch = (query: string, category?: string, minPrice?: number, maxPrice?: number, location?: string) => {
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
    showToast(`Search for "${query || category || 'custom filter'}" saved to your dashboard`, 'success');
  };

  const removeSavedSearch = (id: string) => {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    showToast('Saved search removed', 'info');
  };

  return (
    <MarketplaceContext.Provider
      value={{
        currentUser,
        switchRole,
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
