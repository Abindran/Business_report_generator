const express = require("express");
const router = express.Router();
const { signin, signout, signup } = require("../controllers/auth");

router.post("/signup", signup);

router.post("/signin", signin);

router.get("/signout", signout);

module.exports = router;
