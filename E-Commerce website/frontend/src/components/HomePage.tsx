'use client'
import { useState, useEffect } from 'react'
import { Heart, Search, ShoppingCart, User } from 'lucide-react'
import { Link } from 'react-router-dom';
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import Navbar from './Navbar';

type Book = {
  _id: string;
  title: string;
  author: string;
  price: number;
  discount: number;
  category: string;
  images: string[];
}

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedAuthor, setSelectedAuthor] = useState("All");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetchBooks();
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/books');
      const data: Book[] = await response.json(); // Cast response data to Book[]
      setBooks(data);
  
      // Extract unique categories and authors as strings
      const uniqueCategories: string[] = Array.from(new Set(data.map((book: Book) => book.category)));
      const uniqueAuthors: string[] = Array.from(new Set(data.map((book: Book) => book.author)));
  
      setCategories(['All', ...uniqueCategories]);
      setAuthors(['All', ...uniqueAuthors]);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };
  

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const data = await response.json();
      setWishlist(data.books.map((book: Book) => book._id));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const toggleWishlist = async (bookId: string) => {
    if (!isAuthenticated) {
      alert('Please log in to add items to your wishlist');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (wishlist.includes(bookId)) {
        await fetch(`http://localhost:5000/api/wishlist/remove/${bookId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setWishlist(wishlist.filter(id => id !== bookId));
      } else {
        await fetch('http://localhost:5000/api/wishlist/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ bookId })
        });
        setWishlist([...wishlist, bookId]);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const addToCart = async (bookId: string) => {
    if (!isAuthenticated) {
      alert('Please log in to add items to your cart');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/carts/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookId, quantity: 1 })
      });
  
      if (response.ok) {
        alert('Book added to cart successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to add book to cart:', errorData);
        alert(errorData.message || 'Failed to add book to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart');
    }
  };
  


  const filteredBooks = books.filter(book => 
    (selectedCategory === "All" || book.category === selectedCategory) &&
    (selectedAuthor === "All" || book.author === selectedAuthor) &&
    (book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     book.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const discountedBooks = filteredBooks.filter(book => book.discount > 0);

  return (
    <div className="min-h-screen bg-gray-100">
    <Navbar />
    <div className="container mx-auto px-4 py-8">
    </div>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-8">
          <aside className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Author</label>
                  <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {authors.map(author => (
                        <SelectItem key={author} value={author}>{author}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </aside>

          <div className="col-span-3 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Discounted Books</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {discountedBooks.map(book => (
                  <BookCard key={book._id} book={book} isWishlisted={wishlist.includes(book._id)} onWishlistToggle={toggleWishlist} onAddToCart={addToCart} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">All Books</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map(book => (
                  <BookCard key={book._id} book={book} isWishlisted={wishlist.includes(book._id)} onWishlistToggle={toggleWishlist} onAddToCart={addToCart} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

function BookCard({ book, isWishlisted, onWishlistToggle, onAddToCart }: {
  book: Book;
  isWishlisted: boolean;
  onWishlistToggle: (id: string) => void;
  onAddToCart: (id: string) => void;
}) {
  return (
    <Card>
      <Link to={`/books/${book._id}`} className="block">
        <CardHeader>
          <img src={book.images[0] || "/placeholder.svg"} alt={book.title} className="w-full h-48 object-cover" />
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold">{book.title}</h3>
          <p className="text-sm text-gray-600">{book.author}</p>
          <div className="flex items-center justify-between mt-2">
            {book.discount > 0 ? (
              <div>
                <span className="text-lg font-bold">${(book.price * (1 - book.discount / 100)).toFixed(2)}</span>
                <span className="text-sm text-gray-500 line-through ml-2">${book.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-lg font-bold">${book.price.toFixed(2)}</span>
            )}
            <Badge>{book.category}</Badge>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => onWishlistToggle(book._id)}>
          <Heart size={18} className={`mr-2 ${isWishlisted ? 'text-red-500' : ''}`} />
          Wishlist
        </Button>
        <Button variant="default" size="sm" onClick={() => onAddToCart(book._id)}>
          <ShoppingCart size={18} className="mr-2" />
          Add to Cart
          </Button> 
      </CardFooter>
    </Card>
  );
}
