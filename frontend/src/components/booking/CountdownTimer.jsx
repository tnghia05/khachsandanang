import React, { useState, useEffect } from 'react';
import { FaClock } from 'react-icons/fa';

const CountdownTimer = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const expirationTime = new Date(expiresAt).getTime();
      const currentTime = new Date().getTime();
      const difference = expirationTime - currentTime;
      
      if (difference <= 0) {
        setIsExpired(true);
        if (onExpire) onExpire();
        return 0;
      }
      
      return Math.floor(difference / 1000);
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl font-medium border border-red-100">
        <FaClock className="text-xl" />
        <span>Hết thời gian thanh toán</span>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const isWarning = timeLeft < 180; // less than 3 minutes

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border ${
      isWarning 
        ? 'bg-red-50 border-red-200 text-red-600' 
        : 'bg-amber-50 border-amber-200 text-amber-700'
    } transition-colors duration-300`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${isWarning ? 'bg-red-100 animate-pulse' : 'bg-amber-100'}`}>
          <FaClock className="text-xl" />
        </div>
        <div>
          <p className="text-sm font-medium opacity-80">Thời gian giữ chỗ còn lại</p>
          <div className={`text-2xl font-bold tracking-tight font-mono ${isWarning ? 'animate-pulse' : ''}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
