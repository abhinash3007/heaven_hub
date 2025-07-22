const { errorHandler } = require("./error");
const jwt = require("jsonwebtoken");

module.exports.verifyToken = (req, res, next) => {
    console.log('Cookies:', req.cookies);
    console.log('Authorization Header:', req.headers.authorization);
    console.log('Request URL:', req.url);
    console.log('Request Method:', req.method);

    const token = req.cookies.access_token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        console.log('No token found in cookies or headers');
        return next(errorHandler(401, "Unauthorized: Token not provided"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Token verification failed:', err.message);
            return next(errorHandler(403, "Forbidden: Invalid token"));
        }
        console.log('Token verified successfully for user:', user.id);
        req.user = user;
        next();
    });
};
