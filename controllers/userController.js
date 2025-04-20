const { Request, Response } = require('express');
const User = require('../models/user');
const { hashPassword, verifyPassword } = require('../utils/hash');

async function registerUser(req, res) {
  const data = req.body;

  try {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already registered' });
    }

    const newUser = await User.create({
      name: data.name,
      email: data.email,
      password: hashPassword(data.password),
      created_at: Math.floor(Date.now() / 1000),
    });

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

async function loginUser(req, res) {
  const data = req.body;

  try {
    const user = await User.findOne({ where: { email: data.email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!verifyPassword(data.password, user.password)) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    return res.status(200).json({ message: 'User logged in successfully' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

module.exports = {
  registerUser,
  loginUser,
};
