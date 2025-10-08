import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const sanitizeSearchQuery = (value) => value.replace(/[<>]/g, '').trim();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', isMenuOpen);
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const sanitized = sanitizeSearchQuery(searchQuery);
    if (sanitized) {
      navigate(`/products?search=${encodeURIComponent(sanitized)}`);
      setSearchQuery('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Sản phẩm', path: '/products' },
    { name: 'Blog', path: '/blog' },
    { name: 'Liên hệ', path: '/contact' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
        : 'bg-gradient-to-r from-amber-600/90 to-amber-800/90 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-white to-amber-100 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <span className="text-amber-600 font-bold text-sm sm:text-lg">R</span>
            </div>
            <span className={`text-lg sm:text-xl lg:text-2xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}>
              <span className="hidden sm:inline">Rare Parfume</span>
              <span className="sm:hidden">RP</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                  isScrolled 
                    ? 'text-gray-700 hover:text-amber-600 hover:bg-amber-50' 
                    : 'text-white hover:text-amber-200 hover:bg-white/20'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch} className="w-full" role="search" aria-label="Tìm kiếm sản phẩm">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm nước hoa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(sanitizeSearchQuery(e.target.value))}
                  autoComplete="off"
                  aria-label="Tìm kiếm nước hoa"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-lg ${
                    isScrolled
                      ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      : 'bg-white/95 border-white/30 text-gray-900 placeholder-gray-600'
                  }`}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-4 h-4" />
              </div>
            </form>
          </div>

          {/* Cart and Menu */}
          <div className="flex items-center space-x-2">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className={`relative p-2.5 rounded-full transition-all duration-300 hover:scale-110 ${
                isScrolled 
                  ? 'text-gray-700 hover:bg-amber-50 hover:text-amber-600' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <ShoppingCart className="w-6 h-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2.5 rounded-full transition-all duration-300 hover:scale-110 ${
                isScrolled
                  ? 'text-gray-700 hover:bg-amber-50 hover:text-amber-600'
                  : 'text-white hover:bg-white/20'
              }`}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden" onKeyDown={handleKeyDown}>
            <div className="px-2 pt-2 pb-3 space-y-3 bg-white/95 backdrop-blur-md rounded-lg mt-2 shadow-xl border border-gray-200">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="px-3 py-2" role="search" aria-label="Tìm kiếm sản phẩm trên di động">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm nước hoa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(sanitizeSearchQuery(e.target.value))}
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-gray-900 shadow-lg"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-4 h-4" />
                </div>
              </form>

              {/* Mobile Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2.5 text-gray-700 font-medium hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
