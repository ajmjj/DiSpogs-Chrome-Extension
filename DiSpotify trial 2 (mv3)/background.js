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

} catch(e) {
    console.log(e);
}