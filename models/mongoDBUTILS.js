//
//Datenbank aufsetzen
//erst Mongo DB rein
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const assert = require('assert');
// const url = 'mongodb://localhost:27017';
const url = process.env.MONGODB_URI  ||'mongodb://localhost:27017';
const dbName = 'Dietenbach';

const client = new MongoClient(url);


// //verbinden von Datenbank
// exportiert Funktion "connectIT" 
// für Verbindung zu mongodb
module.exports = {

    connectIT: function () {
        client.connect(function (err) {
            assert.equal(null, err);
            console.log("Connected successfully to server");

            const db = client.db(dbName);

            client.close();
        });

    },


    // Mongoose Online mit MongoDB Atlas TI Verbindung
    mongooseOnlineVerbindung: function () {
        let mongoDB = process.env.MONGODB_URI;
        mongoose.connect(mongoDB, {
            useNewUrlParser: true
        });
        console.log("mongoose verbunden");
        //Default Verbindung
        let db = mongoose.connection;
        //Error an Connection Event binden für Fehlermeldung bei Connection Erros
        db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    }

}

