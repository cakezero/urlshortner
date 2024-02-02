const express = require("express");
const router = express.Router();
const AUTH = require("../controllers/auth");
const { requireAuth } = require("../middleware/authToken");

router
  .get("/register", AUTH.register)
  .post("/register", AUTH.register_post)
  .get("/login", AUTH.login)
  .post("/login", AUTH.login_post)
  .get("/profile", requireAuth, AUTH.profile)
  .get("/logout", AUTH.logout);

module.exports = router;
