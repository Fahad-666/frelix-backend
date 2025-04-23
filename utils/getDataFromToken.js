const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../controllers/authController');

function getDataFromToken(req) {
    const token = req.cookies.token;
  
    if (!token) {
      throw new Error("Token not found in cookies");
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
  
module.exports = {
    getDataFromToken,
}
