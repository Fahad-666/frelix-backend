const Gig = require('../models/gig');

async function createNewGig(req, res) {

    const data = req.body;
    
    try{
        await Gig.create({
            title: data.title,
            description: data.description,
            price: data.price,
            status: data.status,
            category: data.category,
            userId: req.user.id,
            delivery_time: data.delivery_time,
            image: data.image
        })
        return res.status(201).json({message: "Gig Created Successfully!"});
    }catch(error) {
        return res.status(400).json({error: error.message});
    }

}