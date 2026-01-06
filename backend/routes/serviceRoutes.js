const express = require("express");
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/", getServices);
router.get("/:id", getServiceById);
router.post("/", authMiddleware, roleMiddleware(["admin"]), createService);
router.put("/:id", authMiddleware, roleMiddleware(["admin"]), updateService);
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteService);

module.exports = router;
