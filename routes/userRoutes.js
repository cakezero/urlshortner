const express = require("express");
const router = express.Router();
const URL = require("../controllers/urls");
const { requireAuth } = require('../middleware/authToken')

router
  .get("/", URL.home)
  .get("/delete-user", requireAuth, URL.delete_user)
  .post("/delete-url", requireAuth, URL.delete_url)
  .post("/short", URL.short)
  .post("/delete-urls", requireAuth, URL.delete_urls)
  .post("/delete-user", requireAuth, URL.delete_user_post)
  .get("/:short", URL.shortLink);

module.exports = router;
