// 保存された設定を読み込んで、入力フィールドに設定する関数
function loadSettings() {
    chrome.storage.local.get('settings', function(data) {
        if (data.settings) {
            for (let i = 0; i <= 4; i++) {
                const colorInput = document.getElementById(`level${i}`) as HTMLInputElement;
                const color = data.settings[`level${i}`];
                if (colorInput && color) {
                    colorInput.value = color;
                }
            }
        }
    });
}

// 現在のタブでスタイルを適用する関数
function applyStylesOnCurrentTab(settings: Record<string, string>) {
    const css = Object.keys(settings).map(level => 
        `.ContributionCalendar-day[data-level="${level.replace('level', '')}"] { fill: ${settings[level]}; }`
    ).join('\n');

    chrome.tabs.executeScript({
        code: `
            const styleSheet = document.createElement("style");
            styleSheet.type = "text/css";
            styleSheet.innerText = \`${css}\`;
            document.head.appendChild(styleSheet);
        `
    });
}

// ページの読み込みが完了したら設定をロードする
window.onload = loadSettings;

document.getElementById('save')?.addEventListener('click', function() {
    let settings: Record<string, string> = {};

    for (let i = 0; i <= 4; i++) {
        const colorInput = document.getElementById(`level${i}`) as HTMLInputElement;
        if (colorInput) {
            settings[`level${i}`] = colorInput.value;
        }
    }

    console.log("Saving settings:", settings);
    chrome.storage.local.set({ settings: settings }, () => {
        applyStylesOnCurrentTab(settings); // 保存後に現在のタブでスタイルを適用
        window.close();  // ポップアップを閉じる
    });
});
