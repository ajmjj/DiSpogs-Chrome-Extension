const CLIENT_ID = encodeURIComponent('93eecbb9130a4a26b0b4af8ee76cba97');
const RESPONSE_TYPE = encodeURIComponent('token');
const REDIRECT_URI = encodeURIComponent(chrome.identity.getRedirectURL('spotify'));
const SCOPE = encodeURIComponent('user-read-email');
const SHOW_DIALOG = encodeURIComponent('true');
let STATE = '';
let ACCESS_TOKEN = '';


console.log(chrome.identity.getRedirectURL('spotify'));
const getAuthUrl = function () {
    STATE = encodeURIComponent('meet' + Math.random().toString(36).substring(2, 15));

    const url = `https://accounts.spotify.com/authorize?response_type=${RESPONSE_TYPE}&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${STATE}&show_dialog=${SHOW_DIALOG}`;
    console.log(`url: ${url}`);
    return url;
}



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'login') {
        console.log('login message received');
        chrome.identity.launchWebAuthFlow({
            url: getAuthUrl(),
            interactive: true
        }, function (redirectUrl) {
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
        });
        return true;
    };

    if (request.message === 'logout') {
        console.log('logout message received');
        // chrome.identity.clearAllCachedAuthTokens();
        console.log('cleared all cached auth tokens');
        chrome.action.setPopup({ popup: './popup.html' });
        sendResponse({ message: 'success' });
    }
});
