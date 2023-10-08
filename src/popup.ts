type Settings = {
    [key: string]: string | undefined;
    level0?: string;
    level1?: string;
    level2?: string;
    level3?: string;
    level4?: string;
    level0_img?: string;
    level1_img?: string;
    level2_img?: string;
    level3_img?: string;
    level4_img?: string;
};
type Preset = {
    name: string;
    level0?: string;
    level1?: string;
    level2?: string;
    level3?: string;
    level4?: string;
    level0_img?: string;
    level1_img?: string;
    level2_img?: string;
    level3_img?: string;
    level4_img?: string;
};

let currentLevel = ''; 
// Utility Functions
function getElementById<T extends HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
}

function setElementValue(id: string, value: string | null) {
    const elem = getElementById<HTMLInputElement>(id);
    if (elem && value) elem.value = value;
}

// UI Update Functions
function updateUI(settings: any) {
    for (let i = 0; i <= 4; i++) {
        const levelKey = `level${i}`;
        const previewElem = getElementById<HTMLDivElement>(`${levelKey}_preview`);
        
        if (settings[levelKey]) {
            setElementValue(levelKey, settings[levelKey]);
            if (previewElem) previewElem.style.backgroundColor = settings[levelKey];
        }

        if (settings[`${levelKey}_img`] && previewElem) {
            previewElem.style.backgroundImage = `url(${settings[`${levelKey}_img`]})`;
            previewElem.textContent = "";
        } else if (previewElem) {
            previewElem.style.backgroundImage = '';
            previewElem.textContent = '';
        }
    }
}

// Event Handlers
function handleChoice(choice: string) {
    const dropdown = getElementById<HTMLDivElement>('customDropdown');
    if (dropdown) dropdown.style.display = 'none';

    const colorInput = getElementById<HTMLInputElement>(`${currentLevel}`);
    const imageInput = getElementById<HTMLInputElement>(`${currentLevel}_img`);

    if (choice === "色を選択" && colorInput) colorInput.click();
    if (choice === "画像をアップロード" && imageInput) imageInput.click();
}

function createCanvasContext(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

function processImage(input: File | string, width: number, height: number, callback: (base64: string) => void) {
    const img = new Image();
    img.onload = function() {
        const canvas = createCanvasContext(width, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, width, height); 
        const dataUrl = canvas.toDataURL();
        callback(dataUrl);
    };

    if (typeof input === "string") {
        img.src = input;
    } else {
        img.src = URL.createObjectURL(input);
    }
}

function handleImageUpload(inputElement: HTMLInputElement, previewElement: HTMLDivElement | null) {
    const file = inputElement.files?.[0];
    if (!file || !previewElement) return;

    processImage(file, 30, 30, (dataUrl) => {
        previewElement.style.backgroundImage = `url(${dataUrl})`;

        const hiddenImageInputElement = getElementById<HTMLInputElement>(`${currentLevel}_img_hidden`);
        if (hiddenImageInputElement) {
            hiddenImageInputElement.value = dataUrl;
        }
    });
}



function showOptions(level: string) {
    const previewElem = getElementById<HTMLDivElement>(`${level}_preview`);
    const dropdown = getElementById<HTMLDivElement>('customDropdown');
    
    if (dropdown && previewElem) {
        const rect = previewElem.getBoundingClientRect();
        const popupWidth = window.innerWidth;
        const popupHeight = window.innerHeight;
        const dropdownWidth = dropdown.offsetWidth;
        const dropdownHeight = dropdown.offsetHeight;

        let left = rect.left;
        let top = (rect.top + rect.height);

        // ドロップダウンが右端からはみ出る場合
        if (left + dropdownWidth > popupWidth) {
            left = popupWidth - dropdownWidth;
        }

        // ドロップダウンが下端からはみ出る場合
        if (top + dropdownHeight > popupHeight) {
            top = popupHeight - dropdownHeight;
        }
        
        dropdown.style.display = 'block';
        dropdown.style.left = `${left}px`;
        dropdown.style.top = `${top}px`;
        
        currentLevel = level;
    }
}
function updateColorPreview(colorInput: HTMLInputElement, previewElement: HTMLDivElement | null) {
    if (previewElement) {
        previewElement.style.backgroundColor = colorInput.value;
        previewElement.style.backgroundImage = ''; // 背景画像をクリア

        // 関連する隠しのinput要素の画像のデータURLもクリア
        const hiddenImageInputElement = getElementById<HTMLInputElement>(`${currentLevel}_img_hidden`);
        if (hiddenImageInputElement) {
            hiddenImageInputElement.value = '';
        }
    }
}

// Initialization Functions
function initializeEventListeners() {
    for (let i = 0; i <= 4; i++) {
        const levelId = `level${i}`;
        const colorInput = getElementById<HTMLInputElement>(levelId);
        const imageInput = getElementById<HTMLInputElement>(`${levelId}_img`);
        const previewElem = getElementById<HTMLDivElement>(`${levelId}_preview`);
        
        if (previewElem) previewElem.addEventListener('click', () => showOptions(levelId));
        if (colorInput) colorInput.addEventListener('change', () => updateColorPreview(colorInput, previewElem));
        if (imageInput) imageInput.addEventListener('change', () => handleImageUpload(imageInput, previewElem));
    }

    getElementById('colorChoice')?.addEventListener('click', () => handleChoice('色を選択'));
    getElementById('imageChoice')?.addEventListener('click', () => handleChoice('画像をアップロード'));
    getElementById('save')?.addEventListener('click', saveSettings);
    getElementById('set_default')?.addEventListener('click', setDefaultSettings);
}

// Load and Save Functions
function loadSettings() {
    chrome.storage.local.get('settings', (result) => {
        console.log(result);
        const settings = result.settings;

        if (!settings) fetchDefaultSettingsAndUpdateUI();
        else updateUI(settings);
    });
}

function fetchDefaultSettingsAndUpdateUI() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]?.id) return console.log("No active tab found.");

        chrome.tabs.sendMessage(tabs[0].id, { action: "getDefaultColor" }, (response) => {
            if (!response) return console.log("Error in receiving the response.");

            const settings: Settings = {
                level0: response.colorL0,
                level1: response.colorL1,
                level2: response.colorL2,
                level3: response.colorL3,
                level4: response.colorL4,
            };
            

            for (let i = 0; i <= 4; i++) {
                const levelKey = `level${i}`;
                const hiddenImageInputElement = getElementById<HTMLInputElement>(`${levelKey}_img_hidden`);
                if (hiddenImageInputElement) {
                    hiddenImageInputElement.value = '';
                }
                settings[`${levelKey}_img`] = '';
            }
            updateUI(settings);
        });
    });
}

// 初期化関数の中でプリセットを読み込む
function loadPresets() {
    fetch('./preset/preset.json')
        .then(response => response.json())
        .then(presets => {
            const dropdown = getElementById<HTMLSelectElement>('presetDropdown');
            presets.forEach((preset: Preset) => {
                const option = document.createElement('option');
                option.value = JSON.stringify(preset);
                option.textContent = preset.name;
                if (dropdown) {
                    dropdown.appendChild(option);
                }
            });

            if (dropdown) {
                dropdown.addEventListener('change', (event) => {
                    // `event.target`を`HTMLSelectElement`として扱う
                    const targetElement = event.target as HTMLSelectElement;
            
                    // nullチェックを追加
                    if (!targetElement) return;
                    console.log(targetElement.value);
                    const selectedPreset = JSON.parse(targetElement.value);
                    
                    // 選択されたプリセットの色と画像を反映
                    for (let i = 0; i <= 4; i++) {
                        const levelKey = `level${i}`;
                        // 前の設定をクリア
                        setElementValue(levelKey, "");
                        const hiddenImageInputElement = getElementById<HTMLInputElement>(`${levelKey}_img_hidden`);
                        if (hiddenImageInputElement) {
                            hiddenImageInputElement.value = '';
                        }
                        const previewElem = getElementById<HTMLDivElement>(`${levelKey}_preview`);
                        if (previewElem) {
                            previewElem.style.backgroundImage = '';
                            previewElem.style.backgroundColor = '';
                        }
        
                        // 画像があればそれを優先して反映、なければ色を反映
                        if (selectedPreset[`${levelKey}_img`]) {
                            processImage(selectedPreset[`${levelKey}_img`], 30, 30, (base64) => {
                                if (previewElem) {
                                    previewElem.style.backgroundImage = `url(${base64})`;
                                }
                                const hiddenImageInputElement = getElementById<HTMLInputElement>(`${levelKey}_img_hidden`); 
                                if (hiddenImageInputElement) {
                                    hiddenImageInputElement.value = base64;
                                }
                            });
                        } else {
                            setElementValue(levelKey, selectedPreset[levelKey]);
                            if (previewElem) {
                                previewElem.style.backgroundColor = selectedPreset[levelKey];
                            }
                        }
                    }
                });
            }
        }
    );
}

function saveSettings() {
    const settings: Settings = {};

    for (let i = 0; i <= 4; i++) {
        const levelKey = `level${i}`;

        // 色の情報を取得
        const colorValue = getElementById<HTMLInputElement>(levelKey)?.value || '';
        settings[levelKey] = colorValue;

        // 画像の情報を取得
        const hiddenImageInputElement = getElementById<HTMLInputElement>(`${levelKey}_img_hidden`);
        if (hiddenImageInputElement && hiddenImageInputElement.value) {
            settings[`${levelKey}_img`] = hiddenImageInputElement.value;
            settings[levelKey] = undefined;  // 画像が選択されている場合、色の情報を消去
        } else {
            settings[`${levelKey}_img`] = undefined;  // 画像が選択されていない場合、画像情報を消去
        }
    }

    chrome.storage.local.set({ settings }, () => {
        loadSettings();
        window.close();
    });
}

function applyFirstTimeUI() {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    const makeItKawaiiBtn = document.createElement('button');
    makeItKawaiiBtn.innerText = 'Make it Kawaii';
    makeItKawaiiBtn.style.fontSize = '28px';
    makeItKawaiiBtn.style.marginBottom = '15px';
    makeItKawaiiBtn.style.border = 'none';
    makeItKawaiiBtn.style.borderRadius = '25px';
    makeItKawaiiBtn.style.padding = '15px 35px';
    makeItKawaiiBtn.style.background = 'linear-gradient(45deg, #FF69B4, #FF1493, #FF69B4)'; // ピンクのグラデーション
    makeItKawaiiBtn.style.color = 'white';
    makeItKawaiiBtn.style.textShadow = '2px 2px 4px #000000';  // テキストに黒の影を追加
    makeItKawaiiBtn.style.boxShadow = '0px 5px 20px rgba(0, 0, 0, 0.4)';
    makeItKawaiiBtn.style.cursor = 'pointer';
    makeItKawaiiBtn.style.transition = 'transform 0.2s, background 0.3s';
    makeItKawaiiBtn.onmouseover = () => {
        makeItKawaiiBtn.style.transform = 'scale(1.1)';
        makeItKawaiiBtn.style.background = 'linear-gradient(45deg, #FF4500, #FF6347, #FF4500)'; // オーバー時に色をオレンジに変更
    };
    makeItKawaiiBtn.onmouseout = () => {
        makeItKawaiiBtn.style.transform = 'scale(1)';
        makeItKawaiiBtn.style.background = 'linear-gradient(45deg, #FF69B4, #FF1493, #FF69B4)'; // マウスが外れた時にピンクに戻す
    };
    makeItKawaiiBtn.onclick = () => {
        // 以前の処理はそのまま
        fetch('./preset/preset.json')
            .then(response => response.json())
            .then(presets => {
                const preset1 = presets[0];
                updateUI(preset1);
                saveSettings();
                overlay.remove();
            });
    };

    const skipBtn = document.createElement('button');
    skipBtn.innerText = 'Skip';
    skipBtn.style.opacity = '0.7';
    skipBtn.style.border = 'none';
    skipBtn.style.backgroundColor = 'transparent';
    skipBtn.style.cursor = 'pointer';
    skipBtn.style.fontSize = '16px'; // テキストのサイズを小さく
    skipBtn.style.color = '#b0b0b0'; // 薄いグレーのテキストカラー
    skipBtn.style.borderBottom = '1px dashed #b0b0b0'; // 薄いグレーの点線の下線
    skipBtn.style.marginTop = '10px';
    skipBtn.onmouseover = () => skipBtn.style.opacity = '1'; // マウスオーバー時の明るさを増す
    skipBtn.onmouseout = () => skipBtn.style.opacity = '0.7'; // マウスが外れた時に明るさを元に戻す
    skipBtn.onclick = () => {
        overlay.remove();
    }

    overlay.appendChild(makeItKawaiiBtn);
    overlay.appendChild(skipBtn);
    document.body.appendChild(overlay);
}


function setDefaultSettings() {
    fetchDefaultSettingsAndUpdateUI();
}

// Initialize
window.onload = () => {
    // 初回起動を確認
    chrome.storage.local.get('isFirstTime', (result: { isFirstTime?: boolean }) => {
        if (result.isFirstTime) {
            applyFirstTimeUI();
            chrome.storage.local.set({ isFirstTime: false }); // フラグをリセット
        }
    });
    loadSettings();
    loadPresets();
    initializeEventListeners();
};
