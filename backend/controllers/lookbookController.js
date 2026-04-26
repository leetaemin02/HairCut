const Lookbook = require("../models/Lookbook");

// Get all lookbook items (Random 8 items for homepage/refresh)
exports.getLookbook = async (req, res) => {
    try {
        // Lấy ngẫu nhiên tối đa 8 hình ảnh
        const items = await Lookbook.aggregate([{ $sample: { size: 8 } }]);
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a lookbook item
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

// Update a lookbook item
exports.updateLookbook = async (req, res) => {
    try {
        const { title, image, category, description } = req.body;
        const updatedItem = await Lookbook.findByIdAndUpdate(
            req.params.id,
            { title, image, category, description },
            { new: true }
        );
        if (!updatedItem) return res.status(404).json({ message: "Lookbook not found" });
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a lookbook item
exports.deleteLookbook = async (req, res) => {
    try {
        const item = await Lookbook.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: "Lookbook not found" });
        res.status(200).json({ message: "Lookbook deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
