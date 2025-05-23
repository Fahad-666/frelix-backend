const Gig = require('../models/gig');
const { getDataFromToken } = require('../utils/getDataFromToken');

async function recordImpression(req, res) {
  try {
    const gigId = req.params.id;
    const userData = getDataFromToken(req);

    // Check if the gig exists
    const gig = await Gig.findByPk(gigId);
    if (!gig) {
      return res.status(404).json({ error: "Gig not found" });
    }

    // Don't count impressions from the gig owner
    if (userData && userData.userid === gig.userId) {
      return res.status(200).json({ message: "Impression not counted for gig owner" });
    }

    // Increment the impression count
    await gig.increment('impressions');

    return res.status(200).json({ message: "Impression recorded successfully" });
  } catch (error) {
    console.error("Error in recordImpression:", error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  recordImpression
}; 