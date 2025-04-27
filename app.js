const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { registerUser, getUserProfile, updateCategory } = require('./controllers/userController');
const { createNewGig, deleteGig, getUserGigs, updateGig, getAllGigs } = require('./controllers/gigController');
const sequelize = require('./config/database');
const cookieParser = require('cookie-parser');
const { verifyToken, loginUser, logoutUser } = require('./controllers/authController');

const app = express();

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: "https://frelix.techiefahad.site",
  credentials: true,
}));
app.options('*', cors({
  origin: "https://frelix.techiefahad.site",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

app.post('/register', registerUser);
app.post('/login', loginUser);
app.get('/verify-token', verifyToken);
app.get('/get-profile', getUserProfile);
app.post('/logout', logoutUser);
app.post('/update-category', updateCategory);
app.post('/create-gig', createNewGig);
app.get('/user-gigs', getUserGigs);
app.delete('/delete-gig/:id', deleteGig);
app.put('/update-gig/:id', updateGig);
app.get('/gigs', getAllGigs);

const PORT = process.env.PORT;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  sequelize.authenticate()
  .then(() => console.log('Database connected!'))
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

});
