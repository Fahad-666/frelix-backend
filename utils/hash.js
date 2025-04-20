const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(plainPassword, hashedPassword) {
  return hashPassword(plainPassword) === hashedPassword;
}

module.exports = {
  hashPassword,
  verifyPassword,
};
