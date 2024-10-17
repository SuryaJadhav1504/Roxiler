const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  dateOfSale: Date,
  category: String,
});

module.exports = mongoose.model('Transaction', transactionSchema);
