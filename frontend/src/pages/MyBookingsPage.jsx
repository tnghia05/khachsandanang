import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaCamera, FaSearch } from 'react-icons/fa';
import { getMyBookings, cancelBooking } from '../api/bookingApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getMyBookings();
      // Sort by creation date desc
      const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(sorted);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách đặt phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn hủy đặt phòng này?')) return;
    try {
      await cancelBooking(id);
      toast.success('Đã hủy đặt phòng thành công');
      fetchBookings(); // reload
    } catch (error) {
      toast.error('Lỗi khi hủy đặt phòng');
    }
  };

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ thanh toán' },
    { id: 'confirmed', label: 'Đã xác nhận' },
    { id: 'completed', label: 'Đã hoàn thành' },
    { id: 'cancelled', label: 'Đã hủy' }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'confirmed':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Đã xác nhận</span>;
      case 'completed':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Đã hoàn thành</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Đã hủy</span>;
      case 'expired':
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Đã hết hạn</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Chờ thanh toán</span>;
    }
  };

  const filteredBookings = activeTab === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === activeTab || (activeTab === 'cancelled' && b.status === 'expired'));

  if (loading) return <LoadingSpinner message="Đang tải danh sách đặt phòng..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Đặt phòng của tôi</h1>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map(booking => (
            <div key={booking._id} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="w-full md:w-40 h-32 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 border border-gray-200">
                <FaCamera className="text-3xl text-gray-300" />
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{booking.hotelId?.name}</h3>
                    <p className="text-gray-600 font-medium">{booking.roomId?.name}</p>
                    <p className="text-sm text-gray-500 mt-1">Mã: <span className="font-mono text-gray-800">{booking.bookingCode}</span></p>
                  </div>
                  <div>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-gray-600">
                  <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span className="font-semibold text-gray-800">{format(new Date(booking.checkInDate), 'dd/MM/yyyy')}</span> - <span className="font-semibold text-gray-800">{format(new Date(booking.checkOutDate), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex items-center">
                    {booking.totalNights} đêm • {booking.guestCount?.adults} NL
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="w-full md:w-48 flex flex-col justify-end gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 text-right">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Tổng thanh toán</p>
                  <p className="text-xl font-bold text-primary-600">{formatPrice(booking.totalPrice)}</p>
                </div>
                
                <div className="flex gap-2 justify-end mt-2">
                  {booking.status === 'pending' && (
                    <>
                      <button onClick={() => handleCancel(booking._id)} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                        Hủy
                      </button>
                      <Link to={`/checkout/${booking._id}`} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
                        Thanh toán
                      </Link>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <Link to={`/booking-success/${booking.bookingCode}`} className="px-4 py-2 border-2 border-primary-500 text-primary-700 rounded-lg text-sm font-bold hover:bg-primary-50 transition-colors">
                      Xem vé
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl border-dashed">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <FaSearch className="text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Bạn chưa có đơn đặt phòng nào</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Hãy khám phá các khách sạn tuyệt vời tại Đà Nẵng và bắt đầu chuyến đi của bạn.</p>
          <Link to="/" className="inline-block bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-md shadow-primary-200">
            Tìm khách sạn ngay
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
