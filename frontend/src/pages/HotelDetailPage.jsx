import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaStar, FaCamera, FaBed, FaUser, FaWifi, FaCoffee, FaSnowflake } from 'react-icons/fa';
import { getHotelById } from '../api/hotelDetailApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const getAmenityIcon = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('wifi')) return <FaWifi />;
  if (lower.includes('sáng')) return <FaCoffee />;
  if (lower.includes('lạnh')) return <FaSnowflake />;
  return <FaStar />;
};

const HotelDetailPage = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        setLoading(true);
        const data = await getHotelById(id);
        setHotel(data.data);
      } catch (error) {
        toast.error('Không thể tải thông tin khách sạn');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  if (loading) return <LoadingSpinner message="Đang tải thông tin khách sạn..." />;
  if (!hotel) return <div className="text-center py-20 text-gray-500">Không tìm thấy khách sạn</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm mb-6 text-gray-500 flex items-center space-x-2">
        <Link to="/" className="hover:text-primary-600 transition-colors">Trang chủ</Link>
        <span>&gt;</span>
        <span>{hotel.district}</span>
        <span>&gt;</span>
        <span className="text-gray-800 font-medium">{hotel.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium capitalize">
                {hotel.type}
              </span>
              <div className="flex text-amber-400">
                {[...Array(hotel.rating || 5)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
            <p className="flex items-center text-gray-600">
              <FaMapMarkerAlt className="mr-2 text-primary-500" />
              {hotel.address}, {hotel.district}
            </p>
          </div>

          {/* Image Placeholder */}
          <div className="w-full h-80 md:h-96 bg-gray-200 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden relative group">
            {hotel.images && hotel.images.length > 0 ? (
              <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <FaCamera className="text-6xl mb-4 opacity-50" />
                <span className="text-lg font-medium">Hình ảnh khách sạn</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô tả khách sạn</h2>
            <p className="text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100">
              {hotel.description || 'Chưa có thông tin mô tả chi tiết cho khách sạn này.'}
            </p>
          </div>

          {/* Rooms Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Các loại phòng</h2>
            
            {hotel.rooms && hotel.rooms.length > 0 ? (
              <div className="space-y-6">
                {hotel.rooms.map(room => (
                  <div key={room._id} className="border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-shadow bg-white">
                    <div className="w-full md:w-48 h-32 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <FaBed className="text-4xl text-gray-300" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{room.name}</h3>
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider border border-blue-100">
                          {room.roomType}
                        </span>
                      </div>
                      
                      <div className="flex gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <FaUser className="text-gray-400" />
                          <span>{room.capacity?.adults || 2} người lớn</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {room.amenities?.map((amenity, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs text-gray-600 border border-gray-100">
                            {getAmenityIcon(amenity)}
                            {amenity}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-2xl font-bold text-primary-600">{formatPrice(room.pricePerNight)}</p>
                          <p className="text-xs text-gray-500">/ đêm</p>
                        </div>
                        <Link 
                          to={`/rooms/${room._id}?hotelId=${hotel._id}`}
                          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-md shadow-primary-200"
                        >
                          Đặt phòng
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                Khách sạn hiện chưa có phòng nào.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Thông tin nhanh</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Loại chỗ nghỉ</p>
                <p className="font-medium capitalize">{hotel.type}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Khu vực</p>
                <p className="font-medium">{hotel.district}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                <p className="font-medium text-sm leading-relaxed">{hotel.address}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Đánh giá</p>
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(hotel.rating || 5)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <span className="font-medium">{hotel.rating || 5}.0</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 text-sm text-blue-800">
              <span className="text-xl">💡</span>
              <p>Mẹo: Đặt phòng sớm để có giá tốt nhất và đảm bảo phòng trống.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailPage;
