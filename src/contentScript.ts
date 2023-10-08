// 現在のページにスタイルを適用する関数
function applyStyles(settings: Record<string, string>) {
    let css = '';
    for (let i = 0; i <= 4; i++) {
        const color = settings[`level${i}`];
        if (color) {
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
