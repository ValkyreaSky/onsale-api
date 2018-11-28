const mongoose = require('mongoose');
const { Schema } = mongoose;

const adSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: Number,
    required: true,
  },
  isUsed: {
    type: Boolean,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    default: 'https://res.cloudinary.com/selli/image/upload/v1535006858/placeholder.png',
  },
  creationDate: {
    type: Date,
    default: Date.now,
  },
  phone: {
    type: Number,
    default: null,
    trim: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = mongoose.model('Ad', adSchema);
