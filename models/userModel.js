const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email']
    },
    username: { // Add this field
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30
    },
    password: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        maxlength: 150,
        default: ''
    },
    age: {
        type: Number,
        min: 18,
        max: 99
    },
    profilePicture: {
        type: String,
        default: 'default-profile-pic-url'
    },
    
    friendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      
      // Array to store sent friend requests
    sentRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      
      // Array to store friends (accepted friend requests)
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    stories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story'
    }],
    isOnline:{
        type:String,
        default:'0'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });



  module.exports = mongoose.model('User', userSchema);