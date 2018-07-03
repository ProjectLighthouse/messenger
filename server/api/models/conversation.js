'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');
const Message = require('./message');

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
      member: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      last_read_message: {
        type: Schema.Types.ObjectId,
      },
      leaved: {
        type: Boolean,
        default: false,
      },
    },
  ],
  emailAlias: {
    type: String,
  },
  messages: [
    {
      message: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
      },
    },
  ],
  archived: {
    type: Boolean,
    default: false,
  },
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
  newConversation(body) {
    const newConversation = new Conversation({
      reference: body.reference,
    });
    newConversation.members = body.members.map(m => {
      return ({
        member: User.getOrCreate(m),
      });
    });
    const newMessage = Message.newMessage(body.sender, body.message);
    newConversation.messages.push({ message: newMessage._id });
    return newConversation.save();
  },
  addMessage(_id, body) {
    const newMessage = Message.newMessage(body.sender, body.message);
    return Conversation.update({ _id }, { $push: { messages: newMessage } });
  },
  getConversations(archived) {
    return Conversation
    .find({ archived })
    .then((conversations) => {
      return conversations;
    });
  },
  getConversationById(_id) {
    return Conversation
    .findOne({ _id })
    .then((conversation) => {
      return conversation;
    });
  },
  getSenders(_id) {
    return Conversation
    .findOne({ _id })
    .populate('messages.message')
    .then((conversation) => {
      console.log(conversation);
      let messages = [];
      messages = [...messages, ...conversation.messages];
      const senders = messages.map(m => {
        return m.sender;
      });
      return senders || [];
    });
  },
  getMembers(_id) {
    return Conversation
    .findOne({ _id })
    .then((conversation) => {
      return conversation.members || [];
    });
  },
  addMembers(_id, members) {
    const newMembers = members.map(m => {
      console.log(m);
      const member = User.getOrCreate({
        name: m.name,
        email: m.email,
        foreignKeyId: m.foreignKeyId,
      });
      console.log(member);
      return { member };
    });
    return Conversation.update({ _id }, { $push: { members: newMembers } });
  },
  removeMembers(_id, userId) {
    return Conversation.update({ _id }, { $pull: { members: { member: userId } } });
  },
  updateMembers(foreignKeyId, member) {
    return User.update(foreignKeyId, member);
  },
  archiveConversation(_id) {
    return Conversation.update({ _id }, { $set: { archived: true } }).then((conversation) => {
      return conversation;
    });
  },
  leaveConversation(_id, member) {
    return Conversation.update({ _id, 'members.member': member },
    { $set: { 'members.$.leaved': true } }).then((conversation) => {
      return conversation;
    });
  },
  getConversationsByReference(reference) {
    return Conversation
    .findOne({ reference })
    .then((conversations) => {
      return conversations;
    });
  },
  getDeliveredStatus(_id, messageId) {
    if (_id && messageId) {
      return Conversation.findOne({ _id, 'messages._id': messageId }).lean().then((conversation) => {
        if (conversation) {
          return conversation.messages[0].delivered || [];
        }
        return [];
      });
    }
    return [];
  },
  getDeliveredStatusByMember(userId, messageId) {
    if (userId && messageId) {
      return Message.getMessageById(messageId).then(message => {
        return message.delivered.filter((d) => d.userId === userId) || [];
      });
    }
    return [];
  },
  addDeliveredStatus(messageId, userId, body) {
    return Message.getMessageById(messageId).then(message => {
      message.delivered.push({
        userId,
        timestamp: body.timestamp,
      });
      return message.save();
    });
  },
});

