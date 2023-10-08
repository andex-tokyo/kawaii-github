chrome.storage.local.get('settings', function(data) {
    console.log("Loaded settings:", data.settings);
    
    if (data.settings) {
        let css = '';
        for (let i = 0; i <= 4; i++) {
            const color = data.settings[`level${i}`];
            if (color) {
                css += `.ContributionCalendar-day[data-level="${i}"] { fill: ${color}; background-color:${color}}\n`;
            }
        }

        console.log("Applying styles:", css);

        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = css;
        document.head?.appendChild(styleSheet);
    }
});
