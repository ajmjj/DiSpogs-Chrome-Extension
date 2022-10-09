// document.querySelector('#sign-in').addEventListener('click', function () {
//     chrome.runtime.sendMessage({ message: 'login' }, function (response) {
//         if (response.message === 'success') window.close();
//     });
// });

let button = document.getElementById('sign-in');

button.onclick = function(){
    chrome.runtime.sendMessage({ message: 'login' }, function (response) {
        if (response.message === 'success') window.close();
    });
}