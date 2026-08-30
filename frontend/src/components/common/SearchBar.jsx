import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUser } from 'react-icons/fa';

const districts = [
  { label: 'Tất cả', value: '' },
  { label: 'Hải Châu', value: 'Hai Chau' },
  { label: 'Sơn Trà', value: 'Son Tra' },
  { label: 'Ngũ Hành Sơn', value: 'Ngu Hanh Son' },
  { label: 'Thanh Khê', value: 'Thanh Khe' },
  { label: 'Cẩm Lệ', value: 'Cam Le' },
  { label: 'Liên Chiểu', value: 'Lien Chieu' },
  { label: 'Hòa Vang', value: 'Hoa Vang' },
];

const SearchBar = ({ onSearch, initialValues = {}, variant = 'hero' }) => {
  const [district, setDistrict] = useState(initialValues.district || '');
  const [checkIn, setCheckIn] = useState(initialValues.checkIn ? new Date(initialValues.checkIn) : new Date());
  const [checkOut, setCheckOut] = useState(initialValues.checkOut ? new Date(initialValues.checkOut) : new Date(Date.now() + 86400000));
  const [guests, setGuests] = useState(initialValues.guests || 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formatDate = (date) => date.toISOString().split('T')[0];
    onSearch({
      district: district,
      checkIn: formatDate(checkIn),
      checkOut: formatDate(checkOut),
      guests,
    });
  };

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl max-w-4xl w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1 flex items-center"><FaMapMarkerAlt className="mr-1" /> Quận/Huyện</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="p-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              {districts.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1 flex items-center"><FaCalendarAlt className="mr-1" /> Ngày nhận phòng</label>
            <DatePicker
              selected={checkIn}
              onChange={(date) => {
                setCheckIn(date);
                if (date >= checkOut) {
                  setCheckOut(new Date(date.getTime() + 86400000));
                }
              }}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              className="p-2 border rounded-md w-full focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1 flex items-center"><FaCalendarAlt className="mr-1" /> Ngày trả phòng</label>
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              minDate={new Date(checkIn.getTime() + 86400000)}
              dateFormat="dd/MM/yyyy"
              className="p-2 border rounded-md w-full focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1 flex items-center"><FaUser className="mr-1" /> Số khách</label>
            <input
              type="number"
              min="1"
              max="10"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="p-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <button type="submit" className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition flex items-center text-lg w-full md:w-auto justify-center">
            <FaSearch className="mr-2" /> Tìm kiếm
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-md mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="p-2 border rounded-md text-sm"
        >
          {districts.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
        <DatePicker
          selected={checkIn}
          onChange={(date) => {
            setCheckIn(date);
            if (date >= checkOut) setCheckOut(new Date(date.getTime() + 86400000));
          }}
          minDate={new Date()}
          dateFormat="dd/MM/yyyy"
          className="p-2 border rounded-md w-full text-sm"
          placeholderText="Nhận phòng"
        />
        <DatePicker
          selected={checkOut}
          onChange={(date) => setCheckOut(date)}
          minDate={new Date(checkIn.getTime() + 86400000)}
          dateFormat="dd/MM/yyyy"
          className="p-2 border rounded-md w-full text-sm"
          placeholderText="Trả phòng"
        />
        <input
          type="number"
          min="1"
          max="10"
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="p-2 border rounded-md text-sm"
          placeholder="Số khách"
        />
        <button type="submit" className="bg-primary-500 text-white p-2 rounded-md hover:bg-primary-600 transition flex items-center justify-center font-medium">
          <FaSearch className="mr-1" /> Tìm
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
