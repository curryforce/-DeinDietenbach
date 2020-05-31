//Erst Mongoose für schema ->model->instanz
let mongoose = require('mongoose');
let moment = require('moment');

let Schema = mongoose.Schema;

//Für Form> Referenz zum Gebäude erstellen

//An bereits vorhandenen "data"objekt anpassen?

let formSchema = new Schema(
    {
        radiobutton: {type: String, required: true},
        dropdown: {type: String, required: true},
        freitext: {type: String, required: true, max: 200},
        haus_ID: {type: String, required: true},
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        date: {type: Date, default: Date.now},
        upvote: {type: Number},
        downvote: {type: Number}
    }
);

//Virtaul-Property mit transformiertem Datum
formSchema
.virtual('date_transformed')
.get( function() {
    return moment(this.date).format('DD.MM.YYYY');
});

//Damit anfrage in discussR.js per send() oder json() gesendet werden kann
formSchema
    .set('toJSON', { getters: true });

//Exportieren von Model
//drittes Statement bennennt model in db
module.exports = mongoose.model('formInstance', formSchema, 'formInstance');


