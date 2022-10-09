const CLIENT_ID = encodeURIComponent('93eecbb9130a4a26b0b4af8ee76cba97');
const RESPONSE_TYPE = encodeURIComponent('token');
const REDIRECT_URI = encodeURIComponent(chrome.identity.getRedirectURL('spotify'));
const SCOPE = encodeURIComponent('user-read-email');
const SHOW_DIALOG = encodeURIComponent('true');
let STATE = '';
let ACCESS_TOKEN = '';

let user_signed_in = false;

// console.log(chrome.identity.getRedirectURL('spotify'));
const getAuthUrl = function () {
    STATE = encodeURIComponent('meet' + Math.random().toString(36).substring(2, 15));

    const url = `https://accounts.spotify.com/authorize?response_type=${RESPONSE_TYPE}&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${STATE}&show_dialog=${SHOW_DIALOG}`;
    console.log(`url: ${url}`);
    return url;
}



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'login') {
        if (user_signed_in) {
            console.log("User is already signed in.");
        } else {
            console.log('login message received');
            chrome.identity.launchWebAuthFlow({
                url: getAuthUrl(),
                interactive: true
            }, function (redirectUrl) {
                if (typeof redirectUrl === 'undefined') {
                    console.log('Error: redirectUrl is undefined');
                } else {
                    console.log(`redirectUrl: ${redirectUrl}`);
                    // if (chrome.runtime.lastError) {
                    //     console.log('failed: chrome.runtime.lastError');
                    //     sendResponse({ message: 'fail' });
                    ACCESS_TOKEN = redirectUrl.substring(redirectUrl.indexOf('access_token=') + 13);
                    ACCESS_TOKEN = ACCESS_TOKEN.substring(0, ACCESS_TOKEN.indexOf('&'));
                    let state = redirectUrl.substring(redirectUrl.indexOf('state=') + 6);

                    if (state === STATE){
                        console.log("SUCCESS")
                        user_signed_in = true;

                        setTimeout(() => {
                            ACCESS_TOKEN = '';
                            chrome.identity.clearAllCachedAuthTokens();
                            user_signed_in = false;
                        }, 3600000);

                        chrome.action.setPopup({ popup: './popup-signed-in.html' }, () => {
                            sendResponse({ message: 'success' });
                        });
                    } else {
                        console.log('failed: state !== STATE');
                        sendResponse({ message: 'fail' });
                    }
                }
            });
            return true;
        }
    };

    if (request.message === 'logout') {
        console.log('logout message received');
        // chrome.identity.clearAllCachedAuthTokens();
        // console.log('cleared all cached auth tokens');
        user_signed_in = false;
        ACCESS_TOKEN = '';
        chrome.action.setPopup({ popup: './popup.html' });
        sendResponse({ message: 'success' });
    }
});

// Searches spotify for release, returns first album found if it exists
const searchSpotifyForAlbum = async function (name, artist) {
    const searchUrl = `https://api.spotify.com/v1/search?q=${name}%20artist:${artist}&type=album&limit=1`;
    // console.log(`Access token: ${ACCESS_TOKEN}`);
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

// todo: get all album artists
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
                    if (data.albums.items.length > 0) {
                        album.name = data.albums.items[0].name;
                        album.artist = data.albums.items[0].artists[0].name;
                        console.log(`album name: ${album.name}, album artists: ${album.artist}`);
                        if (compareReleaseToAlbum(release, album)) {
                            console.log("MATCH");
                            sendResponse({ message: 'match', link: data.albums.items[0].external_urls.spotify });
                        } else {
                            console.log("NO MATCH");
                            sendResponse({ message: 'no match' , link: null});
                        }
                    } else {
                        console.log('Search returned no results');
                        sendResponse({ message: 'no match', link: null });
                    }
                } else {
                    console.log('Error: data returned from search is undefined');
                }
            });    
    return true;
    }
});