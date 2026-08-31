import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-hot-toast';
import { FaArrowLeft, FaCamera, FaUser, FaUsers, FaChild } from 'react-icons/fa';
import { getHotelById } from '../api/hotelDetailApi';
import { createBooking } from '../api/bookingApi';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const RoomDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get('hotelId');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [checkInDate, setCheckInDate] = useState(() => {
    const p = searchParams.get('checkIn');
    return p ? new Date(p) : new Date();
  });
  
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const p = searchParams.get('checkOut');
    if (p) return new Date(p);
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    return tmr;
  });

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!hotelId) throw new Error("Thiếu ID khách sạn");
        const data = await getHotelById(hotelId);
        setHotel(data.data);
        
        const foundRoom = data.data.rooms?.find(r => r._id === id);
        if (!foundRoom) throw new Error("Không tìm thấy phòng");
        setRoom(foundRoom);
        
        // Update defaults if needed based on room capacity
        if (foundRoom.capacity?.adults) {
          setAdults(Math.min(2, foundRoom.capacity.adults));
        }
      } catch (error) {
        toast.error(error.message || 'Có lỗi xảy ra khi tải dữ liệu');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, hotelId, navigate]);

  const handleBook = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/rooms/${id}?hotelId=${hotelId}` } });
      return;
    }

    if (!checkInDate || !checkOutDate) {
      toast.error('Vui lòng chọn ngày nhận và trả phòng');
      return;
    }

    if (checkInDate >= checkOutDate) {
      toast.error('Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createBooking({
        roomId: room._id,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        guestCount: { adults, children }
      });
      
      toast.success('Đặt phòng thành công! Đang chuyển đến thanh toán...');
      navigate(`/checkout/${res.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi đặt phòng');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations
  const calcNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const diffTime = Math.abs(checkOutDate - checkInDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calcNights();
  const totalPrice = room ? room.pricePerNight * nights : 0;
  const depositAmount = totalPrice * 0.3;

  if (loading) return <LoadingSpinner message="Đang chuẩn bị trang đặt phòng..." />;
  if (!room || !hotel) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to={`/hotels/${hotelId}`} className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6 font-medium transition-colors">
        <FaArrowLeft className="mr-2" /> Quay lại khách sạn
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Room Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.name}</h1>
              <p className="text-gray-500 text-lg">{hotel.name}</p>
            </div>
            <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold uppercase tracking-wider border border-blue-100">
              {room.roomType}
            </span>
          </div>

          <div className="w-full h-80 bg-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 border border-gray-100 shadow-inner">
            <FaCamera className="text-6xl mb-4 opacity-30" />
            <span>Hình ảnh phòng</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold mb-4">Chi tiết phòng</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <FaUsers className="text-primary-500 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sức chứa</p>
                  <p className="font-medium">{room.capacity?.adults || 2} Người lớn</p>
                </div>
              </div>
            </div>

            <h4 className="font-bold mb-3 text-gray-800">Tiện nghi phòng</h4>
            <div className="flex flex-wrap gap-2">
              {room.amenities?.map((am, i) => (
                <span key={i} className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700">
                  {am}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Booking Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-24">
            <div className="bg-primary-600 p-6 text-white text-center">
              <p className="text-sm opacity-80 uppercase tracking-widest font-medium mb-1">Giá mỗi đêm</p>
              <div className="text-3xl font-bold">{formatPrice(room.pricePerNight)}</div>
            </div>

            <div className="p-6 space-y-6">
              {/* Dates */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày nhận phòng</label>
                  <DatePicker
                    selected={checkInDate}
                    onChange={(date) => setCheckInDate(date)}
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500 focus:ring-0 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày trả phòng</label>
                  <DatePicker
                    selected={checkOutDate}
                    onChange={(date) => setCheckOutDate(date)}
                    minDate={checkInDate || new Date()}
                    dateFormat="dd/MM/yyyy"
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-primary-500 focus:ring-0 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Người lớn</label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="number"
                      min="1"
                      max={room.capacity?.adults || 4}
                      value={adults}
                      onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                      className="w-full border-2 border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Trẻ em</label>
                  <div className="relative">
                    <FaChild className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      max={room.capacity?.children || 2}
                      value={children}
                      onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                      className="w-full border-2 border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              {nights > 0 && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>{formatPrice(room.pricePerNight)} × {nights} đêm</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-3">
                    <span>Phí dịch vụ</span>
                    <span>Miễn phí</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-gray-800">
                    <span>Tổng tiền</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-primary-700 bg-primary-50 p-2 rounded pt-3 font-semibold text-sm">
                    <span>Tiền cọc cần thanh toán (30%)</span>
                    <span>{formatPrice(depositAmount)}</span>
                  </div>
                </div>
              )}

              {/* Action */}
              {!user ? (
                <button
                  onClick={() => navigate('/login', { state: { from: `/rooms/${id}?hotelId=${hotelId}` } })}
                  className="w-full bg-gray-800 text-white py-4 rounded-xl font-bold hover:bg-gray-900 transition-colors"
                >
                  Đăng nhập để đặt phòng
                </button>
              ) : (
                <button
                  onClick={handleBook}
                  disabled={submitting || nights <= 0}
                  className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-200"
                >
                  {submitting ? 'Đang xử lý...' : 'Đặt ngay'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;
