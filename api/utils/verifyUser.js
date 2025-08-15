const { errorHandler } = require("./error");
const jwt = require("jsonwebtoken");

module.exports.verifyToken = (req, res, next) => {

    const token = req.cookies.access_token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return next(errorHandler(401, "Unauthorized: Token not provided"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(errorHandler(403, "Forbidden: Invalid token"));
        }
        req.user = user;
        next();
    });
};
