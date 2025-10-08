import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Users,
  DollarSign,
  Package2,
  RotateCcw,
  Loader2,
  AlertCircle,
  Inbox
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchDashboardData } from '../services/api';

const roleLabels = {
  admin: 'Quản trị viên',
  sale: 'Nhân viên bán hàng'
};

const roleBadgeClasses = {
  admin: 'bg-emerald-100 text-emerald-700',
  sale: 'bg-blue-100 text-blue-700'
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const {
    data: dashboardData,
    isLoading,
    isError,
    refetch
  } = useQuery('dashboard-data', fetchDashboardData, {
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
    staleTime: 60000
  });

  useEffect(() => {
    if (dashboardData) {
      setLastUpdated(new Date());
    }
  }, [dashboardData]);

  useEffect(() => {
    if (dashboardData?.user?.role === 'sale' && location.pathname.startsWith('/products')) {
      navigate('/orders', { replace: true });
    }
  }, [dashboardData?.user?.role, location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const menuItems = useMemo(() => {
    const commonItems = [
      { name: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Đơn hàng', path: '/orders', icon: ShoppingCart }
    ];

    if (dashboardData?.user?.role === 'admin') {
      return [
        ...commonItems,
        { name: 'Sản phẩm', path: '/products', icon: Package }
      ];
    }

    return commonItems;
  }, [dashboardData?.user?.role]);

  const userRole = dashboardData?.user?.role;
  const roleLabel = roleLabels[userRole] || 'Thành viên';
  const badgeClass = roleBadgeClasses[userRole] || 'bg-slate-100 text-slate-700';
  const formattedLastUpdated = lastUpdated
    ? lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : '--:--';
  const isInitialLoading = isLoading && !dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-slate-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gray-600 opacity-50" />
        </div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur border-r border-slate-100 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center shadow-inner">
              <span className="text-white font-semibold text-lg">OMS</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">Rare Parfume</p>
              <p className="text-xs text-slate-500">Bảng điều khiển</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-amber-50 text-amber-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <span className={`p-2 rounded-md ${
                  location.pathname.startsWith(item.path)
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }`}>
                  <Icon className="w-5 h-5" />
                </span>
                <span className="font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Đăng nhập</p>
            <p className="text-sm font-semibold text-slate-900">{dashboardData?.user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-500 truncate">{dashboardData?.user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                aria-label="Mở menu"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <p className="text-sm text-slate-500">Xin chào,</p>
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-slate-900">
                    {dashboardData?.user?.name || 'Admin'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${badgeClass}`}>
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isLoading && (
                <span className="hidden sm:flex items-center text-xs text-amber-600 space-x-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang đồng bộ...</span>
                </span>
              )}
              <div className="hidden sm:block text-xs text-slate-500">
                Cập nhật: <span className="font-medium text-slate-700">{formattedLastUpdated}</span>
              </div>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tải lại</span>
              </button>
            </div>
          </div>
          {isError && (
            <div className="bg-red-50 border-t border-red-100 px-4 sm:px-6 lg:px-8 py-2 text-sm text-red-600 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>Không thể tải dữ liệu tổng quan. Vui lòng thử lại.</span>
            </div>
          )}
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {isInitialLoading ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="flex flex-col items-center space-y-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p>Đang tải bảng điều khiển...</p>
              </div>
            </div>
          ) : (
            <Outlet context={{ dashboardData, isLoading }} />
          )}
        </main>
      </div>
    </div>
  );
};

const AdminDashboardPage = () => {
  const { data: dashboardData, isLoading, isError, refetch } = useQuery('dashboard-data', fetchDashboardData, {
    refetchOnWindowFocus: false,
    staleTime: 60000
  });

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat('vi-VN'),
    []
  );

  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'USD' }),
    []
  );

  const stats = useMemo(() => [
    {
      name: 'Tổng sản phẩm',
      value: numberFormatter.format(dashboardData?.stats?.total_products || 0),
      icon: Package2,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      name: 'Tổng đơn hàng',
      value: numberFormatter.format(dashboardData?.stats?.total_orders || 0),
      icon: ShoppingCart,
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      name: 'Doanh thu',
      value: currencyFormatter.format(Number(dashboardData?.stats?.total_revenue || 0)),
      icon: DollarSign,
      color: 'text-amber-600 bg-amber-100'
    },
    {
      name: 'Khách hàng',
      value: numberFormatter.format(dashboardData?.stats?.total_customers || 0),
      icon: Users,
      color: 'text-purple-600 bg-purple-100'
    }
  ], [currencyFormatter, dashboardData?.stats, numberFormatter]);

  const revenueChart = useMemo(() => {
    if (dashboardData?.revenue_chart?.length) {
      return dashboardData.revenue_chart;
    }

    return [
      { day: 'T2', revenue: 1200 },
      { day: 'T3', revenue: 1800 },
      { day: 'T4', revenue: 1500 },
      { day: 'T5', revenue: 2200 },
      { day: 'T6', revenue: 1900 },
      { day: 'T7', revenue: 2500 },
      { day: 'CN', revenue: 2100 }
    ];
  }, [dashboardData?.revenue_chart]);

  const recentOrders = useMemo(
    () => (dashboardData?.recent_orders || []).slice(0, 5),
    [dashboardData?.recent_orders]
  );

  const statusLabels = {
    pending: 'Chờ xử lý',
    paid: 'Đã thanh toán',
    shipped: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy'
  };

  const statusClasses = {
    pending: 'bg-amber-100 text-amber-800',
    paid: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700'
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isError) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center text-red-600">
        <div className="flex flex-col items-center space-y-3">
          <AlertCircle className="w-10 h-10" />
          <p className="text-lg font-semibold">Không thể tải dữ liệu tổng quan</p>
          <p className="text-sm text-red-500">Vui lòng kiểm tra kết nối và thử lại.</p>
          <button
            onClick={() => refetch()}
            className="btn-primary px-5"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tổng quan hoạt động</h1>
          <p className="text-slate-500">Theo dõi tình hình kinh doanh và hiệu suất đơn hàng gần đây.</p>
        </div>
        <button
          onClick={() => refetch()}
          className="btn-primary flex items-center space-x-2 self-start md:self-auto"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      <section>
        {isLoading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 card-hover"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{stat.name}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Doanh thu 7 ngày qua</h2>
              <p className="text-sm text-slate-500">Cập nhật tự động sau mỗi 30 giây</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChart} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value) => [currencyFormatter.format(value), 'Doanh thu']}
                    labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#f59e0b' }}
                    activeDot={{ r: 6, stroke: '#f97316', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Thông tin nhanh</h2>
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Tài khoản</span>
              <span className="font-medium text-slate-900">{dashboardData?.user?.name || '---'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Vai trò</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadgeClasses[dashboardData?.user?.role] || 'bg-slate-100 text-slate-700'}`}>
                {roleLabels[dashboardData?.user?.role] || 'Chưa xác định'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Đơn hàng trong ngày</span>
              <span className="font-medium text-slate-900">{numberFormatter.format(dashboardData?.stats?.orders_today || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Doanh thu hôm nay</span>
              <span className="font-medium text-emerald-600">{currencyFormatter.format(Number(dashboardData?.stats?.revenue_today || 0))}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Đơn hàng gần đây</h2>
          <span className="text-sm text-slate-500">Hiển thị 5 đơn hàng mới nhất</span>
        </div>

        {isLoading ? (
          <OrdersSkeleton />
        ) : recentOrders.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-100">
                  <th className="py-3 px-4">Mã đơn hàng</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Tổng tiền</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-900">{order.order_number}</p>
                      <p className="text-xs text-slate-500">{order.payment_method}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-slate-900">{order.customer_name}</p>
                      <p className="text-xs text-slate-500">{order.customer_email}</p>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-900">
                      {currencyFormatter.format(Number(order.total_amount || 0))}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        statusClasses[order.status] || 'bg-slate-100 text-slate-700'
                      }`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-500">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title="Chưa có đơn hàng"
            description="Khi có đơn hàng mới, bạn sẽ nhìn thấy tại đây."
          />
        )}
      </section>
    </div>
  );
};

const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-pulse">
        <div className="h-4 w-24 bg-slate-200 rounded mb-4" />
        <div className="h-6 w-32 bg-slate-200 rounded" />
      </div>
    ))}
  </div>
);

const OrdersSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
    ))}
  </div>
);

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 space-y-3">
    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
      <Icon className="w-6 h-6 text-slate-400" />
    </div>
    <p className="text-lg font-semibold text-slate-700">{title}</p>
    <p className="text-sm text-slate-500 max-w-sm">{description}</p>
  </div>
);

export { AdminLayout, AdminDashboardPage };
