const Conversation = require('../models').Conversation;

module.exports = {
  updateDeliveryStatus(req, res) {
    const { delivery } = req.body;
    Conversation.addDeliveredStatus(delivery).then((conversation) => {
      req.io.emit('delivered_status', conversation);
      return res.send(conversation);
    });
  },
};
