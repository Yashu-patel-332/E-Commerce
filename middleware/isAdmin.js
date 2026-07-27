module.exports = function (req, res, next) {
    if (!req.user || !req.user.isAdmin) {
        return res.redirect("/dashboard?error=Admin%20access%20required")
    }

    next()
}
