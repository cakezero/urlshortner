require("dotenv").config();
const Url = require("../models/urlSchema");
const User = require("../models/authSchema");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const home = async (req, res) => {
  const token = req.cookies.url_cookie;

  if (!token) {
    return res.render("home");
  }

  jwt.verify(token, process.env.SECRET_MESSAGE, async (err, decodedToken) => {
    if (err) {
      res.redirect("/user/login");
      return;
    }

    const user = await User.findById(decodedToken.id);

    if (user) {
      const urls = await Url.find({ user: user._id }).sort({ _id: -1 });

      return res.render("home", { urls });
    }
  });
};

const shortLink = async (req, res) => {
  const shortUrl = req.params.shortUrl;
  await Url.findOne({ shortUrl })
    .then((result) => res.redirect(`${result.longUrl}`))
    .catch((error) => res.sendStatus(404));
};

const short = async (req, res) => {
  const token = req.cookies.url_cookie;
  let { url } = req.body;
  const protocol = 'urlshortener'

  if (
    !validator.isURL(url, {
      require_protocol: true,
    })
  ) {
    return res.status(200).json({ error: "Invalid Url passed" });
  }

  const urlParts = url.split('://');

  const urlbody = urlParts[1];

  const urlb = urlbody.split(".");

  let urlBody = "";

  for (i = 0; i < urlb.length; i++) {
    urlBody += urlb[i];
  }

  let shortUrl = "";

  for (i = 0; i < 8; i++) {
    let u = Math.floor(Math.random() * urlBody.length);
    if (i % 2 == 0) {
      shortUrl += urlBody[u].toUpperCase();
    }
    shortUrl += urlBody[u];
  }

  if (shortUrl.length != 5) {
    shortUrl = shortUrl.slice(0, 5);
  }

  if (!token) {
    return res.status(201).json({
      notSigned: {
        shortUrl,
        longUrl: url,
      },
    });
  }

  jwt.verify(token, process.env.SECRET_MESSAGE, async (err, decodedToken) => {
    if (err) {
      return res.redirect("/");
    }

    const user = await User.findById(decodedToken.id);

    if (user) {
      const urll = await Url.create({ longUrl: url, shortUrl, user });
      user.urls.push(urll._id);
      user.save();
      return res.json({ message: "Url Shortened Successfuly!!" });
    }
  });
};

module.exports = {
  home,
  shortLink,
  short,
};
