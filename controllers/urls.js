const Url = require("../models/urlSchema");
const User = require("../models/authSchema");
const validator = require("validator");
const { checkForUser } = require('../middleware/authToken');

const home = async (req, res) => {
  const domain = req.protocol + '://' + req.get('host') + '/';
  const token = req.cookies.url_cookie;

  if (!token) {
    return res.render("home", { domain });
  }

    const user = await checkForUser(token);

    if (user) {
      const urls = await Url.find({ user: user._id }).sort({ _id: -1 });

      return res.render("home", { urls, domain });
    }
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
  const shortUrlLength = 4;

  if (!validator.isURL(url, { require_protocol: true })) {
    return res.status(400).json({ error: "Invalid Url passed" });
  }

  const urlParts = url.split("://");

  const urlbody = urlParts[1];

  const urlb = urlbody.split(".");

  let UrlBody = "";

  for (i = 0; i < urlb.length; i++) {
    UrlBody += urlb[i];
  }

  let urlBody = ""

  let UrLBody = UrlBody.split("/");
  
  for (i = 0; i < UrLBody.length; i++) {
    urlBody += UrLBody[i];
  }
  
  let shortUrl = "";

  for (i = 0; i < shortUrlLength; i++) {
    let u = Math.floor(Math.random() * urlBody.length);
    if (i % 2 == 0) {
      shortUrl += urlBody[u].toUpperCase();
    }
    shortUrl += urlBody[u];
  }

  if (!token) {
    const notSignedUrl = await Url.create({ longUrl: url, shortUrl })
    return res.status(201).json({
      notSigned: {
        shortUrl: notSignedUrl.shortUrl,
        longUrl: url,
      },
    });
  }

  const user = await checkForUser(token);

    if (!user) {
      return res.json({ error: 'Error, kindly logout and log back in' })
    }
    
    const savedUrl = await Url.create({ longUrl: url, shortUrl, user: user._id });
    user.urls.push(savedUrl._id);
    user.save();
    return res.json({ message: "Url Shortened Successfuly!!" });

};

// Delete Functions
const delete_url = async (req, res) => {
  const fullUrl = req.body.url;
  const splittedUrl = fullUrl.split('/')
  const shortUrl = splittedUrl.pop();

  if (!shortUrl) {
    return res.status(404).json({ error: "Url does not exist" });
  }

  try {
    const url = await Url.find({ shortUrl });

    const ress = await Url.findByIdAndDelete(url._id)
    const user = await User.findById(url.user);

    if (!ress._id in user.urls) {
      return res.json({ nott: "no url here" });
    }

    user.urls.splice(user.urls.indexOf(ress._id), 1);
    user.save();
    return res.json({ message: "Url deleted successfully!!" });

  } catch (err) {

    return res.json({ error: "Url deletion failed!" });
  }
};

const delete_urls = async (req, res) => {
  const token = req.cookies.url_cookie;

  try {

    const user = await checkForUser(token);
    await Url.deleteMany({ user: user._id })
    return res.status(200).json({ message: `All urls for ${user.username} has been deleted successfully` });

  } catch (error) {

    return res.status(500).json({ error })

  }
  
};

const delete_user = (req, res) => {
  res.render("delete-user");
};

const delete_user_post = async (req, res) => {
  const token = req.cookies.url_cookie;

  if (!token) {
    return res.redirect("/user/login");
  }

  try {
    const user = await checkForUser(token);

    await User.findByIdAndDelete(user._id);
    return res.json({ message: "User deleted successfully!!" });

  } catch (err) {
    
    return res.json({ error: "User deletion failed!, Try again" });
  }
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
