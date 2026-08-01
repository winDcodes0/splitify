const Group = require('../models/group')
const Expense = require('../models/expense')


function buildSplits(amount, splitType, participants){
    if (splitType === 'equal') {
        const count = participants.length;
        if (count === 0) return [];
        const share = Math.round((amount / count) * 100) / 100;
        let runningSum = 0;

        return participants.map((p, idx) => {
            let userAmount;
            if (idx === count - 1) {
                userAmount = Math.round((amount - runningSum) * 100) / 100;
            } else {
                userAmount = share;
                runningSum += share;
            }
            return {
                user: p.user,
                amount: userAmount
            };
        });
    }

    if (splitType === 'exact') {
        const total = participants.reduce((sum, p) => sum + Number(p.value || 0), 0);

        if (Math.abs(total - amount) > 0.01) {
            throw Error(`exact amount ${total} does not match total amount ${amount}`);
        }

        return participants.map((p) => ({
            user: p.user,
            amount: Number(p.value)
        }));
    }

    if (splitType === 'percentage' || splitType === 'persentage') {
        const totalPercent = participants.reduce((sum, p) => sum + Number(p.value || 0), 0);
        if (Math.abs(totalPercent - 100) > 0.01) {
            throw Error(`percentage sum ${totalPercent} does not match 100%`);
        }
        let runningSum = 0;
        const count = participants.length;

        return participants.map((p, idx) => {
            let userAmount;
            if (idx === count - 1) {
                userAmount = Math.round((amount - runningSum) * 100) / 100;
            } else {
                userAmount = Math.round((amount * (Number(p.value) / 100)) * 100) / 100;
                runningSum += userAmount;
            }
            return {
                user: p.user,
                amount: userAmount
            };
        });
    }

    throw Error('Invalid split type');
}

async function createExpense(req,res){
    try{
        //step 1: extract data from frontend part by req.body
        const {groupId, description, amount, paidBy, splitType, participants} = req.body

        //step 2: validate in data comes from user by req.body
        if(!groupId || !description || !amount || !paidBy || !participants?.length){
            return res.status(400).json({
                message: 'All fields are required!'
            })
        }

        //step 3: finding group by id
        const group = await Group.findById(groupId)
        .populate('members','name email')
        
        if(!group) return res.status(403).json({
            message: "group not found"
        })
        
        const isMatch = group.members.some((m)=> m._id.toString() === req.user._id.toString());
        
        if(!isMatch) return res.status(404).json({
            message: "you are not the member of this group"
        })

        //step 4: 
        const splits = buildSplits(Number(amount), splitType || 'equal', participants);

        const expense = await Expense.create({
            group: groupId,
            description,
            amount: Number(amount),
            paidBy,
            splitType,
            participants: splits
        })

        //step 5:
        const populated = await expense.populate([
            {path:'paidBy', select:'name email'},
            {path:'participants.user', select:'name email'},
        ])
        res.status(201).json({expense:populated})

    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            message: err.message || 'expense not created'
        })
    }
}

// api/expense/:groupId
async function getGroupExpense(req,res){
    try{
        const expense = await Expense.find({ group: req.params.groupId })
        .populate('paidBy','name email')
        .populate('participants.user','name email')
        .sort({createdAt: -1})

        res.json({expense})
    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            message: 'expense not fetched'
        })
    }
}

// api/expense/group/:groupId/balances
async function getGroupBalances(req,res){
    res.json({ balances: [] });
}

async function deleteExpense(req, res) {
    try{
        const expense = await Expense.findByIdAndDelete(req.params.id);

        if(!expense){
            return res.status(403).json({
                message: "expense doesn't exist"
            })
        }

        return res.status(200).json({
            message: 'expense deleted'
        })
    }
    catch(err){
        return res.status(500).json({
            message: 'Unable to delete expense'
        })
    }
}

module.exports = {createExpense, getGroupBalances, getGroupExpense, deleteExpense}