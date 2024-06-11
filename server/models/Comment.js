const { Schema, model } = require('mongoose');

const commentSchema = new Schema({
    commentText: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 150,
    },
    commentAuthor: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
});

const Comment = model('Comment', commentSchema);

module.exports = Comment;