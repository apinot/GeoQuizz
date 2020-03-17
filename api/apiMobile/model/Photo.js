
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    desc: { type: String, required: true },
    position : {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    url: { type: String, required: true },
});

module.exports = mongoose.model("Photo", schema);
