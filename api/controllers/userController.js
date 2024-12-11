const User = require("../models/userModels");
const Listing = require("../models/listingModels");
const { errorHandler } = require("../utils/error")
const bcrypt = require("bcrypt");
module.exports.updateUserInfo = async (req, res, next) => {
    if (req.user.id !== req.params.id) {
        return next(errorHandler(401, "You can only update your own account"));
    }
    try {
        if (req.body.password) {
            req.body.password = bcrypt.hashSync(req.body.password, 10);
        }
        const updateUserInfo = await User.findByIdAndUpdate(req.params.id, {
            $set: {
                userName: req.body.userName,
                email: req.body.email,
                password: req.body.password,
                avatar: req.body.avatar,
            },
        }, { new: true });
        const { password, ...rest } = updateUserInfo._doc;
        res.status(200).json(rest);
    } catch (err) {
        next(err);
    }
}
module.exports.deleteUser = async (req, res, next) => {
    if (req.user.id !== req.params.id) {
        return next(errorHandler(401, "You can only update your own account"));
    }
    try {
        await User.findByIdAndDelete(req.params.id);
        res.clearCookie("access_token");
        res.status(200).json('User has been deleted')
    } catch (error) {
        next(error);
    }
}
module.exports.getUserListing = async (req, res, next) => {
    if (req.user.id === req.params.id) {
        try {
            const listing = await Listing.find({ userRef: req.params.id })
            res.status(200).json(listing);
        } catch (error) {
            next(error);
        }
    } else {
        return next(errorHandler(401, 'You can only view your own listing'));
    }
}
module.exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }
        const { password: pass, ...rest } = user._doc;
        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
}