import { Heart, Search, ShoppingCart, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]); // State to store search results
  const [allBooks, setAllBooks] = useState<any[]>([]); // State to store all books
  const [loading, setLoading] = useState(false); // State for loading indicator

  useEffect(() => {
    checkAuthStatus();
    fetchBooks(); // Fetch all books on component mount
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/books'); // Fetch all books
      const data = await response.json();
      setAllBooks(data); // Store all books
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length > 2) {
      // Filter books based on search term
      const filteredBooks = allBooks.filter((book) =>
        book.title.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredBooks); // Set the filtered results
    } else {
      setSearchResults([]); // Clear results if query is too short
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          BookStore
        </Link>

        <div className="relative flex items-center space-x-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              className="pl-8" 
              placeholder="Search books..." 
              value={searchTerm}
              onChange={handleSearch}
            />
            {/* Dropdown with search results */}
            {searchTerm && searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white shadow-lg mt-2 rounded-lg max-h-60 overflow-y-auto">
                {loading ? (
                  <p className="p-2 text-center text-gray-500">Loading...</p>
                ) : (
                  searchResults.map((book) => (
                    <Link to={`/books/${book._id}`} key={book._id} className="block p-2 hover:bg-gray-100">
                      <div className="flex items-center">
                        <img src={book.image} alt={book.title} className="w-12 h-16 object-cover mr-3" />
                        <div>
                          <h3 className="font-semibold text-sm">{book.title}</h3>
                          <p className="text-xs text-gray-500">{book.author}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <Link to="/cart"> {/* Link to CartPage */}
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>

          {isAuthenticated ? (
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
