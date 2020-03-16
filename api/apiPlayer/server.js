const express = require('express');
const jwt = require('jsonwebtoken');

// create app
const app = express();

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
