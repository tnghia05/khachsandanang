import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { getBookingById, cancelBooking } from '../api/bookingApi';
import { createPaymentUrl } from '../api/paymentApi';
import { applyVoucher, getPublicVouchers } from '../api/voucherApi';
import CountdownTimer from '../components/booking/CountdownTimer';
import PaymentMethodSelector from '../components/booking/PaymentMethodSelector';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaTag, FaCheckCircle, FaTicketAlt } from 'react-icons/fa';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const CheckoutPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [processing, setProcessing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Voucher states
  const [voucherInput, setVoucherInput] = useState('');
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [publicVouchers, setPublicVouchers] = useState([]);

  useEffect(() => {
    const fetchBookingAndVouchers = async () => {
      try {
        const res = await getBookingById(bookingId);
        
        // If already paid/confirmed, redirect to success
        if (res.data.status !== 'pending') {
          toast.success('Đơn đặt phòng này đã được xử lý');
          navigate(res.data.status === 'confirmed' ? `/booking-success/${res.data.bookingCode}` : '/my-bookings');
          return;
        }
        
        setBooking(res.data);
        if (res.data.voucherCode) {
          setVoucherInput(res.data.voucherCode);
        }

        // Tải danh sách voucher công khai để gợi ý
        try {
          const voucherRes = await getPublicVouchers();
          if (voucherRes.data) {
            setPublicVouchers(voucherRes.data);
          }
        } catch (vErr) {
          console.error('Không thể tải voucher công khai:', vErr);
        }
      } catch (error) {
        toast.error('Không tìm thấy đơn đặt phòng');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookingAndVouchers();
  }, [bookingId, navigate]);

  const handleExpire = () => {
    toast.error('Đã hết thời gian giữ chỗ. Đơn đặt phòng đã bị hủy.');
    navigate('/');
  };

  const handleApplyVoucher = async (codeToUse) => {
    const code = (codeToUse || voucherInput).trim().toUpperCase();
    if (!code) {
      toast.error('Vui lòng nhập mã ưu đãi');
      return;
    }

    try {
      setApplyingVoucher(true);
      const res = await applyVoucher({ bookingId, voucherCode: code });
      
      setBooking((prev) => ({
        ...prev,
        totalPrice: res.data.totalPrice,
        depositAmount: res.data.depositAmount,
        discountAmount: res.data.discountAmount,
        voucherCode: res.data.voucherCode,
      }));
      setVoucherInput(res.data.voucherCode);
      toast.success(res.data.message || 'Áp dụng mã giảm giá thành công!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mã ưu đãi không hợp lệ hoặc đã hết hạn');
    } finally {
      setApplyingVoucher(false);
    }
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

  const originalTotalPrice = booking.totalPrice + (booking.discountAmount || 0);
  const depositAmount = booking.depositAmount || Math.round(booking.totalPrice * 0.3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Thanh toán đặt phòng</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Summary */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-fit">
            <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-gray-100 text-gray-800">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Mã đặt phòng</p>
                  <p className="text-xl font-bold text-blue-900">{booking.bookingCode}</p>
                </div>
                {booking.voucherCode && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                    <FaTag className="mr-1" /> {booking.voucherCode}
                  </span>
                )}
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

              <div className="border-t border-gray-200 pt-6 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Giá phòng gốc</span>
                  <span>{formatPrice(originalTotalPrice)}</span>
                </div>
                
                {booking.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg">
                    <span className="flex items-center">
                      <FaTicketAlt className="mr-2" /> Ưu đãi Voucher ({booking.voucherCode})
                    </span>
                    <span>-{formatPrice(booking.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Phí dịch vụ</span>
                  <span className="text-green-600 font-medium">Miễn phí</span>
                </div>

                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
                  <span>Tổng thanh toán</span>
                  <span className="text-xl text-primary-600">{formatPrice(booking.totalPrice)}</span>
                </div>

                <div className="flex justify-between items-center bg-primary-50 p-4 rounded-xl border border-primary-100 mt-3">
                  <div>
                    <span className="font-bold text-primary-800 block">Tiền cọc giữ phòng (30%)</span>
                    <span className="text-xs text-primary-600">Thanh toán ngay để nhận QR Check-in</span>
                  </div>
                  <span className="text-2xl font-bold text-primary-700">{formatPrice(depositAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Khối nhập Voucher Khuyến Mãi */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
              <FaTag className="text-primary-500 mr-2" /> Mã giảm giá & Ưu đãi
            </h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập mã ưu đãi (VD: HOSTAY50)"
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                className="flex-1 uppercase font-semibold tracking-wider px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleApplyVoucher()}
                disabled={applyingVoucher || !voucherInput.trim()}
                className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center min-w-[110px]"
              >
                {applyingVoucher ? 'Đang xét...' : 'Áp dụng'}
              </button>
            </div>

            {/* Gợi ý mã có sẵn */}
            {publicVouchers.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-medium">Mã ưu đãi dành cho bạn (bấm để dùng):</p>
                <div className="flex flex-wrap gap-2">
                  {publicVouchers.map((v) => (
                    <button
                      key={v.code}
                      type="button"
                      onClick={() => {
                        setVoucherInput(v.code);
                        handleApplyVoucher(v.code);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg border flex items-center transition ${
                        booking.voucherCode === v.code
                          ? 'border-green-500 bg-green-50 text-green-700 font-bold'
                          : 'border-dashed border-primary-300 hover:bg-primary-50 text-primary-700'
                      }`}
                    >
                      <span className="font-bold mr-1">{v.code}:</span>
                      <span>
                        {v.discountType === 'percent'
                          ? `Giảm ${v.discountPercent}%`
                          : `Giảm ${new Intl.NumberFormat('vi-VN').format(v.discountAmount)}đ`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
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
                    Đang chuyển hướng...
                  </span>
                ) : (
                  `Đặt cọc ${formatPrice(depositAmount)}`
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
