const express = require("express");
const { getLookbook, createLookbook, updateLookbook, deleteLookbook } = require("../controllers/lookbookController");

const router = express.Router();

router.get("/", getLookbook);
router.post("/", createLookbook);
router.put("/:id", updateLookbook);
router.delete("/:id", deleteLookbook);

module.exports = router;
