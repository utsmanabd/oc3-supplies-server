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
  getNewAccessToken,
  generateRefreshToken,
  loginAPI
}
