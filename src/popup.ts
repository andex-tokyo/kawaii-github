function getElementById<T extends HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
}

function loadSettings() {
    chrome.storage.local.get('settings', (data) => {
        if (!data.settings) return;

        for (let i = 0; i <= 4; i++) {
            const colorValue = data.settings[`level${i}`];
            const imageData = data.settings[`level${i}_img`];

            setElementValue(`level${i}`, colorValue);
            setImageSource(`level${i}_img_preview`, imageData);
        }
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
            alert("正方形の画像のみ対応しております。\nアップロードされた画像のサイズは"+img.width+"x"+img.height+"px です。");
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

        // 画像のURLをチェック
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
    const defaultColors = {
        level0: "#161B22",
        level1: "#0e4429",
        level2: "#006d32",
        level3: "#26a641",
        level4: "#39d353"
    };
    
    // 画像を削除する処理
    for (let i = 0; i <= 4; i++) {
        setImageSource(`level${i}_img_preview`, null);
    }

    chrome.storage.local.set({ settings: defaultColors }, () => {
        window.close();
    });
}

window.onload = () => {
    loadSettings();
    initializeEventListeners();
};
