'use strict';

const express = require('express');
const ConversationApi = require('./api/conversation-api');

module.exports = function (app) {
  if (process.env.NODE_ENV || !process.env.CLIENT_HOSTPORT) {
    app.use(express.static('public'));
  }

  // creating a neew account
  app.get('/api/', ConversationApi.getStatus);

  app.get('/api/conversation/:sender', ConversationApi.getAllConversations);
  app.get('/api/conversation/recipient/:recipient', ConversationApi.getConversationByRecipients);
  app.post('/api/conversation/send/:sender', ConversationApi.sendConversationToAll);

  app.post('/api/conversation/:conversationId/members', ConversationApi.addMembers);
  app.delete('/api/conversation/:conversationId/members', ConversationApi.removeMembers);
  app.get('/api/conversation/:conversationId/members', ConversationApi.getMembers);
  app.put('/api/conversation/:conversationId/:foreignKeyId/members', ConversationApi.updateMembers);

  app.get('/api/conversation/:conversationId/:messageId/delivered', ConversationApi.getDeliveredStatus);
  app.get('/api/conversation/:conversationId/:foreignKeyId/delivered', ConversationApi.getDeliveredStatusByMember);
};
