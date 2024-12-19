'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Button } from "./ui/button"
import { Package, Heart, LogOut, ShoppingCart, Settings, User } from 'lucide-react'
import { Badge } from "./ui/badge"
import Navbar from './Navbar'
import BookManagement from './BookManagement'
import { Skeleton } from "./ui/skeleton"

interface Order {
  orderId: string;
  status: string;
  totalPrice: number;
  items: {
    bookTitle: string;
    quantity: number;
  }[];
}

interface WishlistItem {
  id: string;
  title: string;
  author: string;
  price: number;
  image: string;
}

export default function ProfilePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [fetchError, setFetchError] = useState<{ orders: string | null; wishlist: string | null }>({
    orders: null,
    wishlist: null,
  });
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const fetchOrders = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/orders/user-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data: Order[] = await response.json();
      setOrders(data);
    } catch (error) {
      const err = error as Error;
      setFetchError((prev) => ({ ...prev, orders: err.message || "An unknown error occurred." }));
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchWishlist = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch wishlist: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Fetched Wishlist Data:", data);  // Log the response
  
      const formattedWishlist = data.books.map((book: { _id: string; title: string; author: string; price: number; image: string }) => ({
        id: book._id,
        title: book.title,
        author: book.author,
        price: book.price,  // Directly access price, log it before processing
        image: book.image || "/placeholder.svg",
      }));
  
      console.log("Formatted Wishlist:", formattedWishlist);  // Log the formatted wishlist
  
      setWishlist(formattedWishlist);
    } catch (error) {
      const err = error as Error;
      setFetchError((prev) => ({ ...prev, wishlist: err.message || "An unknown error occurred." }));
    } finally {
      setLoadingWishlist(false);
    }
  };
  

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/'; // Redirect to home page
  };

  const addToCart = async (bookId: string) => {
    setIsLoadingCart(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in first!');
      setIsLoadingCart(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/carts/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId, quantity: 1 }),
      });

      if (response.ok) {
        console.log('Book added to cart');
        alert('Book added to cart successfully!');
      } else {
        const data = await response.json();
        console.error('Error response:', data);
        alert(data.message || 'Error adding book to cart.');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred while adding the book to the cart. Please try again.');
    } finally {
      setIsLoadingCart(false);
    }
  };

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.status}`);
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
if (!token) {
  alert('No token found, please log in.');
  return;
}

    if (token) {
      fetchOrders(token);
      fetchWishlist(token);
      const checkAdminStatus = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/users/check-admin', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setIsAdmin(data.isAdmin);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      };

      checkAdminStatus();
    }
  }, []);

  const removeFromWishlist = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in first!');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/wishlist/remove/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setWishlist(wishlist.filter(item => item.id !== id));
        alert('Book removed from wishlist successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Error removing book from wishlist.');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred while removing the book from the wishlist. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">My Profile</h1>
        {isAdmin ? (
          <Tabs defaultValue="management" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 gap-4 mb-8">
              <TabsTrigger 
                value="management" 
                className="flex flex-col items-center justify-center py-4 px-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-6 w-6 mb-2" />
                Management
              </TabsTrigger>
              <TabsTrigger 
                value="logout" 
                className="flex flex-col items-center justify-center py-4 px-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-6 w-6 mb-2" />
                Logout
              </TabsTrigger>
            </TabsList>
            <TabsContent value="management">
              <BookManagement />
            </TabsContent>
            <TabsContent value="logout">
              <LogoutCard handleLogout={handleLogout} />
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="orders" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 gap-4 mb-8">
              <TabsTrigger 
                value="orders" 
                className="flex flex-col items-center justify-center py-4 px-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
              >
                <Package className="h-6 w-6 mb-2" />
                Your Orders
              </TabsTrigger>
              <TabsTrigger 
                value="wishlist" 
                className="flex flex-col items-center justify-center py-4 px-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
              >
                <Heart className="h-6 w-6 mb-2" />
                Your Wishlist
              </TabsTrigger>
              <TabsTrigger 
                value="logout" 
                className="flex flex-col items-center justify-center py-4 px-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-6 w-6 mb-2" />
                Logout
              </TabsTrigger>
            </TabsList>
            <TabsContent value="orders">
              <OrdersCard
                orders={orders}
                loadingOrders={loadingOrders}
                fetchError={fetchError}
              />
            </TabsContent>
            <TabsContent value="wishlist">
              <WishlistCard
                wishlist={wishlist}
                loadingWishlist={loadingWishlist}
                fetchError={fetchError}
                addToCart={addToCart}
                removeFromWishlist={removeFromWishlist}
                isLoadingCart={isLoadingCart}
              />
            </TabsContent>
            <TabsContent value="logout">
              <LogoutCard handleLogout={handleLogout} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}


interface OrdersCardProps {
  orders: Order[];
  loadingOrders: boolean;
  fetchError: { orders: string | null; wishlist: string | null };
}

function OrdersCard({ orders, loadingOrders, fetchError }: OrdersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Orders</CardTitle>
        <CardDescription>View and manage your order history.</CardDescription>
      </CardHeader>
      <CardContent>
        {loadingOrders ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : fetchError.orders ? (
          <p className="text-red-500">Error: {fetchError.orders}</p>
        ) : orders.length > 0 ? (
          orders.map((order: Order) => (
            <div key={order.orderId} className="mb-6 p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Order #{order.orderId}</h3>
                <Badge>{order.status}</Badge>
              </div>
              <ul className="space-y-2 mb-2">
                {order.items.map((item: { bookTitle: string; quantity: number }, index: number) => (
                  <li key={index} className="flex justify-between">
                    <span>{item.bookTitle} (x{item.quantity})</span>
                  </li>
                ))}
              </ul>
              <div className="text-right font-semibold">
                Total: ${order.totalPrice.toFixed(2)}
              </div>
            </div>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </CardContent>
    </Card>
  );
}

interface WishlistCardProps {
  wishlist: WishlistItem[];
  loadingWishlist: boolean;
  fetchError: { orders: string | null; wishlist: string | null };
  addToCart: (bookId: string) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  isLoadingCart: boolean;
}

function WishlistCard({ wishlist, loadingWishlist, fetchError, addToCart, removeFromWishlist, isLoadingCart }: WishlistCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Wishlist</CardTitle>
        <CardDescription>Books you've saved for later.</CardDescription>
      </CardHeader>
      <CardContent>
        {loadingWishlist ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : fetchError.wishlist ? (
          <p className="text-red-500">Error: {fetchError.wishlist}</p>
        ) : wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wishlist.map((item: WishlistItem) => (
              <div key={item.id} className="flex border rounded-lg overflow-hidden">
                <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-24 h-32 object-cover" />
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.author}</p>
                    <p className="text-lg font-bold mt-2">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <Button 
                      size="sm" 
                      className="flex items-center" 
                      onClick={() => addToCart(item.id)}
                      disabled={isLoadingCart}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {isLoadingCart ? 'Adding...' : 'Add to Cart'}
                    </Button>
                    <Button 
                      variant="ghost"
                      size="sm" 
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Your wishlist is empty.</p>
        )}
      </CardContent>
    </Card>
  );
}

interface LogoutCardProps {
  handleLogout: () => void;
}

function LogoutCard({ handleLogout }: LogoutCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Logout</CardTitle>
        <CardDescription>Are you sure you want to log out?</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleLogout}>Confirm Logout</Button>
      </CardContent>
    </Card>
  );
}

