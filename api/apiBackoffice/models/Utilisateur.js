
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    created_at: { type: Date, required: true}, 
});

module.exports = mongoose.model("Utilisateur", schema);