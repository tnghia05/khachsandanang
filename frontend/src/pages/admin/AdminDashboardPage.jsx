import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaMoneyBillWave,
  FaCalendarCheck,
  FaBed,
  FaPercentage,
  FaArrowRight,
  FaClock,
  FaCheckCircle,
} from 'react-icons/fa';
import { getAnalytics } from '../../api/adminApi';
import RevenueBarChart from '../../components/admin/RevenueBarChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const statusBadges = {
  pending: { label: 'Chờ thanh toán', bg: 'bg-amber-100 text-amber-800' },
  confirmed: { label: 'Đã xác nhận', bg: 'bg-green-100 text-green-800' },
  checked_in: { label: 'Đang lưu trú', bg: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Đã hoàn tất', bg: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Đã hủy', bg: 'bg-red-100 text-red-800' },
  expired: { label: 'Hết hạn', bg: 'bg-slate-100 text-slate-700' },
};

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getAnalytics();
        setData(res.data);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner message="Đang tải dữ liệu tổng quan PMS..." />;
  if (!data) return <div className="text-center text-gray-500 py-12">Không thể tải dữ liệu thống kê.</div>;

  const {
    totalRevenue,
    statusCounts,
    todayOccupiedBookings,
    totalSystemRooms,
    occupancyRate,
    monthlyRevenue,
    recentBookings,
  } = data;

  const cards = [
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(totalRevenue),
      subtitle: 'Từ các đơn đã xác nhận / hoàn tất',
      icon: FaMoneyBillWave,
      color: 'bg-emerald-500',
    },
    {
      title: 'Tổng số đơn đặt',
      value: statusCounts.total,
      subtitle: `${statusCounts.confirmed + statusCounts.checked_in} đơn đang xử lý / ở`,
      icon: FaCalendarCheck,
      color: 'bg-primary-500',
    },
    {
      title: 'Khách đang lưu trú',
      value: `${todayOccupiedBookings} phòng`,
      subtitle: `Trên tổng số ${totalSystemRooms} phòng toàn hệ thống`,
      icon: FaBed,
      color: 'bg-blue-500',
    },
    {
      title: 'Tỷ lệ lấp phòng hôm nay',
      value: `${occupancyRate}%`,
      subtitle: `${todayOccupiedBookings}/${totalSystemRooms} phòng có khách`,
      icon: FaPercentage,
      color: occupancyRate > 60 ? 'bg-indigo-500' : 'bg-amber-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${card.color} text-white flex items-center justify-center text-xl shadow-md`}>
                <Icon />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Analytics: Chart & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RevenueBarChart data={monthlyRevenue} />
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Phân bố trạng thái đơn</h3>
            <p className="text-xs text-gray-500 mb-6">Chi tiết tình trạng lưu trú trong hệ thống</p>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center text-green-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2" /> Đã xác nhận
                </span>
                <span className="font-bold text-gray-900">{statusCounts.confirmed}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center text-blue-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2" /> Đang lưu trú
                </span>
                <span className="font-bold text-gray-900">{statusCounts.checked_in}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center text-gray-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400 mr-2" /> Đã hoàn tất
                </span>
                <span className="font-bold text-gray-900">{statusCounts.completed}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center text-amber-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-2" /> Chờ thanh toán
                </span>
                <span className="font-bold text-gray-900">{statusCounts.pending}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center text-red-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 mr-2" /> Đã hủy / Hết hạn
                </span>
                <span className="font-bold text-gray-900">{statusCounts.cancelled + statusCounts.expired}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 mt-6">
            <Link
              to="/admin/reception"
              className="w-full py-2.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-xl font-semibold text-xs flex items-center justify-center transition"
            >
              Mở Công Cụ Check-in Lễ Tân <FaArrowRight className="ml-1.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Đơn đặt phòng mới nhất</h3>
            <p className="text-xs text-gray-500">Các giao dịch đặt phòng vừa phát sinh gần đây</p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center"
          >
            Xem tất cả <FaArrowRight className="ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                <th className="py-3 px-6">Mã đơn</th>
                <th className="py-3 px-6">Khách hàng</th>
                <th className="py-3 px-6">Khách sạn / Loại phòng</th>
                <th className="py-3 px-6">Tổng tiền</th>
                <th className="py-3 px-6">Trạng thái</th>
                <th className="py-3 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {recentBookings.map((b) => {
                const badge = statusBadges[b.status] || { label: b.status, bg: 'bg-gray-100 text-gray-800' };
                return (
                  <tr key={b._id} className="hover:bg-gray-50/80 transition">
                    <td className="py-4 px-6 font-bold text-primary-600">{b.bookingCode}</td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-gray-900">{b.customerId?.fullName || 'Khách vãng lai'}</p>
                      <p className="text-xs text-gray-400">{b.customerId?.phone}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-800">{b.hotelId?.name}</p>
                      <p className="text-xs text-gray-500">{b.roomId?.name}</p>
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">{formatCurrency(b.totalPrice)}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {b.status === 'confirmed' ? (
                        <Link
                          to={`/admin/reception?code=${b.bookingCode}`}
                          className="text-xs bg-primary-600 hover:bg-primary-700 text-white font-semibold px-3 py-1.5 rounded-lg transition inline-block"
                        >
                          Check-in
                        </Link>
                      ) : (
                        <Link
                          to={`/admin/reception?code=${b.bookingCode}`}
                          className="text-xs text-gray-500 hover:text-primary-600 font-medium"
                        >
                          Xem chi tiết
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
