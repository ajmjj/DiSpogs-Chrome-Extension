var client_secret = "22b83c68988947bab9a7a8ca229f0700";
var client_id = "93eecbb9130a4a26b0b4af8ee76cba97"

const AUTHORIZE = 'https://accounts.spotify.com/authorize';

function handleRedirect(){
    let code = getCode();
    fetchAccessToken(code);
}

function fetchAccessToken(code){
    let body = "grant_type=authorization_code";
    body += "&code=" + code;;
    body += "&redirect_uri=" + redirectUri;
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

//get code from return url
function getCode(){
    let code = null;
    const queryString = window.location.search;
    if (queryString.length > 0) {
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code');
    }
    return code;
}

function requestAuthorization(){
    let url = AUTHORIZE;
    url += "?client_id=" + client_id; // don't expose client id to the user
    url += "&response_type=code";
    url += "&redirect_uri=" + redirectUri;
    url += "&scope=" + encodeURIComponent("user-read-currently-playing user-read-playback-state");
    url += "&show_dialog=true";
    window.location.href = url; // Show Spotify login page
}

try{
    //On page change
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (changeInfo.status == 'complete') {
        //if (changeInfo.url){
            chrome.scripting.executeScript({
                files: ['content_script.js'],
                target: {tabId: tab.Id, allFrames: true}
            });
        //}
        }   
    });

    chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
        if (request.action === 'launchOauth'){
          chrome.identity.launchWebAuthFlow({
            url: 'https://accounts.spotify.com/authorize' +
            '?client_id=$SPOTIFY_CLIENT_ID' +
            '&response_type=code' +
            '&redirect_uri=https://<put chrome token here>.chromiumapp.org/success', // Todo add redirect uri (also to spotify dev dashboard)
            interactive: true //needed?
          },
          function(redirectUrl) {
            let code = redirectUrl.slice(redirectUrl.indexOf('=') + 1)
      
            makeXhrPostRequest(code, 'authorization_code')
              .then(data => {
                data = JSON.parse(data)
                chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab){
                  if (
                    changeInfo.status === 'complete' && tab.url.indexOf('spotify') > -1
                  || changeInfo.status === 'complete' && tab.url.indexOf('spotify') > -1 && tab.url.indexOf('user') > -1 && tab.url.indexOf('playlists') === -1
                ) {
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                        chrome.tabs.sendMessage(tabs[0].id, {token: data.access_token}, function(response) {
                          console.log('response is ', response)
                        });
                    })
                  }
                })
                return data
              })
              .catch(err => console.error(err))
          }) //launch web auth flow
      
        } //if statment
      })// extension event listener

} catch(e) {
    console.log(e);
}
