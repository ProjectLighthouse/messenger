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
      email: {
        type: String,
        required: true,
      },
      photo: {
        type: String,
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
      },
    },
  ],
  emailAlias: {
    type: String,
  },
  messages: [
    {
      // amazon ses message ID
      messageId: {
        type: String,
      },
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
        {
          email: {
            type: String,
            default: '',
          },
          foreign_key_id: {
            type: Schema.Types.ObjectId,
            required: true,
          },
          timestamp: {
            type: Date,
          },
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
});

const Conversation = mongoose.model('Conversation', ConversationSchema);
module.exports = Object.assign(Conversation, {
  getAllConversations(sender) {
    return Conversation.find({ 'messages.sender': sender }).lean();
  },
  getConversationByRecipients(recipient) {
    return Conversation.find({ 'members.foreign_key_id': recipient }).lean();
  },
  sendConversationToAll(reference, sender, message, members) {
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
          email: m.email,
          photo: m.photo,
          foreign_key_id: m._id,
        });
      });
      newConversation.messages.push({ sender, message });

      return newConversation.save();
    });
  },
  addMembers(_id, members) {
    return Conversation
    .findOne({ _id })
    .then((conversation) => {
      const newMembers = members.map(m => {
        return {
          name: m.name,
          email: m.email,
          foreign_key_id: m._id,
        };
      });
      conversation.members = [...conversation.members, ...newMembers];
      return conversation.save();
    });
  },
  getMembers(_id) {
    return Conversation
    .findOne({ _id })
    .then((conversation) => {
      return conversation.members;
    });
  },
  removeMembers(_id, foreignKeyId) {
    return Conversation
    .findOne({ _id })
    .then((conversation) => {
      conversation.members = conversation.members.filter(m => m.foreign_key_id !== foreignKeyId);
      return conversation.members;
    });
  },
  updateMembers(_id, foreignKeyId, member) {
    return Conversation
    .update({ _id, 'members.foreign_key_id': foreignKeyId },
    { $set: { 'members.$.name': member.name,
    'members.$.email': member.email,
    'members.$.photo': member.photo,
    'members.$.permissions': member.permissions } });
  },
  getDeliveredStatus(_id, messageId) {
    return Conversation.findOne({ _id, 'messages._id': messageId }).lean().then((conversation) => {
      if (conversation) {
        return conversation.messages[0].delivered;
      }
      return [];
    });
  },
  addDeliveredStatus(delivery) {
    return Conversation.find({ 'messages.messageId': delivery.mail.messageId }).then((conversation) => {
      conversation.messages[0].delivered.push({
        email: delivery.delivery.recipients[0],
        timestamp: delivery.delivery.timestamp,
      });
      return conversation.delivered;
    });
  },
  getDeliveredStatusByMember(_id, foreignKeyId) {
    return Conversation.find({ _id, 'messages.delivered.foreign_key_id': foreignKeyId }).lean().then((conversation) => {
      return conversation;
    });
  },
});
