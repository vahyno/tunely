// require mongoose and connect to database
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/tunely_test');

var Album = require('./album');

module.exports = {
  Album: Album
};