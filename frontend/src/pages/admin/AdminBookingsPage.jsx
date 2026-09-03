import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaCalendarCheck, FaSearch, FaFilter, FaArrowRight } from 'react-icons/fa';
import { getAllBookings } from '../../api/adminApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const statusTabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'confirmed', label: 'Đã xác nhận' },
  { id: 'checked_in', label: 'Đang lưu trú' },
  { id: 'completed', label: 'Đã hoàn tất' },
  { id: 'pending', label: 'Chờ thanh toán' },
  { id: 'cancelled', label: 'Đã hủy' },
];

const statusBadges = {
  pending: { label: 'Chờ thanh toán', bg: 'bg-amber-100 text-amber-800' },
  confirmed: { label: 'Đã xác nhận', bg: 'bg-green-100 text-green-800' },
  checked_in: { label: 'Đang lưu trú', bg: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Đã hoàn tất', bg: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Đã hủy', bg: 'bg-red-100 text-red-800' },
  expired: { label: 'Hết hạn', bg: 'bg-slate-100 text-slate-700' },
};

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getAllBookings({
        status: selectedTab,
        search: searchTerm,
        page,
        limit: 10,
      });
      setBookings(res.data || []);
      setPagination(res.pagination || { pages: 1, total: 0 });
    } catch (err) {
      console.error('Lỗi khi tải danh sách đặt phòng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedTab, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaCalendarCheck className="text-primary-500 mr-3" /> Quản Lý Đơn Đặt Phòng
          </h1>
          <p className="text-sm text-gray-500">
            Theo dõi danh sách toàn bộ các giao dịch đặt phòng lưu trú trong hệ thống.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedTab(tab.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedTab === tab.id
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đặt phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition flex items-center"
          >
            <FaSearch className="mr-2 text-xs" /> Tìm kiếm
          </button>
        </form>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingSpinner message="Đang tải danh sách đặt phòng..." />
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Không tìm thấy đơn đặt phòng nào trong mục này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                  <th className="py-3.5 px-6">Mã đơn</th>
                  <th className="py-3.5 px-6">Khách hàng</th>
                  <th className="py-3.5 px-6">Khách sạn & Phòng</th>
                  <th className="py-3.5 px-6">Ngày ở</th>
                  <th className="py-3.5 px-6">Tổng tiền</th>
                  <th className="py-3.5 px-6">Trạng thái</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {bookings.map((b) => {
                  const badge = statusBadges[b.status] || { label: b.status, bg: 'bg-gray-100 text-gray-800' };
                  return (
                    <tr key={b._id} className="hover:bg-gray-50/80 transition">
                      <td className="py-4 px-6 font-bold text-primary-600">
                        <Link to={`/admin/reception?code=${b.bookingCode}`} className="hover:underline">
                          {b.bookingCode}
                        </Link>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-900">{b.customerId?.fullName || 'Khách vãng lai'}</p>
                        <p className="text-xs text-gray-400">{b.customerId?.phone}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-800">{b.hotelId?.name}</p>
                        <p className="text-xs text-gray-500">{b.roomId?.name} ({b.roomId?.roomType})</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-800">
                          {format(new Date(b.checkInDate), 'dd/MM')} ➔ {format(new Date(b.checkOutDate), 'dd/MM/yyyy')}
                        </p>
                        <p className="text-xs text-gray-400">{b.totalNights} đêm</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-900">{formatCurrency(b.totalPrice)}</p>
                        <p className="text-xs text-emerald-600">Cọc: {formatCurrency(b.depositAmount)}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/admin/reception?code=${b.bookingCode}`}
                          className="inline-flex items-center text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition"
                        >
                          Xử lý <FaArrowRight className="ml-1" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
            <span>Tổng cộng {pagination.total} đơn</span>
            <div className="flex space-x-1">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 rounded-lg font-bold ${
                    page === p ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingsPage;
