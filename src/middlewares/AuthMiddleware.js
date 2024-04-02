const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;


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


module.exports = {
    verifyToken
}