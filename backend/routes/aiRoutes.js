const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

// Post chat message to AI assistant
router.post("/chat", aiController.chatWithAI);

module.exports = router;
