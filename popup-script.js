let button = document.getElementById('sign-in');

button.onclick = function(){
    console.log('button clicked');
    chrome.runtime.sendMessage({ message: 'login' }, function (response) {
        if (response.message === 'success') window.close();
    });
}