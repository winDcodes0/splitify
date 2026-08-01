const express = require('express');
const {protect} = require("../middleware/authMiddleware")
const {createExpense, getGroupExpense, getGroupBalances, deleteExpense} = require('../controller/expenseController')
const Router = express.Router();
Router.use(protect);


Router.post('/',createExpense);
Router.post('/group/:groupId',getGroupExpense)
// Router.get('/group/:groupId/balances',getGroupBalance);
Router.delete('/:id', deleteExpense);

module.exports = Router;