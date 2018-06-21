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
  app.get('/api/conversation/:sender/:recipient', ConversationApi.getConversationByRecipients);
  app.post('/api/conversation/:sender/:recipient', ConversationApi.sendMessageToRecipients);
  app.post('/api/conversation/:conversation/:sender', ConversationApi.sendMessageToAll);

  app.del('/api/conversation/:conversationID/members', ConversationApi.removeMembers);
  app.get('/api/conversation/:conversationID/members', ConversationApi.getMembers);
  app.post('/api/conversation/:conversationID/members', ConversationApi.addMembers);
  app.put('/api/conversation/:conversationID/members', ConversationApi.updateMembers);

  app.get('/api/conversation/:conversationID/delivered', ConversationApi.getDeliveredStatus);
  app.get('/api/conversation/:conversationID/:member/delivered', ConversationApi.getDeliveredStatusByMember);
};
