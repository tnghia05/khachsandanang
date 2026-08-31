import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { getMyBookings } from '../api/bookingApi';
import ETicket from '../components/booking/ETicket';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BookingSuccessPage = () => {
  const { bookingCode } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await getMyBookings();
        const found = res.data.find(b => b.bookingCode === bookingCode);
        
        if (found) {
          setBooking(found);
        } else {
          // Could not find in user's list (maybe API pagination issue, or wrong user)
          navigate('/my-bookings');
        }
      } catch (error) {
        console.error('Error fetching booking', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooking();
  }, [bookingCode, navigate]);

  if (loading) return <LoadingSpinner message="Đang tải vé điện tử..." />;
  if (!booking) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4 animate-bounce" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
        <p className="text-gray-600 text-lg">Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của Hostay.</p>
      </div>

      <div className="mb-10">
        <ETicket booking={booking} />
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link 
          to="/"
          className="px-8 py-3 rounded-xl border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto text-center"
        >
          Về trang chủ
        </Link>
        <Link 
          to="/my-bookings"
          className="px-8 py-3 rounded-xl bg-primary-600 font-semibold text-white hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 w-full sm:w-auto text-center"
        >
          Xem lịch sử đặt phòng
        </Link>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
