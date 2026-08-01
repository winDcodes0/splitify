const mongoose = require('mongoose');

// all user splits by amount
const splitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    }
},{_id: false}); // Disable _id for subdocument

const expenseSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    description: {
        type: String,

    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    splitType: {
        type: String,
        enum: ['equal', 'exact', 'percentage'],
        default: 'equal'
    },
    participants: {
        type: [splitSchema],
        required: true,
        validate: {
            validator: (arr) => arr.length > 0,
            message: 'Atleast one split is required'
        }
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);