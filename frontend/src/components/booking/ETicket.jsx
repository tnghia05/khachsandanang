import React from 'react';
import QRCode from 'react-qr-code';
import { format } from 'date-fns';

const ETicket = ({ booking }) => {
  if (!booking) return null;

  const {
    bookingCode,
    qrCodeData,
    hotelId,
    roomId,
    checkInDate,
    checkOutDate,
    totalNights,
    totalPrice,
    guestCount,
    status
  } = booking;

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const formatPrice = (price) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const getStatusBadge = () => {
    switch(status) {
      case 'confirmed':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold border border-green-200">Đã xác nhận</span>;
      case 'checked_in':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold border border-blue-200">Đã nhận phòng</span>;
      case 'completed':
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold border border-gray-200">Đã hoàn thành</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold border border-red-200">Đã hủy</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold border border-amber-200">Chờ thanh toán</span>;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-6 text-center text-white relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div className="w-40 h-40 bg-white rounded-full absolute -top-10 -left-10 mix-blend-overlay"></div>
          <div className="w-32 h-32 bg-white rounded-full absolute top-10 -right-10 mix-blend-overlay"></div>
        </div>
        <h2 className="text-2xl font-bold tracking-widest relative z-10">VÉ ĐIỆN TỬ</h2>
        <p className="font-medium opacity-90 relative z-10">Hostay - Trải nghiệm tuyệt vời</p>
      </div>

      {/* QR Code Section */}
      <div className="p-6 flex flex-col items-center border-b-2 border-dashed border-gray-200 bg-gray-50 relative">
        {/* Ticket cutouts */}
        <div className="absolute -left-3 bottom-[-12px] w-6 h-6 bg-white rounded-full border-r-2 border-dashed border-gray-200 z-10"></div>
        <div className="absolute -right-3 bottom-[-12px] w-6 h-6 bg-white rounded-full border-l-2 border-dashed border-gray-200 z-10"></div>
        
        <p className="text-gray-500 mb-4 text-sm font-medium">Mã đặt phòng</p>
        <p className="text-3xl font-bold text-gray-800 mb-6 tracking-wider bg-white px-6 py-2 rounded-lg shadow-sm border border-gray-100">{bookingCode}</p>
        
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 inline-block">
          <QRCode 
            value={qrCodeData || bookingCode || 'placeholder'} 
            size={180} 
            level="M"
            className="rounded"
          />
        </div>
      </div>

      {/* Info Section */}
      <div className="p-6 space-y-4">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Khách sạn</p>
          <p className="font-semibold text-gray-800">{hotelId?.name || 'Đang cập nhật'}</p>
          {hotelId?.address && <p className="text-sm text-gray-600 truncate">{hotelId.address}</p>}
        </div>
        
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Loại phòng</p>
          <p className="font-semibold text-gray-800">{roomId?.name || 'Đang cập nhật'}</p>
          {roomId?.roomType && <p className="text-sm text-gray-600 capitalize">{roomId.roomType}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase mb-1">Nhận phòng</p>
            <p className="font-semibold text-gray-800">{formatDate(checkInDate)}</p>
            <p className="text-xs text-gray-500 mt-1">Sau 14:00</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase mb-1">Trả phòng</p>
            <p className="font-semibold text-gray-800">{formatDate(checkOutDate)}</p>
            <p className="text-xs text-gray-500 mt-1">Trước 12:00</p>
          </div>
        </div>

        <div className="flex justify-between items-end border-t border-gray-100 pt-4">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase mb-1">Số khách</p>
            <p className="font-medium text-gray-800">
              {guestCount?.adults || 0} người lớn
              {(guestCount?.children > 0) && `, ${guestCount.children} trẻ em`}
            </p>
            <p className="text-xs text-gray-500 mt-1">{totalNights} đêm</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium uppercase mb-1">Tổng tiền</p>
            <p className="text-xl font-bold text-primary-600">{formatPrice(totalPrice)}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-5 text-center flex flex-col items-center justify-center border-t border-gray-100">
        <div className="mb-3">
          {getStatusBadge()}
        </div>
        <p className="text-xs text-gray-500">Vui lòng xuất trình vé điện tử này khi nhận phòng</p>
      </div>
    </div>
  );
};

export default ETicket;
