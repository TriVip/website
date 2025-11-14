import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { ShoppingCart, Heart, Share2, Star, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { fetchProduct, fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }),
    []
  );

  // Fetch product details
  const { data: product, isLoading, error } = useQuery(
    ['product', id],
    () => fetchProduct(id),
    {
      enabled: !!id,
    }
  );

  // Fetch related products
  const { data: relatedProducts = [] } = useQuery(
    ['related-products', product?.brand],
    () => fetchProducts({ brand: product?.brand, limit: 4 }),
    {
      enabled: !!product?.brand,
    }
  );

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      addToCart(product, quantity);
      toast.success(`${product.name} đã được thêm vào giỏ hàng!`);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product?.stock_quantity) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#222222]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#ffffff] mb-4">Sản phẩm không tồn tại</h2>
          <p className="text-[#cccccc] mb-4">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link to="/products" className="btn-primary">
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  const images = product.image_urls || ['/images/placeholder.jpg'];
  const scentNotes = product.scent_notes || {};

  return (
    <div className="min-h-screen bg-[#222222] pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-[#888888] mb-6">
          <Link to="/" className="hover:text-[#d4af37]">Trang chủ</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#d4af37]">Sản phẩm</Link>
          <span>/</span>
          <span className="text-[#ffffff]">{product.name}</span>
        </nav>

        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 text-[#cccccc] hover:text-[#d4af37] mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="text-xs sm:text-sm">Quay lại</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
          {/* Product Images */}
          <div className="space-y-2 sm:space-y-3">
            {/* Main Image */}
            <div className="aspect-square rounded-xl overflow-hidden bg-[#333333]">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === index
                        ? 'border-[#d4af37] ring-2 ring-[#d4af37]/30'
                        : 'border-[#555555] hover:border-[#888888]'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-3 sm:space-y-4">
            {/* Brand and Name */}
            <div>
              <div className="text-xs sm:text-sm text-[#d4af37] font-medium mb-1.5">{product.brand}</div>
               <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#ffffff] mb-2 sm:mb-3">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                <div className="flex text-[#d4af37]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-[#888888]">(4.8) • 124 đánh giá</span>
              </div>
            </div>

             {/* Price */}
             <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#ffffff]">
               {currencyFormatter.format(Number(product.price || 0))}
               <span className="text-xs sm:text-sm text-[#888888] ml-1.5">{product.volume_ml}ml</span>
             </div>

            {/* Description */}
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[#ffffff] mb-1.5 sm:mb-2">Mô tả sản phẩm</h3>
              <p className="text-xs sm:text-sm text-[#cccccc] leading-relaxed">{product.description}</p>
            </div>

            {/* Scent Notes */}
            {Object.keys(scentNotes).length > 0 && (
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#ffffff] mb-1.5 sm:mb-2">Tầng hương</h3>
                <div className="space-y-1.5 sm:space-y-2">
                  {scentNotes.top_notes && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-[#eeeeee] mb-0.5 sm:mb-1">Tầng đầu (Top Notes)</h4>
                      <p className="text-xs text-[#cccccc]">{scentNotes.top_notes.join(', ')}</p>
                    </div>
                  )}
                  {scentNotes.middle_notes && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-[#eeeeee] mb-0.5 sm:mb-1">Tầng giữa (Middle Notes)</h4>
                      <p className="text-xs text-[#cccccc]">{scentNotes.middle_notes.join(', ')}</p>
                    </div>
                  )}
                  {scentNotes.base_notes && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-[#eeeeee] mb-0.5 sm:mb-1">Tầng cuối (Base Notes)</h4>
                      <p className="text-xs text-[#cccccc]">{scentNotes.base_notes.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {product.stock_quantity > 0 ? (
                <>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm text-[#cccccc]">
                    Còn hàng ({product.stock_quantity} sản phẩm)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm text-red-400">Hết hàng</span>
                </>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            {product.stock_quantity > 0 && (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <span className="text-xs sm:text-sm font-medium text-[#eeeeee]">Số lượng:</span>
                  <div className="flex items-center border border-[#555555] rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-1.5 hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                    >
                      <Minus className="w-3.5 h-3.5 text-[#d4af37]" />
                    </button>
                    <span className="px-3 sm:px-4 py-1.5 min-w-[50px] sm:min-w-[60px] text-center text-xs sm:text-sm font-medium text-[#ffffff]">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock_quantity}
                      className="p-1.5 hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#d4af37]" />
                    </button>
                  </div>
                </div>

                 <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                   <button
                     onClick={handleAddToCart}
                     disabled={isAddingToCart}
                     className="flex-1 btn-primary flex items-center justify-center space-x-1.5 disabled:opacity-50"
                   >
                     <ShoppingCart className="w-4 h-4" />
                     <span className="hidden sm:inline">{isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}</span>
                     <span className="sm:hidden">{isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}</span>
                   </button>
                   
                   <div className="flex space-x-2 sm:space-x-0 sm:flex-col sm:space-y-2">
                     <button className="p-2.5 border border-[#555555] rounded-lg hover:bg-[#333333] transition-colors duration-300">
                       <Heart className="w-4 h-4 text-[#d4af37]" />
                     </button>
                     
                     <button className="p-2.5 border border-[#555555] rounded-lg hover:bg-[#333333] transition-colors duration-300">
                       <Share2 className="w-4 h-4 text-[#d4af37]" />
                     </button>
                   </div>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <h2 className="text-base sm:text-lg font-bold text-[#ffffff] mb-3 sm:mb-4">Sản phẩm liên quan</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {relatedProducts
                .filter(p => p.id !== product.id)
                .slice(0, 4)
                .map((relatedProduct) => (
                  <motion.div
                    key={relatedProduct.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="h-full"
                  >
                    <ProductCard product={relatedProduct} />
                  </motion.div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
