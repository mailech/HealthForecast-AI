const express = require("express");
const router = express.Router();
const { getPendingRequests, getUsers } = require("../controllers/userController");
const { requestCredentials, approveAccessRequest, rejectAccessRequest } = require("../controllers/authController");

router.get("/pending", getPendingRequests);
router.get("/requests", getPendingRequests);
router.get("/", getUsers);
router.post("/request-credentials", requestCredentials);
router.put("/:id/approve", approveAccessRequest);
router.put("/:id/reject", rejectAccessRequest);
router.put("/requests/:id/approve", approveAccessRequest);
router.put("/requests/:id/reject", rejectAccessRequest);

module.exports = router;
