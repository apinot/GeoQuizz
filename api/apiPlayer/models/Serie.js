
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    ville: { type: String, required: true },
    nom: { type: String, required: true },
    descr: { type: String, required: true },
    dist: { type: Number, required: true },
    map: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        zoom: { type: Number, required: true },
    },
    photos: [{ type: String }],
    user: { type: String, required: true },
});

module.exports = mongoose.model("Serie", schema);