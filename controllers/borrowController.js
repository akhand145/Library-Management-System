const mongoose = require('mongoose');
const User = require('../models/user');
const Book = require('../models/book');
const Borrow = require('../models/borrow');

const borrowBook = async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    if (!userId || !bookId) {
        return res.status(400).json({ status: 'failed', msg: 'Please provide both userId and bookId!' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'failed', msg: 'User not found!' });
    }
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ status: 'failed', msg: 'Book not found!' });
    }

    const borrow = new Borrow({
      user: userId,
      book: bookId,
      borrowDate: new Date()
    });
    await borrow.save();

    return res.status(201).json({ status: 'success', msg: 'User book borrowed successfully!', data: borrow });
  } catch (error) {
    return res.status(500).json({ status: 'failed', msg: error.message });
  }
};

const getAllBorrowedBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const borrowedBooks = await Borrow.find()
      .populate('user', 'name email')
      .populate('book', 'title author')
      .limit(limit * 1).skip((page - 1) * limit);

    const count = await Borrow.countDocuments();
    const totalPages = Math.ceil(count / limit);

    if (borrowedBooks.length === 0) {
        return res.status(404).json({ status: 'failed', msg: 'Borrow record not found!', data: [] });
    }

    return res.status(200).json({ status: "success", currentPage: page, totalPages: totalPages, totalCount: count, data: borrowedBooks });
  } catch (error) {
    res.status(500).json({ status: 'failed', msg: error.message });
  }
};

const returnBook = async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    if (!userId || !bookId) {
        return res.status(400).json({ status: 'failed', msg: 'Please provide both userId and bookId!' });
    }
  
    // Validate the format of userId and bookId
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookId)) {
        return res.status(400).json({ status: 'failed', msg: 'Invalid userId or bookId format!' });
    }

    const borrow = await Borrow.findOne({ user: userId, book: bookId, returnDate: null });
    if (!borrow) {
      return res.status(404).json({ status: 'failed', msg: 'Borrow record not found or book already returned!' });
    }

    borrow.returnDate = new Date();
    await borrow.save();
    
    return res.status(200).json({ status: 'success', msg: 'Book returned successfully!', data: borrow });
  } catch (error) {
    res.status(500).json({ status: 'failed', msg: error.message });
  }
};

module.exports = {
    borrowBook,
    getAllBorrowedBooks,
    returnBook,
} 