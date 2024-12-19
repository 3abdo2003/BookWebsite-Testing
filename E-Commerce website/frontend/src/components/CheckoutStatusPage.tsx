'use client';

import { useEffect, useState } from 'react';

const CheckoutStatusPage = () => {
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const success = queryParams.get('success');
    const canceled = queryParams.get('canceled');
    const sessionId = queryParams.get('session_id');

    if (success && sessionId) {
      confirmOrder(sessionId);
    } else if (canceled) {
      setStatusMessage('Your payment was canceled. Please try again.');
    }
  }, []);

  const confirmOrder = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/orders/checkout-success?session_id=${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (response.ok) {
        setStatusMessage('Payment successful! Your order has been placed.');
      } else {
        const data = await response.json();
        setStatusMessage(data.message || 'Failed to confirm your order. Please contact support.');
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      setStatusMessage('An error occurred. Please try again.');
    }
  };
  

  return <div className="text-center">{statusMessage || 'Processing payment...'}</div>;
};

export default CheckoutStatusPage;
