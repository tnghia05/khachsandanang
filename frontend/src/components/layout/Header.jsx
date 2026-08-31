import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaWater, FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center text-primary-500">
            <FaWater className="h-8 w-8 mr-2" />
            <span className="font-bold text-2xl tracking-tight">HOSTAY</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-500 font-medium">Trang chủ</Link>
            <Link to="/search" className="text-gray-700 hover:text-primary-500 font-medium">Tìm kiếm</Link>
            {isAuthenticated && (
              <Link to="/my-bookings" className="text-gray-700 hover:text-primary-500 font-medium">Đặt phòng của tôi</Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-500 focus:outline-none"
                >
                  <FaUserCircle className="h-6 w-6" />
                  <span className="font-medium">{user?.fullName || 'Người dùng'}</span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-500 font-medium">Đăng nhập</Link>
                <Link to="/register" className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition font-medium">Đăng ký</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-500 focus:outline-none"
            >
              {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50">Trang chủ</Link>
            <Link to="/search" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50">Tìm kiếm</Link>
            {isAuthenticated && (
              <Link to="/my-bookings" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50">Đặt phòng của tôi</Link>
            )}
            {isAuthenticated ? (
              <>
                <div className="block px-3 py-2 text-base font-medium text-gray-700">Xin chào, {user?.fullName}</div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50">Đăng nhập</Link>
                <Link to="/register" className="block px-3 py-2 text-base font-medium text-primary-500 hover:bg-gray-50">Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
