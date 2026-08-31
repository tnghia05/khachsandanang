import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { getBookingById, cancelBooking } from '../api/bookingApi';
import { createPaymentUrl } from '../api/paymentApi';
import CountdownTimer from '../components/booking/CountdownTimer';
import PaymentMethodSelector from '../components/booking/PaymentMethodSelector';
import LoadingSpinner from '../components/common/LoadingSpinner';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const CheckoutPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [processing, setProcessing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await getBookingById(bookingId);
        
        // If already paid/confirmed, redirect to success
        if (res.data.status !== 'pending') {
          toast.success('Đơn đặt phòng này đã được xử lý');
          navigate(res.data.status === 'confirmed' ? `/booking-success/${res.data.bookingCode}` : '/my-bookings');
          return;
        }
        
        setBooking(res.data);
      } catch (error) {
        toast.error('Không tìm thấy đơn đặt phòng');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooking();
  }, [bookingId, navigate]);

  const handleExpire = () => {
    toast.error('Đã hết thời gian giữ chỗ. Đơn đặt phòng đã bị hủy.');
    navigate('/');
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      const res = await createPaymentUrl(bookingId, paymentMethod);
      if (res.data && res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        toast.error('Không thể tạo URL thanh toán');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi khởi tạo thanh toán');
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt phòng này?')) return;
    
    try {
      setCancelling(true);
      await cancelBooking(bookingId);
      toast.success('Đã hủy đặt phòng');
      navigate('/');
    } catch (error) {
      toast.error('Lỗi khi hủy đặt phòng');
      setCancelling(false);
    }
  };

  if (loading) return <LoadingSpinner message="Đang tải thông tin thanh toán..." />;
  if (!booking) return null;

  const depositAmount = booking.totalPrice * 0.3;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Thanh toán đặt phòng</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Summary */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-fit">
          <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-gray-100 text-gray-800">Tóm tắt đơn hàng</h2>
          
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-600 font-semibold uppercase tracking-wider mb-1">Mã đặt phòng</p>
              <p className="text-xl font-bold text-blue-900">{booking.bookingCode}</p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-800">{booking.hotelId?.name}</h3>
              <p className="text-gray-600 mt-1">{booking.roomId?.name} <span className="mx-2">•</span> <span className="capitalize">{booking.roomId?.roomType}</span></p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Nhận phòng</p>
                <p className="font-semibold text-gray-800">{format(new Date(booking.checkInDate), 'dd/MM/yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Trả phòng</p>
                <p className="font-semibold text-gray-800">{format(new Date(booking.checkOutDate), 'dd/MM/yyyy')}</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-gray-700">
              <span className="font-medium">Thời gian lưu trú</span>
              <span>{booking.totalNights} đêm</span>
            </div>
            
            <div className="flex justify-between items-center text-gray-700">
              <span className="font-medium">Khách</span>
              <span>{booking.guestCount?.adults} NL{booking.guestCount?.children ? `, ${booking.guestCount.children} TE` : ''}</span>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Tiền phòng</span>
                <span>{formatPrice(booking.totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí dịch vụ</span>
                <span>Miễn phí</span>
              </div>
              <div className="flex justify-between font-semibold text-lg text-gray-800">
                <span>Tổng cộng</span>
                <span>{formatPrice(booking.totalPrice)}</span>
              </div>
              <div className="flex justify-between items-center bg-primary-50 p-4 rounded-xl border border-primary-100">
                <span className="font-bold text-primary-800">Tiền cọc cần thanh toán (30%)</span>
                <span className="text-2xl font-bold text-primary-600">{formatPrice(depositAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment */}
        <div className="space-y-6">
          <CountdownTimer expiresAt={booking.holdExpiresAt} onExpire={handleExpire} />
          
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <PaymentMethodSelector 
              selected={paymentMethod} 
              onChange={setPaymentMethod} 
            />
            
            <div className="mt-8 space-y-4">
              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 disabled:opacity-70 transition-all shadow-lg shadow-primary-200 flex justify-center items-center"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Đang xử lý...
                  </span>
                ) : (
                  `Thanh toán ${formatPrice(depositAmount)}`
                )}
              </button>
              
              <button
                onClick={handleCancel}
                disabled={processing || cancelling}
                className="w-full py-3 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Đang hủy...' : 'Hủy đặt phòng'}
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-6">
              Bằng việc tiếp tục thanh toán, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của Hostay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
