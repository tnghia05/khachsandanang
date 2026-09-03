import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';
import {
  FaQrcode,
  FaSearch,
  FaCheckCircle,
  FaSignOutAlt,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaHotel,
  FaBed,
  FaMoneyBillWave,
  FaTag,
} from 'react-icons/fa';
import { lookupBooking, checkInBooking, checkOutBooking } from '../../api/adminApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const statusBadges = {
  pending: { label: 'Chờ thanh toán', bg: 'bg-amber-100 text-amber-800' },
  confirmed: { label: 'Đã xác nhận (Sẵn sàng Check-in)', bg: 'bg-green-100 text-green-800' },
  checked_in: { label: 'Đang lưu trú tại khách sạn', bg: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Đã hoàn tất trả phòng', bg: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Đã hủy', bg: 'bg-red-100 text-red-800' },
  expired: { label: 'Đã hết hạn giữ phòng', bg: 'bg-slate-100 text-slate-700' },
};

const AdminReceptionPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [codeQuery, setCodeQuery] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [crossTenantError, setCrossTenantError] = useState('');

  const initialCode = searchParams.get('code');

  useEffect(() => {
    if (initialCode) {
      setCodeQuery(initialCode);
      handleSearch(initialCode);
    }
  }, [initialCode]);

  const handleSearch = async (overrideCode) => {
    const code = (overrideCode || codeQuery).trim();
    if (!code) {
      toast.error('Vui lòng nhập mã đặt phòng hoặc chuỗi quét QR');
      return;
    }

    setCrossTenantError('');
    try {
      setLoading(true);
      const res = await lookupBooking(code);
      setBooking(res.data);
      setSearchParams({ code });
    } catch (err) {
      setBooking(null);
      if (err.response?.status === 403) {
        setCrossTenantError(err.response?.data?.message || 'Bạn không có quyền quản lý đơn đặt phòng của cơ sở lưu trú khác!');
        toast.error('Cảnh báo: Đơn đặt phòng thuộc quyền sở hữu của Host khác!');
      } else {
        toast.error(err.response?.data?.message || 'Không tìm thấy đơn đặt phòng');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!booking) return;
    try {
      setActionLoading(true);
      const res = await checkInBooking(booking._id);
      setBooking(res.data);
      toast.success('Xác nhận nhận phòng (Check-in) thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi thực hiện Check-in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!booking) return;
    try {
      setActionLoading(true);
      const res = await checkOutBooking(booking._id);
      setBooking(res.data);
      toast.success('Xác nhận trả phòng (Check-out) thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi thực hiện Check-out');
    } finally {
      setActionLoading(false);
    }
  };

  const badge = booking ? statusBadges[booking.status] || { label: booking.status, bg: 'bg-gray-100 text-gray-800' } : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FaQrcode className="text-primary-500 mr-3" /> Quầy Lễ Tân & Check-in Không Chạm
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Quét mã QR trên vé điện tử của khách hoặc nhập mã đặt phòng để đổi trạng thái đơn tức thì.
        </p>
      </div>

      {/* Input / Scanner Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder="Dán chuỗi quét mã QR hoặc nhập mã đơn (VD: HT1234567890)"
              value={codeQuery}
              onChange={(e) => setCodeQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none font-medium text-gray-800"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3.5 rounded-xl transition flex items-center justify-center min-w-[140px]"
          >
            {loading ? 'Đang tìm...' : 'Tra cứu'}
          </button>
        </form>
      </div>

      {loading && <LoadingSpinner message="Đang tra cứu thông tin đơn lưu trú..." />}

      {/* Cảnh báo Chặn Check-in Chéo Cơ Sở */}
      {crossTenantError && (
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl flex items-start space-x-4 animate-shake shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
            ⚠️
          </div>
          <div>
            <h3 className="font-bold text-red-900 text-base">Từ chối truy cập: Chặn thao tác chéo cơ sở!</h3>
            <p className="text-sm text-red-700 mt-1">
              {crossTenantError}
            </p>
            <p className="text-xs text-red-500 mt-2">
              Chính sách phân quyền SaaS của Hostay chỉ cho phép Lễ tân kiểm tra và làm thủ tục check-in cho các đơn đặt phòng thuộc cơ sở lưu trú của chính đối tác mình sở hữu.
            </p>
          </div>
        </div>
      )}

      {/* Booking Details Card */}
      {booking && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-primary-400 font-bold">Mã Đặt Phòng</p>
              <h2 className="text-2xl font-black">{booking.bookingCode}</h2>
            </div>
            <div>
              <span className={`inline-block px-4 py-2 rounded-xl text-sm font-bold shadow ${badge.bg}`}>
                {badge.label}
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* 2-Col Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Khách hàng */}
              <div className="bg-gray-50 p-5 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                  <FaUser className="mr-2" /> Thông tin Khách hàng
                </h4>
                <p className="text-lg font-bold text-gray-800">{booking.customerId?.fullName || 'Khách vãng lai'}</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-center"><FaPhone className="mr-2 text-gray-400 text-xs" /> {booking.customerId?.phone}</p>
                  <p className="flex items-center"><FaEnvelope className="mr-2 text-gray-400 text-xs" /> {booking.customerId?.email}</p>
                </div>
              </div>

              {/* Chỗ nghỉ */}
              <div className="bg-gray-50 p-5 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                  <FaHotel className="mr-2" /> Phòng & Cơ sở lưu trú
                </h4>
                <p className="text-lg font-bold text-gray-800">{booking.hotelId?.name}</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-center"><FaBed className="mr-2 text-gray-400 text-xs" /> {booking.roomId?.name} ({booking.roomId?.roomType})</p>
                  <p className="text-xs text-gray-500">{booking.hotelId?.address}, {booking.hotelId?.district}</p>
                </div>
              </div>
            </div>

            {/* Stay Dates & Financials */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-gray-100 py-6">
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1 flex items-center">
                  <FaCalendarAlt className="mr-1 text-primary-500" /> Ngày nhận / Trả phòng
                </p>
                <p className="font-bold text-gray-800">
                  {format(new Date(booking.checkInDate), 'dd/MM/yyyy')} ➔ {format(new Date(booking.checkOutDate), 'dd/MM/yyyy')}
                </p>
                <p className="text-xs text-gray-500">{booking.totalNights} đêm • {booking.guestCount?.adults} NL, {booking.guestCount?.children || 0} TE</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1 flex items-center">
                  <FaMoneyBillWave className="mr-1 text-emerald-500" /> Tiền phòng & Cọc
                </p>
                <p className="font-bold text-gray-800">{formatCurrency(booking.totalPrice)}</p>
                <p className="text-xs text-emerald-600 font-medium">Đã cọc 30%: {formatCurrency(booking.depositAmount)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1 flex items-center">
                  <FaTag className="mr-1 text-purple-500" /> Ưu đãi / Voucher
                </p>
                <p className="font-bold text-gray-800">
                  {booking.voucherCode ? booking.voucherCode : 'Không sử dụng'}
                </p>
                {booking.discountAmount > 0 && (
                  <p className="text-xs text-purple-600 font-medium">Giảm {formatCurrency(booking.discountAmount)}</p>
                )}
              </div>
            </div>

            {/* Check-in Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 border rounded-xl bg-white shadow-sm">
                  <QRCode value={booking.qrCodeData || booking.bookingCode} size={80} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold">Tình trạng thanh toán</p>
                  <p className="font-bold text-gray-800 uppercase text-sm">
                    {booking.paymentStatus === 'fully_paid' ? 'Đã thanh toán 100%' : 'Đã thanh toán tiền cọc'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                {booking.status === 'confirmed' && (
                  <button
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-100 flex items-center justify-center transition disabled:opacity-50"
                  >
                    <FaCheckCircle className="mr-2 text-lg" />
                    {actionLoading ? 'Đang xử lý...' : 'Xác Nhận Khách Nhận Phòng'}
                  </button>
                )}

                {booking.status === 'checked_in' && (
                  <button
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary-100 flex items-center justify-center transition disabled:opacity-50"
                  >
                    <FaSignOutAlt className="mr-2 text-lg" />
                    {actionLoading ? 'Đang xử lý...' : 'Xác Nhận Khách Trả Phòng'}
                  </button>
                )}

                {booking.status === 'completed' && (
                  <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-4 py-3 rounded-xl inline-flex items-center">
                    <FaCheckCircle className="mr-2 text-green-500" /> Đã hoàn tất chu trình lưu trú
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReceptionPage;
