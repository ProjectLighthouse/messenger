const Conversation = require('../models').Conversation;

module.exports = {
  getStatus(req, res) {
    res.send(Date());
  },
  newConversation(req, res) {
     /**
     * body { reference, sender, message, members[{name, emailAddress, foreignKeyId}] }
     */
    const body = req.body;
    Conversation.newConversation(body).then((conversation) => {
      global.io.emit(`new_message_${conversation.reference}`, conversation);
      return res.send(conversation);
    });
  },
  getConversations(req, res) {
    const body = req.body;
    /**
     * body { archived: true/false }
     */
    Conversation.getConversations(body.archived).then((conversations) => {
      return res.send(conversations);
    });
  },
  getConversationById(req, res) {
    const { conversationId } = req.params;
    Conversation.getConversationById(conversationId).then((conversation) => {
      return res.send(conversation);
    });
  },
  getSenders(req, res) {
    const { conversationId } = req.params;
    Conversation.getSenders(conversationId).then((senders) => {
      return res.send(senders);
    });
  },
  getMembers(req, res) {
    const { conversationId } = req.params;
    Conversation.getMembers(conversationId).then((members) => {
      return res.send(members);
    });
  },
  addMembers(req, res) {
    const { conversationId } = req.params;
    const body = req.body;
    /**
     * body { members: [name, email, foreignKeyId] }
     */
    Conversation.addMembers(conversationId, body.members).then((conversation) => {
      global.io.emit(`update_members_${conversationId}`, conversation);
      return res.send(conversation);
    });
  },
  removeMembers(req, res) {
    const { conversationId } = req.params;
    const body = req.body;
    /**
     * body { foreignKeyId }
     */
    Conversation.removeMembers(conversationId, body.foreignKeyId).then((conversation) => {
      global.io.emit(`update_members_${conversationId}`, conversation);
      return res.send(conversation);
    });
  },
  updateMembers(req, res) {
    const { foreignKeyId } = req.params;
    const body = req.body;
     /**
     * body { member: {name, email, photo, permissions} }
     */
    Conversation.updateMembers(foreignKeyId, body.member).then((conversation) => {
      global.io.emit(`update_members_${foreignKeyId}`, conversation);
      return res.send(conversation);
    });
  },
  archiveConversation(req, res) {
    const { conversationId } = req.params;
    Conversation.archiveConversation(conversationId).then((conversation) => {
      global.io.emit(`archive_conversation_${conversationId}`, conversation);
      return res.send(conversation);
    });
  },
  leaveConversation(req, res) {
    const { conversationId } = req.params;
    const body = req.body;
    /**
     * body { member: ObjectId }
     */
    Conversation.leaveConversation(conversationId, body.member).then((conversation) => {
      global.io.emit(`leave_conversation_${conversationId}`, conversation);
      return res.send(conversation);
    });
  },
  getConversationsByReference(req, res) {
    const { referenceId } = req.params;
    return Conversation.getConversationsByReference(referenceId).then((conversations) => {
      return res.send(conversations);
    });
  },
  getDeliveredStatus(req, res) {
    const { conversationId, messageId } = req.params;
    Conversation.getDeliveredStatus(conversationId, messageId).then((conversation) => {
      return res.send(conversation);
    });
  },
  getDeliveredStatusByMember(req, res) {
    const { foreignKeyId, messageId } = req.params;
    if( foreignKeyId && messageId ) {
      return Conversation.getDeliveredStatusByMember(foreignKeyId, messageId).then((conversation) => {
        return res.send(conversation);
      });
    }
    return [];
  },
};
