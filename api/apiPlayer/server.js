const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const cors = require('cors');
const parser = require('body-parser');

// create app
const app = express();

app.use(cors());
app.use(parser.json());

// connexion à la base de donnée mongo
mongoose.connect("mongodb://databaseGeoQuizz/Geoquizz", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

/* Models */ 
const Partie = require('./models/Partie');


/* Routes */
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


/* Démarrage de l'application */
app.listen(8080, () => {
    console.log('api player is running !');
});
