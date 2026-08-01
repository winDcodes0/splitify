const express = require('express');
const {protect} = require("../middleware/authMiddleware")
const {createGroup, getMyGroups, getGroupById, addMember} = require('../controller/groupController')
const Router = express.Router();
Router.use(protect);


Router.post('/',createGroup);
Router.get('/',getMyGroups);
Router.post('/:id',getGroupById);
Router.post('/:id/members',addMember);

module.exports = Router;