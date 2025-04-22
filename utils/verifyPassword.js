const { hashPassword } = require('./hash');

function verifyPassword(plainPassword, hashedPassword) {
    return hashPassword(plainPassword) === hashedPassword;
}

module.exports={
    verifyPassword,
}