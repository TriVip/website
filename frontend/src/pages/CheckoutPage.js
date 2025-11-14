import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Check, CreditCard, Truck, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/api';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }),
    []
  );

  const { register, handleSubmit, formState: { errors }, trigger } = useForm({
    mode: 'onTouched'
  });

  const steps = [
    { id: 1, title: 'Thông tin giao hàng', icon: Truck },
    { id: 2, title: 'Phương thức thanh toán', icon: CreditCard },
    { id: 3, title: 'Xác nhận đơn hàng', icon: Check },
  ];

  const onSubmit = async (data) => {
    if (currentStep === 1) {
      const isValidStep = await trigger(['customer_name', 'customer_phone', 'customer_email', 'shipping_address']);
      if (!isValidStep) {
        toast.error('Vui lòng kiểm tra lại thông tin giao hàng.');
        return;
      }
      setOrderData(data);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      await handleOrderSubmission();
    }
  };

  const handleOrderSubmission = async () => {
    if (!orderData || items.length === 0) return;

    setIsSubmitting(true);
    try {
      const orderItems = items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      const orderPayload = {
        ...orderData,
        items: orderItems,
        payment_method: 'qr_code',
      };

      const response = await createOrder(orderPayload);
      
      // Clear cart and redirect to confirmation
      clearCart();
      navigate(`/order-confirmation/${response.order.order_number}`);
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/cart');
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#222222] pt-20 sm:pt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        {/* Header */}
        <div className="mb-4 sm:mb-5">
          <button
            onClick={goBack}
            className="inline-flex items-center space-x-1.5 text-[#cccccc] hover:text-[#d4af37] mb-3 font-semibold text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </button>
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#ffffff]">Thanh toán</h1>
            <p className="text-xs sm:text-sm text-[#cccccc]">Hoàn tất các bước bên dưới để đặt hàng an toàn với Rare Parfume.</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-[#d4af37] border-[#d4af37] text-[#222222]' 
                      : isActive 
                        ? 'border-[#d4af37] text-[#d4af37]' 
                        : 'border-[#555555] text-[#888888]'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="ml-2 sm:ml-2.5">
                    <p className={`text-xs sm:text-sm font-medium ${
                      isActive ? 'text-[#d4af37]' : isCompleted ? 'text-[#ffffff]' : 'text-[#888888]'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-6 sm:w-12 h-0.5 mx-1.5 sm:mx-3 ${
                      isCompleted ? 'bg-[#d4af37]' : 'bg-[#555555]'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#222222] border border-[#555555] rounded-xl shadow-xl p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4"
                >
                  <div className="space-y-1.5">
                    <h2 className="text-base sm:text-lg font-bold text-[#ffffff]">Thông tin giao hàng</h2>
                    <p className="text-xs text-[#cccccc]">Thông tin sẽ được bảo mật và chỉ sử dụng để giao hàng.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label" htmlFor="customer_name">
                        Họ và tên
                      </label>
                      <input
                        id="customer_name"
                        type="text"
                        autoComplete="name"
                        maxLength={80}
                        {...register('customer_name', { required: 'Vui lòng nhập họ và tên' })}
                        className={`input-field ${errors.customer_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Nhập họ và tên đầy đủ"
                        aria-invalid={errors.customer_name ? 'true' : 'false'}
                      />
                      {errors.customer_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.customer_name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="input-label" htmlFor="customer_phone">
                        Số điện thoại
                      </label>
                      <input
                        id="customer_phone"
                        type="tel"
                        {...register('customer_phone', {
                          required: 'Vui lòng nhập số điện thoại',
                          pattern: {
                            value: /^[0-9]{10,11}$/,
                            message: 'Số điện thoại không hợp lệ'
                          }
                        })}
                        autoComplete="tel"
                        inputMode="tel"
                        maxLength={11}
                        className={`input-field ${errors.customer_phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Ví dụ: 0912345678"
                        aria-invalid={errors.customer_phone ? 'true' : 'false'}
                      />
                      {errors.customer_phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.customer_phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="input-label" htmlFor="customer_email">
                      Email
                    </label>
                    <input
                      id="customer_email"
                      type="email"
                      {...register('customer_email', {
                        required: 'Vui lòng nhập email',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email không hợp lệ'
                        }
                      })}
                      autoComplete="email"
                      maxLength={120}
                      className={`input-field ${errors.customer_email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Nhập email nhận thông báo"
                      aria-invalid={errors.customer_email ? 'true' : 'false'}
                    />
                    {errors.customer_email && (
                      <p className="text-red-500 text-sm mt-1">{errors.customer_email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="input-label" htmlFor="shipping_address">
                      Địa chỉ giao hàng
                    </label>
                    <textarea
                      id="shipping_address"
                      {...register('shipping_address', { required: 'Vui lòng nhập địa chỉ giao hàng' })}
                      autoComplete="street-address"
                      minLength={6}
                      className={`input-field min-h-[120px] ${errors.shipping_address ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      rows={3}
                      placeholder="Nhập địa chỉ giao hàng chi tiết"
                      aria-invalid={errors.shipping_address ? 'true' : 'false'}
                    />
                    {errors.shipping_address && (
                      <p className="text-red-500 text-sm mt-1">{errors.shipping_address.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="input-label" htmlFor="notes">
                      Ghi chú cho đơn hàng <span className="text-[#888888] font-normal">(tùy chọn)</span>
                    </label>
                    <textarea
                      id="notes"
                      {...register('notes')}
                      className="input-field min-h-[100px]"
                      rows={2}
                      placeholder="Ghi chú thêm cho đơn hàng"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#222222] border border-[#555555] rounded-xl shadow-xl p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4"
                >
                  <div className="space-y-1.5">
                    <h2 className="text-base sm:text-lg font-bold text-[#ffffff]">Phương thức thanh toán</h2>
                    <p className="text-xs text-[#cccccc]">Các giao dịch được mã hóa bằng chuẩn bảo mật SSL.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="border border-[#555555] rounded-lg p-4 hover:border-[#d4af37] transition-colors duration-300">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="qr_code"
                          value="qr_code"
                          {...register('payment_method')}
                          defaultChecked
                          className="text-[#d4af37] focus:ring-[#d4af37]"
                        />
                        <label htmlFor="qr_code" className="flex items-center space-x-3 cursor-pointer">
                          <CreditCard className="w-6 h-6 text-[#d4af37]" />
                          <div>
                            <p className="font-medium text-[#ffffff]">Thanh toán bằng mã QR</p>
                            <p className="text-sm text-[#cccccc]">Quét mã QR để thanh toán nhanh chóng</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* QR Code Placeholder */}
                    <div className="mt-6 p-6 bg-[#333333] rounded-lg text-center">
                      <div className="w-44 h-44 sm:w-48 sm:h-48 bg-[#222222] border-2 border-dashed border-[#555555] rounded-lg mx-auto flex items-center justify-center mb-4">
                        <div className="text-center">
                          <CreditCard className="w-12 h-12 text-[#888888] mx-auto mb-2" />
                          <p className="text-sm text-[#888888]">Mã QR sẽ hiển thị ở đây</p>
                        </div>
                      </div>
                      <p className="text-sm text-[#cccccc]">
                        Quét mã QR bằng ứng dụng ngân hàng để thanh toán
                      </p>
                    </div>

                    {/* Security Notice */}
                    <div className="flex items-start space-x-3 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                      <Shield className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-400">Thanh toán an toàn</p>
                        <p className="text-xs text-green-400/80 mt-1">
                          Thông tin thanh toán của bạn được mã hóa và bảo mật
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Order Confirmation */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#222222] border border-[#555555] rounded-xl shadow-xl p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4"
                >
                  <div className="space-y-1.5">
                    <h2 className="text-base sm:text-lg font-bold text-[#ffffff]">Xác nhận đơn hàng</h2>
                    <p className="text-xs text-[#cccccc]">Vui lòng kiểm tra kỹ thông tin trước khi hoàn tất.</p>
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-[#ffffff]">Tóm tắt đơn hàng</h3>
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-[#555555]">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                            loading="lazy"
                          />
                          <div>
                            <p className="font-medium text-[#ffffff]">{item.name}</p>
                            <p className="text-sm text-[#cccccc]">{item.brand} • {item.volume_ml}ml</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-[#ffffff]">{currencyFormatter.format(Number(item.price || 0))}</p>
                          <p className="text-sm text-[#cccccc]">x{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t border-[#555555] pt-4">
                    <div className="flex justify-between text-lg font-bold text-[#ffffff]">
                      <span>Tổng cộng</span>
                      <span>{currencyFormatter.format(Number(getTotalPrice() || 0))}</span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  {orderData && (
                    <div className="p-4 bg-[#333333] rounded-lg border border-[#555555]">
                      <h3 className="font-semibold text-[#ffffff] mb-2">Thông tin giao hàng</h3>
                      <div className="space-y-1 text-sm text-[#cccccc]">
                        <p><strong>Tên:</strong> {orderData.customer_name}</p>
                        <p><strong>Email:</strong> {orderData.customer_email}</p>
                        <p><strong>SĐT:</strong> {orderData.customer_phone}</p>
                        <p><strong>Địa chỉ:</strong> {orderData.shipping_address}</p>
                        {orderData.notes && <p><strong>Ghi chú:</strong> {orderData.notes}</p>}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-2">
                <button
                  type="button"
                  onClick={goBack}
                  className="btn-secondary sm:w-auto w-full"
                >
                  Quay lại
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary sm:w-auto w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang xử lý...' :
                   currentStep === 3 ? 'Hoàn tất đặt hàng' : 'Tiếp tục'}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#222222] border border-[#555555] rounded-xl shadow-xl p-3 sm:p-4 sticky top-24 space-y-3 sm:space-y-4">
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-[#ffffff]">Đơn hàng của bạn</h2>
                <p className="text-xs text-[#cccccc]">{getTotalItems()} sản phẩm đang chờ thanh toán.</p>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#ffffff] truncate">{item.name}</p>
                      <p className="text-sm text-[#cccccc]">{item.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#ffffff]">{currencyFormatter.format(Number(item.price || 0))}</p>
                      <p className="text-sm text-[#cccccc]">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#555555] pt-4 space-y-3">
                <div className="flex justify-between text-base text-[#eeeeee]">
                  <span>Tạm tính</span>
                  <span>{currencyFormatter.format(Number(getTotalPrice() || 0))}</span>
                </div>
                <div className="flex justify-between text-base text-[#eeeeee]">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-400">Miễn phí</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-[#ffffff]">
                  <span>Tổng cộng</span>
                  <span>{currencyFormatter.format(Number(getTotalPrice() || 0))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
