const { Schema, model } = require('mongoose');

const postSchema = new Schema({
  text: {
    type: String,
    required: 'This section cannot be empty!',
    minlength: 1,
    maxlength: 280,
    trim: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }]
});

const Post = model('Post', postSchema);

module.exports = Post;