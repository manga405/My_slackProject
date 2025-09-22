const jwt = require('jsonwebtoken')
require('dotenv').config()

const verifyToken = async (token) => {
 
  const decoded = await jwt.verify(token, process.env.SECRET);
  return decoded;
};

module.exports = verifyToken;