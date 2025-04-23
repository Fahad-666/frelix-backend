const express = require('express');
const cors = require('cors');
const { registerUser, getUserProfile } = require('./controllers/userController');
const sequelize = require('./config/database');
const cookieParser = require('cookie-parser');
const { verifyToken, loginUser } = require('./controllers/authController');


const app = express();

app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use(cookieParser());

app.post('/register', registerUser);
app.post('/login', loginUser);
app.get('/verify-token', verifyToken);
app.get('/get-profile', getUserProfile);

const PORT = "5000";
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if(sequelize) {
    console.log("Database Connection Established Successfully!")
  }
});
