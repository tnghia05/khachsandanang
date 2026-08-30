import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/common/SearchBar';
import { FaShieldAlt, FaStar, FaHeadset, FaMapMarkerAlt } from 'react-icons/fa';

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
      {/* Hero Section */}
      <section className="relative w-full py-20 lg:py-32 bg-gradient-to-r from-primary-900/70 to-primary-600/50" style={{
        backgroundImage: 'linear-gradient(to right, rgba(14, 165, 233, 0.9), rgba(2, 132, 199, 0.7))',
      }}>
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

      {/* Featured Destinations Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Điểm đến nổi bật tại Đà Nẵng</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest) => (
            <div key={dest.id} className={`${dest.color} rounded-2xl p-6 text-white shadow-lg transform transition hover:-translate-y-2 cursor-pointer h-48 flex flex-col justify-end relative overflow-hidden`}>
              <div className="absolute top-4 right-4 bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <FaMapMarkerAlt className="text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-1 z-10">{dest.title}</h3>
              <p className="text-sm text-white/90 z-10">{dest.subtitle}</p>
              {/* decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Hostay Section */}
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
