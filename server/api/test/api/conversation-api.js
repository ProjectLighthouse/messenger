/**
 * Created by joaogabriellima on 08/05/18.
 */
const request = require('../helpers/request');

module.exports = {
  getStatus(userId) {
    return request.post('/', {
      userId,
    });
  },
  getAllConversations(sender) {
    return request.get(`/conversation/${sender}`);
  },
  getConversationByRecipients(recipient) {
    return request.get(`/conversation/recipient/${recipient}`);
  },
  sendConversationToAll(sender, body) {
    // body.reference, body.message, body.members
    return request.post(`/conversation/send/${sender}`, body);
  },
  addMembers(conversationId, body) {
    // body.members
    return request.post(`/conversation/${conversationId}/members`, body);
  },
  getMembers(conversationId) {
    return request.get(`/conversation/${conversationId}/members`);
  },
  removeMembers(conversationId, body) {
    // body.foreignKeyId
    return request.delete(`/conversation/${conversationId}/members`, body);
  },
  updateMembers(conversationId, foreignKeyId, body) {
    // body.member
    return request.put(`/conversation/${conversationId}/${foreignKeyId}/members`, body);
  },
  getDeliveredStatus(conversationId, messageId) {
    return request.get(`/conversation/${conversationId}/${messageId}/delivered`);
  },
  getDeliveredStatusByMember(conversationId, foreignKeyId) {
    return request.get(`/conversation/${conversationId}/${foreignKeyId}/delivered`);
  },
};
