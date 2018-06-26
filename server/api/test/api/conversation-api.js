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
  getMembers(conversationId, referenceId) {
    return request.get(`/conversation/${conversationId}/${referenceId}/members`);
  },
  removeMembers(conversationId, referenceId, body) {
    // body.foreignKeyId
    return request.delete(`/conversation/${conversationId}/${referenceId}/members`, body);
  },
  updateMembers(conversationId, referenceId, body) {
    // body.member
    return request.put(`/conversation/${conversationId}/${referenceId}/members`, body);
  },
  getDeliveredStatus(conversationId) {
    return request.get(`/conversation/${conversationId}/delivered`);
  },
  getDeliveredStatusByMember(conversationId, member) {
    return request.get(`/conversation/${conversationId}/${member}/delivered`);
  },
};
