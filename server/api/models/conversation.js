'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  reference: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
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
module.exports = Object.assign(Conversation, {
  getAllConversations(sender) {
    return Conversation.find({ 'messages.sender': sender }).lean();
  },
  getConversationByRecipients(recipient) {
    return Conversation.find({ 'members.foreign_key_id': recipient }).lean();
  },
  sendMessageToRecipients(reference, sender, message, members) {
    return Conversation
    .findOne({ reference })
    .then((conversation) => {
      if (conversation) {
        return conversation;
      }
      const newConversation = new Conversation({
        reference,
      });
      newConversation.members = members.map(m => {
        return ({
          name: m.name,
          foreign_key_id: m._id,
        });
      });
      newConversation.messages.push({ sender, message });
      return newConversation.save();
    });
  },
  sendMessageToAll(req, res) {
    res.send();
  },
  addMembers(req, res) {
    res.send();
  },
  getMembers(req, res) {
    res.send();
  },
  removeMembers(req, res) {
    res.send();
  },
  updateMembers(req, res) {
    res.send();
  },
  getDeliveredStatus(req, res) {
    res.send();
  },
  getDeliveredStatusByMember(req, res) {
    res.send();
  },
});
