const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const cors = require('cors');
const parser = require('body-parser');

// create app
const app = express();

/* Models */ 
const Partie = require('./models/Partie');

app.use(parser.json());
app.use(cors());

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
 * - username
 * 
 * @return 
 * id de la partie
 * token de la partie
 */
app.post("/parties", (req, res) => {
    let { username } = req.body;
    if(!username) {
        res.status(400).json({ status: 400, msg: 'Bad Request' });
        return;
    }
    
    const token = crypto.randomBytes(48).toString('hex');

    const nouvellePartie = new Partie({
        token,
        serie: null,
        end: false,
        score: 0,
        username,
        created_at: new Date(),
        photos: [],
    })

    nouvellePartie.save()
        .then((partie) => {
            res.status(201).json({
                partie: partie._id,
                token: token,
            })
        });
});

// Lorsque l'url ne corrspond à aucune route
app.all('*', (req, res) => {
    res.status(400).json({
        status: 400,
        msg: 'Bad request',
    });
});

// Lorsqu'une erreur 500 est renvoyée
app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).json({
        status: 500,
        msg: 'Internal Server Error',
    });
});

app.listen(8080, () => {
    console.log('api player is running !');
});
