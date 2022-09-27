
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


  
  }
  init()
}
