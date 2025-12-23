// Security Helper: Prevents ReDoS attacks by escaping special regex characters
const escapeRegex = (text) => {
  if (!text) return '';
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

module.exports = escapeRegex;