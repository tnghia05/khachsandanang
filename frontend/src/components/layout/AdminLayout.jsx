import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import {
  FaChartPie,
  FaQrcode,
  FaCalendarCheck,
  FaHotel,
  FaBed,
  FaTicketAlt,
  FaArrowLeft,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserShield,
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', label: 'Tổng quan PMS', icon: FaChartPie, end: true },
    { to: '/admin/reception', label: 'Lễ tân & Check-in QR', icon: FaQrcode },
    { to: '/admin/bookings', label: 'Quản lý Đặt phòng', icon: FaCalendarCheck },
    { to: '/admin/hotels', label: 'Khách sạn / Homestay', icon: FaHotel },
    { to: '/admin/rooms', label: 'Quản lý Phòng', icon: FaBed },
    { to: '/admin/vouchers', label: 'Khuyến mãi / Voucher', icon: FaTicketAlt },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-slate-900 text-white flex items-center justify-between p-4 sticky top-0 z-40 shadow">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-xl text-primary-400">HOSTAY</span>
          <span className="text-xs bg-primary-900 text-primary-300 px-2 py-0.5 rounded font-bold uppercase">PMS</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-300 hover:text-white focus:outline-none p-1"
        >
          {sidebarOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-50 transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo & Brand */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-extrabold text-2xl tracking-wider text-primary-400">HOSTAY</span>
            <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded font-bold uppercase">PMS</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <FaTimes />
          </button>
        </div>

        {/* User Role Badge */}
        <div className="px-6 py-4 bg-slate-800/60 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-600/30 text-primary-400 flex items-center justify-center font-bold text-lg">
            <FaUserShield />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-white">{user?.fullName || 'Quản trị viên'}</p>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-medium uppercase">
              {user?.role === 'admin' ? 'Quản trị hệ thống' : 'Chủ khách sạn (Host)'}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-900/50'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="flex items-center w-full px-4 py-2.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition"
          >
            <FaArrowLeft className="mr-2" /> Về trang khách hàng
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 text-xs font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 rounded-lg transition"
          >
            <FaSignOutAlt className="mr-2" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 hidden md:flex justify-between items-center sticky top-0 z-20">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Kênh Quản Trị Khách Sạn & Vận Hành PMS</h2>
            <p className="text-xs text-gray-500">Hệ thống quản lý lưu trú & ưu đãi du lịch Đà Nẵng</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition flex items-center"
            >
              <FaArrowLeft className="mr-1.5" /> Xem Trang Chủ
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="p-4 md:p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
