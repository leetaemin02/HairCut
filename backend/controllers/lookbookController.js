const Lookbook = require("../models/Lookbook");

// Get all lookbook items
exports.getLookbook = async (req, res) => {
    try {
        const items = await Lookbook.find().sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a lookbook item (useful for seeding/admin)
exports.createLookbook = async (req, res) => {
    try {
        const { title, image, category, description } = req.body;
        const newItem = new Lookbook({
            title,
            image,
            category,
            description,
        });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
