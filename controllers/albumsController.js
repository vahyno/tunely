var db = require('../models');

// GET /api/albums
function index(req, res) {
  // access database and pull out all albums
  db.Album.find({}, function(err, allAlbums) {
    res.json(allAlbums);
  });
}

// POST /api/albums
function create(req, res) {
  // create an album based on request body and send it back as JSON

  // break data in the genre field into an array
  var genres = req.body.genres.split(', ');
  req.body.genres = genres;

  db.Album.create(req.body, function(err, album) {
    if (err) { console.log('error', err); }
    res.json(album);
  });
}

// GET /api/albums/:albumId
function show(req, res) {
  // find one album by id and send it back as JSON
  db.Album.findById(req.params.album_id, function(err, foundAlbum) {
    res.json(foundAlbum);
  });
}

// DELETE /api/albums/:albumId
function destroy(req, res) {
  // find one album by id, delete it, and send it back as JSON
  db.Album.findByIdAndRemove(req.params.album_id, function(err, deletedAlbum) {
    if (err) { console.log('error', err); }
    res.send(200);
  });
}

// PUT or PATCH /api/albums/:albumId
function update(req, res) {
  // find one album by id, update it based on request body,
  // and send it back as JSON

  db.Album.findById(req.params.id, function(err, foundAlbum) {
    if (err) { console.log('albumsController.update error', err); }
    foundAlbum.artistName = req.body.artistName;
    foundAlbum.name = req.body.name;
    foundAlbum.releaseDate = req.body.releaseDate;
    foundAlbum.save(function(err, savedAlbum) {
      if (err) { console.log('saving altered album failed'); }
      res.json(savedAlbum);
    });
  });
}

module.exports = {
  index: index,
  create: create,
  show: show,
  destroy: destroy,
  update: update
};