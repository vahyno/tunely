// require mongoose
// set up shorthand Schema variable to stand in for mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Song = require('./song');

// album schema
var AlbumSchema = new Schema({
  artistName: String,
  name: String,
  releaseDate: String,
  genres: [ String ],
  songs: [ Song.schema ]
});

// album model
var Album = mongoose.model('Album', AlbumSchema);

module.exports = Album;