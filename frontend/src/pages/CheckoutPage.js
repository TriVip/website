import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Check, CreditCard, Truck, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/api';
import LayoutContainer from '../components/LayoutContainer';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const steps = [
    { id: 1, title: 'Thông tin giao hàng', icon: Truck },
    { id: 2, title: 'Phương thức thanh toán', icon: CreditCard },
    { id: 3, title: 'Xác nhận đơn hàng', icon: Check },
  ];

  const onSubmit = async (data) => {
    if (currentStep === 1) {
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

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <LayoutContainer className="py-6">
        <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={goBack}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-amber-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Thanh toán</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-amber-600 border-amber-600 text-white' 
                      : isActive 
                        ? 'border-amber-600 text-amber-600' 
                        : 'border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-amber-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                      isCompleted ? 'bg-amber-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="on">
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin giao hàng</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        {...register('customer_name', { required: 'Vui lòng nhập họ và tên' })}
                        className="input-field"
                        placeholder="Nhập họ và tên"
                        autoComplete="name"
                        aria-label="Họ và tên"
                      />
                      {errors.customer_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.customer_name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        {...register('customer_phone', {
                          required: 'Vui lòng nhập số điện thoại',
                          pattern: {
                            value: /^[0-9]{10,11}$/,
                            message: 'Số điện thoại không hợp lệ'
                          }
                        })}
                        className="input-field"
                        placeholder="Nhập số điện thoại"
                        autoComplete="tel"
                        inputMode="tel"
                        maxLength={11}
                        aria-label="Số điện thoại"
                      />
                      {errors.customer_phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.customer_phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...register('customer_email', {
                        required: 'Vui lòng nhập email',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email không hợp lệ'
                        }
                      })}
                      className="input-field"
                      placeholder="Nhập email"
                      autoComplete="email"
                      aria-label="Email"
                    />
                    {errors.customer_email && (
                      <p className="text-red-500 text-sm mt-1">{errors.customer_email.message}</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ giao hàng *
                    </label>
                    <textarea
                      {...register('shipping_address', { required: 'Vui lòng nhập địa chỉ giao hàng' })}
                      className="input-field"
                      rows={3}
                      placeholder="Nhập địa chỉ giao hàng chi tiết"
                      autoComplete="street-address"
                      aria-label="Địa chỉ giao hàng"
                    />
                    {errors.shipping_address && (
                      <p className="text-red-500 text-sm mt-1">{errors.shipping_address.message}</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      {...register('notes')}
                      className="input-field"
                      rows={2}
                      placeholder="Ghi chú thêm cho đơn hàng"
                      autoComplete="off"
                      aria-label="Ghi chú đơn hàng"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Phương thức thanh toán</h2>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-300 rounded-lg p-4 hover:border-amber-500 transition-colors duration-300">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="qr_code"
                          value="qr_code"
                          {...register('payment_method')}
                          defaultChecked
                          className="text-amber-600 focus:ring-amber-500"
                          aria-describedby="qr_code_description"
                        />
                        <label htmlFor="qr_code" className="flex items-center space-x-3 cursor-pointer">
                          <CreditCard className="w-6 h-6 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">Thanh toán bằng mã QR</p>
                            <p id="qr_code_description" className="text-sm text-gray-600">Quét mã QR để thanh toán nhanh chóng</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* QR Code Placeholder */}
                    <div className="mt-6 p-6 bg-gray-50 rounded-lg text-center">
                      <div className="w-48 h-48 bg-white border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center mb-4">
                        <div className="text-center">
                          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Mã QR sẽ hiển thị ở đây</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Quét mã QR bằng ứng dụng ngân hàng để thanh toán
                      </p>
                    </div>

                    {/* Security Notice */}
                    <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                      <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Thanh toán an toàn</p>
                        <p className="text-xs text-green-700 mt-1">
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
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Xác nhận đơn hàng</h2>
                  
                  {/* Order Summary */}
                  <div className="space-y-3 mb-4">
                    <h3 className="font-semibold text-gray-900">Tóm tắt đơn hàng</h3>
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">{item.brand} • {item.volume_ml}ml</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${item.price}</p>
                          <p className="text-sm text-gray-600">x{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Tổng cộng</span>
                      <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  {orderData && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Thông tin giao hàng</h3>
                      <div className="space-y-1 text-sm text-gray-600">
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
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="btn-secondary"
                >
                  Quay lại
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang xử lý...' : 
                   currentStep === 3 ? 'Hoàn tất đặt hàng' : 'Tiếp tục'}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Đơn hàng của bạn</h2>
              
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${item.price}</p>
                      <p className="text-sm text-gray-600">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Tổng cộng</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </LayoutContainer>
    </div>
  );
};

export default CheckoutPage;
