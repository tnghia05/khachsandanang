import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PaymentReturnHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Determine which payment method return this is
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const bookingCode = searchParams.get('vnp_TxnRef');
    
    // MoMo usually uses resultCode
    const resultCode = searchParams.get('resultCode');
    const orderId = searchParams.get('orderId');

    // Simulate slight delay for visual processing
    const timer = setTimeout(() => {
      // Handle VNPay
      if (vnp_ResponseCode !== null) {
        if (vnp_ResponseCode === '00') {
          navigate(`/booking-success/${bookingCode}`);
        } else {
          navigate('/payment-failed');
        }
      } 
      // Handle MoMo
      else if (resultCode !== null) {
        if (resultCode === '0') {
          // For MoMo we might need to extract booking code differently based on implementation
          navigate(`/booking-success/${orderId}`);
        } else {
          navigate('/payment-failed');
        }
      }
      // Unknown
      else {
        navigate('/');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchParams, navigate]);

  return <LoadingSpinner message="Đang xử lý kết quả thanh toán..." />;
};

export default PaymentReturnHandler;
