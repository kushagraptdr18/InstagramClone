const mongoose = require('mongoose');
const { Schema } = mongoose;

// Comment Schema
const commentSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Post Schema
const postSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the user who created the post
    required: true
  },
  img:{
    type: String
  },
  caption: {
    type: String,
    maxlength: 500 // Limit caption to 500 characters
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Users who liked the post
  }],
  comments: [commentSchema], // Array of comments
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

// Middleware to set updatedAt field
postSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Export the Post model
module.exports = mongoose.model('Post', postSchema);


