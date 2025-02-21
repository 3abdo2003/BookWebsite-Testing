// backend/controllers/bookController.js
const BookService = require('../services/bookService');

exports.getBooks = async (req, res) => {
  try {
    const { category, author } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (author) filter.author = author;

    const books = await BookService.getBooks(filter);
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getBookById = async (req, res) => {
  try {
    const book = await BookService.getBookById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const newBook = await BookService.createBook(req.body);
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { discountPercentage, ...rest } = req.body;
    const updatedData = {
      ...rest,
      discount: discountPercentage, // Ensure discount is updated
    };
    const updatedBook = await BookService.updateBook(req.params.id, updatedData);
    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteBook = async (req, res) => {
  try {
    const deletedBook = await BookService.deleteBook(req.params.id);
    if (!deletedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
