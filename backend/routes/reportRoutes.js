const express = require("express");
const router = express.Router();
const { downloadReport } = require("../controllers/reportController");

router.get("/download", downloadReport);
router.get("/:id/download", downloadReport);

module.exports = router;
