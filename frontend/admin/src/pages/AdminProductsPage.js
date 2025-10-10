import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Loader2,
  PackageSearch,
  Sparkles,
  X
} from 'lucide-react';
import {
  fetchAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../services/api';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang bán' },
  { value: 'inactive', label: 'Tạm ẩn' }
];

const AdminProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  const {
    data: productsData,
    isLoading,
    isError,
    refetch
  } = useQuery(['admin-products', currentPage, searchTerm], () => fetchAdminProducts({
    page: currentPage,
    limit: 10,
    search: searchTerm
  }), {
    keepPreviousData: true
  });

  const products = useMemo(
    () => productsData?.products || [],
    [productsData?.products]
  );
  const pagination = productsData?.pagination || {};
  const pageSize = pagination.limit || 10;
  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'USD' }),
    []
  );

  const filteredProducts = useMemo(() => {
    if (statusFilter === 'active') {
      return products.filter((product) => product.is_active);
    }
    if (statusFilter === 'inactive') {
      return products.filter((product) => !product.is_active);
    }
    return products;
  }, [products, statusFilter]);

  const totalCount = pagination.total_count || 0;
  const hasResults = filteredProducts.length > 0;
  const fromItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toItem = Math.min(currentPage * pageSize, totalCount);

  const createMutation = useMutation(createProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-products');
      toast.success('Sản phẩm đã được tạo thành công!');
      setShowAddForm(false);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi tạo sản phẩm');
    }
  });

  const updateMutation = useMutation(
    ({ id, data }) => updateProduct(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-products');
        toast.success('Sản phẩm đã được cập nhật thành công!');
        setEditingProduct(null);
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi cập nhật sản phẩm');
      }
    }
  );

  const deleteMutation = useMutation(deleteProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-products');
      toast.success('Sản phẩm đã được xóa thành công!');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa sản phẩm');
    }
  });

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleVisibility = (product) => {
    updateMutation.mutate({ id: product.id, data: { is_active: !product.is_active } });
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  if (isError) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center text-red-600">
        <div className="flex flex-col items-center space-y-3">
          <PackageSearch className="w-10 h-10" />
          <p className="text-lg font-semibold">Không thể tải danh sách sản phẩm</p>
          <p className="text-sm text-red-500">Vui lòng thử lại sau ít phút.</p>
          <button onClick={() => refetch()} className="btn-primary px-5">Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý sản phẩm</h1>
          <p className="text-slate-500">Thêm mới, chỉnh sửa và kiểm soát tồn kho sản phẩm một cách nhanh chóng.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : 'text-slate-500'}`} />
            <span>Làm mới</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, thương hiệu hoặc danh mục..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  statusFilter === tab.value
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-500">
          <div className="bg-slate-50 rounded-xl p-4 flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <p className="font-semibold text-slate-700">Tổng sản phẩm</p>
              <p className="text-slate-500">{totalCount} sản phẩm đang quản lý</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 flex items-center space-x-3">
            <Eye className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="font-semibold text-slate-700">Đang hiển thị</p>
              <p className="text-slate-500">{products.filter((p) => p.is_active).length} sản phẩm</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 flex items-center space-x-3">
            <EyeOff className="w-5 h-5 text-rose-500" />
            <div>
              <p className="font-semibold text-slate-700">Tạm ẩn</p>
              <p className="text-slate-500">{products.filter((p) => !p.is_active).length} sản phẩm</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        {isLoading ? (
          <ProductsTableSkeleton />
        ) : hasResults ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="py-4 px-6">Sản phẩm</th>
                  <th className="py-4 px-6">Thương hiệu</th>
                  <th className="py-4 px-6">Giá</th>
                  <th className="py-4 px-6">Tồn kho</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_urls?.[0] || '/images/placeholder.jpg'}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.volume_ml}ml • {product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{product.brand}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {currencyFormatter.format(Number(product.price || 0))}
                    </td>
                    <td className="py-4 px-6 text-slate-600">{product.stock_quantity}</td>
                    <td className="py-4 px-6">
                      <StatusPill isActive={product.is_active} isFeatured={product.is_featured} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleVisibility(product)}
                          className={`p-2 rounded-lg transition-colors ${
                            product.is_active
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-rose-600 hover:bg-rose-50'
                          }`}
                          title={product.is_active ? 'Ẩn sản phẩm' : 'Hiển thị sản phẩm'}
                        >
                          {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Không có sản phẩm phù hợp"
            description="Hãy thử thay đổi bộ lọc hoặc thêm sản phẩm mới để bắt đầu danh mục."
          />
        )}

        {hasResults && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 border-t border-slate-100">
            <div className="text-sm text-slate-500">
              Hiển thị {fromItem}-{toItem} trên tổng số {totalCount} sản phẩm
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                Trước
              </button>
              <span className="text-sm text-slate-600">
                Trang {currentPage} / {pagination.total_pages || 1}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.total_pages || 1))}
                disabled={currentPage === (pagination.total_pages || 1)}
                className="px-3 py-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {(showAddForm || editingProduct) && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowAddForm(false);
            setEditingProduct(null);
          }}
          onSubmit={(data) => {
            if (editingProduct) {
              updateMutation.mutate({ id: editingProduct.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isLoading={createMutation.isLoading || updateMutation.isLoading}
        />
      )}
    </div>
  );
};

const StatusPill = ({ isActive, isFeatured }) => (
  <div className="flex flex-col gap-1">
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
      isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
    }`}>
      {isActive ? 'Đang bán' : 'Tạm ẩn'}
    </span>
    {isFeatured && (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700">
        Nổi bật
      </span>
    )}
  </div>
);

const ProductsTableSkeleton = () => (
  <div className="space-y-3 p-6">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
    ))}
  </div>
);

const EmptyState = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 text-slate-500">
    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
      <PackageSearch className="w-7 h-7 text-slate-400" />
    </div>
    <p className="text-lg font-semibold text-slate-700">{title}</p>
    <p className="text-sm text-slate-500 max-w-md">{description}</p>
  </div>
);

const ProductForm = ({ product, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    description: product?.description || '',
    price: product?.price || '',
    stock_quantity: product?.stock_quantity || '',
    volume_ml: product?.volume_ml || '',
    category: product?.category || 'perfume',
    is_featured: product?.is_featured || false,
    is_active: product?.is_active !== false,
    image_urls: product?.image_urls?.join(', ') || ''
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      stock_quantity: Number(formData.stock_quantity),
      volume_ml: Number(formData.volume_ml),
      image_urls: formData.image_urls
        ? formData.image_urls.split(',').map((url) => url.trim()).filter(Boolean)
        : []
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-slate-900/50" onClick={onClose} aria-hidden="true" />
        <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-xl font-semibold text-slate-900">
              {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" aria-label="Đóng">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tên sản phẩm *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Thương hiệu *</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="input-field"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Hình ảnh (URL, phân cách bằng dấu phẩy)</label>
              <textarea
                value={formData.image_urls}
                onChange={(e) => handleChange('image_urls', e.target.value)}
                className="input-field"
                rows={2}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Giá *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tồn kho *</label>
                <input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => handleChange('stock_quantity', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Dung tích (ml) *</label>
                <input
                  type="number"
                  value={formData.volume_ml}
                  onChange={(e) => handleChange('volume_ml', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => handleChange('is_featured', e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="ml-2 text-sm text-slate-700">Sản phẩm nổi bật</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="ml-2 text-sm text-slate-700">Hiển thị trên cửa hàng</span>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="btn-secondary">
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isLoading ? 'Đang lưu...' : 'Lưu sản phẩm'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProductsPage;
