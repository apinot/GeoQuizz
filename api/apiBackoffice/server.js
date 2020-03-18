const express = require('express');
const cors = require('cors');
const parser = require('body-parser');
const mongoose = require('mongoose');

// creation de l'application
const app = express();

app.use(cors());
app.use(parser.json());

// connexion à la base de données
mongoose.connect("mongodb://databaseGeoQuizz/Geoquizz", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

/* Routes */
app.get('/', (req, res) => {
    res.json({app: 'Back-office GeoQuizz'});
});



app.listen(8080, () => {
    console.log('api backoffice is running !');
});
