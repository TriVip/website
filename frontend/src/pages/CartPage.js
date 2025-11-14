import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();

  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }),
    []
  );

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#222222] pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-[#888888] mb-8">
              <ShoppingBag className="w-24 h-24 mx-auto" />
            </div>
            <h2 className="text-3xl font-bold text-[#ffffff] mb-4">Giỏ hàng trống</h2>
            <p className="text-[#cccccc] mb-8">
              Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!
            </p>
            <Link to="/products" className="btn-primary inline-flex items-center space-x-2">
              <span>Khám phá sản phẩm</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222222] pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        {/* Header */}
        <div className="mb-4 sm:mb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-[#ffffff] mb-1.5">Giỏ hàng</h1>
          <p className="text-xs sm:text-sm text-[#cccccc]">
            Bạn có {getTotalItems()} sản phẩm trong giỏ hàng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-[#222222] border border-[#555555] rounded-xl shadow-lg p-3 sm:p-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  {/* Product Image */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-[#333333] flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <h3 className="font-semibold text-[#ffffff] mb-1 text-xs sm:text-sm">{item.name}</h3>
                    <p className="text-xs text-[#cccccc] mb-0.5">{item.brand}</p>
                    <p className="text-xs text-[#888888]">{item.volume_ml}ml</p>
                  </div>

                  {/* Price */}
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="font-semibold text-[#ffffff] text-sm sm:text-base">{currencyFormatter.format(Number(item.price || 0))}</p>
                    <p className="text-xs text-[#cccccc] mt-0.5">
                      Tổng: {currencyFormatter.format(Number((item.price * item.quantity) || 0))}
                    </p>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 pt-3 border-t border-[#555555] space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-[#eeeeee]">Số lượng:</span>
                    <div className="flex items-center border border-[#555555] rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-[#333333] transition-colors rounded-l-lg"
                      >
                        <Minus className="w-3.5 h-3.5 text-[#d4af37]" />
                      </button>
                      <span className="px-2.5 sm:px-3 py-1.5 min-w-[40px] sm:min-w-[50px] text-center text-xs sm:text-sm font-medium text-[#ffffff]">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-[#333333] transition-colors rounded-r-lg"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#d4af37]" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors duration-300 self-start sm:self-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Clear Cart Button */}
            <div className="text-center">
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-400 font-medium transition-colors duration-300"
              >
                Xóa tất cả sản phẩm
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#222222] border border-[#555555] rounded-xl shadow-lg p-3 sm:p-4 sticky top-24">
              <h2 className="text-base sm:text-lg font-bold text-[#ffffff] mb-3 sm:mb-4">Tóm tắt đơn hàng</h2>

              {/* Order Details */}
              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-[#cccccc]">Tạm tính ({getTotalItems()} sản phẩm)</span>
                  <span className="font-medium text-[#ffffff]">{currencyFormatter.format(Number(getTotalPrice() || 0))}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-[#cccccc]">Phí vận chuyển</span>
                  <span className="font-medium text-green-500">Miễn phí</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-[#cccccc]">Thuế</span>
                  <span className="font-medium text-[#ffffff]">{currencyFormatter.format(0)}</span>
                </div>
                <div className="border-t border-[#555555] pt-2 sm:pt-3">
                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base font-bold text-[#ffffff]">Tổng cộng</span>
                    <span className="text-sm sm:text-base font-bold text-[#ffffff]">{currencyFormatter.format(Number(getTotalPrice() || 0))}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                to="/checkout"
                className="w-full btn-primary flex items-center justify-center space-x-1.5"
              >
                <span>Tiến hành thanh toán</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Continue Shopping */}
              <Link
                to="/products"
                className="w-full btn-secondary flex items-center justify-center space-x-1.5 mt-2 sm:mt-3"
              >
                <span>Tiếp tục mua sắm</span>
              </Link>

              {/* Security Notice */}
              <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-400 font-medium">Thanh toán an toàn</span>
                </div>
                <p className="text-xs text-green-400/80 mt-0.5">
                  Thông tin của bạn được bảo mật và mã hóa
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
