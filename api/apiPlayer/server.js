const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// create app
const app = express();


// connexion à la base de donnée mongo
mongoose.connect("mongodb://databaseGeoQuizz/Geoquizz", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.get('/', (req, res) => {
    res.json({app: 'GeoQuizz'});
});

/**
 * données :
 * - pseudo
 * - série
 * - niveau (éventuel)
 * 
 * @return 
 * id de la partie
 * token de la partie
 */
app.post("/start", (req, res) => {
    //TODO filtrer les données
    let param = req.query.params;
});


app.listen(8082, () => {
    console.log('api player is running !');
});
