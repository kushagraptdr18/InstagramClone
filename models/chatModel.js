const mongoose = require('mongoose');

// Define the chat schema
const chatSchema = mongoose.Schema({
    sender_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receiver_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        required: true
    }
}, 
{ 
    timestamps: true // Automatically adds 'createdAt' and 'updatedAt'
});

// Export the chat model
module.exports = mongoose.model('Chat', chatSchema);
