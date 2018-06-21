const removeMd = require('remove-markdown');
const removeHtml = require('sanitize-html');

module.exports = {
  createUnformattedDescription(description) {
    return removeMd(description);
  },
  stripHtml(field) {
    return removeHtml(field, {
      allowedTags: [],
      allowedAttributes: [],
    });
  },
};
