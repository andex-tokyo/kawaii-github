chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!changeInfo.url) return;

    console.log("Tab updated:", changeInfo);

    const isGitHubPage = changeInfo.url.startsWith('https://github.com') || changeInfo.url.startsWith('http://github.com');
    if (isGitHubPage) {
        console.log("Executing content script for:", tabId);

        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["contentScript.js"]
        });
    }
});
