const express = require('express');
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

app.listen(8082, () => {
    console.log('api player is running !');
});
