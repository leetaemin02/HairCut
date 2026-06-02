// backend/routes/securityRoutes.js
const express = require("express");
const router = express.Router();
const { getSecurityStatus, checkHeaders } = require("../controllers/securityController");

router.get("/status", getSecurityStatus);
router.get("/headers", checkHeaders);

module.exports = router;
