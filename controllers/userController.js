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
  try {
    const userData = getDataFromToken(req);
    const user = await User.findOne({ where: { id: userData.userid } });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ 
      user: {
        ...userData,
        location: user.location || '',
        bio: user.bio || '',
      }
    });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
}

async function updateProfile(req, res) {
  try {
    const userData = getDataFromToken(req);
    const { name, email, bio, location } = req.body;

    const user = await User.findOne({ where: { id: userData.userid } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    await user.update({
      name: name || user.name,
      email: email || user.email,
      bio: bio || user.bio,
      location: location || user.location
    });

    // Fetch updated user data
    const updatedUser = await User.findByPk(userData.userid, {
      attributes: ['id', 'name', 'email', 'bio', 'location']
    });

    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
}

const UserPaymentDetails = require('../models/userPaymentDetails');

async function savePaymentData(req, res) {
  let userData;
  try {
    userData = getDataFromToken(req);
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid or missing token" });
  }

  if (!userData || !userData.userid) {
    return res.status(401).json({ error: "Unauthorized: User ID missing in token" });
  }

  const { account_holder_name, phone_number, country, bank_name, acc_number } = req.body;

  if (!account_holder_name || !phone_number || !country || !bank_name || !acc_number) {
    return res.status(400).json({ error: "Please enter all information is required" });
  }

  let user;
  try {
    user = await User.findOne({ where: { id: userData.userid } });
  } catch (error) {
    console.error("Sequelize findOne error:", error);
    return res.status(500).json({ error: "Database query error" });
  }

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const existingPayment = await UserPaymentDetails.findOne({ where: { userId: userData.userid } });
    
    // Check if in cooldown period
    if (existingPayment && existingPayment.cooldownUntil && new Date(existingPayment.cooldownUntil) > new Date()) {
      return res.status(400).json({ 
        error: "Payment details cannot be updated during cooldown period",
        cooldownUntil: existingPayment.cooldownUntil
      });
    }

    // Set cooldown period to 7 days from now
    const cooldownUntil = new Date();
    cooldownUntil.setDate(cooldownUntil.getDate() + 7);

    if (existingPayment) {
      existingPayment.accountHolderName = account_holder_name;
      existingPayment.phoneNumber = phone_number;
      existingPayment.country = country;
      existingPayment.bankName = bank_name;
      existingPayment.accountNumber = acc_number;
      existingPayment.cooldownUntil = cooldownUntil;
      await existingPayment.save();
    } else {
      await UserPaymentDetails.create({
        userId: userData.userid,
        accountHolderName: account_holder_name,
        phoneNumber: phone_number,
        country: country,
        bankName: bank_name,
        accountNumber: acc_number,
        cooldownUntil: cooldownUntil
      });
    }

    return res.status(200).json({ 
      message: "Payment details saved successfully",
      cooldownUntil: cooldownUntil
    });
  } catch (error) {
    console.error("Sequelize save/create error:", error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0].path;
      if (field === 'idx_phone_number') {
        return res.status(400).json({ error: "Duplicate entry: This phone number is already registered" });
      } else if (field === 'idx_account_number') {
        return res.status(400).json({ error: "Duplicate entry: This account number is already registered" });
      }
    }
    return res.status(500).json({ error: "Failed to save payment details" });
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

async function getPaymentDetails(req, res) {
  let userData;
  try {
    userData = getDataFromToken(req);
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid or missing token" });
  }

  if (!userData || !userData.userid) {
    return res.status(401).json({ error: "Unauthorized: User ID missing in token" });
  }

  try {
    const paymentDetails = await UserPaymentDetails.findOne({
      where: { userId: userData.userid },
    });

    if (!paymentDetails) {
      return res.status(404).json({ error: "Payment details not found" });
    }

    return res.status(200).json({ 
      paymentDetails,
      isInCooldown: paymentDetails.cooldownUntil && new Date(paymentDetails.cooldownUntil) > new Date(),
      cooldownUntil: paymentDetails.cooldownUntil
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return res.status(500).json({ error: "Failed to fetch payment details" });
  }
}

module.exports = {
  registerUser,
  getUserProfile,
  updateProfile,
  updateCategory,
  getUsersInfo,
  savePaymentData,
  getPaymentDetails,
};
