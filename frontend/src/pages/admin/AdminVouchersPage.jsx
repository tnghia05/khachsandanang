import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import {
  FaTicketAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaCalendarAlt,
} from 'react-icons/fa';
import { getAdminVouchers, createVoucher, updateVoucher, deleteVoucher } from '../../api/adminApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const AdminVouchersPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percent',
    discountPercent: 10,
    discountAmount: 50000,
    maxDiscount: 200000,
    minOrderValue: 500000,
    maxUsage: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
  });

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await getAdminVouchers();
      setVouchers(res.data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách voucher:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleOpenModal = (voucher = null) => {
    if (voucher) {
      setEditingVoucher(voucher);
      setFormData({
        code: voucher.code,
        description: voucher.description || '',
        discountType: voucher.discountType || 'percent',
        discountPercent: voucher.discountPercent || 10,
        discountAmount: voucher.discountAmount || 50000,
        maxDiscount: voucher.maxDiscount || 0,
        minOrderValue: voucher.minOrderValue || 0,
        maxUsage: voucher.maxUsage || 100,
        startDate: new Date(voucher.startDate).toISOString().split('T')[0],
        endDate: new Date(voucher.endDate).toISOString().split('T')[0],
        isActive: voucher.isActive,
      });
    } else {
      setEditingVoucher(null);
      setFormData({
        code: '',
        description: '',
        discountType: 'percent',
        discountPercent: 10,
        discountAmount: 50000,
        maxDiscount: 200000,
        minOrderValue: 500000,
        maxUsage: 100,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã ưu đãi này?')) return;
    try {
      await deleteVoucher(id);
      toast.success('Đã xóa mã ưu đãi');
      fetchVouchers();
    } catch (err) {
      toast.error('Lỗi khi xóa mã ưu đãi');
    }
  };

  const handleToggleActive = async (voucher) => {
    try {
      await updateVoucher(voucher._id, { isActive: !voucher.isActive });
      toast.success(`Đã ${!voucher.isActive ? 'kích hoạt' : 'tắt'} voucher`);
      fetchVouchers();
    } catch (err) {
      toast.error('Lỗi khi đổi trạng thái voucher');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error('Vui lòng nhập mã voucher');
      return;
    }

    const payload = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      discountPercent: Number(formData.discountPercent),
      discountAmount: Number(formData.discountAmount),
      maxDiscount: Number(formData.maxDiscount),
      minOrderValue: Number(formData.minOrderValue),
      maxUsage: Number(formData.maxUsage),
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
    };

    try {
      setSaving(true);
      if (editingVoucher) {
        await updateVoucher(editingVoucher._id, payload);
        toast.success('Cập nhật voucher thành công');
      } else {
        await createVoucher(payload);
        toast.success('Tạo mới voucher thành công');
      }
      setIsModalOpen(false);
      fetchVouchers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu voucher');
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
            <FaTicketAlt className="text-primary-500 mr-3" /> Quản Lý Khuyến Mãi & Voucher
          </h1>
          <p className="text-sm text-gray-500">
            Cấu hình mã chiết khấu tự động, tỷ lệ giảm giá và hạn mức áp dụng cho khách hàng.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-primary-200 transition flex items-center self-start sm:self-auto text-sm"
        >
          <FaPlus className="mr-2" /> Tạo Voucher Mới
        </button>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingSpinner message="Đang tải danh sách voucher..." />
          </div>
        ) : vouchers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Chưa có mã ưu đãi nào trong hệ thống.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                  <th className="py-3.5 px-6">Mã Voucher</th>
                  <th className="py-3.5 px-6">Mức chiết khấu</th>
                  <th className="py-3.5 px-6">Đơn tối thiểu</th>
                  <th className="py-3.5 px-6">Lượt sử dụng</th>
                  <th className="py-3.5 px-6">Hạn áp dụng</th>
                  <th className="py-3.5 px-6">Trạng thái</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {vouchers.map((v) => {
                  const now = new Date();
                  const isExpired = new Date(v.endDate) < now;
                  return (
                    <tr key={v._id} className="hover:bg-gray-50/80 transition">
                      <td className="py-4 px-6">
                        <span className="font-extrabold text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200 tracking-wider">
                          {v.code}
                        </span>
                        {v.description && (
                          <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">{v.description}</p>
                        )}
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900">
                        {v.discountType === 'percent' ? (
                          <span>
                            Giảm {v.discountPercent}%
                            {v.maxDiscount > 0 && (
                              <span className="block text-xs text-gray-500 font-normal">
                                Tối đa {formatCurrency(v.maxDiscount)}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span>Giảm {formatCurrency(v.discountAmount)}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-600 font-medium">
                        {v.minOrderValue > 0 ? formatCurrency(v.minOrderValue) : 'Không giới hạn'}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-800">
                          {v.usedCount} / {v.maxUsage}
                        </span>
                        <div className="w-24 bg-gray-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="bg-primary-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.round((v.usedCount / v.maxUsage) * 100))}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-600">
                        <p>{format(new Date(v.startDate), 'dd/MM/yyyy')}</p>
                        <p className={`font-semibold ${isExpired ? 'text-red-500' : 'text-gray-800'}`}>
                          đến {format(new Date(v.endDate), 'dd/MM/yyyy')}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleActive(v)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                            v.isActive && !isExpired
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {v.isActive && !isExpired ? 'Đang kích hoạt' : 'Ngưng dùng'}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(v)}
                          className="text-xs font-semibold text-gray-700 hover:text-primary-600 px-2.5 py-1.5 rounded-lg border hover:bg-gray-50 transition"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(v._id)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Thêm / Sửa Voucher */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900">
                {editingVoucher ? 'Chỉnh sửa Voucher' : 'Tạo mới Voucher'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mã Voucher (viết hoa, không dấu) *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="VD: HOSTAY50"
                  className="w-full uppercase font-bold tracking-wider px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mô tả ưu đãi</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="VD: Giảm 50K cho đơn từ 500K"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Loại giảm giá</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                  >
                    <option value="percent">Theo phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>

                <div>
                  {formData.discountType === 'percent' ? (
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Tỷ lệ giảm (%) *</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        required
                        value={formData.discountPercent}
                        onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Số tiền giảm (VNĐ) *</label>
                      <input
                        type="number"
                        min={0}
                        step={10000}
                        required
                        value={formData.discountAmount}
                        onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {formData.discountType === 'percent' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Giảm tối đa (VNĐ, 0 = không giới hạn)</label>
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Đơn tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    step={100000}
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Lượt dùng tối đa</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.maxUsage}
                    onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
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
                  {saving ? 'Đang lưu...' : 'Lưu Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVouchersPage;
