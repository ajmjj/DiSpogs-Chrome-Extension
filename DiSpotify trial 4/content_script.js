if (typeof init === 'undefined'){
  const init = function(){
    const targetDiv = document.getElementsByClassName('body_32Bo9').item(0);

    var button = document.createElement("BUTTON");
    button.className= 'DiSpogsButton';
    button.innerHTML = "Available on Spotify";
    button.style = "background-color:#44c767;border-radius:28px;border:1px solid #18ab29;display:inline-block;cursor:pointer;color:#ffffff;font-family:Arial;font-size:15px;padding:11px 16px;text-decoration:none;";
    targetDiv.appendChild(button);

    //using Shadow Root
    // var root = targetDiv.attachShadow({mode: 'open'}); //Create shadow root
    // var button = document.createElement('BUTTON'); 
    // div.className = 'DiSpogsButton';
    // button.innerHTML = "<style></style>" + "Available on Spotify";
    // root.appendChild(button)

    // Get release title, artist and Name from Discogs
    
    const releaseTitle = document.getElementsByClassName('title_1q3xW').item(0).innerText;
    const releaseArtist = document.getElementsByClassName('link_15cpV').item(0).innerText;
    var releaseName = releaseTitle.replace(`${releaseArtist}`, "").trim().slice(1);
    // console.log("releaseArtist: " + releaseArtist);
    // console.log("releaseTitle: " + releaseTitle);
    // console.log("releaseName: " + releaseName);
    return [releaseArtist, releaseName];
  }

  const searchAlbum = function(releaseDetails){
    releaseArtist = releaseDetails[0];
    releaseName = releaseDetails[1];
    // console.log("releaseArtist: " + releaseArtist);
    // console.log("releaseName: " + releaseName);

    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken('<here_your_access_token>');
    spotifyApi.searchAlbums(`${releaseName}&artist:${releaseArtist}&limit=3`)
    .then(function(data) {
      console.log(`Search for ${releaseName} by ${releaseArtist} in the artist name:`, data);
      const album = data.albums.items[0];
      // console.log("album: " + album.name);
      // console.log("artist: " + album.artists[0].name);

      if (album.artists[0].name === releaseArtist && album.name === releaseName) {
        // console.log("Album found on Spotify");
        // console.log("Album spotify url: " + album.external_urls.spotify);

      } else {
        // console.log("Album not found on Spotify");
      }
    }, function(err) {
      console.error(err);
    });
  }
 

  releaseDetails = init();
  searchAlbum(releaseDetails);
    
}

