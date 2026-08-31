import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

const PaymentFailedPage = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <FaTimesCircle className="text-7xl text-red-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Thanh toán không thành công</h1>
      <p className="text-gray-600 text-lg mb-8 max-w-md">
        Rất tiếc, quá trình thanh toán của bạn đã bị từ chối hoặc đã xảy ra lỗi. 
        Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {bookingId ? (
          <Link 
            to={`/checkout/${bookingId}`}
            className="px-8 py-3 rounded-xl bg-primary-600 font-bold text-white hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
          >
            Thử lại thanh toán
          </Link>
        ) : null}
        
        <Link 
          to="/"
          className={`px-8 py-3 rounded-xl border-2 border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition-colors ${!bookingId ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700 hover:border-primary-700 shadow-lg shadow-primary-200' : ''}`}
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
