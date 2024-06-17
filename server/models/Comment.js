const { Schema, model } = require('mongoose');

const commentSchema = new Schema({
    text: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 150,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Comment = model('Comment', commentSchema);

module.exports = Comment;