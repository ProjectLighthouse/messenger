const Message = require('../models').Message;

module.exports = {
  getStatus(req, res) {
    res.send(Date());
  },
  getAllConversations(req, res) {
    const { sender } = req.params;
    Message.getAllConversations(sender).then((conversations) => {
      return res.send(conversations);
    });
  },
  getConversationByRecipients(req, res) {
    const { recipient } = req.params;
    Message.getConversationByRecipients(recipient).then((conversations) => {
      return res.send(conversations);
    });
  },
  sendMessageToAll(req, res) {
    const { sender } = req.params;
    const body = req.body;
    Message.sendMessageToAll(body.reference, sender, body.message, body.members).then((conversation) => {
      return res.send(conversation);
    });
  },
  addMembers(req, res) {
    const { conversationId } = req.params;
    const body = req.body;
    Message.addMembers(conversationId, body.members).then((conversation) => {
      return res.send(conversation);
    });
  },
  getMembers(req, res) {
    const { conversationId, referenceId } = req.params;
    Message.getMembers(conversationId, referenceId).then((conversation) => {
      return res.send(conversation);
    });
  },
  removeMembers(req, res) {
    const { conversationId, referenceId } = req.params;
    const body = req.body;
    Message.removeMembers(conversationId, referenceId, body.foreignKeyId).then((conversation) => {
      return res.send(conversation);
    });
  },
  updateMembers(req, res) {
    const { conversationId, referenceId } = req.params;
    const body = req.body;
    Message.updateMembers(conversationId, referenceId, body.member).then((conversation) => {
      return res.send(conversation);
    });
  },
  getDeliveredStatus(req, res) {
    const { id } = req.params;
    Message.getDeliveredStatus(id).then((conversation) => {
      return res.send(conversation);
    });
  },
  getDeliveredStatusByMember(req, res) {
    const { id, foreignKeyId } = req.params;
    Message.getDeliveredStatusByMember(id, foreignKeyId).then((conversation) => {
      return res.send(conversation);
    });
  },
};
