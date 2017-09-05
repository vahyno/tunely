// require mongoose
// set up shorthand Schema variable to stand in for mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// song schema
var SongSchema = new Schema({
  name: String,
  trackNumber: Number
});

// song model
var Song = mongoose.model('Song', SongSchema);

module.exports = Song;