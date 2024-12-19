const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const wishlistService = require('../services/wishlistService');

// Mock the Wishlist model
jest.mock('../models/Wishlist');

describe('Wishlist Service', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockBookId = new mongoose.Types.ObjectId().toString();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getWishlistByUserId', () => {
    it('should return the wishlist for the user', async () => {
      const mockWishlist = {
        user: mockUserId,
        books: [{ _id: mockBookId, title: 'Book Title', author: 'Author Name', price: 100 }],
      };

      // Properly mock the chained `populate` method
      const mockPopulate = jest.fn().mockResolvedValue(mockWishlist);
      Wishlist.findOne.mockReturnValue({ populate: mockPopulate });

      const result = await wishlistService.getWishlistByUserId(mockUserId);

      expect(result).toEqual(mockWishlist);
      expect(Wishlist.findOne).toHaveBeenCalledWith({ user: mockUserId });
      expect(mockPopulate).toHaveBeenCalledWith({ path: 'books', select: '_id title author price image' });
    });

    it('should return an empty wishlist if none exists', async () => {
      Wishlist.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

      const result = await wishlistService.getWishlistByUserId(mockUserId);

      expect(result).toEqual({ books: [] });
      expect(Wishlist.findOne).toHaveBeenCalledWith({ user: mockUserId });
    });
  });

  describe('addToWishlist', () => {
    it('should add a book to the user\'s wishlist', async () => {
      const mockWishlist = { user: mockUserId, books: [] };

      Wishlist.findOne.mockResolvedValue(mockWishlist);
      mockWishlist.save = jest.fn().mockResolvedValue({ ...mockWishlist, books: [mockBookId] });

      const result = await wishlistService.addToWishlist(mockUserId, mockBookId);

      expect(result.books).toContain(mockBookId);
      expect(Wishlist.findOne).toHaveBeenCalledWith({ user: mockUserId });
      expect(mockWishlist.save).toHaveBeenCalled();
    });

    it('should throw an error if the book is already in the wishlist', async () => {
      const mockWishlist = { user: mockUserId, books: [mockBookId] };

      Wishlist.findOne.mockResolvedValue(mockWishlist);

      await expect(wishlistService.addToWishlist(mockUserId, mockBookId)).rejects.toThrow('Book already in wishlist');
      expect(Wishlist.findOne).toHaveBeenCalledWith({ user: mockUserId });
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove a book from the user\'s wishlist', async () => {
      const mockWishlist = { user: mockUserId, books: [mockBookId] };

      Wishlist.findOne.mockResolvedValue(mockWishlist);
      mockWishlist.save = jest.fn().mockResolvedValue({ user: mockUserId, books: [] });

      const result = await wishlistService.removeFromWishlist(mockUserId, mockBookId);

      expect(result.books).not.toContain(mockBookId);
      expect(Wishlist.findOne).toHaveBeenCalledWith({ user: mockUserId });
      expect(mockWishlist.save).toHaveBeenCalled();
    });

    it('should throw an error if the wishlist does not exist', async () => {
      Wishlist.findOne.mockResolvedValue(null);

      await expect(wishlistService.removeFromWishlist(mockUserId, mockBookId)).rejects.toThrow('Wishlist not found');
      expect(Wishlist.findOne).toHaveBeenCalledWith({ user: mockUserId });
    });
  });
});
