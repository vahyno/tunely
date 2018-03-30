var mongoose = require("mongoose");

var Schema = mongoose.Schema;


// album schema
var AlbumSchema = new Schema({
  artistName: String,
  name: String,
  releaseDate: String,
  genres: [ String ]
});

// album model
var Album = mongoose.model('Album', AlbumSchema);

module.exports = Album;
