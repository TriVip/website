import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';

const BlogCard = ({ post }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link to={`/blog/${post.slug}`} className="block h-full">
        <div className="card overflow-hidden h-full flex flex-col">
          {/* Blog Image */}
          <div className="relative aspect-video overflow-hidden bg-[#333333]">
            <img
              src={post.featured_image || '/images/blog-placeholder.jpg'}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Blog Content */}
          <div className="p-3 sm:p-4 flex flex-col h-full flex-1">
            <div className="mb-1.5 sm:mb-2">
              <span className="text-xs text-[#d4af37] font-medium">Blog</span>
            </div>
            
            <h3 className="text-xs sm:text-sm font-bold text-[#ffffff] mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-[#d4af37] transition-colors duration-300">
              {post.title}
            </h3>
            
            <p className="text-xs text-[#cccccc] mb-2 sm:mb-3 line-clamp-3 flex-grow">
              {post.excerpt || post.content?.substring(0, 150) + '...'}
            </p>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-xs text-[#888888] mb-2 sm:mb-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(post.published_at || post.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Read More */}
            <div className="flex items-center text-xs text-[#d4af37] font-medium group-hover:text-[#b8941f] transition-colors duration-300 mt-auto">
              <span>Đọc thêm</span>
              <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BlogCard;
