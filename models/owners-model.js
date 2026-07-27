const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
    fullname: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        unique: true
    },
    password: String,
    products: {
        type: Array,
        default: []
    },
    picture: String,
    gstin: String,
})

module.exports = mongoose.model('owner', ownerSchema);