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

// Redirection to the url
const shortLink = async (req, res) => {
  const shortUrl = req.params.short;

  try {

    const url = await Url.findOne({ shortUrl });
    return res.redirect(`${url.longUrl}`);

  } catch (error) {
  
    return res.sendStatus(404);
  }
};

// Url shortener function
const short = async (req, res) => {
  const token = req.cookies.url_cookie;
  let { url } = req.body;

  if (!validator.isURL(url, { require_protocol: true })) {
    return res.status(200).json({ error: "Invalid Url passed" });
  }

  const urlParts = url.split("://");

  const urlbody = urlParts[1];

  const urlb = urlbody.split(".");

  let urlBody = "";

  for (i = 0; i < urlb.length; i++) {
    urlBody += urlb[i];
  }

  let shortUrl = "";

  for (i = 0; i < 2; i++) {
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

// Delete Functions
const delete_url = async (req, res) => {
  const shortUrl = req.body.url;

  const url = await Url.findOne({ shortUrl });

  if (!url) {
    return res.status(400).json({ error: "Url does not exist" });
  }

  try {
    const ress = await Url.findByIdAndDelete(url._id)
    const user = await User.findById(ress.user);

    if (!ress._id in user.urls) {
      return res.json({ nott: "no user here" });
    }
    user.urls.splice(user.urls.indexOf(ress._id), 1);
    user.save();
    return res.json({ message: "Url deleted successfully!!" });
  } catch (err) {
    return res.json({ error: "Url deletion failed!" });
  }
};

const delete_urls = (req, res) => {};

const delete_user = (req, res) => {
  res.render("delete-user");
};

const delete_user_post = async (req, res) => {
  const token = req.cookies.url_cookie;

  if (!token) {
    return res.redirect("/user/login");
  }

  jwt.verify(token, process.env.SECRET_MESSAGE, async (err, decodedToken) => {
    if (err) {
      return res.redirect("/user/login");
    }

    try {
      await User.findByIdAndDelete(decodedToken.id);
      return res.json({ message: "User deleted successfully!!" });
    } catch (err) {
      return res.json({ error: "User deletion failed!" });
    }
  });
};

module.exports = {
  home,
  shortLink,
  short,
  delete_urls,
  delete_url,
  delete_user,
  delete_user_post,
};
