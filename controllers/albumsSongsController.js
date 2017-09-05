var db = require('../models');

// POST '/api/albums/:albumId/songs'
function create(req, res) {
  db.Album.findById(req.params.album_id, function(err, foundAlbum) {
    
    // dangerous – in a real app, we'd validate the incoming data
    var newSong = new db.Song(req.body);

    foundAlbum.songs.push(newSong);
    foundAlbum.save(function(err, savedAlbum) {
      // responding with song in JSON
      // some APIs may respond with parent obj as well (e.g. foundAlbum)
      res.json(newSong);  
    });
  });
}


module.exports = {
  create: create
};
