const mongoose = require("mongoose");

const lookbookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            default: "General",
        },
        description: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Lookbook", lookbookSchema);
