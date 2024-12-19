'use client'

import { useState, useEffect } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  hasDiscount: boolean;
  discountPercentage: number;
}

export default function BookManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [newBook, setNewBook] = useState<Omit<Book, '_id'>>({
    title: '',
    author: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    hasDiscount: false,
    discountPercentage: 0,
  });
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/books');
      if (response.ok) {
        const data = await response.json();
  
        // Map backend `discount` to `discountPercentage` and calculate `hasDiscount`
        const processedBooks = data.map((book: any) => ({
          ...book,
          discountPercentage: book.discount || 0, // Default to 0 if no discount provided
          hasDiscount: (book.discount || 0) > 0, // Set `hasDiscount` based on `discount`
        }));
  
        setBooks(processedBooks);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };
  
  

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const bookToCreate = {
      ...newBook,
      discount: newBook.hasDiscount ? newBook.discountPercentage : 0, // Map `discountPercentage` to `discount`
    };
    try {
      const response = await fetch('http://localhost:5000/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookToCreate),
      });
      if (response.ok) {
        fetchBooks();
        setNewBook({
          title: '',
          author: '',
          description: '',
          price: 0,
          category: '',
          stock: 0,
          hasDiscount: false,
          discountPercentage: 0,
        });
      }
    } catch (error) {
      console.error('Error creating book:', error);
    }
  };
  
  

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    const token = localStorage.getItem('token');
    const updatedBook = {
      ...editingBook,
      discount: editingBook.hasDiscount ? editingBook.discountPercentage : 0,  // Ensure discount is sent instead of discountPercentage
    };
    try {
      const response = await fetch(`http://localhost:5000/api/books/${editingBook._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedBook),
      });
      if (response.ok) {
        fetchBooks();
        setEditingBook(null);
      }
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };
  

  const handleDeleteBook = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/books/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        fetchBooks();
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Book Management</CardTitle>
          <CardDescription>Manage your book catalog</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mb-4"><Plus className="mr-2 h-4 w-4" /> Add New Book</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Book</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateBook} className="space-y-4">
                <Input
                  placeholder="Title"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                />
                <Input
                  placeholder="Author"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={newBook.price}
                  onChange={(e) => setNewBook({ ...newBook, price: parseFloat(e.target.value) })}
                />
                <Input
                  placeholder="Category"
                  value={newBook.category}
                  onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Stock"
                  value={newBook.stock}
                  onChange={(e) => setNewBook({ ...newBook, stock: parseInt(e.target.value) })}
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasDiscount"
                    checked={newBook.hasDiscount}
                    onCheckedChange={(checked) => setNewBook({ ...newBook, hasDiscount: checked as boolean })}
                  />
                  <Label htmlFor="hasDiscount">Has Discount</Label>
                </div>
                {newBook.hasDiscount && (
                  <Input
                    type="number"
                    placeholder="Discount Percentage"
                    value={newBook.discountPercentage}
                    onChange={(e) => setNewBook({ ...newBook, discountPercentage: parseFloat(e.target.value) })}
                  />
                )}
                <div className="flex justify-end space-x-2">
                  <Button type="submit">Create Book</Button>
                  <Button type="button" onClick={() => setNewBook({ title: '', author: '', description: '', price: 0, category: '', stock: 0, hasDiscount: false, discountPercentage: 0 })} variant="outline">Cancel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={!!editingBook} onOpenChange={(open) => !open && setEditingBook(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Book</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateBook} className="space-y-4">
                <Input
                  placeholder="Title"
                  value={editingBook?.title || ''}
                  onChange={(e) => setEditingBook(prev => prev ? {...prev, title: e.target.value} : null)}
                />
                <Input
                  placeholder="Author"
                  value={editingBook?.author || ''}
                  onChange={(e) => setEditingBook(prev => prev ? {...prev, author: e.target.value} : null)}
                />
                <Textarea
                  placeholder="Description"
                  value={editingBook?.description || ''}
                  onChange={(e) => setEditingBook(prev => prev ? {...prev, description: e.target.value} : null)}
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={editingBook?.price || 0}
                  onChange={(e) => setEditingBook(prev => prev ? {...prev, price: parseFloat(e.target.value)} : null)}
                />
                <Input
                  placeholder="Category"
                  value={editingBook?.category || ''}
                  onChange={(e) => setEditingBook(prev => prev ? {...prev, category: e.target.value} : null)}
                />
                <Input
                  type="number"
                  placeholder="Stock"
                  value={editingBook?.stock || 0}
                  onChange={(e) => setEditingBook(prev => prev ? {...prev, stock: parseInt(e.target.value)} : null)}
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="editHasDiscount"
                    checked={editingBook?.hasDiscount || false}
                    onCheckedChange={(checked) => setEditingBook(prev => prev ? {...prev, hasDiscount: checked as boolean} : null)}
                  />
                  <Label htmlFor="editHasDiscount">Has Discount</Label>
                </div>
                {editingBook?.hasDiscount && (
                  <Input
                    type="number"
                    placeholder="Discount Percentage"
                    value={editingBook?.discountPercentage || 0}
                    onChange={(e) => setEditingBook(prev => prev ? {...prev, discountPercentage: parseFloat(e.target.value)} : null)}
                  />
                )}
                <div className="flex justify-end space-x-2">
                  <Button type="submit">Update Book</Button>
                  <Button type="button" onClick={() => setEditingBook(null)} variant="outline">Cancel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book._id}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>${book.price.toFixed(2)}</TableCell>
                  <TableCell>{book.category}</TableCell>
                  <TableCell>{book.stock}</TableCell>
                  <TableCell>
                   {book.hasDiscount ? `${book.discountPercentage}%` : 'No'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button onClick={() => setEditingBook(book)} size="sm" variant="outline"><Edit className="h-4 w-4" /></Button>
                      <Button onClick={() => handleDeleteBook(book._id)} size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

