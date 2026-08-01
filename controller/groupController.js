const Group = require('../models/group');
const User = require('../models/user');

//createGroup
// POST: /api/groups
async function createGroup(req,res){
    try{

        const{name, description,memberEmails}=req.body;

        if(!name){
            return res.status(403).json({message:'Group Name Required'});
        }

        let memberIds=[];
        if(Array.isArray(memberEmails)&&memberEmails.length>0){
            const user=await User.find({email:{ $in :memberEmails.map((e)=>e.toLowerCase())}})
            memberIds=user.map((u)=>u._id);
        }

        const members=Array.from(new Set([req.user._id.toString(),...memberIds.map(String)]))

        const group=await Group.create({
            name,
            description,
            createdby:req.user._id,
            members

        })

        const populated= await group.populate('members','name email')
        res.status(201).json({group:populated})

    }
    catch(err){
        res.status(400).json({message:'Unable to Create Group'})
        console(err);
    }
    
}

//getMyGroups
// GET: /api/groups
async function getMyGroups(req, res) {
    try{
        const group = await Group.find({
            members: req.user._id
        })
        .populate('members','name email')
        .sort({createdby: -1})

        res.json({group})
    }
    catch(err){
        res.status(400).json({
            message: 'Ubanle to Get Group'
        })
    }
}

//getGroupByID
// PUT: /api/groups/:id
async function getGroupById(req,res){
    try{
        const group = await Group.findById(req.params.id)
        .populate('members','name email')

        if(!group) return res.status(403).json({
            message: "group not found"
        })

        const isMatch = group.members.some((m)=> m._id.toString() === req.user._id.toString());

        if(!isMatch) return res.status(404).json({
            message: "you are not the member of this group"
        })

        res.json({group})
    }
    catch(err){
        res.status(400).json({
            message: "Unable to Get Group By Id"
        })
    }
}

//addMember
// PUT: /api/groups/:id/members
async function addMember(req,res) {
    try{
        const {email} = req.body;

        const group = await Group.findById(req.params.id)
        if(!group){
            return res.status(404).json({
                message: "Group not found"
            })
        }

        const user = await User.findOne({email: email.toLowerCase()})
        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }

        if(group.members.some((m)=> m.toString() === user._id.toString())){
            return res.status(403).json({
                message: "you are Already the member of this group"
            })
        }

        group.members.push(user._id);
        await group.save();

        const populated = await group.populate("members","name email");

        return res.status(201).json({group: populated})
    }
    catch(err){
        res.status(400).json({
            message: "Unable to Add Member in group"
        })
    }
}

module.exports = {
    createGroup,
    getMyGroups,
    getGroupById,
    addMember,
};