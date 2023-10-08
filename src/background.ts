chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log("Tab updated:", changeInfo);
    
    if (changeInfo.url && changeInfo.url.includes("github.com")) {
        console.log("Executing content script for:", tabId);
        
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["contentScript.js"]
        });
    }
});
