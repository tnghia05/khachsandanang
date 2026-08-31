import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaStar, FaCamera } from 'react-icons/fa';

const typeColors = {
  homestay: 'bg-green-100 text-green-800',
  hotel: 'bg-blue-100 text-blue-800',
  resort: 'bg-purple-100 text-purple-800',
  apartment: 'bg-orange-100 text-orange-800',
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const HotelCard = ({ hotel }) => {
  const { name, type, district, address, ratingAverage, images, availableRooms } = hotel;
  
  // Find the cheapest room for display
  const lowestPrice = availableRooms && availableRooms.length > 0
    ? Math.min(...availableRooms.map(r => r.pricePerNight))
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col sm:flex-row mb-4">
      {/* Image */}
      <div className="sm:w-1/3 h-48 sm:h-auto bg-gray-200 flex-shrink-0 relative">
        {images && images.length > 0 ? (
          <img src={images[0]} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <FaCamera className="text-3xl mb-2" />
            <span>Không có ảnh</span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-md uppercase ${typeColors[type] || 'bg-gray-100 text-gray-800'}`}>
            {type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{name}</h3>
            {ratingAverage > 0 && (
              <div className="flex items-center text-amber-500 bg-amber-50 px-2 py-1 rounded">
                <FaStar className="mr-1 text-sm" />
                <span className="font-bold text-sm">{ratingAverage.toFixed(1)}</span>
              </div>
            )}
          </div>
          <div className="text-gray-500 text-sm flex items-start mb-3">
            <FaMapMarkerAlt className="mt-1 mr-1 flex-shrink-0" />
            <span className="line-clamp-2">{address}, {district}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row justify-between items-end sm:items-center">
          <div className="mb-3 sm:mb-0">
            {lowestPrice > 0 ? (
              <>
                <p className="text-xs text-gray-500">Giá từ</p>
                <p className="text-xl font-bold text-primary-600">{formatPrice(lowestPrice)}<span className="text-sm font-normal text-gray-500">/đêm</span></p>
              </>
            ) : (
              <p className="text-sm text-gray-500 italic">Hết phòng trống</p>
            )}
          </div>
          <Link to={`/hotels/${hotel._id}`} className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto text-center">
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
