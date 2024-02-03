let mongoose = require('mongoose');

let medicineSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    expiry_date: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Medicine',medicineSchema);