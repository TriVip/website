import axios from 'axios';

const getBaseURL = () => {
  const envUrl = process.env.REACT_APP_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    const isLocalhost = ['localhost', '127.0.0.1'].includes(hostname);

    if (!isLocalhost) {
      return `${origin.replace(/\/$/, '')}/api`;
    }
  }

  return 'http://localhost:5000/api';
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Products API
export const fetchProducts = async (params = {}) => {
  try {
    const response = await api.get('/products', { params });
    // Backend returns { products: [...], pagination: {...} }
    return response.data || { products: [], pagination: {} };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchProduct = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const fetchFeaturedProducts = async () => {
  try {
    const response = await api.get('/products/featured/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

export const fetchBrands = async () => {
  try {
    const response = await api.get('/products/brands/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const response = await api.get('/products/categories/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Orders API
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const fetchOrder = async (orderNumber) => {
  try {
    const response = await api.get(`/orders/${orderNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const fetchOrdersByEmail = async (email) => {
  try {
    const response = await api.get('/orders', { params: { email } });
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Admin API
export const adminLogin = async (credentials) => {
  try {
    const response = await api.post('/admin/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const fetchAdminOrders = async (params = {}) => {
  try {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const response = await api.put(`/admin/orders/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const fetchAdminProducts = async (params = {}) => {
  try {
    const response = await api.get('/admin/products', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin products:', error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await api.post('/admin/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/admin/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const fetchDashboardData = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/admin/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

// Blog API (placeholder - can be implemented later)
export const fetchBlogPosts = async (params = {}) => {
  try {
    // This would be implemented when blog API is ready
    // For now, return mock data
    return [
      {
        id: 1,
        title: 'The Art of Choosing Your Signature Scent',
        slug: 'art-of-choosing-signature-scent',
        excerpt: 'Discover how to find the perfect perfume that represents your unique personality and style.',
        featured_image: '/images/blog-signature-scent.jpg',
        author: 'Rare Parfume Team',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Understanding Fragrance Notes: A Complete Guide',
        slug: 'understanding-fragrance-notes-guide',
        excerpt: 'Learn about top, middle, and base notes and how they work together to create beautiful fragrances.',
        featured_image: '/images/blog-fragrance-notes.jpg',
        author: 'Rare Parfume Team',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        title: 'The History of Perfume: From Ancient Times to Modern Luxury',
        slug: 'history-of-perfume-ancient-to-modern',
        excerpt: 'Explore the fascinating journey of perfume from ancient civilizations to modern luxury brands.',
        featured_image: '/images/blog-perfume-history.jpg',
        author: 'Rare Parfume Team',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }
};

export const fetchBlogPost = async (slug) => {
  try {
    // This would be implemented when blog API is ready
    // For now, return mock data
    return {
      id: 1,
      title: 'The Art of Choosing Your Signature Scent',
      slug: slug,
      content: 'Choosing a signature scent is like choosing a piece of art that represents your personality...',
      excerpt: 'Discover how to find the perfect perfume that represents your unique personality and style.',
      featured_image: '/images/blog-signature-scent.jpg',
      author: 'Rare Parfume Team',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    throw error;
  }
};

export default api;
