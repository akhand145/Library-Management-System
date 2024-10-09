const Book = require('../models/book');

const addBook = async (req, res) => {
  try {
    const { title, author, ISBN, publishYear, genre } = req.body;
    if (!title || !author || !ISBN || !publishYear || !genre) {
        return res.status(400).json({ status: 'failed', msg: 'Please provide title, author, ISBN, publishYear and genre!' });
    }

    // Check for existing book
    const existingBook = await Book.findOne({ ISBN });
    if (existingBook) {
      return res.status(409).json({ status: 'failed', msg: 'This book is already added!' });
    }

    const book = new Book({ title, author, ISBN, publishYear, genre });
    await book.save();
    
    return res.status(201).json({ status: 'success', msg: 'Book added successfully!', data: book });
  } catch (error) {
    return res.status(500).json({ status: 'failed', msg: error.message });
  }
};

const getAllBooks = async (req, res) => {
  try {
    const { author, genre, year, page = 1, limit = 10 } = req.query;
    const query = {};

    if (author) query.author = new RegExp(author, 'i');
    if (genre) query.genre = new RegExp(genre, 'i');
    if (year) query.publishYear = year;

    const books = await Book.find(query).limit(limit * 1).skip((page - 1) * limit);

    const count = await Book.countDocuments(query);
    const totalPages = Math.ceil(count / limit);

    if (books.length === 0) {
        return res.status(404).json({ status: 'failed', msg: 'No books found!', data: [] });
    }

    return res.status(200).json({ status: "success", currentPage: page, totalPages: totalPages, totalCount: count, data: books });
  } catch (error) {
    res.status(500).json({ status: 'failed', msg: error.message });
  }
};

const getBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
        return res.status(404).json({ status: 'failed', msg: 'Book not found!' });
    }

    res.status(200).json({ status: 'success', data: book });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
        return res.status(404).json({ status: 'failed', msg: 'Book not found!' });
    }

    const { title, author, publishYear, genre } = req.body;
    const updatedData = { title, author, publishYear, genre };

    const updateBook = await Book.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updateBook) {
        return res.status(400).json({ status: 'failed', msg: 'Book not updated!' });
    }
    
    res.status(200).json({ status: 'success', msg: 'Book details updated successfully!', data: updateBook });
  } catch (error) {
    res.status(500).json({ status: 'failed', msg: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
        return res.status(404).json({ status: 'failed', msg: 'Book not found!' });
    }

    const deleteBook = await Book.findByIdAndDelete(id);
    if (!deleteBook) {
        return res.status(400).json({ status: 'failed', msg: 'Book not deleted!' });
    }

    res.status(200).json({ status: 'success', msg: 'Book deleted successfully!' });
  } catch (error) {
    res.status(500).json({ status: 'failed', msg: error.message });
  }
};

module.exports = {
    addBook,
    getAllBooks,
    getBook,
    updateBook,
    deleteBook,
}