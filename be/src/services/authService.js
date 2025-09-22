const jwt = require('jsonwebtoken')
const { model } = require('mongoose')
const User = model('users')

exports.loginByToken = (token) => {
    return jwt.decode(token, { secret: process.env.SECRET });
}

exports.update = async (userId, updateAuthData) => {
    const updated =  await User.updateOne({ _id: userId }, updateAuthData)
    const user = await User.findById(userId);
    return updated
}