
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    token: { type: String, required: true },
    serie: { type: String, required: true },
    end: { type: Boolean, required: true },
    score: { type: Number, required: true },
    player_name: { type: String, required: true },
});

module.exports = mongoose.model("Partie", schema);