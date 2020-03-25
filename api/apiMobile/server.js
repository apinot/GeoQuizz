const express = require('express');
const cors = require('cors');
const parser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//create app
const app = express();
app.use(cors());
app.use(parser.json());


/*Models*/
const Utilisateur = require('./model/Utilisateur');
const Serie = require('./model/Serie');
const Photo = require('./model/Photo');


// connexion à la base de donnée mongo
mongoose.connect("mongodb://databaseGeoQuizz/Geoquizz", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const config = require('./config/server.conf.json');


/* Middelware d'authentification */
app.use((req, res, next) => {
    if(!req.headers.authorization) {
        next();
        return;
    }
    const [typeAuth, token] = req.headers.authorization.split(' ');
    if(!typeAuth || typeAuth !== 'bearer' || !token) {
        next();
        return;
    }
    jwt.verify(token, config.jwtSecret, (err, decoded) => {

        if (err) {
            throw err;
        }

        if (!decoded && !decoded.user) {
            next();
            return;
        }

        Utilisateur.findById(decoded.user)
            .then((user) => {
                if (!user) {
                    next();
                    return;
                }
                req.authUser = user;
                next();
            })
            .catch((error) => {
                throw error
            })
    });
});

app.post('/utilisateurs/auth', (req, res) => {
    console.log('zinzin')
    setTimeout(() => {
        if(!req.headers.authorization) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }

        const credentialsBase64 = req.headers.authorization.split(' ')[1];
        if(!credentialsBase64) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }
        const [email, password] = Buffer.from(credentialsBase64, 'base64').toString('utf-8').split(':');
        if(!email || !password) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }

        Utilisateur.find({email}, (err, users) => {
            if(err) throw err;

            if(users.length !== 1) {
                res.status(401).json({status: 401, msg: 'Unauthorized'});
                return;
            }

            const [user] = users;

            bcrypt.compare(config.passwordSecret + password, user.password)
                .then((result) => {
                    if(!result) {
                        res.status(401).json({status: 401, msg: 'Unauthorized'});
                        return;
                    }

                    const token = jwt.sign({user: user._id}, config.jwtSecret);

                    res.status(200).json({
                        user: {
                            id: user._id,
                            email: user.email,
                        },
                        token,
                    })
                })
                .catch((error) => {
                    throw error;
                });
        });
    }, 2000);
});

/*Routes*/
app.get("/", (req,res) =>{
    res.status(200).json({success: "bonjour de l'api Mobile"})
});

app.post("/photos", (req, res) =>{
    if (!req.headers.authorization) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }
    let photos = req.body.data.images;
    let id  = req.body.data.id
    console.log(req.body.data)
    //console.log(req.body.data);
    //console.log(photos);
    if(!photos) {
        res.status(400).json({ status: 400, msg: 'Bad Request' });
        return;
    }

    photos.forEach((photo)=>{
        //initialisation de la photo
        const lat = photo.location.latitude;
        const lng = photo.location.longitude;
        const url = photo.img.url;
        const idUtilisateur = id;
        const newPhoto = new Photo({
            position : {
                lat: lat,
                lng: lng
            },
            url: url,
            user: idUtilisateur,
            created_at : new Date()
        });
        console.log(newPhoto)
        //enregistrement de la photo
        newPhoto.save()
            .then((photo) => {
                res.status(200).json(photo);
            })
            .catch((err) =>{
                res.status(500).json({err})
            });
    })

})
app.put('/serie/:id', (req,res)=>{
    if (!req.headers.authorization) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }
    const {id} = req.params;
    const updateSerie = req.body;
    const idUtilisateur = req.body.user;
    console.log(req.body.user)
    console.log(req.body)
    Serie.findById(id, (err, serie) => {
        if (err) throw err;
        if (!serie) {
            res.status(404).json({status: 404, msg: 'Serie Not Found'});
            return;
        }
        // vérification du propriétaire de la série
        if (serie.user !== idUtilisateur) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }
        console.log('---------------------------------------------------------')
        serie.ville =  updateSerie.ville;
        serie.dist = updateSerie.dist;
        serie.descr = updateSerie.descr;
        serie.map.lat = updateSerie.lat;
        serie.map.lng = updateSerie.lng;
        serie.map.zoom = updateSerie.zoom;
        serie.user = updateSerie.user;
        serie.created_at = new Date();

        serie.save().then((serie) => {
            res.status(200).json(serie)
        }).catch((err)=>{
            res.status(500).json({err})
        })
    })

});

app.post('/series', (req, res) => {
    if (!req.headers.authorization) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }
    const serie = req.body;
    const newSerie = new Serie({
        ville: serie.ville,
        dist: serie.dist,
        nom: serie.nom,
        descr: serie.descr,
        map: {
            lat: serie.lat,
            lng: serie.lng,
            zoom: serie.lng
        },
        photos: serie.photos,
        user: serie.user,
        created_at: new Date()
    });
    newSerie.save().then((serie)=>{
        res.status(200).json({serie})
    }).catch((err) => {
        res.status(500).json({err})
    })
});

app.delete('/series/:id/', (req, res) => {
    const { id } = req.params;
    console.log(req.headers);
    if (!req.headers.authorization) {
        res.status(401).json({status: 401, msg: 'Unauthorized'});
        return;
    }
    const idUtilisateur = req.query.id;
    console.log(idUtilisateur)
    Serie.findById(id, (err, serie) => {
        if(err) throw err;
        if(!serie) {
            res.status(404).json({status: 404, msg: 'Serie Not Found'});
            return;
        }
        // vérification du propriétaire de la série
        if(serie.user !== idUtilisateur) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }
    });
    Serie.findByIdAndDelete(id, (err) => {
        if(err) throw err;
        res.status(200).json({response: 'deleted'});
    });
});

app.get('/series', (req, res) => {
    let {limit, offset} = req.query;

    if(!limit || !Number(limit) || limit > 25) limit = 25;
    if(!offset || !Number(offset) || offset < 0) offset = 0;

    const idUtilisateur = req.query.id;

    // Compte le nombre totals de séries
    Serie.count((err, count) => {
        if(err) throw err;
        //récupère les séries
        Serie.find({ user: idUtilisateur }).limit(Number(limit)).skip(Number(offset)).exec()
            .then((series) => {
                if(!series){
                    res.status(200).json({
                        count,
                        series: [],
                    })
                    return;
                }

                res.status(200).json({
                    count,
                    series,
                })
            })
            .catch((error) => {
                throw error;
            });
    });
});

app.put("/series/:id/photos", (req, res) => {
    setTimeout(()=>{
        if(!req.headers.authorization) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
        }},2000);

    const { id } = req.params;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        res.status(404).json({status: 404, msg: 'Serie Not Found'});
        return;
    }
    // TODO verifier la structure de l'objet photo
    let photos = req.body.data.images;
    if(!photos) {
        console.log('zinzin');
        res.status(400).json({ status: 400, msg: 'Bad Request' });
        return;
    }

    // application du middleware
    const idUtilisateur = req.body.data.id;

    Serie.findById(id, (err, serie) => {
        console.log('1');
        if(err) throw err;
        if(!serie) {
            res.status(404).json({status: 404, msg: 'Serie Not Found'});
            return;
        }
        if(serie.user !== idUtilisateur) {
            res.status(401).json({status: 401, msg: 'Unauthorized'});
            return;
        }
        console.log('2');

        let tab = [];
        async function savePhoto() { 
            for (const photo of photos) {
                // initialisation de la photo
                const lat = photo.location.latitude;
                const lng = photo.location.longitude;
                const url = photo.img.url;
                const newPhoto = new Photo({
                    position : {
                        lat: lat,
                        lng: lng
                    },
                    url: url,
                    user : idUtilisateur,
                    created_at : new Date()
                });
                // sauvegarde l'id de la photo
                const phot = await newPhoto.save();
                    tab.push(phot._id);
                    console.log('regarde le tableau se remplit')
                    console.log(tab);
                    console.log(phot)
            }
            return tab;
        }
        savePhoto().then((tab2) => {
            console.log('3')
            console.log('alors il est remplit ?')
            console.log(tab2);
            serie.photos = tab2
            serie.save().then((saved) => {
                console.log('4');
                res.status(200).json({
                    serie: {
                        id: saved._id,
                        ville: saved.ville,
                        nom : saved.nom,
                        descr: saved.descr,
                        dist: saved.dist,
                        map: {
                            lat: saved.map.lat,
                            lng: saved.map.lng,
                        },
                        zoom: saved.map.zoom,
                        photos: saved.photos,
                    }
                });
            }).catch((err) =>{
                res.status(500).json({err})
            });
        })
    });
});


/* Gestion des erreurs */

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
    console.log('api mobile is running !');
});
