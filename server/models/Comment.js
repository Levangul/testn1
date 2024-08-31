// models/Comment.js

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
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
        replies: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reply',
        }],
    },
   
);

commentSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
