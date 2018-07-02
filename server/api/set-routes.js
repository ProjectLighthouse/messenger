'use strict';

const express = require('express');
const ConversationApi = require('./api/conversation-api');

module.exports = function (app) {
  if (process.env.NODE_ENV || !process.env.CLIENT_HOSTPORT) {
    app.use(express.static('public'));
  }

  // creating a neew account
  app.get('/api/', ConversationApi.getStatus);

  // Create's a conversation for my user (accepts recipients as array in the body; also accepts a reference id (such as organization id or opportunity id)
  app.post('/api/conversations', ConversationApi.newConversation);
  // Retrieves all active conversations, optionally pass flag to show archived conversations as well.
  app.get('/api/conversations', ConversationApi.getConversations);
  // Retrieves a single conversation
  app.get('/api/conversations/:conversationId', ConversationApi.getConversationById);
  // Retrieves all members of a conversation who have sent a message
  app.get('/api/conversations/:conversationId/senders', ConversationApi.getSenders);
  // Retrieves all members of a conversation
  app.get('/api/conversations/:conversationId/members', ConversationApi.getMembers);
  // Add members into conversation
  app.post('/api/conversations/:conversationId/members', ConversationApi.addMembers);
  // Remove members from conversation
  app.delete('/api/conversations/:conversationId/members', ConversationApi.removeMembers);
  // Update an member detail
  app.put('/api/conversations/:foreignKeyId/members', ConversationApi.updateMembers);
  // Archive's a conversation
  app.post('/api/conversations/:conversationId/archive', ConversationApi.archiveConversation);
  // Leave a conversation
  app.post('/api/conversations/:conversationId/leave', ConversationApi.leaveConversation);
  // Retrieves all conversations by reference id
  app.get('/api/:referenceId/conversations', ConversationApi.getConversationsByReference);
  // Get delivered status by messageId
  app.get('/api/conversations/:conversationId/:messageId/delivered', ConversationApi.getDeliveredStatus);
  // get delivered status by memberId
  app.get('/api/conversations/:conversationId/:foreignKeyId/delivered', ConversationApi.getDeliveredStatusByMember);
};
