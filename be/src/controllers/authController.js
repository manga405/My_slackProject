const User = require("../models/user");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateTokens = require('../utils/generateTokens');
const verifyToken = require("../utils/verifyToken");
const authService = require('../services/authService')
const userService = require('../services/userService')
const channelService = require('../services/channelService')
const { STATUS, REQUEST, METHOD } = require('../constants/chat');
const { sendToUsers } = require('../utils/chat');


//signUp
exports.signUp = async (req, res) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            return res.status(200).json({ mes: "Please fill all the fields", status: "warning" });
        }
        const user = await User.findOne({ email: email })
        if (user) {
            return res.status(200).json({ mes: "Email already exists", status: "info" });
        }
        const hash = await bcrypt.hash(password, 10)
        const newUser = new User({
            email,
            username,
            password: hash,
            avatar: req.file?.filename
        });
        await newUser.save()
        res.status(200).json({
            mes: "Registered", status: "success"
        })
    } catch (error) {
        res.status(500).json({ mes: err.message, status: "error" })
    }
};

//signIn
exports.signIn = (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email: email }).then((user) => {

        if (!user) {
            return res.status(200).json({ mes: "user is not found", status: "error" });
        }
        bcrypt.compare(password, user.password, (err, result) => {

            if (!result) {
                return res.status(200).json({ mes: "password incorrect", status: "warning" });
            }
            const Token = generateTokens(user);
            return res.json({
                token: Token,
                mes: "Signed",
                status: "success"
            });
        });
    });
};

exports.check = async (req, res) => {
    const user = await verifyToken(req.query.token);
    res.json(user)
}


exports.updateStatus = async (socket, data) => {
    try {
        const updated = await authService.update(socket.user.id, data)
        const users = await userService.read()
        const channels = await channelService.readAll()
        users.forEach(user => {
            socket.socketList[String(user._id)]?.forEach(socket => socket.emit(`${REQUEST.AUTH}_${METHOD.READ}`, STATUS.ON, users));
            socket.socketList[String(user._id)]?.forEach(socket => socket.emit(`${REQUEST.CHANNEL}_${METHOD.READ}`, STATUS.ON, channels));
        })
        socket.emit(`${REQUEST.AUTH}_${METHOD.READ}`, STATUS.SUCCESS, users);
        socket.emit(`${REQUEST.CHANNEL}_${METHOD.READ}`, STATUS.ON, channels);
    } catch (err) {
        socket.emit(`${REQUEST.AUTH}_${METHOD.READ}`, STATUS.FAILED, { ...data, message: err.message });
    }
}

exports.read = async (socket, data) => {
    try {
        const users = await userService.read()
        const channels = await channelService.readAll()
        // console.log(socket.socketList);
        users.forEach(user => {

            socket.socketList[String(user._id)]?.forEach(socket => socket.emit(`${REQUEST.CHANNEL}_${METHOD.READ}`, STATUS.ON, channels));
            socket.socketList[String(user._id)]?.forEach(socket => socket.emit(`${REQUEST.AUTH}_${METHOD.READ}`, STATUS.ON, users));
        })
        socket.emit(`${REQUEST.AUTH}_${METHOD.READ}`, STATUS.ON, users);
        socket.emit(`${REQUEST.CHANNEL}_${METHOD.READ}`, STATUS.ON, channels);
    } catch (err) {
        socket.emit(`${REQUEST.AUTH}_${METHOD.READ}`, STATUS.FAILED, { ...data, message: err.message });
    }
}

