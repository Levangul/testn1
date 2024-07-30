
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, },
    read: { type: Boolean, default: false }
});

messageSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

messageSchema.set('toJSON', {
    virtuals: true,
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
