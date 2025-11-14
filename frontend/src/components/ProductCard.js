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
    currency: 'VND'
  }).format(Number.isFinite(priceValue) ? priceValue : 0);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group h-full"
    >
      <Link to={`/products/${product.id}`} className="block h-full">
        <div className="card overflow-hidden border border-[#555555] hover:border-[#d4af37] h-full flex flex-col min-h-0">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden bg-[#333333]">
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
                  className="p-1.5 sm:p-2 bg-[#333333] rounded-full shadow-lg hover:bg-[#444444] transition-colors duration-300 border border-[#555555]"
                  title="Thêm vào giỏ hàng"
                  aria-label="Thêm vào giỏ hàng"
                >
                  <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d4af37]" />
                </button>
                <button
                  onClick={handleQuickView}
                  className="p-1.5 sm:p-2 bg-[#333333] rounded-full shadow-lg hover:bg-[#444444] transition-colors duration-300 border border-[#555555]"
                  title="Xem nhanh"
                  aria-label="Xem nhanh"
                >
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d4af37]" />
                </button>
                <button
                  className="p-1.5 sm:p-2 bg-[#333333] rounded-full shadow-lg hover:bg-[#444444] transition-colors duration-300 border border-[#555555]"
                  title="Yêu thích"
                  aria-label="Thêm vào danh sách yêu thích"
                >
                  <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d4af37] hover:text-red-500" />
                </button>
              </div>
            </div>

            {/* Featured Badge */}
            {product.is_featured && (
              <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2">
                <span className="bg-[#d4af37] text-[#222222] text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full">
                  Nổi bật
                </span>
              </div>
            )}

            {/* Stock Badge */}
            {product.stock_quantity === 0 && (
              <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
                <span className="bg-red-500 text-white text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full">
                  Hết hàng
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-3 sm:p-4 flex-1 flex flex-col min-h-0">
            <div className="mb-1">
              <span className="text-xs text-[#d4af37] font-medium">{product.brand}</span>
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-[#ffffff] mb-2 line-clamp-2 group-hover:text-[#d4af37] transition-colors duration-300 flex-shrink-0 min-h-[2.5rem] sm:min-h-[3rem]">
              {product.name}
            </h3>
            <div className="flex items-center flex-wrap gap-x-1.5 gap-y-1 mt-auto pt-2">
              <span className="text-sm sm:text-base font-bold text-[#ffffff]">
                {formattedPrice}
              </span>
              <span className="text-xs text-[#888888]">
                {product.volume_ml}ml
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
