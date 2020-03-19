
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    position : {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    url: { type: String, required: true },
    desc: { type: String, required: false },
});

module.exports = mongoose.model("Photo", schema);
