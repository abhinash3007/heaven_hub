const User = require("../models/userModels");
const bcrypt = require("bcrypt");
const { errorHandler } = require("../utils/error");
const jwt = require('jsonwebtoken');

module.exports.signup = async (req, res, next) => {
    const { userName, email, password } = req.body;
    if (!userName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, message: "Email already in use" });
  }
    try {
        const hashPassword = bcrypt.hashSync(password, 10);
        const newUser = new User({ userName, email, password: hashPassword });
        await newUser.save();
        res.status(200).json({ success: true, message: "User created successfully!" });
    } catch (error) {
        next(error);
    }
};

module.exports.signin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const validate = await User.findOne({ email });
        if (!validate) {
            return next(errorHandler(404, "User not found!"));
        }
        
        const comparePass = bcrypt.compareSync(password, validate.password);
        if (!comparePass) {
            return next(errorHandler(401, "Incorrect email or password!"));
        }

        const token = jwt.sign({ id: validate._id }, process.env.JWT_SECRET);
        const { password: pass, ...rest } = validate._doc;
        res.cookie("access_token", token, { 
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000 
        })
            .status(200)
            .json({ success: true, token, ...rest });
    } catch (error) {
        next(error);
    }
};

module.exports.google = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            const { password: pass, ...rest } = user._doc;
            res.cookie("access_token", token, { 
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 24 * 60 * 60 * 1000 
            })
                .status(200)
                .json({ success: true, ...rest });
        } else {
            const generatePassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashPassword = bcrypt.hashSync(generatePassword, 10);
            const newUser = new User({
                userName: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4),
                email: req.body.email,
                password: hashPassword,
                avatar: req.body.photo
            });
            await newUser.save();
            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
            const { password: pass, ...rest } = newUser._doc;
            return res.cookie("access_token", token, { 
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 24 * 60 * 60 * 1000 
            })
                .status(200)
                .json({ success: true, ...rest });
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};

module.exports.signOut = (req, res, next) => {
    try {
        res.clearCookie('access_token', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });
        res.status(200).json({ success: true, message: 'User has been logged out' });
    } catch (error) {
        next(error);
    }
};
