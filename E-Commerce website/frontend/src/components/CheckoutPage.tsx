'use client'

import { useState, useEffect } from 'react'
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import Navbar from './Navbar'

type CartItem = {
  book: { title: string, author: string, price: number }
  quantity: number
}

type Cart = {
  items: CartItem[]
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [shippingAddress, setShippingAddress] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("visa")
  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found, redirecting to login')
        return
      }
      const response = await fetch('http://localhost:5000/api/carts', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const cartData = await response.json()
        setCart(cartData)
      } else {
        console.error('Failed to fetch cart, status:', response.status)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotal = () => {
    return cart?.items.reduce((total, item) => total + (item.book.price || 0) * item.quantity, 0) || 0
  }

  const handleCheckout = async () => {
    setErrorMessage(null);
  
    if (!shippingAddress.trim()) {
      setErrorMessage('Please enter a shipping address.');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter a phone number.');
      return;
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, redirecting to login');
      return;
    }
  
    const orderData = { paymentMethod, shippingAddress, phoneNumber };
  
    try {
      const endpoint =
        paymentMethod === 'visa'
          ? 'http://localhost:5000/api/orders/create-checkout-session'
          : 'http://localhost:5000/api/orders/checkout';
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });
  
      if (response.ok) {
        const data = await response.json();
        if (paymentMethod === 'visa') {
          window.location.href = data.url; // Redirect to Stripe
        } else {
          setCheckoutStatus('Order placed successfully! Redirecting...');
          setTimeout(() => {
            window.location.href = '/profile';
          }, 2000);
        }
      } else {
        setCheckoutStatus('Checkout failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      setCheckoutStatus('Checkout failed. Please try again.');
    }
  };
  
  
  

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        {cart && cart.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            <div>
              {cart.items.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold">{item.book.title}</h3>
                    <p className="text-sm text-gray-600">{item.book.author}</p>
                    <p className="text-lg font-bold mt-2">${item.book.price.toFixed(2)}</p>
                    <p className="text-md">Quantity: {item.quantity}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="Shipping Address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                    />
                    <div className="mt-2">
                      <label className="mr-2">Payment Method:</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="p-2 border rounded"
                      >
                        <option value="visa">Visa</option>
                        <option value="cash">Cash</option>
                      </select>
                    </div>
                    {errorMessage && (
                      <div className="mt-4 text-red-600 text-sm font-semibold">
                        {errorMessage}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleCheckout}>Confirm Order</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xl mb-4">Your cart is empty</p>
          </div>
        )}
        {checkoutStatus && (
          <div className="mt-4 text-center text-lg font-semibold">
            {checkoutStatus}
          </div>
        )}
      </main>
    </div>
  )
}

