// backend/services/wishlistService.js
const Wishlist = require('../models/Wishlist');
// Ensure the Book model is required so it's registered with Mongoose
require('../models/Book');

exports.getWishlistByUserId = async (userId) => {
  try {
    const wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: 'books',
      select: '_id title author price image',
    });
    if (!wishlist) {
      return { books: [] };
    }
    return wishlist;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.addToWishlist = async (userId, bookId) => {
  try {
    let wishlist = await Wishlist.findOne({ user: userId });

    // Create a new wishlist if none exists
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, books: [] });
    }

    // Check if the book is already in the wishlist
    if (wishlist.books.some(book => book.toString() === bookId)) {
      throw new Error('Book already in wishlist');
    }    

    // Add the book to the wishlist
    wishlist.books.push(bookId);
    await wishlist.save();

    return wishlist;
  } catch (error) {
    throw new Error(error.message);
  }
};



exports.removeFromWishlist = async (userId, bookId) => {
  try {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) throw new Error('Wishlist not found');

    wishlist.books = wishlist.books.filter(book => book.toString() !== bookId);
    await wishlist.save();

    return wishlist;
  } catch (error) {
    throw new Error(error.message);
  }
};
