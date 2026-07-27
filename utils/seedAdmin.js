const bcrypt = require("bcrypt")
const userModel = require("../models/user-model.js")

module.exports = async function seedAdmin() {
    const email = (process.env.ADMIN_EMAIL || "admin@cartora.com").trim().toLowerCase()
    const password = process.env.ADMIN_PASSWORD || "Admin@123"
    const fullname = process.env.ADMIN_NAME || "Cartora Admin"

    const hash = await bcrypt.hash(password, 10)

    await userModel.updateMany({ email: { $ne: email } }, { $set: { isAdmin: false } })

    await userModel.findOneAndUpdate(
        { email },
        {
            $set: {
                fullname,
                email,
                password: hash,
                isAdmin: true,
            },
            $setOnInsert: {
                cart: [],
                orders: [],
            },
        },
        { upsert: true, returnDocument: "after" }
    )
}
