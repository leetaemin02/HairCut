const express = require("express");
const { getLookbook, createLookbook } = require("../controllers/lookbookController");

const router = express.Router();

router.get("/", getLookbook);
router.post("/", createLookbook);

module.exports = router;
