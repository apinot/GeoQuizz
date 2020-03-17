const express = require('express');
// create app
const app = express();
const express = require('express');

// connexion à la base de donnée mongo
mongoose.connect("mongodb://databaseGeoQuizz/Geoquizz", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});
app.listen(8081, () => {
    console.log('api mobile is running !');
});
