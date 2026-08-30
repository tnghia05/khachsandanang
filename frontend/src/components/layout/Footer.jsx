import React from 'react';
import { Link } from 'react-router-dom';
import { FaWater } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center text-primary-500 mb-4">
              <FaWater className="h-8 w-8 mr-2" />
              <span className="font-bold text-2xl tracking-tight">HOSTAY</span>
            </div>
            <p className="text-gray-300">Nền tảng đặt phòng khách sạn hàng đầu tại Đà Nẵng.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-600 pb-2 inline-block">Liên kết</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-primary-400">Trang chủ</Link></li>
              <li><Link to="/search" className="text-gray-300 hover:text-primary-400">Tìm kiếm</Link></li>
              <li><span className="text-gray-300 cursor-not-allowed">Về chúng tôi</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-600 pb-2 inline-block">Liên hệ</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: info@hostay.vn</li>
              <li>Phone: 0236 1234 567</li>
              <li>Address: Đà Nẵng, Việt Nam</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
          © 2026 Hostay. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
