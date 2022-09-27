const init = function(){
  const targetDiv = document.getElementsByClassName('body_32Bo9').item(0);
  return targetDiv;
}

const generateButton = function(targetDiv){
  // if exists, generate button to top spotify result
  // if doesnt exist, generate greyed out button
  
  var button = document.createElement("BUTTON");
  button.className= 'DiSpogsButton';
  button.innerHTML = "Available on Spotify";
  targetDiv.appendChild(button);
}



const targetDiv = init();
generateButton(targetDiv);