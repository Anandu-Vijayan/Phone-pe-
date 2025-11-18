const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  merchantTransactionId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  userId: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'],
    default: 'PENDING',
  },
  phonepeTransactionId: {
    type: String,
    default: null,
  },
  phonepeResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  redirectUrl: {
    type: String,
    default: null,
  },
  callbackData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payment', paymentSchema);

