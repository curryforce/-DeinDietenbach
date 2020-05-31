
//Server-Side


//Für errors
let createErrors = require('http-errors');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//für Compression von Routen
let compression = require('compression');

//Sicherheitslibrary
let helmet = require('helmet');

//Für auslesen von .env Keys
require('dotenv').config();

//Import von Routern
var indexRouter = require('./routes/index');
let discussRouter =require('./routes/discussR');
let addRouter =require('./routes/addRouter');
let likeRouter = require('./routes/likeR');
let dislikeRouter = require('./routes/dislikeR');


//App definiert
var app = express();

app.use(compression());  //Kompressiert auf allen Routen
app.use(helmet());      //einbinden von helmet

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());


//View engine statisch also html
app.set('view engine', 'html');


//Für Statische index Startseite 
app.use(express.static(path.join(__dirname, 'public')));


//gibt an, welche Funktionen ausgeführt werden sollen
//wenn Pfade mit Get /Post Requests angefragt werden
app.use('/', indexRouter);
app.use('/discuss', discussRouter);
app.use('/add', addRouter);
app.use('/like', likeRouter);
app.use('/dislike', dislikeRouter);



//import von feedbackForm-Model
let formInstance = require('./models/feedbackForm');


//MongoDB MOdul Import
let mongoDBUTILS = require('./models/mongoDBUTILS');
mongoDBUTILS.connectIT(); //verbindet mongodb
mongoDBUTILS.mongooseOnlineVerbindung(); //verbindet mongoose zur db


//Letze Route> wenn anestrebte nicht da-> index.html als default
//redirect
app.get('*', function (req, res) {
  res.redirect('/');
});


//Catchen von 404 Fehlern
app.use(function (req, res, next) {
  next(createErrors(404));
});



//Zuletzt abschließendes Error-Handling 
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;