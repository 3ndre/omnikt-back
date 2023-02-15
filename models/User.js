const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  wallet: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('user', UserSchema);
