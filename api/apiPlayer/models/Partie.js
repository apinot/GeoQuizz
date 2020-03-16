
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    token: { type: String, required: true },
    serie: { type: String, required: false },
    end: { type: Boolean, required: true },
    score: { type: Number, required: true },
    username: { type: String, required: true },
    created_at: { type: Date, required: true}, 
    photos: [{type: String, required: true}],
});

module.exports = mongoose.model("Partie", schema);