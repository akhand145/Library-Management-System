const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const auth = require('../middleware/auth');

router.post('/', auth, borrowController.borrowBook);
router.get('/', auth, borrowController.getAllBorrowedBooks);
router.post('/return', auth, borrowController.returnBook);

module.exports = router;