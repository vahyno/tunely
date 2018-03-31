var mongoose = require("mongoose");

var Schema = mongoose.Schema;


// song schema
var SongSchema = new Schema({
  name: String,
  trackNumber: Number
});

// album model
var Song = mongoose.model('Song', SongSchema);

module.exports = Song;
