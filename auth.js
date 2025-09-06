const jwt = require("jsonwebtoken");
require('dotenv').config();

// [CREATE ACCESS TOKEN]
module.exports.createAccessToken = (user) => {
    const data = {
        id: user._id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        suffix: user.suffix,
        username: user.username,
        role: user.role,
        status: user.status
    };

    return jwt.sign(data, process.env.JWT_SECRET_KEY, {
        expiresIn: "1d"
    });
};

// [VERIFY TOKEN]
module.exports.verify = (req, res, next) => {
    let token = req.headers.authorization;

    if (typeof token === "undefined") {
        return res.status(401).send({ auth: "Failed. No Token" });
    } else {
        token = token.slice(7); // remove "Bearer " prefix
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
            if (err) {
                return res.status(403).send({
                    auth: "Failed",
                    message: err.message
                });
            } else {
                req.user = decodedToken;
                next();
            }
        });
    }
};

// [VERIFY PRINCIPAL]
module.exports.verifyAdmin = (req, res, next) => {
    if (req.user.role === "admin") {
        next();
    } else {
        return res.status(403).send({
            auth: "Failed",
            message: "Action Forbidden: User not a principal"
        });
    }
};

// [VERIFY TEACHER]
module.exports.verifyTeacher = (req, res, next) => {
    if (req.user.role === "admin" || req.user.role === "teacher") {
        console.log("admin detected")
        next();
    } else {
        return res.status(403).send({
            auth: "Failed",
            message: "Action Forbidden: User not a teacher"
        });
    }
};

// [VERIFY CASHIER]
module.exports.verifyCashier = (req, res, next) => {
    if (req.user.role === "admin" || req.user.role === "cashier") {
        next();
    } else {
        return res.status(403).send({
            auth: "Failed",
            message: "Action Forbidden: User not a cashier"
        });
    }
};

// [ERROR HANDLER]
module.exports.errorHandler = (err, req, res, next) => {
    console.error(err);

    const statusCode = err.status || 500;
    const errorMessage = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: {
            message: errorMessage,
            errorCode: err.code || 'SERVER_ERROR',
            details: err.details || null
        }
    });
};
