const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    image: String,
    name: String,
    price: Number,
    bgcolor: String,
    discount: {
        type: Number,
        default: 0
    },
    panecolor: String,
    textcolor: String,
})

module.exports = mongoose.model('product', productSchema);