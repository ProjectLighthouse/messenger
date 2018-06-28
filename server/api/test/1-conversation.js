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
});
