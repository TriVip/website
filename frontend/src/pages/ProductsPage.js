import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { fetchProducts, fetchBrands, fetchCategories } from '../services/api';
import toast from 'react-hot-toast';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || '',
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    volume: searchParams.get('volume') || '',
    featured: searchParams.get('featured') || '',
  });
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch brands and categories
  const { data: brands = [] } = useQuery('brands', fetchBrands);
  const { data: categories = [] } = useQuery('categories', fetchCategories);

  // Fetch products with filters
  const { data: productsData, isLoading, error } = useQuery(
    ['products', filters, currentPage],
    () => {
      // Remove empty filter values before sending to API
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      return fetchProducts({ ...cleanFilters, page: currentPage, limit: 12 });
    },
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      retry: 2,
      onError: (error) => {
        console.error('Error fetching products:', error);
        toast.error('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
      }
    }
  );

  const products = productsData?.products || [];
  const pagination = productsData?.pagination || {};

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (currentPage > 1) params.set('page', currentPage);
    setSearchParams(params);
  }, [filters, currentPage, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = e.target.search.value;
    handleFilterChange('search', searchValue);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      brand: '',
      category: '',
      min_price: '',
      max_price: '',
      volume: '',
      featured: '',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const volumeOptions = [50, 100, 150, 200];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Có lỗi xảy ra</h2>
          <p className="text-gray-600">Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222222] pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        {/* Header */}
        <div className="mb-3 sm:mb-4">
          <h1 className="text-lg sm:text-xl font-bold text-[#ffffff] mb-1.5">Tất cả sản phẩm</h1>
          <p className="text-xs sm:text-sm text-[#cccccc]">
            Khám phá bộ sưu tập nước hoa niche độc đáo của chúng tôi
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-5">
          {/* Filters Sidebar */}
          <div className={`lg:w-72 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-[#222222] border border-[#555555] rounded-xl shadow-lg p-3 sm:p-4 lg:p-5 sticky top-24">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-sm sm:text-base font-semibold text-[#ffffff]">Bộ lọc</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-3 sm:mb-4">
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    placeholder="Tìm kiếm sản phẩm..."
                    defaultValue={filters.search}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-[#555555] bg-[#333333] text-[#ffffff] placeholder-[#888888] rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all"
                  />
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-[#888888] w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </form>

              {/* Brand Filter */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-[#eeeeee] mb-1.5">
                  Thương hiệu
                </label>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-[#555555] bg-[#333333] text-[#ffffff] rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all"
                >
                  <option value="">Tất cả thương hiệu</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-[#eeeeee] mb-1.5">
                  Danh mục
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-[#555555] bg-[#333333] text-[#ffffff] rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-[#eeeeee] mb-1.5">
                  Khoảng giá
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Giá tối thiểu"
                    value={filters.min_price}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-[#555555] bg-[#333333] text-[#ffffff] placeholder-[#888888] rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Giá tối đa"
                    value={filters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-[#555555] bg-[#333333] text-[#ffffff] placeholder-[#888888] rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all"
                  />
                </div>
              </div>

              {/* Volume Filter */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-[#eeeeee] mb-1.5">
                  Dung tích
                </label>
                <select
                  value={filters.volume}
                  onChange={(e) => handleFilterChange('volume', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-[#555555] bg-[#333333] text-[#ffffff] rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all"
                >
                  <option value="">Tất cả dung tích</option>
                  {volumeOptions.map((volume) => (
                    <option key={volume} value={volume}>
                      {volume}ml
                    </option>
                  ))}
                </select>
              </div>

              {/* Featured Filter */}
              <div className="mb-3 sm:mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.featured === 'true'}
                    onChange={(e) => handleFilterChange('featured', e.target.checked ? 'true' : '')}
                    className="w-3.5 h-3.5 rounded border-[#555555] bg-[#333333] text-[#d4af37] focus:ring-[#d4af37]"
                  />
                  <span className="ml-2 text-xs sm:text-sm text-[#eeeeee]">Chỉ sản phẩm nổi bật</span>
                </label>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2 px-3 sm:px-4 text-xs sm:text-sm border border-[#555555] rounded-lg text-[#eeeeee] hover:bg-[#333333] transition-colors duration-300 font-medium"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-[#222222] border border-[#555555] rounded-xl shadow-lg p-2.5 sm:p-3 mb-3 sm:mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 gap-2 sm:gap-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 border border-[#555555] bg-[#333333] rounded-lg hover:bg-[#444444] text-[#eeeeee] text-xs sm:text-sm transition-colors"
                  >
                    <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Bộ lọc</span>
                  </button>
                  
                  {pagination.total_count && (
                    <span className="text-xs text-[#888888]">
                      Hiển thị {products.length} trong tổng số {pagination.total_count} sản phẩm
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-xs text-[#888888]">Xem:</span>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-[#333333] text-[#d4af37] border border-[#555555]' : 'text-[#888888] hover:text-[#d4af37] hover:bg-[#333333]'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-[#333333] text-[#d4af37] border border-[#555555]' : 'text-[#888888] hover:text-[#d4af37] hover:bg-[#333333]'
                    }`}
                  >
                    <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12 sm:py-16">
                <div className="loading-spinner"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="text-[#888888] mb-4 sm:mb-6">
                  <Search className="w-16 h-16 sm:w-20 sm:h-20 mx-auto" />
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-[#ffffff] mb-2 sm:mb-3">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-sm sm:text-base text-[#cccccc] mb-4 sm:mb-6">
                  Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="btn-primary"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className={`grid gap-2 sm:gap-3 lg:gap-4 xl:gap-5 ${
                    viewMode === 'grid'
                      ? 'grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                      : 'grid-cols-1'
                  }`}
                >
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="h-full"
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                  <div className="flex justify-center items-center flex-wrap gap-2 sm:gap-3 mt-6 sm:mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-[#555555] bg-[#333333] text-[#eeeeee] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#444444] transition-colors font-medium"
                    >
                      Trước
                    </button>
                    
                    {[...Array(pagination.total_pages)].map((_, index) => {
                      const page = index + 1;
                      const isCurrentPage = page === currentPage;
                      
                      // Show only a few pages around current page
                      if (
                        page === 1 ||
                        page === pagination.total_pages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg transition-colors font-medium ${
                              isCurrentPage
                                ? 'bg-[#d4af37] text-[#222222]'
                                : 'border border-[#555555] bg-[#333333] text-[#eeeeee] hover:bg-[#444444]'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return <span key={page} className="px-2 text-[#888888]">...</span>;
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.total_pages))}
                      disabled={currentPage === pagination.total_pages}
                      className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-[#555555] bg-[#333333] text-[#eeeeee] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#444444] transition-colors font-medium"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
