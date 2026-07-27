const jwt = require("jsonwebtoken")
const userModel = require("../models/user-model.js")

module.exports = async function (req, res, next) {
    if (!req.cookies.token) {
        return res.redirect("/login?error=Please%20login%20first");
    }
    try {
        let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
        let user = await userModel
            .findOne({ email: decoded.email })
            .select("-password")
        req.user = user;
        next();
    } catch (error) {
        return res.redirect("/login?error=Please%20login%20first");
    }

}
