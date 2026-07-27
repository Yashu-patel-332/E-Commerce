const express = require('express')
const router = express.Router()
const productModel = require("../models/product-model.js")
const userModel = require("../models/user-model.js")
const isloggedin = require("../middleware/isLoggedin.js")
const isAdmin = require("../middleware/isAdmin.js")

router.get("/", function (req, res) {
    res.redirect("/shop")
})

router.get("/create", isloggedin, isAdmin, function (req, res) {
    res.render("create-product", { user: req.user, product: null, error: req.query.error })
})

router.post("/create", isloggedin, isAdmin, async function (req, res) {
    try {
        const { name, price, discount, image, bgcolor, panecolor, textcolor } = req.body
        await productModel.create({
            name,
            price,
            discount,
            image,
            bgcolor,
            panecolor,
            textcolor,
        })
        res.redirect("/dashboard?success=Product%20created")
    } catch (error) {
        console.log(error.message)
        res.redirect("/products/create?error=Could%20not%20create%20product")
    }
})

router.get("/:id/edit", isloggedin, isAdmin, async function (req, res) {
    const product = await productModel.findById(req.params.id)
    if (!product) return res.redirect("/dashboard?error=Product%20not%20found")

    res.render("create-product", { user: req.user, product, error: req.query.error })
})

router.post("/:id/update", isloggedin, isAdmin, async function (req, res) {
    try {
        const { name, price, discount, image, bgcolor, panecolor, textcolor } = req.body
        await productModel.findByIdAndUpdate(req.params.id, {
            name,
            price,
            discount,
            image,
            bgcolor,
            panecolor,
            textcolor,
        })
        res.redirect("/dashboard?success=Product%20updated")
    } catch (error) {
        console.log(error.message)
        res.redirect(`/products/${req.params.id}/edit?error=Could%20not%20update%20product`)
    }
})

router.post("/:id/delete", isloggedin, isAdmin, async function (req, res) {
    await productModel.findByIdAndDelete(req.params.id)
    await userModel.updateMany({}, { $pull: { cart: req.params.id } })
    res.redirect("/dashboard?success=Product%20deleted")
})

router.post("/:id/cart", isloggedin, async function (req, res) {
    await userModel.findByIdAndUpdate(req.user._id, {
        $push: { cart: req.params.id },
    })
    res.redirect("/cart")
})

module.exports = router;
