// 現在のページにスタイルを適用する関数
function applyStyles(settings: Record<string, string | null>) {
    let css = '';
    for (let i = 0; i <= 4; i++) {
        const color = settings[`level${i}`];
        const imageData = settings[`level${i}_img`];
        
        if (imageData) {
            css += `.ContributionCalendar-day[data-level="${i}"] { background-image: url(${imageData}); background-size: cover; fill: transparent; background-color:transparent; }\n`;
        } else if (color) {
            css += `.ContributionCalendar-day[data-level="${i}"] { fill: ${color}; background-color:${color}; }\n`;
        }
    }

    const existingStyle = document.getElementById('customGitHubStyles');
    if (existingStyle) {
        existingStyle.remove();
    }

    const styleSheet = document.createElement("style");
    styleSheet.id = "customGitHubStyles";
    styleSheet.type = "text/css";
    styleSheet.innerText = css;
    document.head?.appendChild(styleSheet);
}

// 設定の変更を監視してスタイルを適用する
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'local' && changes.settings) {
        applyStyles(changes.settings.newValue);
    }
});

// ページが読み込まれたときに、初期のスタイルを適用する
chrome.storage.local.get('settings', function(data) {
    if (data.settings) {
        applyStyles(data.settings);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getDefaultColor") {
        const computedStyle = getComputedStyle(document.documentElement);
        const bgColorValueL0 = computedStyle.getPropertyValue('--color-calendar-graph-day-bg').trim();
        const bgColorValueL1 = computedStyle.getPropertyValue('--color-calendar-graph-day-L1-bg').trim();
        const bgColorValueL2 = computedStyle.getPropertyValue('--color-calendar-graph-day-L2-bg').trim();
        const bgColorValueL3 = computedStyle.getPropertyValue('--color-calendar-graph-day-L3-bg').trim();
        const bgColorValueL4 = computedStyle.getPropertyValue('--color-calendar-graph-day-L4-bg').trim();
        sendResponse({
            colorL0: bgColorValueL0,
            colorL1: bgColorValueL1,
            colorL2: bgColorValueL2,
            colorL3: bgColorValueL3,
            colorL4: bgColorValueL4,
        });
        return true;
    }
});

