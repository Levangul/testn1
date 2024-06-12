const { Schema, model } = require('mongoose');

const postSchema = new Schema({
  postText: {
    type: String,
    required: 'This section can not be empty!',
    minlength: 1,
    maxlength: 280,
    trim: true,
  },
  postAuthor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Post = model('Post', postSchema);

module.exports = Post;