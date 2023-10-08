chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
    if (details.reason === "install") {
        // プラグインがインストールされたとき
        chrome.storage.local.set({ isFirstTime: true });
    } else if (details.reason === "update") {
        // プラグインが更新されたとき（必要に応じて使用）
    }
});
