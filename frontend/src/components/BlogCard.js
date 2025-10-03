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
      <Link to={`/blog/${post.slug}`} className="block">
        <div className="card overflow-hidden h-full">
          {/* Blog Image */}
          <div className="relative aspect-video overflow-hidden bg-gray-100">
            <img
              src={post.featured_image || '/images/blog-placeholder.jpg'}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Blog Content */}
          <div className="p-4 flex flex-col h-full">
            <div className="mb-3">
              <span className="text-xs text-amber-600 font-medium">Blog</span>
            </div>
            
            <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors duration-300">
              {post.title}
            </h3>
            
            <p className="text-xs text-gray-600 mb-3 line-clamp-3 flex-grow">
              {post.excerpt || post.content?.substring(0, 150) + '...'}
            </p>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center space-x-3">
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
            <div className="flex items-center text-xs text-amber-600 font-medium group-hover:text-amber-700 transition-colors duration-300">
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
