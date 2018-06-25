const Conversation = require('../models').Conversation;

module.exports = {
  updateDeliveryStatus(req, res) {
    const { delivery } = req.body;
    Conversation.addDeliveredStatus(delivery).then((conversation) => {
      return res.send(conversation);
    });
  },
};
