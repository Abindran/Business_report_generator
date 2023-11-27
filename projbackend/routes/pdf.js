const express = require("express");
const router = express.Router();
const { getUserById } = require("../controllers/user");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { getPdfData } = require("../controllers/pdf");
router.param("userId", getUserById);

router.post("/pdfupload/:userId", isSignedIn, isAuthenticated, getPdfData);

module.exports = router;
