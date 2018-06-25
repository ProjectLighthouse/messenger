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
  sendMessageToAll(reference, sender, message, members) {
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
      conversation.members.concat(members.map(m => {
        return ({
          name: m.name,
          foreign_key_id: m._id,
        });
      }));
      return conversation.save();
    });
  },
  getMembers(_id, reference) {
    return Conversation
    .findOne({ _id, reference })
    .then((conversation) => {
      return conversation.members;
    });
  },
  removeMembers(_id, reference, foreignKeyId) {
    return Conversation
    .findOne({ _id, reference })
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
  getDeliveredStatus(_id) {
    return Conversation.find({ _id }).lean().then((conversation) => {
      return conversation.delivered;
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
    return Conversation.find({ _id, 'delivered.recipients.foreign_key_id': foreignKeyId }).lean().then((conversation) => {
      return conversation.delivered;
    });
  },
});
