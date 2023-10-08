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
    }
});

