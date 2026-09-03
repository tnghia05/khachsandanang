import React, { useState } from 'react';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const RevenueBarChart = ({ data = [] }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        Chưa có dữ liệu doanh thu
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1000000);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Biểu đồ doanh thu 6 tháng gần nhất</h3>
          <p className="text-xs text-gray-500">Doanh thu từ các đơn đặt phòng đã thanh toán / xác nhận</p>
        </div>
      </div>

      <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2 border-b border-gray-200 relative">
        {data.map((item, index) => {
          const heightPercent = Math.max(8, Math.round((item.revenue / maxRevenue) * 85));
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.month}
              className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-12 z-20 bg-slate-900 text-white text-xs py-1.5 px-3 rounded-lg shadow-lg pointer-events-none whitespace-nowrap">
                  <p className="font-bold">{item.month}</p>
                  <p className="text-primary-300 font-semibold">{formatCurrency(item.revenue)}</p>
                  <p className="text-[10px] text-gray-300">{item.bookingsCount} đơn đặt phòng</p>
                </div>
              )}

              {/* Bar */}
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full max-w-[48px] rounded-t-lg transition-all duration-300 ${
                  isHovered
                    ? 'bg-primary-600 shadow-lg shadow-primary-200'
                    : 'bg-gradient-to-t from-primary-500 to-sky-400 hover:brightness-105'
                }`}
              />

              {/* Month Label */}
              <span className="text-xs font-semibold text-gray-600 mt-2 truncate w-full text-center">
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RevenueBarChart;
