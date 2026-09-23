export type UserRole = 'customer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  verified: boolean;
  businessId?: string;
  location: string;
  bio?: string;
  createdAt: string;
}

export interface BusinessProfile {
  id: string;
  ownerId: string;
  businessName: string;
  tagline: string;
  description: string;
  category: string;
  logo: string;
  banner: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  responseTime: string; // e.g. "Within 15 minutes"
  address: string;
  city: string;
  country: string;
  phone: string;
  whatsapp: string;
  email: string;
  website?: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
  operatingHours: string;
  memberSince: string;
  badges: string[];
  productsCount: number;
  featured?: boolean;
}

export type ProductCondition = 'new' | 'refurbished' | 'used';
export type ProductStatus = 'active' | 'pending' | 'draft' | 'archived' | 'rejected';

export type DeliveryOption = 'pickup' | 'local_standard' | 'express' | 'free_shipping' | 'nationwide';

export type PaymentOption = 'mpesa' | 'card' | 'mobile_money' | 'bank_transfer' | 'cash_on_delivery';

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  discountPrice?: number;
  condition: ProductCondition;
  stock: number;
  location: string;
  city: string;
  images: string[];
  videoUrl?: string;
  deliveryOptions: DeliveryOption[];
  deliveryFee: number;
  paymentOptions: PaymentOption[];
  featured: boolean;
  status: ProductStatus;
  views: number;
  inquiriesCount: number;
  sellerId: string;
  businessId?: string;
  businessName: string;
  businessVerified: boolean;
  businessLogo?: string;
  sellerPhone: string;
  sellerWhatsapp: string;
  createdAt: string;
  specifications: Record<string, string>;
  rating: number;
  reviewsCount: number;
  rejectionReason?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  sellerId: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'failed';

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentOption;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingCode?: string;
  createdAt: string;
  notes?: string;
}

export interface InquiryMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isBuyer: boolean;
}

export interface Inquiry {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  sellerId: string;
  sellerName: string;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
  messages: InquiryMessage[];
}

export interface SavedSearch {
  id: string;
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  dateSaved: string;
}

export interface AdminDetails {
  profile: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
    role: string;
    department: string;
    permissions: string[];
  };
  platformBranding: {
    marketplaceName: string;
    tagline: string;
    supportEmail: string;
    supportPhone: string;
    businessAddress: string;
    timeZone: string;
    defaultCurrency: 'KES' | 'USD' | 'EUR' | 'GBP';
    announcementBanner: {
      active: boolean;
      text: string;
      type: 'info' | 'warning' | 'alert' | 'success';
    };
  };
  securityAndSettings: {
    twoFactorRequired: boolean;
    contentModerationMode: 'auto_approve' | 'require_review' | 'ai_flagging';
    mpesaSandbox: boolean;
    allowGuestInquiries: boolean;
    feeCommissionRate: number; // percentage e.g. 3.5
  };
  notificationPreferences: {
    emailOnNewListing: boolean;
    smsOnHighValueOrder: boolean;
    lowStockThresholdAlert: boolean;
    disputeEscalation: boolean;
  };
}

export interface CategoryInfo {
  id: string;
  name: string;
  iconName: string;
  description: string;
  itemCount: number;
  image: string;
  popularSearchTerms: string[];
}
