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
  FaCrown,
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

  const isSuperAdmin = user?.role === 'admin';
  const daysLeft = user?.subscription?.expiresAt
    ? Math.max(0, Math.ceil((new Date(user.subscription.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)))
    : 30;

  const navItems = [
    { to: '/admin', label: 'Tổng quan PMS', icon: FaChartPie, end: true },
    { to: '/admin/reception', label: 'Lễ tân & Check-in QR', icon: FaQrcode },
    { to: '/admin/bookings', label: 'Quản lý Đặt phòng', icon: FaCalendarCheck },
    { to: '/admin/hotels', label: 'Khách sạn / Homestay', icon: FaHotel },
    { to: '/admin/rooms', label: 'Quản lý Phòng', icon: FaBed },
    { to: '/admin/vouchers', label: 'Khuyến mãi / Voucher', icon: FaTicketAlt },
    { to: '/admin/subscription', label: 'Gói Dịch Vụ & Quảng Cáo', icon: FaCrown },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-slate-900 text-white flex items-center justify-between p-4 sticky top-0 z-40 shadow">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-xl text-primary-400">HOSTAY</span>
          <span className="text-xs bg-primary-900 text-primary-300 px-2 py-0.5 rounded font-bold uppercase">
            {isSuperAdmin ? 'SaaS Master' : 'Host PMS'}
          </span>
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
            <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded font-bold uppercase">
              {isSuperAdmin ? 'Master' : 'PMS'}
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <FaTimes />
          </button>
        </div>

        {/* User Role Badge */}
        <div className="px-6 py-4 bg-slate-800/60 border-b border-slate-800 flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
            isSuperAdmin ? 'bg-amber-500/20 text-amber-400' : 'bg-primary-600/30 text-primary-400'
          }`}>
            {isSuperAdmin ? <FaCrown /> : <FaUserShield />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-white">{user?.fullName || 'Người dùng'}</p>
            {isSuperAdmin ? (
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold border border-amber-800/60 uppercase">
                Super Admin
              </span>
            ) : (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-medium">
                  Đối tác Host
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  daysLeft > 7 ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                }`}>
                  Còn {daysLeft} ngày
                </span>
              </div>
            )}
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
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-800">
                {isSuperAdmin ? 'Kênh Quản Trị Hệ Thống SaaS Hostay' : 'Kênh Quản Trị Khách Sạn & Lễ Tân PMS'}
              </h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                isSuperAdmin ? 'bg-amber-100 text-amber-800' : 'bg-primary-100 text-primary-800'
              }`}>
                {isSuperAdmin ? 'Platform Super Admin' : 'Tenant Host'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {isSuperAdmin
                ? 'Toàn quyền điều phối cơ sở lưu trú, voucher toàn sàn và thuê bao đối tác'
                : 'Quản lý riêng biệt cơ sở lưu trú, phòng nghỉ, doanh thu và quầy lễ tân check-in'}
            </p>
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
