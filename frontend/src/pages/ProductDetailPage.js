import React, { useState } from 'react';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sản phẩm không tồn tại</h2>
          <p className="text-gray-600 mb-4">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
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
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-amber-600">Trang chủ</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-amber-600">Sản phẩm</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-amber-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Product Images */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === index
                        ? 'border-amber-500 ring-2 ring-amber-200'
                        : 'border-gray-200 hover:border-gray-300'
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
          <div className="space-y-4">
            {/* Brand and Name */}
            <div>
              <div className="text-amber-600 font-medium mb-2">{product.brand}</div>
               <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.8) • 124 đánh giá</span>
              </div>
            </div>

             {/* Price */}
             <div className="text-xl sm:text-2xl font-bold text-gray-900">
               ${product.price}
               <span className="text-sm sm:text-base text-gray-500 ml-2">{product.volume_ml}ml</span>
             </div>

            {/* Description */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Mô tả sản phẩm</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Scent Notes */}
            {Object.keys(scentNotes).length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Tầng hương</h3>
                <div className="space-y-2">
                  {scentNotes.top_notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Tầng đầu (Top Notes)</h4>
                      <p className="text-xs text-gray-600">{scentNotes.top_notes.join(', ')}</p>
                    </div>
                  )}
                  {scentNotes.middle_notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Tầng giữa (Middle Notes)</h4>
                      <p className="text-xs text-gray-600">{scentNotes.middle_notes.join(', ')}</p>
                    </div>
                  )}
                  {scentNotes.base_notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Tầng cuối (Base Notes)</h4>
                      <p className="text-xs text-gray-600">{scentNotes.base_notes.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {product.stock_quantity > 0 ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Còn hàng ({product.stock_quantity} sản phẩm)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-600">Hết hàng</span>
                </>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            {product.stock_quantity > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Số lượng:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock_quantity}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                 <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                   <button
                     onClick={handleAddToCart}
                     disabled={isAddingToCart}
                     className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                   >
                     <ShoppingCart className="w-5 h-5" />
                     <span className="hidden sm:inline">{isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}</span>
                     <span className="sm:hidden">{isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}</span>
                   </button>
                   
                   <div className="flex space-x-2 sm:space-x-0 sm:flex-col sm:space-y-2">
                     <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                       <Heart className="w-5 h-5 text-gray-600" />
                     </button>
                     
                     <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                       <Share2 className="w-5 h-5 text-gray-600" />
                     </button>
                   </div>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts
                .filter(p => p.id !== product.id)
                .slice(0, 4)
                .map((relatedProduct) => (
                  <motion.div
                    key={relatedProduct.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
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
