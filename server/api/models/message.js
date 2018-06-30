'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  messageId: {
    type: String,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
  },
  message: {
    type: String,
    default: '',
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  delivered: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      email: {
        type: String,
        default: '',
      },
      timestamp: {
        type: Date,
      },
    }],
}, {
  usePushEach: true,
});

MessageSchema
.index({
  _id: 1,
  reference: 1,
});

const Message = mongoose.model('Message', MessageSchema);
module.exports = Object.assign(Message, {
  newMessage(sender, message) {
    const newmessage = new Message({ sender, message });
    return newmessage.save();
  },
  getMessageById(messageId) {
    return Message.findOne({ _id: messageId }).then((message) => {
      return message;
    });
  },
});
