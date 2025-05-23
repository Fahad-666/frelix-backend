const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { registerUser, getUserProfile, updateCategory, getUsersInfo, savePaymentData, getPaymentDetails } = require('./controllers/userController');
const { createNewGig, deleteGig, getUserGigs, updateGig, getAllGigs } = require('./controllers/gigController');
const { uploadMessageFile } = require('./controllers/messageController');
const { recordImpression } = require('./controllers/impressionController');
const sequelize = require('./config/database');
const cookieParser = require('cookie-parser');
const { verifyToken, loginUser, logoutUser } = require('./controllers/authController');
const { updateProfile } = require('./controllers/userController');

const LOCAL_URL = process.env.LOCAL_URL;
const HOSTED_URL = process.env.HOSTED_URL;

const app = express();

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: HOSTED_URL,
  credentials: true,
}));
app.options('*', cors({
  origin: HOSTED_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

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
app.get('/get-payment-details', getPaymentDetails);
app.post('/collect-payment-details', savePaymentData)
app.post('/get-users-info', getUsersInfo);
app.post('/gigs/:id/impression', recordImpression);
app.post('/upload-message-file', uploadMessageFile);
app.post('/update-profile', updateProfile);

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
