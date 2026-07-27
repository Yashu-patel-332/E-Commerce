const express = require('express')
const app = express()
const path = require('path')
const connectDB = require("./config/mongoose-connection.js")
const cookieParser = require('cookie-parser')
const ownersRouter = require('./routes/ownersRouter.js')
const productsRouter = require('./routes/productRouter.js')
const usersRouter = require('./routes/usersRouter.js')
const indexRouter = require('./routes/index.js');


require("dotenv").config()

const db = require("./config/mongoose-connection.js")
const seedAdmin = require("./utils/seedAdmin.js")

seedAdmin().catch((error) => {
    console.log("Admin seed failed:", error.message)
})

app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

const port = process.env.PORT || 3000



app.use("/", indexRouter)
app.use("/owners", ownersRouter)
app.use("/products", productsRouter)
app.use("/users", usersRouter)

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`)
    connectDB();
})
