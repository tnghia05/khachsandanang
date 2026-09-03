import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FaHotel,
  FaPlus,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaBed,
  FaMapMarkerAlt,
  FaStar,
  FaTimes,
} from 'react-icons/fa';
import { getAdminHotels, createHotel, updateHotel, toggleHotelStatus } from '../../api/adminApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const districts = [
  'Hai Chau',
  'Son Tra',
  'Ngu Hanh Son',
  'Thanh Khe',
  'Cam Le',
  'Lien Chieu',
  'Hoa Vang',
];

const hotelTypes = [
  { value: 'hotel', label: 'Khách sạn (Hotel)' },
  { value: 'homestay', label: 'Homestay' },
  { value: 'resort', label: 'Resort' },
  { value: 'apartment', label: 'Căn hộ (Apartment)' },
];

const AdminHotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'hotel',
    district: 'Son Tra',
    address: '',
    description: '',
    amenities: 'WiFi miễn phí, Điều hòa',
  });
  const [saving, setSaving] = useState(false);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const res = await getAdminHotels();
      setHotels(res.data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách khách sạn:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleOpenModal = (hotel = null) => {
    if (hotel) {
      setEditingHotel(hotel);
      setFormData({
        name: hotel.name,
        type: hotel.type,
        district: hotel.district,
        address: hotel.address,
        description: hotel.description || '',
        amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(', ') : '',
      });
    } else {
      setEditingHotel(null);
      setFormData({
        name: '',
        type: 'hotel',
        district: 'Son Tra',
        address: '',
        description: '',
        amenities: 'WiFi miễn phí, Điều hòa',
      });
    }
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (hotelId) => {
    try {
      const res = await toggleHotelStatus(hotelId);
      toast.success(res.message || 'Cập nhật trạng thái thành công');
      fetchHotels();
    } catch (err) {
      toast.error('Lỗi khi đổi trạng thái');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      toast.error('Vui lòng điền tên và địa chỉ cơ sở lưu trú');
      return;
    }

    const payload = {
      ...formData,
      amenities: formData.amenities.split(',').map((a) => a.trim()).filter(Boolean),
    };

    try {
      setSaving(true);
      if (editingHotel) {
        await updateHotel(editingHotel._id, payload);
        toast.success('Cập nhật cơ sở lưu trú thành công');
      } else {
        await createHotel(payload);
        toast.success('Thêm mới cơ sở lưu trú thành công');
      }
      setIsModalOpen(false);
      fetchHotels();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu thông tin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaHotel className="text-primary-500 mr-3" /> Quản Lý Cơ Sở Lưu Trú (Khách sạn / Homestay)
          </h1>
          <p className="text-sm text-gray-500">
            Quản lý thông tin danh mục khách sạn, homestay, resort tại Đà Nẵng.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-primary-200 transition flex items-center self-start sm:self-auto text-sm"
        >
          <FaPlus className="mr-2" /> Thêm Cơ Sở Mới
        </button>
      </div>

      {/* Hotel Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Đang tải danh sách cơ sở lưu trú..." />
      ) : hotels.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border text-gray-500">
          Chưa có cơ sở lưu trú nào trong hệ thống.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <div
              key={hotel._id}
              className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col justify-between transition-all ${
                hotel.isActive ? 'border-gray-200' : 'border-red-200 bg-red-50/20 opacity-80'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary-100 text-primary-800">
                    {hotel.type}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      hotel.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {hotel.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-gray-900 mt-2 line-clamp-1">{hotel.name}</h3>

                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <FaMapMarkerAlt className="mr-1 text-primary-500 flex-shrink-0" />
                  <span className="truncate">{hotel.address}, {hotel.district}</span>
                </p>

                <p className="text-xs text-gray-600 mt-3 line-clamp-2">{hotel.description || 'Chưa có mô tả'}</p>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <FaStar className="text-amber-400 mr-1" /> {hotel.ratingAverage || 5.0} ({hotel.ratingQuantity || 0})
                  </span>
                  <Link
                    to={`/admin/rooms?hotelId=${hotel._id}`}
                    className="font-bold text-primary-600 hover:text-primary-700 flex items-center bg-primary-50 px-2.5 py-1 rounded-lg"
                  >
                    <FaBed className="mr-1" /> {hotel.roomsCount || 0} Loại phòng
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => handleOpenModal(hotel)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center transition"
                >
                  <FaEdit className="mr-1.5" /> Sửa
                </button>
                <button
                  onClick={() => handleToggleStatus(hotel._id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                    hotel.isActive
                      ? 'border border-red-200 text-red-600 hover:bg-red-50'
                      : 'border border-green-200 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {hotel.isActive ? <><FaEyeSlash className="mr-1" /> Ẩn</> : <><FaEye className="mr-1" /> Hiện</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Thêm / Sửa Khách Sạn */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900">
                {editingHotel ? 'Chỉnh sửa Cơ sở lưu trú' : 'Thêm mới Cơ sở lưu trú'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tên cơ sở lưu trú *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Sơn Trà Ocean View"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Loại hình</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                  >
                    {hotelTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Quận / Huyện *</label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                  >
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Địa chỉ chi tiết *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="VD: 123 Võ Nguyên Giáp, Phước Mỹ"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tiện nghi (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="WiFi miễn phí, Điều hòa, Bể bơi"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mô tả giới thiệu</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Giới thiệu sơ lược về cơ sở lưu trú..."
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu Cơ Sở'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHotelsPage;
