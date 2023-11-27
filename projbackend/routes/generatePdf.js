const express = require("express");
const router = express.Router();

const { getUserById } = require("../controllers/user");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { getPdfGenerateInput } = require("../controllers/generatePdf");
router.param("userId", getUserById);

router.post(
  "/pdf/user/input/:userId",
  isSignedIn,
  isAuthenticated,
  getPdfGenerateInput
);

module.exports = router;
