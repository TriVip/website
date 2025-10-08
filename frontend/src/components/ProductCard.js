import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.name} đã được thêm vào giỏ hàng!`);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Quick view functionality can be implemented later
    toast.success('Tính năng xem nhanh sẽ sớm có mặt!');
  };

  const priceValue = Number(product.price ?? 0);
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'USD'
  }).format(Number.isFinite(priceValue) ? priceValue : 0);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link to={`/products/${product.id}`} className="block">
        <div className="card overflow-hidden border border-gray-100 hover:border-amber-200">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <img
              src={product.image_urls?.[0] || '/images/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <button
                  onClick={handleAddToCart}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-amber-50 transition-colors duration-300"
                  title="Thêm vào giỏ hàng"
                  aria-label="Thêm vào giỏ hàng"
                >
                  <ShoppingCart className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={handleQuickView}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-amber-50 transition-colors duration-300"
                  title="Xem nhanh"
                  aria-label="Xem nhanh"
                >
                  <Eye className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors duration-300"
                  title="Yêu thích"
                  aria-label="Thêm vào danh sách yêu thích"
                >
                  <Heart className="w-5 h-5 text-gray-700 hover:text-red-500" />
                </button>
              </div>
            </div>

            {/* Featured Badge */}
            {product.is_featured && (
              <div className="absolute top-3 left-3">
                <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  Nổi bật
                </span>
              </div>
            )}

            {/* Stock Badge */}
            {product.stock_quantity === 0 && (
              <div className="absolute top-3 right-3">
                <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  Hết hàng
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-2">
            <div className="mb-1">
              <span className="text-xs text-amber-600 font-medium">{product.brand}</span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors duration-300">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <span className="text-lg font-bold text-gray-900">
                  {formattedPrice}
                </span>
                <span className="text-xs text-gray-500">
                  {product.volume_ml}ml
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-3 h-3 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">(4.8)</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
