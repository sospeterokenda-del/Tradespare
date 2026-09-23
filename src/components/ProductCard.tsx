import React, { useState } from 'react';
import {
  CheckCircle2,
  Heart,
  MapPin,
  MessageCircle,
  MessageSquare,
  Package,
  Play,
  Share2,
  ShoppingCart,
  Star,
  Zap,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickOrder?: (product: Product) => void;
  onQuickContact?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickOrder,
  onQuickContact,
}) => {
  const { isInWishlist, toggleWishlist, formatPrice, addToCart } = useMarketplace();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const isFavorited = isInWishlist(product.id);

  const discountPercent =
    product.discountPrice && product.discountPrice < product.price
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

  const currentPrice = product.discountPrice ?? product.price;

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 hover:border-indigo-400/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-4/3 w-full max-w-full overflow-hidden bg-slate-100">
        <img
          src={product.images[currentImgIndex] || product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 max-w-full"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10 pointer-events-none">
          {discountPercent > 0 && (
            <span className="bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded-lg shadow-sm">
              -{discountPercent}% OFF
            </span>
          )}
          {product.featured && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" /> Featured
            </span>
          )}
        </div>

        {/* Top Right Floating Action: Wishlist */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 shadow-sm min-h-[40px] min-w-[40px] ${
            isFavorited
              ? 'bg-rose-50 text-rose-600 scale-110'
              : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white'
          }`}
          title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Video demonstration indicator */}
        {product.videoUrl && (
          <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            <Play className="w-3 h-3 fill-white text-white" />
            <span>Video Demo</span>
          </div>
        )}
      </div>

      {/* Card Content Information */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Unboxed Metadata Hierarchy */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <span className="text-indigo-600 font-bold uppercase tracking-wider">
              {product.category.replace('-', ' ')}
            </span>
            <span>·</span>
            <span className="capitalize">{product.condition}</span>
            <span>·</span>
            <span className="flex items-center gap-0.5 text-slate-600 truncate max-w-[90px] sm:max-w-[120px]">
              <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              <span className="truncate">{product.city}</span>
            </span>
          </div>

          {/* Product Title */}
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h3>

          {/* Seller / Business info */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <div className="flex items-center gap-1 text-slate-600 font-medium truncate max-w-[140px] sm:max-w-[160px]">
              <span className="truncate">{product.businessName}</span>
              {product.businessVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 text-amber-500 font-bold flex-shrink-0 text-[11px]">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating}</span>
            </div>
          </div>
        </div>

        {/* Pricing Block */}
        <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base sm:text-xl font-black text-slate-900">
              {formatPrice(currentPrice)}
            </span>
            {product.discountPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            {product.stock > 0 ? (
              <span className="text-emerald-700 font-bold">In Stock ({product.stock})</span>
            ) : (
              <span className="text-rose-500 font-bold">Sold Out</span>
            )}
          </span>
        </div>

        {/* Touch-Friendly Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Quick WhatsApp or Message */}
          <a
            href={`https://wa.me/${product.sellerWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
              `Hi ${product.businessName}, I am interested in "${product.title}" (${formatPrice(
                currentPrice
              )}) listed on TradeSphere.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors active:scale-95 min-h-[44px]"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="truncate">WhatsApp</span>
          </a>

          {/* Quick Order / Buy Now */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickOrder) {
                onQuickOrder(product);
              } else {
                addToCart(product, 1);
              }
            }}
            className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/20 active:scale-95 transition-all min-h-[44px]"
            title="Order instantly"
          >
            <ShoppingCart className="w-4 h-4 flex-shrink-0" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
