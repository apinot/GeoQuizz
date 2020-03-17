
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    ville: { type: String, required: true },
    dist: { type: Number, required: true },
    map: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        zoom: { type: Number, required: true },
    }
    photos: [{type: String}],
});

module.exports = mongoose.model("Serie", schema);