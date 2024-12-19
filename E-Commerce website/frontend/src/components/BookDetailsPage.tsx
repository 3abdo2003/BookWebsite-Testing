'use client';
import { useState, useEffect } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import Navbar from './Navbar';

type Book = {
  _id: string;
  title: string;
  author: string;
  description: string;
  price: number | undefined;
  discount: number;
  category: string;
  stock: number | undefined;
  images: string[];
};

export default function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBook();
    checkWishlistStatus();
  }, [id]);

  const fetchBook = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/books/${id}`);
      if (!response.ok) {
        throw new Error(`Unable to fetch book details, status: ${response.status}`);
      }
      const data: Book = await response.json();
      setBook(data);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching book:', err);
      setError('Failed to load book details. Please try again later.');
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/wishlist`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.status === 401) {
        console.log('User not authenticated');
        return;
      }
      if (!response.ok) {
        throw new Error(`Unable to check wishlist status, status: ${response.status}`);
      }
      const data = await response.json();
      setIsWishlisted(data.books && data.books.some((item: { _id: string }) => item._id === id));
    } catch (err) {
      console.error('Error checking wishlist status:', err);
    }
  };

  const toggleWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to manage your wishlist');
      return;
    }

    try {
      const url = isWishlisted
        ? `http://localhost:5000/api/wishlist/remove/${id}`
        : `http://localhost:5000/api/wishlist/add`;
      const method = isWishlisted ? 'DELETE' : 'POST';
      const body = isWishlisted ? null : JSON.stringify({ bookId: id });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body,
      });

      if (response.ok) {
        setIsWishlisted(!isWishlisted);  // Update the wishlist state immediately after success
        alert(isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist');
      } else {
        const data = await response.json();
        console.error(data.message || 'Failed to update wishlist.');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const addToCart = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in first!');
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/carts/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId: id, quantity: 1 }),
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
      setIsLoading(false);
    }
  };

  const calculateDiscountedPrice = () => {
    return book && book.price
      ? (book.price * (1 - book.discount / 100)).toFixed(2)
      : null;
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!book) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="overflow-hidden">
          <CardHeader className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <img
              src={book.images && book.images.length > 0 ? book.images[0] : "/placeholder.svg"}
              alt={book.title}
              className="w-full h-96 object-cover rounded-lg"
            />
            <div className="space-y-4">
              <CardTitle className="text-3xl font-bold">{book.title}</CardTitle>
              <p className="text-xl text-gray-600">{book.author}</p>
              <Badge>{book.category}</Badge>
              <div className="flex items-center space-x-2">
                {book.price !== undefined ? (
                  book.discount > 0 ? (
                    <>
                      <span className="text-2xl font-bold">${calculateDiscountedPrice()}</span>
                      <span className="text-lg text-gray-500 line-through">${book.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold">${book.price.toFixed(2)}</span>
                  )
                ) : (
                  <span className="text-2xl font-bold">Price unavailable</span>
                )}
              </div>
              <p className="text-lg">Stock: {book.stock ?? 'Unknown'}</p>
            </div>
          </CardHeader>
          <CardContent className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{book.description}</p>
          </CardContent>
          <CardFooter className="flex justify-between mt-6">
            <Button onClick={addToCart} className="flex-1 mr-2">
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
            <Button onClick={toggleWishlist} variant="outline" className="flex-1 ml-2">
              <Heart className={`mr-2 h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
