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
});

function handleSuccess (albums) {
  albums.forEach(function(album) {
    renderAlbum(album);
  });
};

function handleError(err){
  console.log('There has been an error: ', err);
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
              <button class='btn btn-danger delete-album'>Delete Album</button>
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