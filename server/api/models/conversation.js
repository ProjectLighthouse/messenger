'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  reference: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  members: [
    {
      name: {
        type: String,
        required: true,
      },
      photo: {
        type: String,
        required: true,
      },
      foreign_key_id: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      permissions: [{
        rule: {
          type: String,
          required: true,
        },
      }],
      last_read_message: {
        type: Schema.Types.ObjectId,
        required: true,
      },
    },
  ],
  messages: [
    {
      sender: {
        type: Schema.Types.ObjectId,
        required: true,
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
      { email: {
        type: String,
        default: '',
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      recipients: [
        {
          email: {
            type: String,
            default: '',
          },
        },
      ],
    }],
    },
  ],
}, {
  usePushEach: true,
});

ConversationSchema
.index({
  _id: 1,
  reference: 1,
  'messages.sender': 1,
  'members.foreign_key_id': 1,
});

const Conversation = mongoose.model('Conversation', ConversationSchema);
module.exports = Object.assign(Conversation, {});
