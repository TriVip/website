import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import LayoutContainer from './LayoutContainer';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'Về chúng tôi', path: '/about' },
      { name: 'Câu chuyện thương hiệu', path: '/brand-story' },
      { name: 'Tuyển dụng', path: '/careers' },
      { name: 'Tin tức', path: '/news' },
    ],
    support: [
      { name: 'Trung tâm hỗ trợ', path: '/support' },
      { name: 'Hướng dẫn mua hàng', path: '/shopping-guide' },
      { name: 'Chính sách đổi trả', path: '/return-policy' },
      { name: 'Bảo hành', path: '/warranty' },
    ],
    legal: [
      { name: 'Điều khoản sử dụng', path: '/terms' },
      { name: 'Chính sách bảo mật', path: '/privacy' },
      { name: 'Chính sách cookie', path: '/cookie-policy' },
      { name: 'Liên hệ', path: '/contact' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/rareparfume' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/rareparfume' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/rareparfume' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <LayoutContainer className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-2xl font-bold">Rare Parfume</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Khám phá thế giới nước hoa niche và cao cấp với Rare Parfume. 
              Chúng tôi mang đến những mùi hương độc đáo và sang trọng nhất.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 rounded-lg hover:bg-amber-600 transition-colors duration-300"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Công ty</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-amber-400 transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-amber-400 transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">
                    123 Đường Perfume, Quận 1<br />
                    TP. Hồ Chí Minh, Việt Nam
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <a
                  href="tel:+84123456789"
                  className="text-gray-300 hover:text-amber-400 transition-colors duration-300"
                >
                  +84 123 456 789
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <a
                  href="mailto:info@rareparfume.com"
                  className="text-gray-300 hover:text-amber-400 transition-colors duration-300"
                >
                  info@rareparfume.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} Rare Parfume. Tất cả quyền được bảo lưu.
            </div>
            <div className="flex space-x-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-gray-400 hover:text-amber-400 text-sm transition-colors duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </LayoutContainer>
    </footer>
  );
};

export default Footer;
