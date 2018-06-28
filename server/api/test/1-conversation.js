const expect = require('chai').expect;
const ConversationApi = require('./api/conversation-api');
const {
  Conversation,
} = require('../models');
const Misc = require('./helpers/misc');

const globalSender = Misc.mongoObjectId();
const globalReference = Misc.mongoObjectId();
const globalRecipient = Misc.mongoObjectId();

describe('Conversation', function () {
  describe('POST /api/conversation/send/:sender', function () {
    it('should create a new conversation', function () {
      return ConversationApi.sendConversationToAll(globalSender, {
        reference: globalReference,
        sender: globalSender,
        message: 'The first message sended to the group',
        members: [
          {
            name: 'User1',
            photo: '',
            email: 'user1.email@email.com',
            _id: globalRecipient,
          },
          {
            name: 'User2',
            photo: '',
            email: 'user2.email@email.com',
            _id: Misc.mongoObjectId(),
          },
        ],
      })
      .then((conversation) => {
        global.conversationId = conversation._id;
        global.messageId = conversation.messages[0]._id;
        expect(conversation.reference).to.equal(globalReference);
        expect(conversation.members).to.have.lengthOf(2);
        expect(conversation).to.be.ok;
      });
    });
  });
  describe('GET /api/conversation/:sender', function () {
    it('Get all conversations by sender', function () {
      return ConversationApi.getAllConversations(globalSender)
      .then((conversation) => {
        expect(conversation).to.be.an('array').and.to.have.lengthOf(1);
        expect(conversation).to.be.ok;
      });
    });
  });
  describe('GET /api/conversation/recipient/:recipient', function () {
    it('Get all conversations by recipient', function () {
      return ConversationApi.getConversationByRecipients(globalRecipient)
      .then((conversation) => {
        expect(conversation).to.be.an('array');
        expect(conversation).to.be.ok;
      });
    });
  });
  describe('POST /api/conversation/:conversationId/members', function () {
    it('Add members into conversation', function () {
      return ConversationApi.addMembers(global.conversationId, {
        members: [
          {
            name: 'New User',
            photo: '',
            email: 'newuser@email.com',
            _id: Misc.mongoObjectId(),
          },
        ],
      })
      .then((conversation) => {
        expect(conversation).to.be.an('object');
        expect(conversation).to.be.ok;
      });
    });
  });
  describe('GET /api/conversation/:conversationId/members', function () {
    it('GET members by conversation', function () {
      return ConversationApi.getMembers(global.conversationId)
      .then((conversation) => {
        expect(conversation).to.be.an('array');
        expect(conversation).to.be.ok;
      });
    });
  });
  describe('PUT /api/conversation/:conversationId/members', function () {
    it('Update members details by conversation', function () {
      return ConversationApi.updateMembers(global.conversationId, globalRecipient, {
        member: {
          name: 'New User',
          photo: '',
          email: 'newuser@email.com',
          _id: Misc.mongoObjectId(),
        },
      })
      .then((conversation) => {
        expect(conversation).to.be.an('object');
        expect(conversation).to.be.ok;
      });
    });
  });
  describe('DELETE /api/conversation/:conversationId/members', function () {
    it('Delete members by conversation', function () {
      return ConversationApi.removeMembers(global.conversationId, {
        foreignKeyId: globalRecipient,
      })
      .then((conversation) => {
        expect(conversation).to.be.an('array');
        expect(conversation).to.be.ok;
      });
    });
  });
  describe('GET /api/conversation/:conversationId/delivered', function () {
    it('Get delivered status', function () {
      return ConversationApi.getDeliveredStatus(global.conversationId, global.messageId)
      .then((conversation) => {
        expect(conversation).to.be.an('array');
        expect(conversation).to.be.ok;
      });
    });
  });
});
