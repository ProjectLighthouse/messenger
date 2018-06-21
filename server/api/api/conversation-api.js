const Message = require('../models').Message;

module.exports = {
  getStatus(req, res) {
    res.send(Date());
  },
  getAllConversations(req, res) {
    res.send();
  },
  getConversationByRecipients(req, res) {
    res.send();
  },
  sendMessageToRecipients(req, res) {
    res.send();
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
};
