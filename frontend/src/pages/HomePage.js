import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Star, Sparkles, Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import BlogCard from '../components/BlogCard';
import { useQuery } from 'react-query';
import { fetchProducts, fetchBlogPosts } from '../services/api';

const HomePage = () => {
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [featuredRef, featuredInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [blogRef, blogInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Fetch featured products
  const { data: featuredProductsData, isLoading: productsLoading } = useQuery(
    'featured-products',
    () => fetchProducts({ featured: 'true', limit: 8 }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
  
  const featuredProducts = featuredProductsData?.products || [];

  // Fetch recent blog posts
  const { data: blogPosts = [], isLoading: blogLoading } = useQuery(
    'recent-blogs',
    () => fetchBlogPosts({ limit: 3 }),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[80vh] flex items-center justify-center overflow-hidden hero-gradient pt-24 sm:pt-32"
        aria-labelledby="homepage-hero"
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/20 via-transparent to-[#d4af37]/20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/10 via-[#b8941f]/5 to-[#d4af37]/10 opacity-30"></div>
        </div>

        {/* Content */}
        <motion.div
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-16 sm:pb-20"
        >
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="inline-flex items-center space-x-2 bg-[#333333]/50 backdrop-blur-sm rounded-full px-4 py-2 sm:px-6 sm:py-3 mb-6 sm:mb-8 border border-[#555555]">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37]" />
              <span className="text-sm sm:text-base font-medium text-[#eeeeee]">Nước hoa niche cao cấp</span>
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            id="homepage-hero"
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#ffffff] mb-4 sm:mb-6 leading-tight"
          >
            <span className="block sm:inline">Tìm Mùi Hương</span>{' '}
            <span className="text-gradient block sm:inline">Đặc Trưng</span>
            <br />
            <span className="block sm:inline">Của Bạn</span>
           </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base md:text-lg text-[#cccccc] mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-6 lg:px-0"
          >
            Khám phá bộ sưu tập nước hoa niche độc đáo và sang trọng.
            Mỗi mùi hương đều kể một câu chuyện riêng, tạo nên dấu ấn không thể quên.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
          >
            <Link
              to="/products"
              className="btn-primary inline-flex items-center space-x-2 group text-sm sm:text-base"
            >
              <span>Khám phá ngay</span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              to="/blog"
              className="btn-secondary inline-flex items-center space-x-2 text-sm sm:text-base"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Tìm hiểu thêm</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-[#888888] rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 sm:h-3 bg-[#888888] rounded-full mt-1 sm:mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Featured Products Section */}
      <section ref={featuredRef} className="py-10 sm:py-12 lg:py-16 bg-[#222222]" aria-labelledby="featured-products">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={featuredInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center mb-10"
          >
            <motion.div variants={itemVariants} className="mb-4">
              <div className="inline-flex items-center space-x-2 bg-[#333333] border border-[#555555] rounded-full px-4 py-2">
                <Star className="w-4 h-4 text-[#d4af37]" />
                <span className="text-sm font-medium text-[#d4af37]">Sản phẩm nổi bật</span>
              </div>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              id="featured-products"
              className="text-2xl sm:text-3xl font-bold text-[#ffffff] mb-2 sm:mb-3 px-4 sm:px-0"
            >
              Bộ Sưu Tập Đặc Biệt
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-xs sm:text-sm text-[#cccccc] max-w-2xl mx-auto px-4 sm:px-0"
            >
              Những mùi hương được yêu thích nhất, được chọn lọc kỹ lưỡng từ các thương hiệu nước hoa hàng đầu thế giới.
             </motion.p>
          </motion.div>

          {productsLoading ? (
            <div className="flex justify-center items-center py-12 sm:py-16">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate={featuredInView ? "visible" : "hidden"}
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5"
            >
              {featuredProducts.slice(0, 8).map((product) => (
                <motion.div key={product.id} variants={itemVariants} className="h-full">
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuredInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center mt-10"
          >
            <Link
              to="/products"
              className="btn-secondary inline-flex items-center space-x-2 group"
            >
              <span>Xem tất cả sản phẩm</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#333333] to-[#222222]" aria-labelledby="brand-story">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="mb-6">
                <div className="inline-flex items-center space-x-2 bg-[#333333] border border-[#555555] rounded-full px-4 py-2 mb-4">
                  <Sparkles className="w-4 h-4 text-[#d4af37]" />
                  <span className="text-sm font-medium text-[#d4af37]">Câu chuyện thương hiệu</span>
                </div>
                <h2 id="brand-story" className="text-3xl font-bold text-[#ffffff] mb-4">
                  Rare Parfume - Nơi Mùi Hương Trở Thành Nghệ Thuật
                </h2>
                <p className="text-sm sm:text-base text-[#cccccc] leading-relaxed mb-4">
                  Từ năm 2020, Rare Parfume đã không ngừng tìm kiếm và mang đến những mùi hương
                  độc đáo nhất từ khắp nơi trên thế giới. Chúng tôi tin rằng mỗi người đều có một
                   mùi hương đặc trưng riêng, và nhiệm vụ của chúng tôi là giúp bạn tìm thấy nó.
                 </p>
                 <p className="text-sm sm:text-base text-[#cccccc] leading-relaxed mb-6">
                   Với đội ngũ chuyên gia có kinh nghiệm lâu năm trong ngành nước hoa, chúng tôi 
                   cam kết mang đến những sản phẩm chất lượng cao nhất và trải nghiệm mua sắm tuyệt vời.
                </p>
                <Link
                  to="/about"
                  className="btn-primary"
                >
                  <span>Tìm hiểu thêm</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/brand-story.jpg"
                  alt="Rare Parfume Brand Story"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-amber-400 rounded-full opacity-20"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-600 rounded-full opacity-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section ref={blogRef} className="py-10 sm:py-12 lg:py-16 bg-[#222222]" aria-labelledby="recent-blogs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={blogInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center mb-10"
          >
            <motion.div variants={itemVariants} className="mb-4">
              <div className="inline-flex items-center space-x-2 bg-[#333333] border border-[#555555] rounded-full px-4 py-2">
                <Heart className="w-4 h-4 text-[#d4af37]" />
                <span className="text-sm font-medium text-[#d4af37]">Tin tức & Blog</span>
              </div>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              id="recent-blogs"
              className="text-2xl sm:text-3xl font-bold text-[#ffffff] mb-2 sm:mb-3"
            >
              Khám Phá Thế Giới Nước Hoa
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-xs sm:text-sm text-[#cccccc] max-w-2xl mx-auto"
            >
              Cập nhật những xu hướng mới nhất, bí quyết chọn nước hoa và những câu chuyện thú vị về thế giới nước hoa.
            </motion.p>
          </motion.div>

          {blogLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate={blogInView ? "visible" : "hidden"}
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5"
            >
              {blogPosts.slice(0, 3).map((post) => (
                <motion.div key={post.id} variants={itemVariants} className="h-full">
                  <BlogCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={blogInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center mt-8"
          >
            <Link
              to="/blog"
              className="btn-secondary inline-flex items-center space-x-2 group"
            >
              <span>Xem tất cả bài viết</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-[#333333] to-[#444444]" aria-labelledby="cta-block">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 id="cta-block" className="text-3xl sm:text-4xl font-bold text-[#ffffff] mb-4">
              Sẵn Sàng Tìm Mùi Hương Đặc Trưng?
            </h2>
            <p className="text-lg text-[#d4af37] mb-6 max-w-2xl mx-auto">
              Khám phá bộ sưu tập nước hoa niche độc đáo và tìm ra mùi hương hoàn hảo cho bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="btn-primary"
              >
                Mua sắm ngay
              </Link>
              <Link
                to="/contact"
                className="btn-secondary bg-transparent border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#222222]"
              >
                Liên hệ tư vấn
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
