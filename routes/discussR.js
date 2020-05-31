var express = require('express');
var router = express.Router();
let formInstance = require('../models/feedbackForm');

/* GET home page. */
//statische html file serven, nicht render da ohne view engine


//wäre dann Route  
//localhost:3000/discuss/  oder?
router.get("/", function (request, response, next) {

    console.log("Schinkeeeen")

    //Auswahl von freitext u. latitude und longitude haus_ID und transformiertem Datum
    // beiden letzteren -> später marker hinzufügen / TextFeld in Boxseite
    //muss date & date_transformed haben-> für transformierung von virtual
    formInstance.find({}, 'freitext latitude longitude haus_ID  date date_transformed')
        .exec(function (err, ergebnis) {

            if (err) {
                // return next(err);
            } else {
                // console.log(ergebnis);
                response.json(ergebnis);

            }
        });

});


module.exports = router;


