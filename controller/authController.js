const userModel = require("../models/user-model.js")
const bcrypt = require("bcrypt")
//const jwt = require('jsonwebtoken')
const { generateToken } = require("../utils/generateToken.js")

module.exports.registerUser = async function (req, res) {
    try {
        let { email, password, fullname } = req.body;

        let user = await userModel.findOne({ email: email });
        if (user) return res.redirect("/register?error=User%20already%20exists");

        const adminEmails = (process.env.ADMIN_EMAILS || "")
            .split(",")
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean)
        const isAdmin = adminEmails.includes(email.toLowerCase())

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                if (err) return res.redirect("/register?error=Could%20not%20create%20account");
                else {

                    let user = await userModel.create({
                        email,
                        password: hash,
                        fullname,
                        isAdmin,
                    });
                    let token = generateToken(user)
                    res.cookie("token", token);
                    res.redirect("/dashboard")
                }

            })
        })

    } catch (error) {
        console.log(error.message)
        res.redirect("/register?error=Could%20not%20create%20account")
    }
}

module.exports.loginUser = async function (req, res) {
    try {
        let { email, password } = req.body;
        let user = await userModel.findOne({ email: email })
        if (!user) return res.redirect("/login?error=Email%20or%20password%20is%20incorrect");

        bcrypt.compare(password, user.password, function (err, result) {
            if (result) {
                let token = generateToken(user)
                res.cookie("token", token);
                res.redirect("/dashboard")
            } else {
                res.redirect("/login?error=Email%20or%20password%20is%20incorrect")
            }
        })
    } catch (error) {
        console.log(error);
        res.redirect("/login?error=An%20error%20occurred%20while%20logging%20in")
    }
};

module.exports.logoutUser = function (req, res) {
    res.clearCookie("token");
    res.redirect("/login?success=You%20have%20been%20logged%20out");
}


