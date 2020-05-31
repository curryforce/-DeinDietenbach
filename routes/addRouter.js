var express = require('express');
var router = express.Router();
let formInstance = require('../models/feedbackForm');

//Für Form Check Schritte von Form
const {
    body,
    validationResult,
    check,
    isAlphanumeric,
    blacklist,
    sanitizeBody
} = require('express-validator');


router.post("/", function (request, response, next) {

    // sanitizeBody('freitext').escape();

    console.log("Request angekommen");

    const errors = validationResult(request);
    console.log(errors);

    //wenn fehler -> log fehler
    if (!errors.isEmpty()) {
        return response.status(422).json({
            errors: errors.array()
        });
        //wenn keine fehler -> neue Instanz anlegen
    } else {

        //erst bereinigen?
        check(request.body.freitext).isLength({
                min: 3
            })
            .isAlphanumeric(request.body.freitext)
            .blacklist(request.body.freitext, '<>', '@', '//')
            .escape();



        //Aus einkommender data von form
        // neue formInstance erstellen
        let neuesForm = new formInstance({
            radiobutton: request.body.radiobutton,
            dropdown: request.body.dropdown,
            freitext: request.body.freitext,
            haus_ID: request.body.haus_ID,
            latitude: request.body.latitude,
            longitude: request.body.longitude,
            date: request.body.date
        });

        console.log(neuesForm);

        // Soll in Datenbank speichern
        neuesForm.save(function (err) {
            if (err) {
                return next(err);
            }
            //Bei Erfolg wieder seite rendern 
            // response.sendFile('index.html', {
            //   root: './public'
            // });
            //json antwort von client erwartet
            response.json({
                "status": "ok"
            }).status(200);

        });

        //Ende Scope else
    };


});

module.exports = router;
