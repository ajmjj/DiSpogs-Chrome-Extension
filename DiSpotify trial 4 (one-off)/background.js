const CLIENT_ID = encodeURIComponent('93eecbb9130a4a26b0b4af8ee76cba97');
// const CLIENT_SECRET = encodeURIComponent('22b83c68988947bab9a7a8ca229f0700');
const RESPONSE_TYPE = encodeURIComponent('token');
const REDIRECT_URI = encodeURIComponent(chrome.identity.getRedirectURL());
// const REDIRECT_URI = encodeURIComponent('https://pmcgiddpglggjgcpkmgbgcgfenaolina.chromiumapp.org/');
const SCOPE = encodeURIComponent('user-read-email');
const SHOW_DIALOG = encodeURIComponent('true');
let STATE = '';
let ACCESS_TOKEN = '';
// let ACCESS_TOKEN = 'BQCE17ZxbOxLTuM5BeQzYoW0IeFN1MsdJA3bTitnjxKtZddtO';

let user_signed_in = false;

function create_spotify_endpoint() {
    STATE = encodeURIComponent('meet' + Math.random().toString(36).substring(2, 15));

    let oauth2_url = `https://accounts.spotify.com/authorize?response_type=${RESPONSE_TYPE}&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}&scope=${SCOPE}&show_dialog=${SHOW_DIALOG}`;

    console.log(oauth2_url);

    return oauth2_url;
}

// function login() {
//     let popup = window.open(`https://accounts.spotify.com/authorize
//     ?client_id=${this.client_id}
//     &response_type=token
//     &redirect_uri=${this.redirect_uri}
//     &scope=${this.scopes}
//     &show_dialog=true`, 
//     'Login with Spotify', 
//     'width=800,height=600')
    
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'login') {
        if (user_signed_in) {
            console.log("User is already signed in.");
        } else {
            // sign the user in with Spotify (implicit grant flow)
            
            // using chrome.identity.lauchWebAuthFlow()
            chrome.identity.clearAllCachedAuthTokens();
            console.log('Token cleared');
            chrome.identity.launchWebAuthFlow({
                url: create_spotify_endpoint(),
                interactive: true
            }, 
            function (redirect_url) {
                console.log(redirect_url);
                if (chrome.runtime.lastError) {
                    sendResponse({ message: 'fail' });
                } else {
                    if (redirect_url.includes('callback?error=access_denied')) {
                        sendResponse({ message: 'fail' });
                    } else {
                        ACCESS_TOKEN = redirect_url.substring(redirect_url.indexOf('access_token=') + 13);
                        ACCESS_TOKEN = ACCESS_TOKEN.substring(0, ACCESS_TOKEN.indexOf('&'));
                        console.log('Access token: ' + ACCESS_TOKEN);
                        let state = redirect_url.substring(redirect_url.indexOf('state=') + 6);

                        if (state === STATE) {
                            console.log("Login Success")
                            user_signed_in = true;

                            setTimeout(() => {
                                ACCESS_TOKEN = '';
                                user_signed_in = false;
                            }, 3600000);

                            chrome.action.setPopup({ popup: './popup-signed-in.html' }, () => {
                                sendResponse({ message: 'success' });
                            });
                        } else {
                            sendResponse({ message: 'fail' });
                        }
                    }
                }
            });
        }
      
        return true;
    } else if (request.message === 'logout') {
        user_signed_in = false;
        chrome.action.setPopup({ popup: './popup.html' }, () => {
            sendResponse({ message: 'success' });
        });

        return true;
    }
});

// Searches spotify for release, returns first album found if it exists
const searchSpotifyForAlbum = async function (name, artist) {
    const searchUrl = `https://api.spotify.com/v1/search?q=${name}%20artist:${artist}&type=album&limit=1`;
    console.log(`Access token: ${ACCESS_TOKEN}`);
    const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + ACCESS_TOKEN,
            'Content-Type': 'application/json'
        }
    });

    console.log(`Response code: ${response.status}`); 

    if (response.status === 200) {
        let data = await response.json();
        console.log(data);
        return data;
    } else if (response.status === 401) {
        console.log(`Error 400: Bad or expired access token. Please sign in again.`);
    } else if (response.status === 403) {
        console.log("Error 403: Bad OAuth request (wrong consumer key, bad nonce, expired timestamp...).");
    } else if (response.status === 429) {
        console.log("Error 429: The app has exceeded its rate limits. Please try again later");
    }

    //todo -> catch errors

    // console.log(response.json().then(
    //     (data) => { 
    //         console.log(`data ${data}`); 
    //         return data 
    //     }
    // ));
    
};

const compareReleaseToAlbum = function (release, album) {
    if (release.name.toLowerCase() === album.name.toLowerCase() && release.artist.toLowerCase() === album.artist.toLowerCase()) {
        return true;
    }
};


// get all album artists
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'releaseInfo') {
        let release = {};
        release.name = request.name;
        release.artist = request.artist;    
        console.log(`release name: ${release.name}`);
        console.log(`release artist: ${release.artist}`);
        
        
        // Search Spotify for album
        searchSpotifyForAlbum(release.name, release.artist)
            .then((data) => {
                let album = {};
                if (data !== undefined) { 
                    album.name = data.albums.items[0].name;
                    album.artist = data.albums.items[0].artists[0].name;
                    console.log(`album name: ${album.name}, album artists: ${album.artist}`);
                    if (compareReleaseToAlbum(release, album)) {
                        console.log("MATCH");
                        sendResponse({ message: 'match' });
                    } else {
                        console.log("NO MATCH");
                        sendResponse({ message: 'no match' });
                    }
                } else {
                    console.log('Search returned no results');
                }
            });    
    return true;
    }
});