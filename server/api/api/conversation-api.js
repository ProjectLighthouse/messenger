const Conversation = require('../models').Conversation;

module.exports = {
  getStatus(req, res) {
    res.send(Date());
  },
  getAllConversations(req, res) {
    const { sender } = req.params;
    Conversation.getAllConversations(sender).then((conversations) => {
      return res.send(conversations);
    });
  },
  getConversationByRecipients(req, res) {
    const { recipient } = req.params;
    Conversation.getConversationByRecipients(recipient).then((conversations) => {
      return res.send(conversations);
    });
  },
  sendConversationToAll(req, res) {
    const { sender } = req.params;
    const body = req.body;
    Conversation.sendConversationToAll(body.reference, sender, body.message, body.members).then((conversation) => {
      global.io.emit('new_message', conversation);
      return res.send(conversation);
    });
  },
  addMembers(req, res) {
    const { conversationId } = req.params;
    const body = req.body;
    Conversation.addMembers(conversationId, body.members).then((conversation) => {
      global.io.emit('update_memebers', conversation);
      return res.send(conversation);
    });
  },
  getMembers(req, res) {
    const { conversationId, referenceId } = req.params;
    Conversation.getMembers(conversationId, referenceId).then((conversation) => {
      return res.send(conversation);
    });
  },
  removeMembers(req, res) {
    const { conversationId, referenceId } = req.params;
    const body = req.body;
    Conversation.removeMembers(conversationId, referenceId, body.foreignKeyId).then((conversation) => {
      global.io.emit('update_memebers', conversation);
      return res.send(conversation);
    });
  },
  updateMembers(req, res) {
    const { conversationId, referenceId } = req.params;
    const body = req.body;
    Conversation.updateMembers(conversationId, referenceId, body.member).then((conversation) => {
      global.io.emit('update_memebers', conversation);
      return res.send(conversation);
    });
  },
  getDeliveredStatus(req, res) {
    const { id } = req.params;
    Conversation.getDeliveredStatus(id).then((conversation) => {
      return res.send(conversation);
    });
  },
  getDeliveredStatusByMember(req, res) {
    const { id, foreignKeyId } = req.params;
    Conversation.getDeliveredStatusByMember(id, foreignKeyId).then((conversation) => {
      return res.send(conversation);
    });
  },
};
