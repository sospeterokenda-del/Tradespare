import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flag,
  Heart,
  HelpCircle,
  MapPin,
  MessageCircle,
  MessageSquare,
  Package,
  Phone,
  Play,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Truck,
  Video,
} from 'lucide-react';
import { ContactModal } from '../components/ContactModal';
import { OrderModal } from '../components/OrderModal';
import { ProductCard } from '../components/ProductCard';
import { ReportModal } from '../components/ReportModal';
import { ShareModal } from '../components/ShareModal';
import { useMarketplace } from '../context/MarketplaceContext';
import { BusinessProfile, Product } from '../types';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onSelectBusiness: (business: BusinessProfile) => void;
  onNavigate: (view: string, params?: any) => void;
  onEditProduct?: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onSelectProduct,
  onSelectBusiness,
  onNavigate,
  onEditProduct,
}) => {
  const {
    products,
    businesses,
    currentUser,
    isInWishlist,
    toggleWishlist,
    addToCart,
    formatPrice,
    reviews,
    addReview,
    recordProductView,
  } = useMarketplace();

  // Track view count
  React.useEffect(() => {
    recordProductView(product.id);
  }, [product.id]);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  // Modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const business = businesses.find((b) => b.id === product.businessId || b.ownerId === product.sellerId);
  const isFavorited = isInWishlist(product.id);

  const discountPercent =
    product.discountPrice && product.discountPrice < product.price
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

  const currentPrice = product.discountPrice ?? product.price;

  // Reviews for this product
  const productReviews = reviews.filter((r) => r.productId === product.id);

  // Related products
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id && p.status === 'active')
    .slice(0, 4);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmittingReview(true);
    setTimeout(() => {
      addReview(product.id, newRating, newComment);
      setNewComment('');
      setIsSubmittingReview(false);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-12 overflow-x-hidden">
      {/* Navigation Breadcrumbs & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition min-h-[44px] pr-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Share"
            aria-label="Share listing"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Report this listing"
            aria-label="Report listing"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery (5 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-md">
            {showVideo && product.videoUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
                <Video className="w-12 h-12 text-indigo-400 mb-2" />
                <h4 className="text-sm font-bold">Product Showcase Video</h4>
                <p className="text-xs text-slate-400 max-w-sm my-2">
                  High-definition video demonstration supplied by {product.businessName}
                </p>
                <a
                  href={product.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Open Video in New Tab</span>
                </a>
                <button
                  onClick={() => setShowVideo(false)}
                  className="text-xs text-slate-400 underline mt-4"
                >
                  Back to photos
                </button>
              </div>
            ) : (
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            )}

            {/* Badges on main image */}
            <div className="absolute top-4 left-4 flex gap-2">
              {product.featured && (
                <span className="bg-amber-500 text-slate-950 font-extrabold text-xs uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3" /> Featured
                </span>
              )}
              {discountPercent > 0 && (
                <span className="bg-rose-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Wishlist toggle on image */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all shadow-md ${
                isFavorited
                  ? 'bg-rose-500 text-white scale-105'
                  : 'bg-white/80 hover:bg-white text-slate-700 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedImageIndex(idx);
                  setShowVideo(false);
                }}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition ${
                  selectedImageIndex === idx && !showVideo
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-slate-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}

            {product.videoUrl && (
              <button
                onClick={() => setShowVideo(true)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition flex flex-col items-center justify-center gap-1 bg-slate-900 text-white ${
                  showVideo ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200'
                }`}
              >
                <Video className="w-5 h-5 text-indigo-400" />
                <span className="text-[10px] font-bold">Video</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Pricing & Engagement Triggers (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span className="uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {product.category.replace('-', ' ')}
              </span>
              <span>•</span>
              <span className="capitalize">{product.condition} Condition</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                {product.location}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.title}
            </h1>

            {/* Ratings & Views */}
            <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-500">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating}</span>
                <span className="text-slate-400">({product.reviewsCount} customer reviews)</span>
              </div>
              <span>•</span>
              <span>{product.views} views</span>
              <span>•</span>
              <span>{product.inquiriesCount} buyer inquiries</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">
                {formatPrice(currentPrice)}
              </span>
              {product.discountPrice && (
                <span className="text-base text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2 text-xs font-medium">
              {product.stock > 0 ? (
                <span className="text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full font-bold">
                  Out of Stock
                </span>
              )}

              {product.stock > 0 && product.stock <= 3 && (
                <span className="text-amber-700 font-semibold animate-pulse">
                  Hurry! Only {product.stock} units remaining
                </span>
              )}
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <button
                onClick={() => setIsOrderModalOpen(true)}
                className="py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-98 transition"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Buy Now with Escrow</span>
              </button>

              <button
                onClick={() => addToCart(product, 1)}
                className="py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-xs sm:text-sm border border-slate-300 flex items-center justify-center gap-2 active:scale-98 transition"
              >
                <Package className="w-4 h-4 text-indigo-600" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>

          {/* Owner / Admin Action Bar (RBAC Enforced) */}
          {(currentUser.role === 'admin' || (currentUser.role === 'seller' && currentUser.id === product.sellerId)) && (
            <div className="p-4 rounded-3xl bg-indigo-50/80 border border-indigo-200 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-indigo-950">
                    {currentUser.role === 'admin' ? 'Administrator Controls' : 'You own this listing'}
                  </p>
                  <p className="text-[11px] text-indigo-700">
                    {currentUser.role === 'admin' ? 'Admin has full edit & moderation privileges' : 'Merchant Storefront Owner'}
                  </p>
                </div>
              </div>
              {onEditProduct && (
                <button
                  type="button"
                  onClick={() => onEditProduct(product)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5"
                >
                  <span>Edit Product</span>
                </button>
              )}
            </div>
          )}

          {/* Direct Seller Contact Buttons (WhatsApp, Message, Call) */}
          <div className="p-3.5 sm:p-4 rounded-3xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Direct Communication Options
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={`https://wa.me/${product.sellerWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hello ${product.businessName}, I am contacting you regarding "${product.title}" (${formatPrice(
                    currentPrice
                  )}) on TradeSphere.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-sm transition active:scale-95 min-h-[64px]"
              >
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp</span>
              </a>

              <button
                onClick={() => setIsContactModalOpen(true)}
                className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-sm transition active:scale-95 min-h-[64px]"
              >
                <MessageSquare className="w-5 h-5" />
                <span>In-App Chat</span>
              </button>

              <a
                href={`tel:${product.sellerPhone}`}
                className="p-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-sm transition active:scale-95 min-h-[64px]"
              >
                <Phone className="w-5 h-5" />
                <span>Call Seller</span>
              </a>
            </div>
          </div>

          {/* Seller / Business Card */}
          {business && (
            <div
              onClick={() => onSelectBusiness(business)}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={business.logo}
                  alt={business.businessName}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-slate-900">{business.businessName}</h4>
                    {business.verified && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{business.tagline}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span className="text-amber-600 font-bold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-current" /> {business.rating}
                    </span>
                    <span className="flex items-center gap-0.5 text-emerald-600">
                      <Clock className="w-3 h-3" /> {business.responseTime}
                    </span>
                  </div>
                </div>
              </div>

              <span className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 flex-shrink-0">
                <span>View Store</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </div>
          )}

          {/* Delivery & Payment Protection Highlights */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Delivery Options</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Pickup, Standard local delivery, Express Courier available. Delivery fee ~{' '}
                {formatPrice(product.deliveryFee)}.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Buyer Protection</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Funds held securely in TradeSphere escrow until delivery is verified.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specifications Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-slate-200">
        {/* Description */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Product Description</h3>
          <div className="prose prose-slate text-sm text-slate-600 leading-relaxed space-y-3">
            <p>{product.description}</p>
          </div>

          {/* Payment Methods Accepted */}
          <div className="pt-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Accepted Payment Methods
            </h4>
            <div className="flex flex-wrap gap-2">
              {product.paymentOptions.map((opt) => (
                <span
                  key={opt}
                  className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider"
                >
                  {opt.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Specifications Table */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Technical Specifications</h3>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 text-xs overflow-hidden">
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="p-3 flex justify-between gap-4">
                  <span className="font-semibold text-slate-500">{key}</span>
                  <span className="font-bold text-slate-900 text-right">{val}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-slate-400 text-center">No specific attributes listed</div>
            )}
          </div>
        </div>
      </div>

      {/* Verified Reviews Section */}
      <div className="pt-8 border-t border-slate-200 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Customer Reviews & Ratings</h3>
            <p className="text-xs text-slate-500">Verified buyer feedback from confirmed transactions</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(product.rating) ? 'fill-current' : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-extrabold text-slate-800">{product.rating} out of 5</span>
          </div>
        </div>

        {/* Reviews list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {productReviews.length === 0 ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 col-span-2">
              No reviews yet for this listing. Be the first to leave a verified rating!
            </div>
          ) : (
            productReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rev.userAvatar}
                      alt={rev.userName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{rev.userName}</h4>
                      <div className="flex text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  {rev.verifiedPurchase && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Write a review form */}
        <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Leave a Review</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Your Rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewRating(star)}
                  className={`p-1 rounded text-amber-400 hover:scale-110 transition ${
                    star <= newRating ? 'fill-current' : 'text-slate-300'
                  }`}
                >
                  <Star className={`w-5 h-5 ${star <= newRating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
          </div>
          <textarea
            rows={3}
            required
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your experience with the product and delivery service..."
            className="w-full p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={isSubmittingReview}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 transition"
          >
            {isSubmittingReview ? 'Submitting...' : 'Post Review'}
          </button>
        </form>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Related Products in this Category</h3>
            <button
              onClick={() => onNavigate('browse')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              See All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onSelect={onSelectProduct}
                onQuickOrder={() => setIsOrderModalOpen(true)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <OrderModal
        product={product}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSuccess={() => {
          setIsOrderModalOpen(false);
          onNavigate('customer-dashboard', { tab: 'orders' });
        }}
      />

      <ContactModal
        product={product}
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onInquiryCreated={() => onNavigate('customer-dashboard', { tab: 'messages' })}
      />

      <ShareModal
        product={product}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      <ReportModal
        product={product}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
