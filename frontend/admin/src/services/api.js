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

  return '/api';
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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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

export const fetchAdminFeedbacks = async (params = {}) => {
  try {
    const response = await api.get('/admin/feedbacks', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin feedbacks:', error);
    throw error;
  }
};

export const createFeedbackNote = async (data) => {
  try {
    const response = await api.post('/admin/feedbacks', data);
    return response.data;
  } catch (error) {
    console.error('Error creating admin feedback:', error);
    throw error;
  }
};

export const updateFeedback = async (id, data) => {
  try {
    const response = await api.patch(`/admin/feedbacks/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating admin feedback:', error);
    throw error;
  }
};

export const fetchAdminCustomers = async (params = {}) => {
  try {
    const response = await api.get('/admin/customers', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin customers:', error);
    throw error;
  }
};

export const fetchCustomerDetail = async (email) => {
  try {
    const response = await api.get(`/admin/customers/${encodeURIComponent(email)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer detail:', error);
    throw error;
  }
};

export const updateCustomerProfile = async (email, data) => {
  try {
    const response = await api.put(`/admin/customers/${encodeURIComponent(email)}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating customer profile:', error);
    throw error;
  }
};

export const fetchAdminBlogs = async (params = {}) => {
  try {
    const response = await api.get('/admin/blogs', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    throw error;
  }
};

export const createBlogPost = async (data) => {
  try {
    const response = await api.post('/admin/blogs', data);
    return response.data;
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
};

export const updateBlogPost = async (id, data) => {
  try {
    const response = await api.put(`/admin/blogs/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
};

export const deleteBlogPost = async (id) => {
  try {
    const response = await api.delete(`/admin/blogs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
};

export default api;
