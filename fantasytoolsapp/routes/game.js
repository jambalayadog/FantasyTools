var express = require('express');
var router = express.Router();
var fs = require('fs')



router.get('/', function(req, res, next) {
    res.render('./game/game', { title: 'Hey', message: 'Hello there!' });
});


module.exports = router;
