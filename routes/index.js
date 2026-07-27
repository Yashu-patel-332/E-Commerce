const express = require('express')
const router = express.Router()
const isloggedin = require("../middleware/isLoggedin.js")
const productModel = require("../models/product-model.js")
const userModel = require("../models/user-model.js")

const featuredProducts = [
    {
        _id: "sample-1",
        name: "Urban Commuter Pack",
        price: 2499,
        discount: 15,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
        bgcolor: "#f3efe7",
        panecolor: "#184f43",
        textcolor: "#ffffff",
        isSample: true,
    },
    {
        _id: "sample-2",
        name: "Studio Wireless Headphones",
        price: 3999,
        discount: 10,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
        bgcolor: "#e9f0f7",
        panecolor: "#243b53",
        textcolor: "#ffffff",
        isSample: true,
    },
    {
        _id: "sample-3",
        name: "Minimal Desk Lamp",
        price: 1799,
        discount: 20,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
        bgcolor: "#f6eadf",
        panecolor: "#8b3f2f",
        textcolor: "#ffffff",
        isSample: true,
    },
]

router.get('/', (req, res) => {
    res.render('index', {
        error: req.query.error,
        success: req.query.success,
    })
})

router.get('/login', (req, res) => {
    res.render('login', {
        error: req.query.error,
        success: req.query.success,
    })
})

router.get('/register', (req, res) => {
    res.render('register', {
        error: req.query.error,
        success: req.query.success,
    })
})

router.get('/shop', isloggedin, async (req, res) => {
    const products = await productModel.find().sort({ _id: -1 })
    res.render('shop', {
        user: req.user,
        products: products.length ? products : featuredProducts,
    })
})

router.get('/dashboard', isloggedin, async (req, res) => {
    const products = await productModel.find().sort({ _id: -1 })

    if (req.user.isAdmin) {
        const users = await userModel.find().select("-password").sort({ _id: -1 })
        return res.render('admin-dashboard', {
            user: req.user,
            products,
            users,
            error: req.query.error,
            success: req.query.success,
        })
    }

    res.render('user-dashboard', {
        user: req.user,
        products: products.slice(0, 4),
        cartCount: (req.user.cart || []).length,
        orderCount: (req.user.orders || []).length,
        error: req.query.error,
        success: req.query.success,
    })
})

router.get('/cart', isloggedin, async (req, res) => {
    const cartIds = req.user.cart || []
    const products = await productModel.find({ _id: { $in: cartIds } })
    const total = products.reduce((sum, product) => {
        const discount = product.discount || 0
        return sum + Math.max(product.price - discount, 0)
    }, 0)

    res.render('cart', {
        user: req.user,
        products,
        total,
    })
})

router.get('/checkout', isloggedin, async (req, res) => {
    const cartIds = req.user.cart || []
    const products = await productModel.find({ _id: { $in: cartIds } })
    const subtotal = products.reduce((sum, product) => {
        const discount = product.discount || 0
        return sum + Math.max(product.price - discount, 0)
    }, 0)
    const delivery = subtotal > 499 ? 0 : 49
    const total = subtotal + delivery

    res.render('checkout', { user: req.user, products, subtotal, delivery, total, error: req.query.error })
})

router.post('/checkout/place-order', isloggedin, async (req, res) => {
    const cartIds = req.user.cart || []
    if (!cartIds.length) {
        return res.redirect("/cart")
    }

    const products = await productModel.find({ _id: { $in: cartIds } })
    const subtotal = products.reduce((sum, product) => {
        const discount = product.discount || 0
        return sum + Math.max(product.price - discount, 0)
    }, 0)
    const delivery = subtotal > 499 ? 0 : 49
    const total = subtotal + delivery

    const order = {
        items: products.map((product) => ({
            product: product._id,
            name: product.name,
            price: product.price,
            discount: product.discount || 0,
        })),
        shipping: {
            fullname: req.body.fullname,
            phone: req.body.phone,
            address: req.body.address,
            city: req.body.city,
            pincode: req.body.pincode,
        },
        paymentMethod: req.body.paymentMethod,
        subtotal,
        delivery,
        total,
        status: "Placed",
        createdAt: new Date(),
    }

    await userModel.findByIdAndUpdate(req.user._id, {
        $push: { orders: order },
        $set: { cart: [] },
    })

    res.redirect("/order-success")
})

router.get('/order-success', isloggedin, (req, res) => {
    res.render('order-success', { user: req.user })
})

module.exports = router
