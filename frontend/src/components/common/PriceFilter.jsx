import React, { useState } from 'react';

const PriceFilter = ({ onFilterChange, filters = {} }) => {
  const [minPrice, setMinPrice] = useState(filters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || '');
  const [type, setType] = useState(filters.type || '');
  const [minRating, setMinRating] = useState(filters.minRating || 0);

  const handleApply = () => {
    onFilterChange({
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      type,
      minRating: minRating > 0 ? minRating : undefined,
    });
  };

  const handleClear = () => {
    setMinPrice('');
    setMaxPrice('');
    setType('');
    setMinRating(0);
    onFilterChange({});
  };

  const setQuickPrice = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const types = [
    { value: '', label: 'Tất cả' },
    { value: 'hotel', label: 'Khách sạn' },
    { value: 'homestay', label: 'Homestay' },
    { value: 'resort', label: 'Resort' },
    { value: 'apartment', label: 'Căn hộ' },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-gray-800">Bộ lọc</h3>
        <button onClick={handleClear} className="text-sm text-primary-500 hover:underline">Xóa bộ lọc</button>
      </div>

      {/* Khoảng giá */}
      <div className="mb-6">
        <h4 className="font-medium text-sm text-gray-700 mb-3">Khoảng giá (VND)</h4>
        <div className="flex items-center space-x-2 mb-3">
          <input
            type="number"
            placeholder="Tối thiểu"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full p-2 border rounded-md text-sm"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Tối đa"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full p-2 border rounded-md text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setQuickPrice('', 500000)} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-700">Dưới 500K</button>
          <button onClick={() => setQuickPrice(500000, 1000000)} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-700">500K - 1M</button>
          <button onClick={() => setQuickPrice(1000000, 2000000)} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-700">1M - 2M</button>
          <button onClick={() => setQuickPrice(2000000, '')} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-700">Trên 2M</button>
        </div>
      </div>

      {/* Loại chỗ nghỉ */}
      <div className="mb-6">
        <h4 className="font-medium text-sm text-gray-700 mb-3">Loại chỗ nghỉ</h4>
        <div className="space-y-2">
          {types.map((t) => (
            <label key={t.value} className="flex items-center text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="propertyType"
                value={t.value}
                checked={type === t.value}
                onChange={(e) => setType(e.target.value)}
                className="mr-2 text-primary-500 focus:ring-primary-500 h-4 w-4"
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      {/* Đánh giá */}
      <div className="mb-6">
        <h4 className="font-medium text-sm text-gray-700 mb-3">Đánh giá tối thiểu</h4>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setMinRating(star)}
              className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center ${minRating === star ? 'bg-amber-100 text-amber-600 border border-amber-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {star}+
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleApply} className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-medium transition">
        Áp dụng bộ lọc
      </button>
    </div>
  );
};

export default PriceFilter;
