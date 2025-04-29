const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { hashPassword } = require('../utils/hash');
const { getDataFromToken } = require('../utils/getDataFromToken');

const JWT_SECRET = process.env.JWT_SECRET;

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

    const user = await User.findOne({ where: { email: data.email } });

    const payload = {
      userid: user.id,
      loginTime: Math.floor(Date.now() / 1000),
      email: user.email,
      type: user.type,
      name: user.name,
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 });
      
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600 * 1000,
      sameSite: 'lax',
    });

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

async function getUserProfile(req, res) {
  try{
    const userData = getDataFromToken(req);
    return res.status(200).json({ user: userData });
  }catch(error){
    return res.status(401).json({ error: error.message });
  }
}

async function updateCategory(req, res) {
  try {
    console.log("updateCategory called with body:", req.body);
    const userData = getDataFromToken(req);
    console.log("User data from token:", userData);
    if (!userData || !userData.userid) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }
    const user = await User.findOne({ where: { id: userData.userid } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.category = category;
    await user.save();
    return res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    console.error("Error in updateCategory:", error);
    return res.status(400).json({ error: error.message });
  }
}

async function getUsersInfo(req, res) {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds)) {
      return res.status(400).json({ error: "userIds must be an array" });
    }
    const users = await User.findAll({
      where: {
        id: userIds,
      },
      attributes: ['id', 'name'],
    });
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  registerUser,
  getUserProfile,
  updateCategory,
  getUsersInfo,
};
