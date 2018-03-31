/* CLIENT-SIDE JS
 *
 * You may edit this file as you see fit.  Try to separate different components
 * into functions and objects as needed.
 *
 */


// hard-coded data
// var sampleAlbums = [{
//   artistName: 'Ladyhawke',
//   name: 'Ladyhawke',
//   releaseDate: '2008, November 18',
//   genres: [ 'new wave', 'indie rock', 'synth pop' ]
// }, {
//   artistName: 'The Knife',
//   name: 'Silent Shout',
//   releaseDate: '2006, February 17',
//   genres: [ 'synth pop', 'electronica', 'experimental' ]
// }, {
//   artistName: 'Juno Reactor',
//   name: 'Shango',
//   releaseDate: '2000, October 9',
//   genres: [ 'electronic', 'goa trance', 'tribal house' ]
// }, {
//   artistName: 'Philip Wesley',
//   name: 'Dark Night of the Soul',
//   releaseDate: '2008, September 12',
//   genres: [ 'piano' ]
// }];



$(document).ready(function() {
  console.log('app.js loaded!');

  // make a get request for all albums
  $.ajax({
    method: 'GET',
    url: '/api/albums',
    success: handleSuccess,
    error: handleError
  });

  $('#album-form').on('submit', function(event){
    event.preventDefault();
    var formData = $(this).serialize();
    console.log(formData);
    this.reset();

    $.ajax({
      method: 'POST',
      url: '/api/albums',
      data: formData,
      success: handlePostSuccess,
      error: handleError
    });
  });

  $('#albums').on('click', '.add-song', function(e) {
    console.log('add-song clicked!');

    var id = $(this).closest('.album').data('album-id');
    console.log('id', id);

    $('#songModal').data('album-id', id);
    $('#songModal').modal();
  });






}); //doc ready ending

function handlePostSuccess (album) {
  console.log('post success');
  renderAlbum(album);
};


function handleSuccess (albums) {
    albums.forEach(function(album) {
      renderAlbum(album);
    });
};

function handleError(err){
  console.log('There has been an error: ', err);
}

// this function takes in a single album and renders it to the page
function renderAlbum(album) {

  var arrayOfSongStrings = album.songs.map(function(eachSong){
    return `${ eachSong.trackNumber } - ${ eachSong.name }`
  })
  var formattedSongStr = arrayOfSongStrings.join(', ');

  console.log('rendering album', album);
  $('#albums').append(`
    <div data-album-id="album._id" class="row album">
            <div class="col-md-10 col-md-offset-1">
              <div class="panel panel-default">
                <div class="panel-body">

                <!-- begin album internal row -->



    <div class='row'>
      <div class="col-md-3 col-xs-12 thumbnail album-art">
        <img src="images/800x800.png" alt="album image">
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
            <span>${ formattedSongStr }</span>
          </li>

        </ul>
      </div>
    </div>
    <!-- end of album internal row -->

                  <div class='panel-footer'>
                  </div>
                    <div class='panel-footer'>
                        <button class='btn btn-primary add-song'>Add Song</button>
                    </div>
                </div>

              </div>

            </div>

          </div>
    `);
};
