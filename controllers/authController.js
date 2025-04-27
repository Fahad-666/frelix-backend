const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { verifyPassword } = require('../utils/verifyPassword')

const JWT_SECRET=process.env.JWT_SECRET;

async function verifyToken(req, res) {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json({message: "Unauthoraized! Token not found."})
    }

    try{
        const decodedToken = jwt.verify(token, JWT_SECRET);
        res.status(200).json({message: "Token Verified!"});
    }catch{
        return res.status(401).json({message: "Invalid or expired token!"})
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
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600 * 1000,
        sameSite: 'lax',
      });
  
      return res.status(200).json({ message: 'User logged in successfully', user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }});
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

async function logoutUser(req, res) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
    });
    return res.status(200).json({ message: 'User logged out successfully' });
}

module.exports = {
    verifyToken,
    loginUser,
    logoutUser,
}
