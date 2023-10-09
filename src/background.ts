chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
    if (details.reason === "install") {
        chrome.storage.local.set({ isFirstTime: true });
    } else if (details.reason === "update") {
        // プラグインが更新されたとき（必要に応じて使用）
        chrome.storage.local.set({ isFirstTimeUpdate: true });
    }
});
