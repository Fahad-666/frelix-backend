const User = require('../models/user');
const { hashPassword } = require('../utils/hash');

async function registerUser(req, res) {
  const data = req.body;

  try {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already registered' });
    }

    await User.create({
      name: data.name,
      email: data.email,
      password: hashPassword(data.password),
      type: data.type,
      created_at: Math.floor(Date.now() / 1000),
    });

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

module.exports = {
  registerUser,
};
