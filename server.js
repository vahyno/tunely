var express = require('express');
var app = express();

var bodyParser = require('body-parser'); // do we need this YES
var db = require('./models');
var controllers = require('./controllers');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));

app.get('/',function(req, res){
  res.sendFile('views/index.html', {root : __dirname});
});

app.get('/api', controllers.api.index);   // brings me all the way to controllers=> index.js=> apiController.js

app.get('/api/albums', controllers.albums.index);

app.post('/api/albums', controllers.albums.create);

app.listen(3000);
