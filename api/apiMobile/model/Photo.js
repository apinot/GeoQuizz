
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    position : {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    url: { type: String, required: true },
    idUtilisateur : { type: String, required: true },
    created_at: { type: Date, required: true},

});

module.exports = mongoose.model("Photo", schema);
