import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SearchBar from '../components/common/SearchBar';
import {
  FaShieldAlt,
  FaStar,
  FaHeadset,
  FaMapMarkerAlt,
  FaBullhorn,
  FaHotel,
  FaCrown,
  FaArrowRight,
} from 'react-icons/fa';
import { getFeaturedHotels } from '../api/hotelDetailApi';

const destinations = [
  { id: 1, title: 'Bán đảo Sơn Trà', subtitle: 'Thiên đường nghỉ dưỡng bên biển', color: 'bg-green-500' },
  { id: 2, title: 'Phố cổ Hội An', subtitle: 'Di sản văn hóa thế giới', color: 'bg-amber-500' },
  { id: 3, title: 'Ngũ Hành Sơn', subtitle: 'Danh thắng núi đá cẩm thạch', color: 'bg-purple-500' },
  { id: 4, title: 'Bãi biển Mỹ Khê', subtitle: 'Top bãi biển đẹp nhất hành tinh', color: 'bg-blue-500' },
];

const features = [
  { id: 1, icon: FaShieldAlt, title: 'Đặt phòng an toàn', desc: 'Thanh toán bảo mật, hoàn tiền nếu không hài lòng' },
  { id: 2, icon: FaStar, title: 'Giá tốt nhất', desc: 'Cam kết giá tốt nhất thị trường Đà Nẵng' },
  { id: 3, icon: FaHeadset, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ chăm sóc khách hàng luôn sẵn sàng' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [marqueeMessages, setMarqueeMessages] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await getFeaturedHotels();
        if (res.data) {
          setFeaturedHotels(res.data.hotels || []);
          setMarqueeMessages(res.data.marqueeMessages || []);
        }
      } catch (err) {
        console.error('Không thể tải khách sạn nổi bật:', err);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (params) => {
    const query = new URLSearchParams();
    if (params.district) query.set('district', params.district);
    if (params.checkIn) query.set('checkIn', params.checkIn);
    if (params.checkOut) query.set('checkOut', params.checkOut);
    if (params.guests) query.set('guests', params.guests);
    navigate(`/search?${query.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. Marquee Ticker: Dòng chữ chạy quảng cáo ưu đãi đối tác */}
      {marqueeMessages.length > 0 && (
        <div className="bg-gradient-to-r from-amber-600 via-primary-600 to-amber-600 text-white py-2.5 px-4 shadow-sm flex items-center overflow-hidden border-b border-white/20">
          <div className="flex items-center space-x-1.5 flex-shrink-0 bg-slate-950/40 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mr-4 shadow-sm">
            <FaBullhorn className="text-amber-300 animate-bounce" />
            <span>Đối Tác Tài Trợ</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap flex-1">
            <div className="inline-block animate-marquee text-xs md:text-sm font-semibold tracking-wide">
              {marqueeMessages.map((msg, index) => (
                <span key={index} className="inline-flex items-center mx-6">
                  <span className="mr-2">🔥</span>
                  <span>{msg}</span>
                  <span className="ml-6 text-amber-200">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Hero Section */}
      <section
        className="relative w-full py-20 lg:py-32 bg-gradient-to-r from-primary-900/70 to-primary-600/50"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(14, 165, 233, 0.9), rgba(2, 132, 199, 0.7))',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white text-center mb-6 drop-shadow-md">
            Khám phá Đà Nẵng, Nghỉ dưỡng theo cách của bạn
          </h1>
          <p className="text-lg md:text-xl text-white text-center mb-12 max-w-3xl drop-shadow">
            Tìm kiếm và đặt phòng khách sạn, homestay tốt nhất tại thành phố biển Đà Nẵng
          </p>
          <SearchBar onSearch={handleSearch} variant="hero" />
        </div>
      </section>

      {/* 3. Banner Khách Sạn Đối Tác Nổi Bật (Featured Ad Package) */}
      {featuredHotels.length > 0 && (
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2 mb-8">
            <div>
              <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-flex items-center">
                <FaCrown className="mr-1.5 text-amber-500" /> Đối Tác Nổi Bật Hostay
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                Cơ Sở Lưu Trú Được Đề Xuất Tuần Này
              </h2>
            </div>
            <Link
              to="/search"
              className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center"
            >
              Xem tất cả khách sạn <FaArrowRight className="ml-1.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredHotels.map((hotel) => (
              <div
                key={hotel._id}
                className="bg-white rounded-2xl shadow-md border border-amber-200/80 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative h-48 bg-slate-200 overflow-hidden">
                    <img
                      src={
                        hotel.images && hotel.images[0]
                          ? hotel.images[0]
                          : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'
                      }
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full shadow flex items-center">
                      <FaCrown className="mr-1 text-xs" /> TÀI TRỢ NỔI BẬT
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow flex items-center">
                      <FaStar className="text-amber-400 mr-1" /> {hotel.ratingAverage || 4.8}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-2">
                    <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wider">
                      {hotel.type}
                    </span>
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition">
                      {hotel.name}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center">
                      <FaMapMarkerAlt className="mr-1 text-primary-500 flex-shrink-0" />
                      <span className="truncate">{hotel.address}, {hotel.district}</span>
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-2">
                      {hotel.description || 'Trải nghiệm dịch vụ lưu trú đẳng cấp với view biển tuyệt đẹp.'}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  <Link
                    to={`/hotels/${hotel._id}`}
                    className="w-full bg-primary-50 hover:bg-primary-600 text-primary-700 hover:text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center text-xs"
                  >
                    Xem Phòng & Đặt Ngay
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Featured Destinations Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Điểm đến nổi bật tại Đà Nẵng</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              onClick={() => handleSearch({ district: 'Son Tra' })}
              className={`${dest.color} rounded-2xl p-6 text-white shadow-lg transform transition hover:-translate-y-2 cursor-pointer h-48 flex flex-col justify-end relative overflow-hidden`}
            >
              <div className="absolute top-4 right-4 bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <FaMapMarkerAlt className="text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-1 z-10">{dest.title}</h3>
              <p className="text-sm text-white/90 z-10">{dest.subtitle}</p>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Why Hostay Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Tại sao chọn Hostay?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.id} className="text-center p-6 rounded-xl hover:bg-gray-50 transition">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-500 mb-6">
                  <feature.icon className="text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
