import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/common/SearchBar';
import PriceFilter from '../components/common/PriceFilter';
import HotelCard from '../components/common/HotelCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { searchHotels } from '../api/hotelApi';
import { FaFilter, FaSearchLocation } from 'react-icons/fa';

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [sortOrder, setSortOrder] = useState('Đánh giá cao nhất');

  // Extract initial values from URL
  const initialSearchParams = {
    district: searchParams.get('district') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: Number(searchParams.get('guests')) || 1,
  };

  const initialFilters = {
    minPrice: Number(searchParams.get('minPrice')) || undefined,
    maxPrice: Number(searchParams.get('maxPrice')) || undefined,
    type: searchParams.get('type') || '',
    minRating: Number(searchParams.get('minRating')) || undefined,
  };

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams.entries());
      const data = await searchHotels(params);
      
      // Client side sorting
      let results = data.data || [];
      if (sortOrder === 'Giá thấp đến cao') {
        results.sort((a, b) => {
          const priceA = a.availableRooms?.[0]?.pricePerNight || 999999999;
          const priceB = b.availableRooms?.[0]?.pricePerNight || 999999999;
          return priceA - priceB;
        });
      } else if (sortOrder === 'Giá cao đến thấp') {
        results.sort((a, b) => {
          const priceA = a.availableRooms?.[0]?.pricePerNight || 0;
          const priceB = b.availableRooms?.[0]?.pricePerNight || 0;
          return priceB - priceA;
        });
      } else {
        results.sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0));
      }
      
      setHotels(results);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [searchParams, sortOrder]);

  const handleSearch = (newParams) => {
    const newSearchParams = new URLSearchParams(searchParams);
    Object.keys(newParams).forEach(key => {
      if (newParams[key]) {
        newSearchParams.set(key, newParams[key]);
      } else {
        newSearchParams.delete(key);
      }
    });
    setSearchParams(newSearchParams);
  };

  const handleFilterChange = (newFilters) => {
    const newSearchParams = new URLSearchParams(searchParams);
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] !== undefined && newFilters[key] !== '') {
        newSearchParams.set(key, newFilters[key]);
      } else {
        newSearchParams.delete(key);
      }
    });
    setSearchParams(newSearchParams);
    if (window.innerWidth < 1024) {
      setShowMobileFilter(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-6 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Search Bar */}
        <SearchBar onSearch={handleSearch} initialValues={initialSearchParams} variant="compact" />

        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-2">
            <span className="font-semibold text-gray-800">Tìm thấy {hotels.length} kết quả</span>
            <button 
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="flex items-center text-primary-600 bg-primary-50 px-4 py-2 rounded-lg font-medium"
            >
              <FaFilter className="mr-2" /> Bộ lọc
            </button>
          </div>

          {/* Left Sidebar - Filters */}
          <div className={`lg:w-1/4 ${showMobileFilter ? 'block' : 'hidden lg:block'}`}>
            <PriceFilter onFilterChange={handleFilterChange} filters={initialFilters} />
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="hidden lg:flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Tìm thấy {hotels.length} kết quả</h2>
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="p-2 border rounded-md shadow-sm focus:ring-primary-500 text-sm bg-white"
              >
                <option>Đánh giá cao nhất</option>
                <option>Giá thấp đến cao</option>
                <option>Giá cao đến thấp</option>
              </select>
            </div>

            {/* Mobile sort select */}
            <div className="lg:hidden mb-4">
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full p-2 border rounded-md shadow-sm focus:ring-primary-500 text-sm bg-white"
              >
                <option>Đánh giá cao nhất</option>
                <option>Giá thấp đến cao</option>
                <option>Giá cao đến thấp</option>
              </select>
            </div>

            {/* Results List */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm p-12">
                <LoadingSpinner message="Đang tìm kiếm phòng tốt nhất cho bạn..." />
              </div>
            ) : hotels.length > 0 ? (
              <div className="space-y-4">
                {hotels.map(hotel => (
                  <HotelCard key={hotel.hotelId || hotel._id} hotel={hotel} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-16 flex flex-col items-center justify-center text-center">
                <div className="bg-primary-50 p-6 rounded-full mb-6">
                  <FaSearchLocation className="text-6xl text-primary-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy kết quả phù hợp</h3>
                <p className="text-gray-500 max-w-md">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm được chỗ nghỉ ưng ý nhé.
                </p>
                <button 
                  onClick={() => handleFilterChange({})}
                  className="mt-6 text-primary-500 hover:text-primary-600 font-medium"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
