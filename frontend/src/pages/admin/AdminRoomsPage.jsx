import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FaBed,
  FaPlus,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaUsers,
  FaMoneyBillWave,
  FaTimes,
  FaHotel,
} from 'react-icons/fa';
import { getAdminHotels, getAdminRooms, createRoom, updateRoom, toggleRoomStatus } from '../../api/adminApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const roomTypes = [
  { value: 'standard', label: 'Phòng Tiêu chuẩn (Standard)' },
  { value: 'deluxe', label: 'Phòng Cao cấp (Deluxe)' },
  { value: 'suite', label: 'Phòng Thượng hạng (Suite)' },
  { value: 'family', label: 'Phòng Gia đình (Family)' },
];

const AdminRoomsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotelId, setSelectedHotelId] = useState(searchParams.get('hotelId') || '');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    hotelId: '',
    name: '',
    roomType: 'standard',
    pricePerNight: 500000,
    totalRooms: 5,
    capacityAdults: 2,
    capacityChildren: 0,
    amenities: 'WiFi miễn phí, Điều hòa',
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hotelsRes, roomsRes] = await Promise.all([
        getAdminHotels(),
        getAdminRooms(selectedHotelId),
      ]);
      setHotels(hotelsRes.data || []);
      setRooms(roomsRes.data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách phòng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedHotelId]);

  const handleFilterHotel = (hotelId) => {
    setSelectedHotelId(hotelId);
    if (hotelId) {
      setSearchParams({ hotelId });
    } else {
      setSearchParams({});
    }
  };

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        hotelId: room.hotelId?._id || room.hotelId,
        name: room.name,
        roomType: room.roomType || 'standard',
        pricePerNight: room.pricePerNight,
        totalRooms: room.totalRooms || 1,
        capacityAdults: room.capacity?.adults || 2,
        capacityChildren: room.capacity?.children || 0,
        amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : '',
      });
    } else {
      setEditingRoom(null);
      setFormData({
        hotelId: selectedHotelId || (hotels[0]?._id || ''),
        name: '',
        roomType: 'standard',
        pricePerNight: 500000,
        totalRooms: 5,
        capacityAdults: 2,
        capacityChildren: 0,
        amenities: 'WiFi miễn phí, Điều hòa',
      });
    }
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (roomId) => {
    try {
      const res = await toggleRoomStatus(roomId);
      toast.success(res.message || 'Cập nhật trạng thái thành công');
      fetchData();
    } catch (err) {
      toast.error('Lỗi khi đổi trạng thái');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.hotelId) {
      toast.error('Vui lòng chọn khách sạn và nhập tên phòng');
      return;
    }

    const payload = {
      hotelId: formData.hotelId,
      name: formData.name,
      roomType: formData.roomType,
      pricePerNight: Number(formData.pricePerNight),
      totalRooms: Number(formData.totalRooms),
      capacity: {
        maxGuests: Number(formData.capacityAdults) + Number(formData.capacityChildren),
        adults: Number(formData.capacityAdults),
        children: Number(formData.capacityChildren),
      },
      amenities: formData.amenities.split(',').map((a) => a.trim()).filter(Boolean),
    };

    try {
      setSaving(true);
      if (editingRoom) {
        await updateRoom(editingRoom._id, payload);
        toast.success('Cập nhật phòng thành công');
      } else {
        await createRoom(payload);
        toast.success('Thêm phòng mới thành công');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu phòng');
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
            <FaBed className="text-primary-500 mr-3" /> Quản Lý Loại Phòng Lưu Trú
          </h1>
          <p className="text-sm text-gray-500">
            Quản lý giá cả, loại phòng, tiện nghi và số lượng phòng theo từng cơ sở lưu trú.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-primary-200 transition flex items-center self-start sm:self-auto text-sm"
        >
          <FaPlus className="mr-2" /> Thêm Phòng Mới
        </button>
      </div>

      {/* Hotel Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-3">
        <span className="text-sm font-semibold text-gray-700 whitespace-nowrap flex items-center">
          <FaHotel className="mr-2 text-primary-500" /> Lọc theo cơ sở lưu trú:
        </span>
        <select
          value={selectedHotelId}
          onChange={(e) => handleFilterHotel(e.target.value)}
          className="w-full sm:w-80 px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white font-medium"
        >
          <option value="">Tất cả các cơ sở lưu trú ({hotels.length})</option>
          {hotels.map((h) => (
            <option key={h._id} value={h._id}>
              {h.name} ({h.district})
            </option>
          ))}
        </select>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingSpinner message="Đang tải danh sách phòng..." />
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Không có loại phòng nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                  <th className="py-3.5 px-6">Tên loại phòng</th>
                  <th className="py-3.5 px-6">Khách sạn</th>
                  <th className="py-3.5 px-6">Giá / Đêm</th>
                  <th className="py-3.5 px-6">Sức chứa</th>
                  <th className="py-3.5 px-6">Số phòng</th>
                  <th className="py-3.5 px-6">Trạng thái</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-gray-50/80 transition">
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-900">{room.name}</p>
                      <span className="text-xs uppercase px-2 py-0.5 rounded bg-gray-100 font-semibold text-gray-600">
                        {room.roomType}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-800">
                      {room.hotelId?.name || 'Khách sạn'}
                    </td>
                    <td className="py-4 px-6 font-bold text-primary-600">
                      {formatCurrency(room.pricePerNight)}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      <span className="flex items-center">
                        <FaUsers className="mr-1 text-xs text-gray-400" />
                        {room.capacity?.adults} NL {room.capacity?.children ? `+ ${room.capacity.children} TE` : ''}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-800">
                      {room.totalRooms || 1} phòng
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          room.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {room.isActive ? 'Đang mở bán' : 'Tạm ẩn'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(room)}
                        className="text-xs font-semibold text-gray-700 hover:text-primary-600 px-2.5 py-1.5 rounded-lg border hover:bg-gray-50 transition"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleToggleStatus(room._id)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition ${
                          room.isActive
                            ? 'text-red-600 border-red-200 hover:bg-red-50'
                            : 'text-green-600 border-green-200 hover:bg-green-50'
                        }`}
                      >
                        {room.isActive ? 'Ẩn' : 'Hiện'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Thêm / Sửa Phòng */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900">
                {editingRoom ? 'Chỉnh sửa Loại phòng' : 'Thêm mới Loại phòng'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Thuộc cơ sở lưu trú *</label>
                <select
                  required
                  value={formData.hotelId}
                  onChange={(e) => setFormData({ ...formData, hotelId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white font-medium"
                >
                  <option value="">-- Chọn khách sạn / homestay --</option>
                  {hotels.map((h) => (
                    <option key={h._id} value={h._id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tên loại phòng *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Phòng Deluxe Sea View"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phân loại</label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                  >
                    {roomTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Số lượng phòng *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.totalRooms}
                    onChange={(e) => setFormData({ ...formData, totalRooms: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Giá mỗi đêm (VNĐ) *</label>
                <input
                  type="number"
                  min={0}
                  step={50000}
                  required
                  value={formData.pricePerNight}
                  onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none font-bold text-primary-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Số người lớn</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.capacityAdults}
                    onChange={(e) => setFormData({ ...formData, capacityAdults: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Số trẻ em</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.capacityChildren}
                    onChange={(e) => setFormData({ ...formData, capacityChildren: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tiện nghi phòng</label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Điều hòa, Ban công, Bồn tắm"
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
                  {saving ? 'Đang lưu...' : 'Lưu Loại Phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoomsPage;
