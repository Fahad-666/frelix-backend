const express = require('express');
const cors = require('cors');
const { registerUser, loginUser } = require('./controllers/userController');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/register', registerUser);
app.post('/login', loginUser);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
