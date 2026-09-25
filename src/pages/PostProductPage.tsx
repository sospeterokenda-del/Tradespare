import React, { useState, useRef } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Plus,
  PlusCircle,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Video,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useMarketplace } from '../context/MarketplaceContext';
import { CATEGORIES } from '../data/mockData';
import { DeliveryOption, PaymentOption, Product, ProductCondition } from '../types';

interface PostProductPageProps {
  onBack: () => void;
  onSuccess: (product: Product) => void;
  editProduct?: Product;
}

export const PostProductPage: React.FC<PostProductPageProps> = ({
  onBack,
  onSuccess,
  editProduct,
}) => {
  const { addProduct, updateProduct, currentUser, businesses, formatPrice, showToast } = useMarketplace();

  // Primary Form State
  const [title, setTitle] = useState(editProduct?.title || '');
  const [category, setCategory] = useState(editProduct?.category || 'electronics');
  const [condition, setCondition] = useState<ProductCondition>(editProduct?.condition || 'new');
  const [description, setDescription] = useState(editProduct?.description || '');
  const [price, setPrice] = useState<number | ''>(editProduct?.price || '');
  const [discountPrice, setDiscountPrice] = useState<number | ''>(editProduct?.discountPrice || '');
  const [stock, setStock] = useState<number | ''>(editProduct?.stock ?? 5);

  // Seller & Location
  const userBiz = businesses.find((b) => b.ownerId === currentUser.id || b.id === currentUser.businessId) || businesses[0];
  const [businessName, setBusinessName] = useState(editProduct?.businessName || userBiz?.businessName || 'Apex Electronics Hub');
  const [sellerPhone, setSellerPhone] = useState(editProduct?.sellerPhone || currentUser.phone || '+254 722 998 877');
  const [sellerWhatsapp, setSellerWhatsapp] = useState(editProduct?.sellerWhatsapp || '+254722998877');
  const [location, setLocation] = useState(editProduct?.location || 'Westlands, Nairobi');
  const [city, setCity] = useState(editProduct?.city || 'Nairobi');

  // Media
  const [images, setImages] = useState<string[]>(
    editProduct?.images || [
      'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80',
    ]
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState(editProduct?.videoUrl || '');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delivery & Payments
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>(
    editProduct?.deliveryOptions || ['pickup', 'local_standard', 'express']
  );
  const [deliveryFee, setDeliveryFee] = useState<number | ''>(editProduct?.deliveryFee ?? 10);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>(
    editProduct?.paymentOptions || ['mpesa', 'card', 'bank_transfer', 'cash_on_delivery']
  );
  const [featured, setFeatured] = useState(editProduct?.featured || false);

  // Specifications key-value pairs
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: 'Brand', value: 'Original Certified' },
    { key: 'Warranty', value: '1 Year Manufacturer Warranty' },
  ]);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Quick preset photos for convenient testing
  const samplePresets = [
    { label: 'Smart Tech', url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80' },
    { label: 'Solar Hardware', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80' },
    { label: 'Leather Goods', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80' },
    { label: 'Power Tools', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80' },
  ];

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processFiles = (files: FileList | File[]) => {
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        // Max 15MB limit per photo
        if (file.size > 15 * 1024 * 1024) {
          showToast(`"${file.name}" is over 15MB. Please choose a smaller photo.`, 'warning');
          continue;
        }
        validFiles.push(file);
      } else {
        showToast(`Skipped "${file.name}" because it is not an image file`, 'warning');
      }
    }

    if (validFiles.length === 0) return;

    setIsUploadingImages(true);

    const readPromises = validFiles.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (typeof e.target?.result === 'string') {
            resolve(e.target.result);
          } else {
            reject(new Error('Failed to convert file'));
          }
        };
        reader.onerror = () => reject(new Error('File reading error'));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises)
      .then((uploadedDataUrls) => {
        setImages((prev) => [...prev, ...uploadedDataUrls]);
        showToast(
          `Uploaded ${uploadedDataUrls.length} image${uploadedDataUrls.length > 1 ? 's' : ''} from internal storage!`,
          'success'
        );
      })
      .catch(() => {
        showToast('Could not load image from internal storage', 'error');
      })
      .finally(() => {
        setIsUploadingImages(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleAddImage = (urlToAdd?: string) => {
    const url = urlToAdd || newImageUrl.trim();
    if (url) {
      setImages((prev) => [...prev, url]);
      if (!urlToAdd) setNewImageUrl('');
      showToast('Image URL added to product gallery', 'success');
    } else {
      // If user clicks "Add Image" with an empty input, trigger the internal storage file upload picker!
      handleTriggerFileInput();
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const target = prev[index];
      const remaining = prev.filter((_, i) => i !== index);
      return [target, ...remaining];
    });
    showToast('Primary photo updated', 'info');
  };

  const handleRemoveImage = (index: number) => {
    if (images.length === 1) {
      showToast('At least one product image is required.', 'warning');
      return;
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
    showToast('Photo removed', 'info');
  };

  const handleAddSpec = () => {
    setSpecs((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleToggleDelivery = (opt: DeliveryOption) => {
    setDeliveryOptions((prev) =>
      prev.includes(opt) ? prev.filter((item) => item !== opt) : [...prev, opt]
    );
  };

  const handleTogglePayment = (opt: PaymentOption) => {
    setPaymentOptions((prev) =>
      prev.includes(opt) ? prev.filter((item) => item !== opt) : [...prev, opt]
    );
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Product title is required';
    if (!description.trim()) errs.description = 'Product description is required';
    // KES Currency & Pricing Validation
    if (price === '' || isNaN(Number(price)) || Number(price) <= 0) {
      errs.price = 'Valid price in KES (greater than KSh 0) is required';
    } else if (Number(price) > 1000000000) {
      errs.price = 'Price exceeds maximum allowable KES limit (KSh 1,000,000,000)';
    }

    if (discountPrice !== '') {
      if (isNaN(Number(discountPrice)) || Number(discountPrice) <= 0) {
        errs.discountPrice = 'Discount price must be a valid KES amount greater than 0';
      } else if (Number(discountPrice) >= Number(price)) {
        errs.discountPrice = 'Discount price must be lower than the regular price';
      }
    }

    if (deliveryFee !== '' && (isNaN(Number(deliveryFee)) || Number(deliveryFee) < 0)) {
      errs.deliveryFee = 'Delivery fee in KES cannot be negative';
    }

    if (stock === '' || Number(stock) < 0) errs.stock = 'Stock quantity cannot be negative';
    if (images.length === 0) errs.images = 'At least one photo is required';
    if (!sellerPhone.trim()) errs.sellerPhone = 'Seller phone is required';
    if (!location.trim()) errs.location = 'Location is required';
    if (deliveryOptions.length === 0) errs.delivery = 'Select at least one delivery option';
    if (paymentOptions.length === 0) errs.payment = 'Select at least one payment method';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    const specsObj: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specsObj[s.key.trim()] = s.value.trim();
      }
    });

    try {
      if (editProduct) {
        await updateProduct(editProduct.id, {
          title,
          category,
          condition,
          description,
          price: Number(price),
          discountPrice: discountPrice !== '' ? Number(discountPrice) : undefined,
          stock: Number(stock),
          businessName,
          sellerPhone,
          sellerWhatsapp,
          location,
          city,
          images,
          videoUrl,
          deliveryOptions,
          deliveryFee: deliveryFee !== '' ? Number(deliveryFee) : 0,
          paymentOptions,
          featured,
          specifications: specsObj,
        });
        setIsSubmitting(false);
        onSuccess(editProduct);
      } else {
        const created = await addProduct({
          title,
          category,
          condition,
          description,
          price: Number(price),
          discountPrice: discountPrice !== '' ? Number(discountPrice) : undefined,
          stock: Number(stock),
          businessId: userBiz?.id,
          businessName,
          businessVerified: true,
          sellerId: currentUser.id,
          sellerPhone,
          sellerWhatsapp,
          location,
          city,
          images,
          videoUrl: videoUrl.trim() || undefined,
          deliveryOptions,
          deliveryFee: deliveryFee !== '' ? Number(deliveryFee) : 0,
          paymentOptions,
          featured,
          status: 'active',
          specifications: specsObj,
        });
        setIsSubmitting(false);
        onSuccess(created);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
      setIsSubmitting(false);
    }
  };

  // Preview synthetic product object for live preview card
  const previewProduct: Product = {
    id: editProduct?.id || 'preview_prod',
    title: title || 'Product Name Preview',
    slug: 'preview',
    category,
    condition,
    description: description || 'Description will appear here...',
    price: Number(price) || 100,
    discountPrice: discountPrice !== '' ? Number(discountPrice) : undefined,
    stock: Number(stock) || 1,
    location: location || 'Nairobi, Kenya',
    city: city || 'Nairobi',
    images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80'],
    videoUrl,
    deliveryOptions,
    deliveryFee: Number(deliveryFee) || 0,
    paymentOptions,
    featured,
    status: 'active',
    views: 1,
    inquiriesCount: 0,
    sellerId: currentUser.id,
    businessName,
    businessVerified: true,
    sellerPhone,
    sellerWhatsapp,
    createdAt: new Date().toISOString(),
    specifications: {},
    rating: 5.0,
    reviewsCount: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {editProduct ? 'Edit Product Listing' : 'Post a New Product'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in the verified specifications to publish your listing to thousands of active buyers.
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border min-h-[44px] ${
              previewMode
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{previewMode ? 'Hide Preview' : 'Show Live Preview'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form (Left 8 Cols) + Live Preview Card (Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-8">
          {Object.keys(errors).length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>Please fix the following errors before publishing:</span>
              </div>
              <ul className="list-disc list-inside pl-1 text-[11px] space-y-0.5">
                {Object.values(errors).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
                1
              </span>
              <span>General Information</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. DeWalt 20V MAX XR Brushless Cordless Drill Combo Kit"
                  className={`w-full p-3 rounded-2xl border text-slate-900 font-medium outline-none transition ${
                    errors.title ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-slate-900 bg-slate-50 font-medium outline-none focus:border-indigo-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Condition</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['new', 'refurbished', 'used'] as ProductCondition[]).map((cond) => (
                      <button
                        type="button"
                        key={cond}
                        onClick={() => setCondition(cond)}
                        className={`py-2.5 rounded-xl font-bold capitalize transition border text-xs ${
                          condition === cond
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe product highlights, technical specifications, warranty terms, and box contents..."
                  className="w-full p-3 rounded-2xl border border-slate-200 text-slate-900 font-medium outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Inventory */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                2
              </span>
              <span>Pricing & Stock</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Regular Price (KSh) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 5,500"
                  className="w-full p-3 rounded-2xl border border-slate-200 text-slate-900 font-bold outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Discounted Offer Price (KSh) (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 4,999"
                  className="w-full p-3 rounded-2xl border border-slate-200 text-slate-900 font-bold outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Units in Stock <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 10"
                  className="w-full p-3 rounded-2xl border border-slate-200 text-slate-900 font-bold outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Media & Images */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
            {/* Hidden native file input for internal storage upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
              id="product-image-internal-upload"
              aria-label="Upload photos from internal storage"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-xs">
                  3
                </span>
                <span>Images & Video Showcase</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                {images.length} {images.length === 1 ? 'photo' : 'photos'} uploaded
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Drag-and-drop Gallery Grid */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`p-3 rounded-2xl transition border-2 ${
                  isDragOver
                    ? 'border-indigo-500 bg-indigo-50/50'
                    : 'border-transparent bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <label className="block font-bold text-slate-700">
                    Product Gallery
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Click photo star to set as Primary
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group bg-slate-100 shadow-xs"
                    >
                      <img
                        src={img}
                        alt={`Product photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Primary Badge */}
                      {idx === 0 ? (
                        <span className="absolute top-2 left-2 bg-indigo-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-white" /> Primary
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          title="Set as main primary photo"
                          className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/60 hover:bg-indigo-600 text-white opacity-0 group-hover:opacity-100 transition min-h-[32px] min-w-[32px] flex items-center justify-center backdrop-blur-xs"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete Photo Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="Remove photo"
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition min-h-[32px] min-w-[32px] flex items-center justify-center shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Dedicated "Add Image from Storage" Tile */}
                  <button
                    type="button"
                    onClick={handleTriggerFileInput}
                    disabled={isUploadingImages}
                    className="relative aspect-square rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/80 transition flex flex-col items-center justify-center p-3 text-center cursor-pointer group active:scale-98 min-h-[120px]"
                  >
                    {isUploadingImages ? (
                      <div className="flex flex-col items-center gap-1.5 text-indigo-600">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-[11px] font-bold">Uploading...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-500 group-hover:text-indigo-600">
                        <div className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center text-indigo-600 group-hover:scale-110 transition border border-indigo-100">
                          <Upload className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-[11px] text-slate-800 group-hover:text-indigo-600">
                          Upload Photo
                        </span>
                        <span className="text-[10px] text-slate-400">
                          From Storage
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Upload Action Bar: Internal Storage Button + URL option */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleTriggerFileInput}
                    disabled={isUploadingImages}
                    className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20 transition min-h-[44px] cursor-pointer"
                  >
                    {isUploadingImages ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Reading Storage...</span>
                      </>
                    ) : (
                      <>
                        <FolderOpen className="w-4 h-4" />
                        <span>Upload from Internal Storage</span>
                      </>
                    )}
                  </button>

                  <div className="hidden sm:flex items-center text-slate-400 font-medium text-[11px] px-1">
                    or
                  </div>

                  {/* Add image URL input */}
                  <div className="flex-1 flex gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImage();
                        }
                      }}
                      placeholder="Paste image link or click Add Image..."
                      className="flex-1 p-2.5 rounded-xl bg-white border border-slate-200 text-xs outline-none focus:border-indigo-500 min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddImage()}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 active:bg-slate-950 transition min-h-[44px] flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Image</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <span>
                    Tap <strong>Upload from Internal Storage</strong> to choose photos from your phone gallery, camera, files, or computer disk.
                  </span>
                </p>
              </div>

              {/* Preset Sample Images */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  Or pick high-res sample presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {samplePresets.map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => handleAddImage(preset.url)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-[11px] font-medium transition cursor-pointer min-h-[34px]"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video URL */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-700 mb-1">
                  Optional Product Video URL (YouTube, Vimeo, MP4)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 min-h-[44px]"
                  />
                  <Video className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Seller Details, Location & Delivery */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center text-xs">
                4
              </span>
              <span>Delivery & Payment Preferences</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business / Storefront Name</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">City / Region</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Nairobi"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Seller Phone Number</label>
                <input
                  type="tel"
                  required
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Seller WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  value={sellerWhatsapp}
                  onChange={(e) => setSellerWhatsapp(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Pickup / Physical Location Address</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Suite 402, Victoria Plaza, Parklands Rd, Nairobi"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Estimated Delivery Fee (KSh)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 500 (or 0 for Free Delivery)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold"
                />
              </div>
            </div>

            {/* Delivery Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <label className="block font-bold text-slate-800">Delivery Methods Offered</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'pickup', label: 'Customer Pickup' },
                  { id: 'local_standard', label: 'Standard Local Delivery' },
                  { id: 'express', label: 'Express Same-Day' },
                  { id: 'free_shipping', label: 'Free Shipping' },
                  { id: 'nationwide', label: 'Nationwide Courier' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleToggleDelivery(item.id as DeliveryOption)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition border ${
                      deliveryOptions.includes(item.id as DeliveryOption)
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {deliveryOptions.includes(item.id as DeliveryOption) ? '✓ ' : '+ '}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accepted Payments Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <label className="block font-bold text-slate-800">Accepted Payment Methods</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'mpesa', label: 'Safaricom M-Pesa' },
                  { id: 'card', label: 'Visa / Mastercard' },
                  { id: 'mobile_money', label: 'Mobile Money' },
                  { id: 'bank_transfer', label: 'Bank Wire' },
                  { id: 'cash_on_delivery', label: 'Cash on Delivery' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleTogglePayment(item.id as PaymentOption)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition border ${
                      paymentOptions.includes(item.id as PaymentOption)
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {paymentOptions.includes(item.id as PaymentOption) ? '✓ ' : '+ '}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Promotion & Monetization Tier */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
                5
              </span>
              <span>Listing Visibility & Promotion</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div
                onClick={() => setFeatured(false)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                  !featured
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span>Standard Listing</span>
                  <span className="text-emerald-600 font-extrabold">FREE</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Standard catalog visibility, customer inquiries, and order processing.
                </p>
              </div>

              <div
                onClick={() => setFeatured(true)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                  featured
                    ? 'border-amber-500 bg-amber-50/60 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span className="flex items-center gap-1 text-amber-900">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    <span>Featured Sponsored</span>
                  </span>
                  <span className="text-indigo-600 font-extrabold">KSh 650.00</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Promoted top slot on homepage, category priority, and gold Featured badge.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition min-h-[48px] flex items-center justify-center"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto sm:flex-1 max-w-sm py-4 rounded-2xl text-xs sm:text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-98 transition disabled:opacity-70 min-h-[48px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Listing...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  <span>{editProduct ? 'Save Changes' : 'Publish Product to Marketplace'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Real-Time Preview Column (Right 4 Cols) */}
        <div className={`lg:col-span-4 ${previewMode ? 'block' : 'hidden lg:block'} sticky top-28 space-y-4`}>
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold">Live Card Preview</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-medium">
              Real-time
            </span>
          </div>

          <div className="max-w-sm mx-auto">
            <ProductCard
              product={previewProduct}
              onSelect={() => {}}
              onQuickOrder={() => {}}
            />
          </div>

          <p className="text-[11px] text-slate-400 text-center px-4 leading-relaxed">
            This is how your product listing card will appear to prospective buyers across search results and category grids.
          </p>
        </div>
      </div>
    </div>
  );
};
