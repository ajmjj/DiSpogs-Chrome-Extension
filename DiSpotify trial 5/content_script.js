const getRelease = function(){
  // Get release title, artist and Name from Discogs
  const discogsReleaseTitle = document.getElementsByClassName('title_1q3xW').item(0).innerText;
  const releaseArtist = document.getElementsByClassName('link_15cpV').item(0).innerText;
  const releaseName = discogsReleaseTitle.replace(`${releaseArtist}`, "").trim().slice(1).trim();
  // console.log("releaseTitle: " + discogsReleaseTitle);
  // console.log("releaseArtist: " + releaseArtist);
  // console.log("releaseName: " + releaseName);

  return {name : releaseName, artist : releaseArtist};
};

let extensionId = chrome.runtime.id;

const addButton = function(exists){
  const targetDiv = document.getElementsByClassName('body_32Bo9').item(0);

  var button = document.createElement("BUTTON");
  button.className= 'DiSpogsButton';
  button.id = 'DiSpogsButton';
  if (exists){
    button.style.background = `url("chrome-extension://${extensionId}/images/spotgreen.png") no-repeat`;
  } else if (!exists){
    button.style.background = `url("chrome-extension://${extensionId}/images/spotgrey.png")  no-repeat`;
  }
  button.style.backgroundSize = 'cover';
  button.style.width = '48px';
  button.style.height = '48px';
  button.style.border = 'none';
  button.padding = '0px';
  targetDiv.appendChild(button);
};

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
  console.log(`spotify link: ${response.link}`)
  addButton(exists);

  if (exists){
    let newButton = document.getElementById('DiSpogsButton');
    newButton.onclick = function (){window.open(response.link, '_blank');}
  }
  
});