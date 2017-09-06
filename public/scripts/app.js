/* CLIENT-SIDE JS
 *
 * You may edit this file as you see fit.  Try to separate different components
 * into functions and objects as needed.
 *
 */
 

// hard-coded data
var sampleAlbums = [{
  artistName: 'Ladyhawke',
  name: 'Ladyhawke',
  releaseDate: '2008, November 18',
  genres: [ 'new wave', 'indie rock', 'synth pop' ]
}, {
  artistName: 'The Knife',
  name: 'Silent Shout',
  releaseDate: '2006, February 17',
  genres: [ 'synth pop', 'electronica', 'experimental' ]
}, {
  artistName: 'Juno Reactor',
  name: 'Shango',
  releaseDate: '2000, October 9',
  genres: [ 'electronic', 'goa trance', 'tribal house' ]
}, {
  artistName: 'Philip Wesley',
  name: 'Dark Night of the Soul',
  releaseDate: '2008, September 12',
  genres: [ 'piano' ]
}];


$(document).ready(function() {
  console.log('app.js loaded!');

  // make a GET request for all albums
  $.ajax({
    method: 'GET',
    url: '/api/albums',
    success: handleSuccess,
    error: handleError
  });

  $('#album-form form').on('submit', function(e) {
    e.preventDefault();
    var formData = $(this).serialize();

    $.post('/api/albums', formData, function(album) {
      renderAlbum(album);
    })

    // reset form input values after formData has been captured
    $(this).trigger("reset");
  });

  // add click handler to 'add song' buttons
  $('#albums').on('click', '.add-song', function(e) {
    console.log('add-song clicked!');

    var id = $(this).closest('.album').data('album-id');
    console.log('id', id);
    
    $('#songModal').data('album-id', id);
    $('#songModal').modal();
  });

  $('#albums').on('click', '.delete-album', function(e) {
    var id = $(this).closest('.album').data('album-id');
    console.log('id', id);

    $.ajax({
      url: '/api/albums/' + id, 
      type: 'DELETE', 
      success: function(result) {
        $('[data-album-id=' + id + ']').remove();
      }
    });
  });

  $('#saveSong').on('click', handleNewSongSubmit);
  $('#albums').on('click', '.edit-album', handleAlbumEditClick);
  $('#albums').on('click', '.save-album', handleAlbumSaveClick);
  $('#albums').on('click', '.edit-songs', handleSongsEditClick);

  $('#editSongsModalBody').on('click', 'button.btn-danger', handleDeleteSongClick);
  $('#editSongsModal').on('click', 'button#editSongsModalSubmit', handleUpdateSongsSave);

});

function handleUpdateSongsSave(e) {
  var $modal = $('#editSongsModal');

  if ($modal.find('form').length == 0) {
    // there are no songs to update
    $modal.modal('hide');
    return;
  }

  var albumId = $modal.find('form').data('album-id');
  var updatedSongs = [];

  $modal.find('form').each(function () {
    var song = {};
    song._id = $(this).attr('id');
    song.name = $(this).find('input.song-name').val();
    song.trackNumber = $(this).find('input.song-trackNumber').val();

    updatedSongs.push(song);
  });

  $modal.modal('hide');
  updateSongs(albumId, updatedSongs);
}

function updateSongs(albumId, songs) {
  // 1 PUT request per songId
  // re-render entire album after all PUT requests are finished
  var url = '/api/albums/' + albumId + '/songs/';
  var deferreds = [];

  songs.forEach(function(song) {
    var putRequest = $.ajax({
      method: 'PUT',
      url: url + song._id,
      data: song,
      error: function(err) { console.log('Error updating song', song.name, err); }
    });

    deferreds.push(putRequest);
  });

  // wait for all deferreds, then refetch and re-render the album
  $.when.apply(null, deferreds).always(function() {
    console.log('all updates received – time to refresh album');
    fetchAndReRenderAlbumById(albumId);
  });
}

function handleSuccess (albums) {
  albums.forEach(function(album) {
    renderAlbum(album);
  });
};

function handleError(err){
  console.log('There has been an error: ', err);
}


// when the edit button for an album is clicked
function handleAlbumEditClick(e) {
  var $albumRow = $(this).closest('.album');
  var albumId = $albumRow.data('album-id');
  console.log('albumId to edit', albumId);

  // show 'Save Changes' button
  $albumRow.find('.save-album').toggleClass('hidden');
  // hide 'Edit' button
  $albumRow.find('.edit-album').toggleClass('hidden');

  // get album name and replace its field with an input element
  var albumName = $albumRow.find('span.album-name').text();
  $albumRow.find('span.album-name').html('<input class="edit-album-name" value="' + albumName + '"></input>');

  // get the artist name and replace its field with an input element
  var artistName = $albumRow.find('span.artist-name').text();
  $albumRow.find('span.artist-name').html('<input class="edit-artist-name" value="' + artistName + '"></input>');

  // get the releasedate and replace its field with an input element
  var releaseDate = $albumRow.find('span.album-releaseDate').text();
  $albumRow.find('span.album-releaseDate').html('<input class="edit-album-releaseDate" value="' + releaseDate + '"></input>');
}


function handleAlbumSaveClick() {
  var albumId = $(this).parents('.album').data('album-id'); // $(this).closest would have worked fine too
  var $albumRow = $('[data-album-id=' + albumId + ']');

  var data = {
    name: $albumRow.find('.edit-album-name').val(),
    artistName: $albumRow.find('.edit-artist-name').val(),
    releaseDate: $albumRow.find('.edit-album-releaseDate').val()
  };
  
  console.log('PUTing data for album', albumId, 'with data', data);

  $.ajax({
    method: 'PUT',
    url: '/api/albums/' + albumId,
    data: data,
    success: handleAlbumUpdatedResponse
  });
}


function handleAlbumUpdatedResponse(data) {
  console.log('response to update', data);

  var albumId = data._id;
  
  // remove this album from the page, re-draw with updated data
  $('[data-album-id=' + albumId + ']').remove();
  renderAlbum(data);
}


function handleSongsEditClick() {
  var $albumRow = $(this).closest('.album');
  var albumId = $albumRow.data('album-id');

  $.get('/api/albums/' + albumId + "/songs", function(songs) {
    var editSongsFormsHtml = buildEditSongsForms(albumId, songs);
    $('#editSongsModalBody').html(editSongsFormsHtml);

    $('#editSongsModal').modal();
  });
}


function buildEditSongsForms(albumId, songs) {
  var songEditFormHtmlStrings = songs.map(function(song) {
    return `
      <form class="form-inline" id="${song._id}" data-album-id="${albumId}" >
        <div class="form-group">
          <input type="text" class="form-control song-trackNumber" value="${song.trackNumber}">
        </div>
        <div class="form-group">
          <input type="text" class="form-control song-name" value="${song.name}">
        </div>
        <div class="form-group">
          <button class="btn btn-danger" data-song-id="${song._id}">x</button>
        </div>
      </form>
    `;
  });

  // combine all song forms into a single string
  return songEditFormHtmlStrings.join('');
}


// this function takes a single album and renders it to the page
function renderAlbum(album) {
  // list songs along with each album
  var formattedSongsList = album.songs.map(function(song) {
    return `- (${ song.trackNumber }) ${ song.name }`;
  });
  var formattedSongsStr = formattedSongsList.join(', ');

  // HTML template string for each album
  var albumHtml = `
    <!-- one album -->
    <div class="row album" data-album-id=${ album._id }>

      <div class="col-md-10 col-md-offset-1">
        <div class="panel panel-default">
          <div class="panel-body">

          <!-- begin album internal row -->
            <div class='row'>
              <div class="col-md-3 col-xs-12 thumbnail album-art">
                <img src="../images/800x800.png" alt="album image">
              </div>

              <div class="col-md-9 col-xs-12">
                <ul class="list-group">
                  <li class="list-group-item">
                    <h4 class='inline-header'>Album Name:</h4>
                    <span class='album-name'>${ album.name }</span>
                  </li>

                  <li class="list-group-item">
                    <h4 class='inline-header'>Artist Name:</h4>
                    <span class='artist-name'>${ album.artistName }</span>
                  </li>

                  <li class="list-group-item">
                    <h4 class='inline-header'>Released date:</h4>
                    <span class='album-releaseDate'>${ album.releaseDate }</span>
                  </li>

                  <li class="list-group-item">
                    <h4 class="inline-header">Songs:</h4>
                    <span>${ formattedSongsStr }</span>
                  </li>
                </ul>
              </div>

            </div>
            <!-- end of album internal row -->

            <div class='panel-footer'>
              <button class='btn btn-primary add-song'>Add Song</button>
              <button class='btn btn-info edit-songs'>Edit Songs</button>
              <button class='btn btn-danger delete-album'>Delete Album</button>
              <button class='btn btn-info edit-album'>Edit Album</button>
              <button class='btn btn-info save-album hidden'>Save Changes</button>
            </div>

          </div>

        </div>

      </div>

    </div>
    <!-- end one album -->
  `;

  // render HTML template in the DOM
  $('#albums').prepend(albumHtml);
}

function handleNewSongSubmit(e) {
  e.preventDefault();
  console.log('in handleNewSongSubmit function');

  var $modal = $('#songModal');
  var $songNameField = $modal.find('#songName');
  var $trackNumberField = $modal.find('#trackNumber');

  var albumId = $modal.data('albumId');

  // get data from modal fields
  // note the server expects the keys to be 'name', 'trackNumber' so we use those.
  var postData = {
    name: $songNameField.val(),
    trackNumber: $trackNumberField.val()
  };

  // POST to SERVER
  var songPostUrl = '/api/albums/'+ albumId + '/songs';
  $.post(songPostUrl, postData, function(data) {
    $modal.modal('hide');

    $songNameField.val('');
    $trackNumberField.val('');

    var albumGetUrl = '/api/albums/' + albumId;
    $.get(albumGetUrl, function(updatedAlbum) {
      // remove current instance of album
      $('[data-album-id=' + albumId + ']').remove();
      
      // re-render album with new songs
      renderAlbum(updatedAlbum);
    });
  }).fail(function(xhr, status, err) {
    console.log('post to /api/albums/:albumId/songs resulted in error', err);
  });
}


function handleDeleteSongClick(e) {
  e.preventDefault();
  var songId = $(this).data('song-id');
  var albumId = $(this).closest('form').data('album-id');

  var url = '/api/albums/' + albumId + '/songs/' + songId;
  console.log('send DELETE ', url);
  $.ajax({
    method: 'DELETE',
    url: url,
    success: handleSongDeleteResponse
  });
}

function handleSongDeleteResponse(data) {
  var songId = data._id;
  var $formRow = $('form#' + songId);
  var albumId = $formRow.data('album-id');

  // remove song edit form from the page
  $formRow.remove();
  fetchAndReRenderAlbumById(albumId);
}

function fetchAndReRenderAlbumById(albumId) {
  $.get('/api/albums/' + albumId, function(data) {
    $('div[data-album-id=' + albumId + ']').remove();
    renderAlbum(data);
  });
}