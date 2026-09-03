import React from 'react';
import { FaCreditCard, FaWallet } from 'react-icons/fa';

const PaymentMethodSelector = ({ selected, onChange }) => {
  const options = [
    {
      value: 'vnpay',
      label: 'VNPay',
      description: 'QR Code / Thẻ nội địa / Thẻ quốc tế',
      icon: FaCreditCard,
      color: 'text-blue-600'
    },
    {
      value: 'momo',
      label: 'Ví MoMo',
      description: 'Thanh toán qua ứng dụng MoMo',
      icon: FaWallet,
      color: 'text-pink-600'
    }
  ];

  return (
    <div className="space-y-3 mt-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Phương thức thanh toán</h3>
      
      {options.map((option) => {
        const isSelected = selected === option.value;
        const Icon = option.icon;
        
        return (
          <label 
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              isSelected 
                ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-100' 
                : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
            }`}
          >
            <input 
              type="radio" 
              name="paymentMethod" 
              value={option.value} 
              checked={isSelected} 
              onChange={() => onChange(option.value)} 
              className="hidden" 
            />
            <div className="flex items-center h-full mr-4 pt-1">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                isSelected ? 'border-primary-500' : 'border-gray-300'
              }`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
              </div>
            </div>
            
            <div className="flex-1 flex items-center">
              <div className={`text-2xl mr-4 ${option.color}`}>
                <Icon />
              </div>
              <div>
                <p className={`font-semibold ${isSelected ? 'text-primary-800' : 'text-gray-800'}`}>
                  {option.label}
                </p>
                <p className={`text-sm ${isSelected ? 'text-primary-600' : 'text-gray-500'}`}>
                  {option.description}
                </p>
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
};

export default PaymentMethodSelector;
