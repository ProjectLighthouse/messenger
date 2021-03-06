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
  newConversation(body) {
    return request.post('/conversations/', body);
  },
  getConversations() {
    return request.get('/conversations');
  },
  getConversationById(conversationId) {
    // body.reference, body.message, body.members
    return request.get(`/conversations/${conversationId}`);
  },
  getSenders(conversationId) {
    return request.get(`/conversations/${conversationId}/senders`);
  },
  getMembers(conversationId) {
    return request.get(`/conversations/${conversationId}/members`);
  },
  addMembers(conversationId, body) {
    // body.members
    return request.post(`/conversations/${conversationId}/members`, body);
  },
  removeMembers(conversationId, body) {
    // body.foreignKeyId
    return request.delete(`/conversations/${conversationId}/members`, body);
  },
  updateMembers(foreignKeyId, body) {
    // body.member
    return request.put(`/conversations/${foreignKeyId}/members`, body);
  },
  archiveConversation(conversationId) {
    return request.post(`/conversations/${conversationId}/archive`);
  },
  leaveConversation(conversationId, body) {
    return request.post(`/conversations/${conversationId}/leave`, body);
  },
  getConversationsByReference(referenceId) {
    return request.get(`/conversations/references/${referenceId}`);
  },
  getDeliveredStatus(conversationId, messageId) {
    return request.get(`/conversations/${conversationId}/${messageId}/delivered`);
  },
  getDeliveredStatusByMember(conversationId, foreignKeyId) {
    return request.get(`/conversations/${conversationId}/${foreignKeyId}/delivered`);
  },
};
