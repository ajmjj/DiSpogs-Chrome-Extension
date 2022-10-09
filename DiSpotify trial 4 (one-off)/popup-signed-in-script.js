// document.querySelector('#sign-out').addEventListener('click', function () {
//     chrome.runtime.sendMessage({ message: 'logout' }, function (response) {
//         if (response.message === 'success') window.close();
//     });
// });

let button = document.getElementById('sign-out');

button.onclick = function(){
    chrome.runtime.sendMessage({ message: 'logout' }, function (response) {
        if (response.message === 'success') window.close();
    });
}