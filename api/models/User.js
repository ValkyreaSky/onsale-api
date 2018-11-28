const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: null,
    trim: true,
  },
  registerDate: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: String,
    default: 'https://res.cloudinary.com/selli/image/upload/v1535011703/user.png',
  },
  favourites: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Ad',
    },
  ],
});

module.exports = mongoose.model('User', userSchema);
