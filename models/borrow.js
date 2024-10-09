const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
    
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  borrowDate: { type: Date, required: true, default: Date.now },
  returnDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Borrow', borrowSchema);