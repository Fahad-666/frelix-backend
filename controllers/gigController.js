const Gig = require('../models/gig');
const { getDataFromToken } = require('../utils/getDataFromToken');

const User = require('../models/user');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/gigs/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
}).single('image');

async function createNewGig(req, res) {
  upload(req, res, async function (err) {
    console.log("[gigController.js] createNewGig called");
    if (err) {
      console.error("[gigController.js] Multer error:", err);
      return res.status(400).json({ error: err.message });
    }
    const data = req.body;
    console.log("[gigController.js] Request body:", data);
    console.log("[gigController.js] Uploaded file:", req.file);
    if (!req.file) {
      return res.status(400).json({ error: "Gig image is required" });
    }

    try {
      const userData = getDataFromToken(req);
      if (!userData || !userData.userid) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await User.findOne({ where: { id: userData.userid } });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const newGig = await Gig.create({
        title: data.title,
        description: data.description,
        price: data.price,
        status: data.status,
        category: user.category,
        userId: userData.userid,
        delivery_time: data.delivery_time,
        gig_image: req.file.path.replace(/\\/g, '/'),
      });

      return res.status(201).json({ message: "Gig Created Successfully!", gig: newGig });
    } catch (error) {
      console.error("Error in createNewGig:", error);
      return res.status(400).json({ error: error.message });
    }
  });
}

async function getUserGigs(req, res) {
  try {
    const userData = getDataFromToken(req);
    if (!userData || !userData.userid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let gigs = await Gig.findAll({ where: { userId: userData.userid } });
    gigs = gigs.map(gig => {
      if (gig.gig_image) {
        gig.gig_image = gig.gig_image.replace(/\\/g, '/');
      }
      return gig;
    });

    return res.status(200).json({ gigs });
  } catch (error) {
    console.error("[gigController.js] Error in getUserGigs:", error);
    return res.status(400).json({ error: error.message });
  }
}

async function deleteGig(req, res) {
  try {
    const userData = getDataFromToken(req);
    if (!userData || !userData.userid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const gigId = req.params.id;
    const gig = await Gig.findOne({ where: { id: gigId, userId: userData.userid } });
    if (!gig) {
      return res.status(404).json({ error: "Gig not found or you do not have permission to delete it" });
    }

    await gig.destroy();
    return res.status(200).json({ message: "Gig deleted successfully" });
  } catch (error) {
    console.error("Error in deleteGig:", error);
    return res.status(400).json({ error: error.message });
  }
}


async function updateGig(req, res) {
  upload(req, res, async function (err) {
    console.log("[gigController.js] updateGig called");
    if (err) {
      console.error("[gigController.js] Multer error:", err);
      return res.status(400).json({ error: err.message });
    }
    const data = req.body;
    const gigId = req.params.id;
    console.log("[gigController.js] Request body:", data);
    console.log("[gigController.js] Uploaded file:", req.file);

    try {
      const userData = getDataFromToken(req);
      if (!userData || !userData.userid) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const gig = await Gig.findOne({ where: { id: gigId, userId: userData.userid } });
      if (!gig) {
        return res.status(404).json({ error: "Gig not found or you do not have permission to update it" });
      }

      gig.title = data.title || gig.title;
      gig.description = data.description || gig.description;
      gig.price = data.price || gig.price;
      gig.status = data.status || gig.status;
      gig.delivery_time = data.delivery_time || gig.delivery_time;

      if (req.file) {
        gig.gig_image = req.file.path.replace(/\\/g, '/');
      }

      await gig.save();

      return res.status(200).json({ message: "Gig updated successfully", gig });
    } catch (error) {
      console.error("[gigController.js] Error in updateGig:", error);
      return res.status(400).json({ error: error.message });
    }
  });
}

async function getAllGigs(req, res) {
  try {
    let gigs = await Gig.findAll();
    gigs = gigs.map(gig => {
      if (gig.gig_image) {
        gig.gig_image = gig.gig_image.replace(/\\/g, '/');
      }
      return gig;
    });
    return res.status(200).json({ gigs });
  } catch (error) {
    console.error("[gigController.js] Error in getAllGigs:", error);
    return res.status(400).json({ error: error.message });
  }
}

module.exports = {
  createNewGig,
  getUserGigs,
  deleteGig,
  updateGig,
  getAllGigs,
}
