const user = require("../models/user");
const generateToken = require("../utility/generateToken");


// Register a new user
async function register(req, res) {
    try {
        const { name, email, password } = req.body // Take the input

        if(!name || !email || !password){          // Validated
            return res.status(401).json({
                message: "All Field are required"
            })
        }

        // const normalizedEmail = email.toLowerCase();

        const existing = await user.findOne({email: email.toLowerCase()});

        if(existing){
            return res.status(409).json({
                message: "Allready Exists"
            })
        }

        const newUser = await user.create({
            name,
            email,
            password
        });
        const token = generateToken(newUser.id);
        res.status(201).json({
        user: newUser,
        token
        });
    }
    catch (error) {
        res.status(500).json({
            message: "something went wrong",
            error: error.message
        });
    }
}


// Login a user
async function login(req, res) {
    try {
        const { email, password } = req.body

        if(!email || !password){          // Validated
            return res.status(401).json({
                message: "All Field are required"
            })
        }

        const existing = await user.findOne({email: email.toLowerCase()}).select("+password");

        if(!existing){
            return res.status(401).json({
                message: "Invalid credentials"
            })
        }   

        const isPasswordCorrect = await existing.comparePassword(password);

        if(!isPasswordCorrect){
            return res.status(401).json({
                message: "Invalid credentials"
            })
        }

        const token = generateToken(existing.id);
        res.status(200).json({
            user: existing,
            token
        });
    }
    catch (error) {
        res.status(500).json({
            message: "something went wrong",
            error: error.message
        });
    }
}

async function getProfile(req, res) {
    return res.json({
        user: req.user
    });
}

module.exports = { register, login, getProfile };