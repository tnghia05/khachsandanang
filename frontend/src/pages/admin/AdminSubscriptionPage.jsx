import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import {
  FaCrown,
  FaBullhorn,
  FaCalendarAlt,
  FaCheckCircle,
  FaHotel,
  FaClock,
  FaRegLightbulb,
} from 'react-icons/fa';
import { getSubscription, updateHotelAdPackage } from '../../api/adminApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminSubscriptionPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  // State cho từng khách sạn trong danh sách
  const [adConfigs, setAdConfigs] = useState({});

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const res = await getSubscription();
      setData(res.data);

      // Nạp config quảng cáo từ các khách sạn hiện có
      const configs = {};
      (res.data.hotels || []).forEach((h) => {
        configs[h._id] = {
          isFeatured: !!h.isFeatured,
          durationDays: 30,
          marqueeText: h.marqueeText || '',
        };
      });
      setAdConfigs(configs);
    } catch (err) {
      console.error('Lỗi khi tải thông tin thuê bao:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const handleSaveAdConfig = async (hotelId) => {
    const config = adConfigs[hotelId];
    if (!config) return;

    try {
      setSavingId(hotelId);
      const res = await updateHotelAdPackage(hotelId, config);
      toast.success(res.message || 'Cập nhật dịch vụ quảng cáo thành công');
      fetchSubscriptionData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu cấu hình quảng cáo');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Đang tải thông tin gói dịch vụ & quảng cáo..." />;
  if (!data) return <div className="text-center py-12 text-gray-500">Không thể tải thông tin gói dịch vụ.</div>;

  const { subscription, daysRemaining, hotelsCount, hotels } = data;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FaCrown className="text-amber-500 mr-3" /> Gói Dịch Vụ Nền Tảng & Quảng Cáo Nổi Bật
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi trạng thái thuê bao phần mềm và kích hoạt dịch vụ quảng bá Banner & Chạy chữ nổi bật trên trang chủ.
        </p>
      </div>

      {/* 1. Thẻ Gói Thuê Bao Nền Tảng */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-primary-950 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <FaCrown className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 border border-primary-400/30">
                Gói Thuê Bao Đang Sử Dụng
              </span>
              <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center">
                <FaCheckCircle className="mr-1" /> Đang Hoạt Động
              </span>
            </div>

            <h2 className="text-3xl font-black mt-3">Gói Đối Tác Hostay Standard</h2>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Quyền lợi: Quản trị không giới hạn phòng nghỉ, tự tạo mã giảm giá voucher riêng, tích hợp lễ tân check-in QR không chạm và báo cáo doanh thu tự động.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-center min-w-[200px]">
            <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Thời gian còn lại</p>
            <p className="text-4xl font-black text-amber-400 my-1">{daysRemaining} ngày</p>
            <p className="text-xs text-slate-400">
              Hạn dùng: {subscription.expiresAt ? format(new Date(subscription.expiresAt), 'dd/MM/yyyy') : 'Vô thời hạn'}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div>
            <span className="text-slate-400 block">Số cơ sở lưu trú:</span>
            <span className="font-bold text-white text-sm">{hotelsCount} Khách sạn / Homestay</span>
          </div>
          <div>
            <span className="text-slate-400 block">Loại hình thanh toán:</span>
            <span className="font-bold text-white text-sm">Thuê bao SaaS định kỳ</span>
          </div>
          <div>
            <span className="text-slate-400 block">Hỗ trợ kỹ thuật:</span>
            <span className="font-bold text-emerald-400 text-sm">Ưu tiên 24/7</span>
          </div>
        </div>
      </div>

      {/* 2. Dịch Vụ Quảng Cáo Add-on: Banner & Dòng Chữ Chạy Trang Chủ */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FaBullhorn className="text-primary-600 mr-2.5" /> Dịch Vụ Quảng Cáo Nổi Bật Trang Chủ (Add-on)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Đưa khách sạn của bạn lên vị trí nổi bật tại Banner chính và thanh thông báo chạy chữ (Marquee) trên trang chủ Hostay.
            </p>
          </div>
        </div>

        {hotels.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border text-center text-gray-500">
            Bạn chưa có cơ sở lưu trú nào để đăng ký quảng cáo. Hãy tạo khách sạn trước tại mục "Khách sạn / Homestay".
          </div>
        ) : (
          <div className="space-y-6">
            {hotels.map((hotel) => {
              const config = adConfigs[hotel._id] || {
                isFeatured: false,
                durationDays: 30,
                marqueeText: '',
              };

              return (
                <div
                  key={hotel._id}
                  className={`bg-white rounded-2xl shadow-sm border p-6 space-y-5 transition-all ${
                    config.isFeatured ? 'border-primary-300 ring-2 ring-primary-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                        <FaHotel />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{hotel.name}</h3>
                        <p className="text-xs text-gray-500">Khu vực: {hotel.district}</p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.isFeatured}
                        onChange={(e) =>
                          setAdConfigs({
                            ...adConfigs,
                            [hotel._id]: { ...config, isFeatured: e.target.checked },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      <span className="ml-3 text-xs font-bold text-gray-700">
                        {config.isFeatured ? 'Đang bật Quảng cáo' : 'Tắt Quảng cáo'}
                      </span>
                    </label>
                  </div>

                  {config.isFeatured && (
                    <div className="space-y-4 bg-primary-50/40 p-4 rounded-xl border border-primary-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Thời hạn quảng cáo
                          </label>
                          <select
                            value={config.durationDays}
                            onChange={(e) =>
                              setAdConfigs({
                                ...adConfigs,
                                [hotel._id]: { ...config, durationDays: Number(e.target.value) },
                              })
                            }
                            className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value={30}>30 ngày (Gói Tháng)</option>
                            <option value={60}>60 ngày (Gói 2 Tháng)</option>
                            <option value={90}>90 ngày (Gói Quý - Ưu đãi 15%)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Hạn hiển thị hiện tại
                          </label>
                          <div className="px-3 py-2 bg-white border rounded-xl text-xs font-medium text-gray-600 flex items-center">
                            <FaCalendarAlt className="mr-2 text-primary-500" />
                            {hotel.featuredExpiresAt
                              ? format(new Date(hotel.featuredExpiresAt), 'dd/MM/yyyy')
                              : 'Chưa kích hoạt'}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Nội dung dòng chữ chạy quảng cáo trên trang chủ (Marquee text) *
                        </label>
                        <input
                          type="text"
                          value={config.marqueeText}
                          onChange={(e) =>
                            setAdConfigs({
                              ...adConfigs,
                              [hotel._id]: { ...config, marqueeText: e.target.value },
                            })
                          }
                          placeholder="VD: Khách sạn đang có ưu đãi giảm 20% + tặng buffet sáng miễn phí..."
                          className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <p className="text-[11px] text-gray-500 mt-1">
                          Dòng chữ này sẽ xuất hiện trên thanh chạy tin tức nổi bật ngay đầu trang chủ của mọi khách hàng.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleSaveAdConfig(hotel._id)}
                      disabled={savingId === hotel._id}
                      className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50 flex items-center"
                    >
                      {savingId === hotel._id ? 'Đang lưu...' : 'Lưu Cấu Hình Dịch Vụ'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptionPage;
