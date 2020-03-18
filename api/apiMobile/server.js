const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const parser = require('body-parser');

//create app
const app = express();

app.use(cors());
app.use(parser.json());

// connexion à la base de donnée mongo
mongoose.connect("mongodb://databaseGeoQuizz/Geoquizz", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

/*Models*/
const Photo = require('./model/Photo.js');

/*Routes*/
app.get("/", (req,res) =>{
    res.status(200).json({success: "bonjour de l'api Mobile"})
});

app.post("/photos", (req, res) =>{

    let photos = req.body.data[0];
    //console.log(req.body.data);
    //console.log(photos);
    if(!photos) {
        res.status(400).json({ status: 400, msg: 'Bad Request' });
        return;
    }

    //initialisation de la photo
    const lat = photos.location.latitude;
    const lng = photos.location.longitude;
    const url = photos.img.url;
    const newPhoto = new Photo({
        position : {
            lat: lat,
            lng: lng
        },
        url: url,
        create_at : new Date()
    });

    //enregistrement de la photo
    newPhoto.save()
        .then((photo) => {
            res.status(200).json({photo})
        })
        .catch((err) =>{
            res.status(500).json({err})
        });
});

app.listen(8080, () => {
    console.log('api mobile is running !');
});
