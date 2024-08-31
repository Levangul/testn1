
const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
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
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


replySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const Reply = mongoose.model('Reply', replySchema);

module.exports = Reply;
