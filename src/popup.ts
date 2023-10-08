function getElementById<T extends HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
}

function loadSettings() {
    chrome.storage.local.get('settings', (result) => {
        let settings = result.settings;

        if (!settings) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "getDefaultColor" }, (response) => {
                        settings = {
                            level0: response.colorL0,
                            level1: response.colorL1,
                            level2: response.colorL2,
                            level3: response.colorL3,
                            level4: response.colorL4
                        };
                    });
                }
            });
        }

        setTimeout(() => {
            for (let i = 0; i <= 4; i++) {
                const colorValue = settings[`level${i}`];
                const imageData = settings[`level${i}_img`];
                setElementValue(`level${i}`, colorValue);
                setImageSource(`level${i}_img_preview`, imageData);
            }
        }, 50); // 色と画像を設定する前に少し待つ
    });
}

function setElementValue(id: string, value: string | null) {
    const elem = getElementById<HTMLInputElement>(id);
    if (elem && value) elem.value = value;
}

function setImageSource(id: string, src: string | null) {
    const imgElem = getElementById<HTMLImageElement>(id);
    if (imgElem) imgElem.src = src || '';
}

function handleImageUpload(inputElement: HTMLInputElement, previewElement: HTMLImageElement) {
    const file = inputElement.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = function() {
        if (img.width !== img.height) {
            alert("正方形の画像のみ対応しております。\nアップロードされた画像のサイズは" + img.width + "x" + img.height + "px です。");
            return;
        }

        const ctx = createCanvasContext(30, 30);
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, 30, 30);
        previewElement.src = ctx.canvas.toDataURL();
    };
    img.src = URL.createObjectURL(file);
}

function createCanvasContext(width: number, height: number): CanvasRenderingContext2D | null {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas.getContext("2d");
}

function initializeEventListeners() {
    for (let i = 0; i <= 4; i++) {
        getElementById<HTMLInputElement>(`level${i}_img`)?.addEventListener('change', function(evt) {
            const target = evt.target as HTMLInputElement;
            const previewElem = getElementById<HTMLImageElement>(`level${i}_img_preview`);
            if (previewElem) handleImageUpload(target, previewElem);
        });

        getElementById(`delete_level${i}_img`)?.addEventListener('click', () => {
            setImageSource(`level${i}_img_preview`, null);
        });
    }

    getElementById('save')?.addEventListener('click', saveSettings);
    getElementById('set_default')?.addEventListener('click', setDefaultSettings);
}

function saveSettings() {
    const settings: Record<string, string | null> = {};

    for (let i = 0; i <= 4; i++) {
        settings[`level${i}`] = getElementById<HTMLInputElement>(`level${i}`)?.value || '';

        const imgURL = getElementById<HTMLImageElement>(`level${i}_img_preview`)?.src || '';
        if (imgURL && imgURL.includes('data:image/')) {
            settings[`level${i}_img`] = imgURL;
        }
    }

    chrome.storage.local.set({ settings }, () => {
        window.close();
    });
}

function setDefaultSettings() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "getDefaultColor" }, (response) => {
                console.log("Detected background color:", response);

                let settings: Record<string, string> = {};
                settings = {
                    level0: response.colorL0,
                    level1: response.colorL1,
                    level2: response.colorL2,
                    level3: response.colorL3,
                    level4: response.colorL4
                };
                for (let i = 0; i <= 4; i++) {
                    setImageSource(`level${i}_img_preview`, null);
                }

                console.log("Saving settings:", settings);
                chrome.storage.local.set({ settings: settings }, () => {
                });
            });
        }
    });
}

window.onload = () => {
    loadSettings();
    initializeEventListeners();
};
