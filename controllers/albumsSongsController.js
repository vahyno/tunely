var db = require('../models');

// GET '/api/albums/:albumId/songs'
function index(req, res) {
  db.Album.findById(req.params.album_id, function(err, foundAlbum) {
    res.json(foundAlbum.songs);
  });
}

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

// PUT '/api/albums/:albumId/songs/:songId'
function update(req, res) {
  db.Album.findById(req.params.album_id, function(err, foundAlbum) {
    var correctSong = foundAlbum.songs.id(req.params.song_id);

    if (correctSong) {
      correctSong.trackNumber = req.body.trackNumber;
      correctSong.name = req.body.name;

      foundAlbum.save(function(err, saved) {
        console.log('UPDATED', correctSong, 'IN ', saved.songs);
        res.json(correctSong);
      });
    } else {
      res.send(404);
    }
  });
}

// DELETE '/api/albums/:albumId/songs/:songId'
function destroy(req, res) {
  db.Album.findById(req.params.album_id, function(err, foundAlbum) {
    console.log(foundAlbum);
    // we've got the album, now find the song within it
    var correctSong = foundAlbum.songs.id(req.params.song_id);
    if (correctSong) {
      correctSong.remove();
      // resave the album now that the song is gone
      foundAlbum.save(function(err, saved) {
        console.log('REMOVED ', correctSong.name, 'FROM ', saved.songs);
        res.json(correctSong);
      });
    } else {
      res.send(404);
    }
  });
}

module.exports = {
  index: index,
  create: create,
  update: update,
  destroy: destroy
};
