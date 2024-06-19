const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

// Create a virtual property `id` that gets the `_id` field
commentSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialized
commentSchema.set('toJSON', {
    virtuals: true,
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
