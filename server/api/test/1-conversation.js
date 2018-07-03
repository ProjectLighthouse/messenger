const expect = require('chai').expect;
const ConversationApi = require('./api/conversation-api');
const {
Conversation,
} = require('../models');
const Misc = require('./helpers/misc');

const globalSender = Misc.mongoObjectId();
const globalReference = Misc.mongoObjectId();
const globalRecipient = Misc.mongoObjectId();
const globalForeignKeyId1 = Misc.mongoObjectId();
const globalForeignKeyId2 = Misc.mongoObjectId();

describe('Conversation', function () {
  describe('POST /api/conversations', function () {
    it('should create Create a conversation for my user', function (done) {
      ConversationApi.newConversation({
        reference: globalReference,
        members: [
          {
            name: 'User 1',
            emailAddress: 'joao.gabriel4@integritas.net',
            foreignKeyId: globalSender,
          },
          {
            name: 'User 2',
            emailAddress: 'joao.gabriel5@integritas.net',
            foreignKeyId: globalRecipient,
          },
        ],
        sender: globalSender,
        message: 'New message',
      }).then((conversation) => {
        global.conversationId = conversation._id;
        global.messageId = conversation.messages[0]._id;
        expect(conversation.members).to.have.lengthOf(2);
        expect(conversation).to.be.ok;
        done();
      });
    });
  });
  describe('GET /api/conversations', function () {
    it('should retrieves all active conversations', function (done) {
      ConversationApi.getConversations({
        archived: false,
      }).then((conversations) => {
        expect(conversations).to.be.an('array');
        expect(conversations).to.be.ok;
        done();
      });
    });
  });
  describe('GET /api/conversations/:conversationId', function () {
    it('should retrieves a single conversation', function (done) {
      ConversationApi.getConversationById(global.conversationId).then((conversation) => {
        global.conversationId = conversation._id;
        expect(conversation.members).to.have.lengthOf(2);
        expect(conversation).to.be.ok;
        done();
      });
    });
  });
  describe('GET /api/conversations/:conversationId/senders', function () {
    it('should retrieves all members of a conversation who have sent a message', function (done) {
      ConversationApi.getSenders(global.conversationId).then((conversation) => {
        console.log(conversation);
        expect(conversation).to.be.ok;
        done();
      });
    });
  });
  describe('GET /api/conversations/:conversationId/members', function () {
    it('should retrieves all members of a conversation', function (done) {
      ConversationApi.getMembers(global.conversationId).then((members) => {
        expect(members).to.be.ok;
        done();
      });
    });
  });
  describe('POST /api/conversations/:conversationId/members', function () {
    it('should add members into conversation', function (done) {
      ConversationApi.addMembers(global.conversationId, {
        members: [
          {
            name: 'User 3',
            emailAddress: 'joao.gabriel2@integritas.net',
            foreignKeyId: globalForeignKeyId1,
          },
          {
            name: 'User 4',
            emailAddress: 'joao.gabriel1@integritas.net',
            foreignKeyId: globalForeignKeyId2,
          },
        ],
      }).then((conversation) => {
        expect(conversation.ok).to.equal(1);
        expect(conversation).to.be.ok;
        done();
      });
    });
  });
  describe('DELETE /api/conversations/:conversationId/members', function () {
    it('should remove members from conversation', function (done) {
      ConversationApi.removeMembers(global.conversationId,
        {
          foreignKeyId: globalForeignKeyId1,
        }).then((conversation) => {
          expect(conversation).to.be.ok;
          done();
        });
    });
  });
  describe('POST /api/conversations/:conversationId/archive', function () {
    it('should archives a conversation', function (done) {
      ConversationApi.archiveConversation(global.conversationId).then((conversation) => {
        expect(conversation).to.be.ok;
        done();
      });
    });
  });
  describe('POST /api/conversations/:conversationId/leave', function () {
    it('should leave a conversation', function (done) {
      ConversationApi.leaveConversation(global.conversationId).then((conversation) => {
        expect(conversation).to.be.ok;
        done();
      });
    });
  });
  describe('GET /api/conversations/references/:referenceId', function () {
    it('should retrieves all conversations by reference id', function (done) {
      ConversationApi.getConversationsByReference(globalReference).then((conversations) => {
        expect(conversations).to.be.ok;
        done();
      });
    });
  });
  describe('GET /api/conversations/:conversationId/:messageId/delivered', function () {
    it('should get delivered status by messageId', function (done) {
      ConversationApi.getDeliveredStatus(global.conversationId, global.messageId).then((conversations) => {
        expect(conversations).to.be.an('array');
        done();
      });
    });
  });
});
