var express = require('express');
var router = express.Router();

/* GET home page. */
//statische html file serven, nicht render da ohne view engine
router.get('/', function(req, res, next) {
  res.sendfile('../public/index.html');
});


module.exports = router;
