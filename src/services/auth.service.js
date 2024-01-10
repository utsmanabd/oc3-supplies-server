const jwt = require("jsonwebtoken");
const axios = require('axios')
const https = require('https')
const SECRET_KEY = process.env.SECRET_KEY;

const loginAPI = async (username, password) => {
  let res = await axios.post(process.env.AUTH_URL, {username, password}, {httpsAgent: new https.Agent({ rejectUnauthorized: false })})
  if (res.status) {
    return res.data
  } else {
    return false
  }
}

const generateToken = (userData) => {
  return jwt.sign(userData, SECRET_KEY, { expiresIn: '24h' });
};

const generateRefreshToken = (userData) => {
  return jwt.sign(userData, SECRET_KEY)
}

const verifyToken = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  if (!token.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  token = token.slice(7)

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
        console.log(err)
      return res.status(403).json({ error: "Failed to authenticate token" });
    }

    req.user = decoded;
    next()
  });
};

const getNewAccessToken = (token, res) => {
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid refresh token." });
    }

    if (decoded.data === undefined) {
      return res
        .status(401)
        .json({ error: true, message: "Payload not found." });
    }

    const newAccessToken = generateToken(decoded.data);
    res.json({ error: false, accessToken: newAccessToken, payload: decoded });
  });
}

module.exports = {
  generateToken,
  verifyToken,
  getNewAccessToken,
  generateRefreshToken,
  loginAPI
}
