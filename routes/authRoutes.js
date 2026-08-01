const express = require('express');
const {register, login, getProfile} = require("../controller/authController")
const {protect}=require('../middleware/authMiddleware')
const Router = express.Router();

Router.post("/register", register);
Router.post("/login", login);
Router.get("/me", protect, getProfile);

module.exports = Router;