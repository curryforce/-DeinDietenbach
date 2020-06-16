var express = require('express');
var router = express.Router();
let formInstance = require('../models/feedbackForm');

const {
    body,
    validationResult,
    check,
    isAlphanumeric,
    blacklist,
    sanitizeBody
} = require('express-validator');



router.post("/", async function (request, response, next) {

    let MEINEid =  request.body.gesendete_ID;

    console.log("Update Req angekommen");

    const errors = validationResult(request);
    console.log(errors);

    //wenn fehler -> log fehler
    if (!errors.isEmpty()) {
        console.log("Server-Fehler-LikeR");
        return response.status(422).json({
            errors: errors.array()
        });
        //wenn keine fehler -> neue Instanz anlegen
    } else {
        console.log("Das ist die ID: ");
        console.log(MEINEid);
                                                            //Soll upvote um einen erhöhen
        formInstance.findByIdAndUpdate(MEINEid, {$inc:{'upvote': 1}},
             {useFindAndModify: false},
             (err, doc) => {
            if (err) {
                console.log("Something wrong when updating data!");
            }
        
            console.log(doc);
        });
 
            //json antwort von client erwartet
            response.json({
                "status": "ok"
            }).status(200);

        //Ende Scope else
    };


});



module.exports = router;
