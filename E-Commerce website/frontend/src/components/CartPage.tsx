'use client';

import { useState, useEffect } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import Navbar from './Navbar';

type Book = {
  _id: string;
  title: string;
  author: string;
  price: number;
  images: string[];
};

type CartItem = {
  book: Book;
  quantity: number;
};

type Cart = {
  _id: string;
  user: string;
  items: CartItem[];
};

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found, redirecting to login');
        return;
      }
      const response = await fetch('http://localhost:5000/api/carts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const cartData = await response.json();
        setCart(cartData);
      } else {
        console.error('Failed to fetch cart, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (bookId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/carts/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId, quantity: newQuantity }),
      });
      if (response.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      fetchCart();
    }
  };

  const removeFromCart = async (bookId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/carts/remove', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      });
      if (response.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      fetchCart();
    }
  };

  const calculateTotal = () => {
    return cart?.items.reduce((total, item) => total + (item.book.price || 0) * item.quantity, 0) || 0;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        {cart && cart.items && cart.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <Card key={item.book._id}>
                  <CardContent className="p-6 flex items-center space-x-4">
                    <img
                      src={item.book.images?.[0] || '/placeholder.svg'}
                      alt={item.book.title}
                      className="w-24 h-32 object-cover"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold">{item.book.title}</h3>
                      <p className="text-sm text-gray-600">{item.book.author}</p>
                      <p className="text-lg font-bold mt-2">${item.book.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.book._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-lg font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.book._id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.book._id)}
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
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
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to="/checkout">
                    <Button className="w-full">Proceed to Checkout</Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xl mb-4">Your cart is empty</p>
            <Button>Continue Shopping</Button>
          </div>
        )}
      </main>
    </div>
  );
}
