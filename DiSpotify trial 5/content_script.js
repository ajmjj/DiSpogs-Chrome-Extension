const getRelease = function(){
  // Get release title, artist and Name from Discogs
  const discogsReleaseTitle = document.getElementsByClassName('title_1q3xW').item(0).innerText;
  const releaseArtist = document.getElementsByClassName('link_15cpV').item(0).innerText;
  const releaseName = discogsReleaseTitle.replace(`${releaseArtist}`, "").trim().slice(1).trim();
  // console.log("releaseTitle: " + discogsReleaseTitle);
  // console.log("releaseArtist: " + releaseArtist);
  // console.log("releaseName: " + releaseName);

  return {name : releaseName, artist : releaseArtist};
}

const addButton = function(exists){
  const targetDiv = document.getElementsByClassName('body_32Bo9').item(0);
  var buttonColour = getButtonData(exists).colour;

  var button = document.createElement("BUTTON");
  button.className= 'DiSpogsButton';
  button.innerHTML = getButtonData(exists).text;
  button.style = `background-color:${buttonColour};
    border-radius:28px;
    border:1px solid #18ab29;
    display:inline-block;
    cursor:pointer;
    color:#ffffff;
    font-family:Arial;
    font-size:15px;
    padding:11px 16px;
    text-decoration:none;`;
  targetDiv.appendChild(button);

  //using Shadow Root
  // var root = targetDiv.attachShadow({mode: 'open'}); //Create shadow root
  // var button = document.createElement('BUTTON'); 
  // div.className = 'DiSpogsButton';
  // button.innerHTML = "<style></style>" + "Available on Spotify";
  // root.appendChild(button)
}

const getButtonData = function(exists){
  if (exists){
    return {text: 'Available', colour: '#44c767'};
  }
  else {
    return {text: 'Not Available', colour: '#FF4C26'};
  }
}

var discogsRelease = getRelease();
let exists = null;
// console.log(discogsRelease);

chrome.runtime.sendMessage({message: 'releaseInfo', artist: discogsRelease.artist, name: discogsRelease.name},
 function(response) {
  console.log(response.message);
  if (response.message === 'match') {
    exists = true;
  } else if (response.exists === 'no match') {
    exists = false;
  }
  console.log(`match exists: ${exists}`)
  addButton(exists);
});


