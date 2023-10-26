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

let currentLevel = "";

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
      previewElem.style.backgroundColor = "transparent"; // 画像がある場合は背景色を透明に
    } else if (previewElem) {
      previewElem.style.backgroundImage = "";
      previewElem.textContent = "";
      if (settings[levelKey]) {
        // 画像がなく、色がある場合は背景色を再設定
        previewElem.style.backgroundColor = settings[levelKey];
      }
    }
  }
}

// Event Handlers
function handleChoice(choice: string) {
  const dropdown = getElementById<HTMLDivElement>("customDropdown");
  if (dropdown) dropdown.style.display = "none";

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

function processImage(
  input: File | string,
  width: number,
  height: number,
  callback: (base64: string) => void
) {
  const img = new Image();
  img.onload = function () {
    const canvas = createCanvasContext(width, height);
    const ctx = canvas.getContext("2d");
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

function handleImageUpload(
  inputElement: HTMLInputElement,
  previewElement: HTMLDivElement | null
) {
  const file = inputElement.files?.[0];
  if (!file || !previewElement) return;

  processImage(file, 30, 30, (dataUrl) => {
    previewElement.style.backgroundImage = `url(${dataUrl})`;

    const hiddenImageInputElement = getElementById<HTMLInputElement>(
      `${currentLevel}_img_hidden`
    );
    if (hiddenImageInputElement) {
      hiddenImageInputElement.value = dataUrl;
    }
  });
}

function showOptions(level: string) {
  const previewElem = getElementById<HTMLDivElement>(`${level}_preview`);
  const dropdown = getElementById<HTMLDivElement>("customDropdown");

  if (dropdown && previewElem) {
    const rect = previewElem.getBoundingClientRect();
    const popupWidth = window.innerWidth;
    const popupHeight = window.innerHeight;
    const dropdownWidth = dropdown.offsetWidth;
    const dropdownHeight = dropdown.offsetHeight;

    let left = rect.left;
    let top = rect.top + rect.height;

    // ドロップダウンが右端からはみ出る場合
    if (left + dropdownWidth > popupWidth) {
      left = popupWidth - dropdownWidth;
    }

    // ドロップダウンが下端からはみ出る場合
    if (top + dropdownHeight > popupHeight) {
      top = popupHeight - dropdownHeight;
    }

    dropdown.style.display = "block";
    dropdown.style.left = `${left}px`;
    dropdown.style.top = `${top}px`;

    currentLevel = level;
  }
}

function updateColorPreview(
  colorInput: HTMLInputElement,
  previewElement: HTMLDivElement | null
) {
  if (previewElement) {
    previewElement.style.backgroundColor = colorInput.value;
    previewElement.style.backgroundImage = ""; // 背景画像をクリア

    // 関連する隠しのinput要素の画像のデータURLもクリア
    const hiddenImageInputElement = getElementById<HTMLInputElement>(
      `${currentLevel}_img_hidden`
    );
    if (hiddenImageInputElement) {
      hiddenImageInputElement.value = "";
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

    if (previewElem)
      previewElem.addEventListener("click", () => showOptions(levelId));
    if (colorInput)
      colorInput.addEventListener("change", () =>
        updateColorPreview(colorInput, previewElem)
      );
    if (imageInput)
      imageInput.addEventListener("change", () =>
        handleImageUpload(imageInput, previewElem)
      );
  }

  getElementById("colorChoice")?.addEventListener("click", () =>
    handleChoice("色を選択")
  );
  getElementById("imageChoice")?.addEventListener("click", () =>
    handleChoice("画像をアップロード")
  );
  getElementById("save")?.addEventListener("click", saveSettings);
  getElementById("set_default")?.addEventListener("click", setDefaultSettings);
}

// Load and Save Functions
function loadSettings() {
  chrome.storage.local.get("settings", (result) => {
    const settings = result.settings;

    if (!settings) fetchDefaultSettingsAndUpdateUI();
    else updateUI(settings);
  });
}

function fetchDefaultSettingsAndUpdateUI() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) return;
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "getDefaultColor" },
      (response) => {
        if (!response) return;
        const settings: Settings = {
          level0: response.colorL0,
          level1: response.colorL1,
          level2: response.colorL2,
          level3: response.colorL3,
          level4: response.colorL4,
        };

        for (let i = 0; i <= 4; i++) {
          const levelKey = `level${i}`;
          const hiddenImageInputElement = getElementById<HTMLInputElement>(
            `${levelKey}_img_hidden`
          );
          if (hiddenImageInputElement) {
            hiddenImageInputElement.value = "";
          }
          settings[`${levelKey}_img`] = "";
        }
        updateUI(settings);
      }
    );
  });
}

// 初期化関数の中でプリセットを読み込む
function loadPresets() {
  fetch("./preset/preset.json")
    .then((response) => response.json())
    .then((presets) => {
      const dropdown = getElementById<HTMLSelectElement>("presetDropdown");
      presets.forEach((preset: Preset) => {
        const option = document.createElement("option");
        option.value = JSON.stringify(preset);
        option.textContent = preset.name;
        if (dropdown) {
          dropdown.appendChild(option);
        }
      });

      if (dropdown) {
        dropdown.addEventListener("change", (event) => {
          // `event.target`を`HTMLSelectElement`として扱う
          const targetElement = event.target as HTMLSelectElement;

          // nullチェックを追加
          if (!targetElement) return;
          const selectedPreset = JSON.parse(targetElement.value);

          // 選択されたプリセットの色と画像を反映
          for (let i = 0; i <= 4; i++) {
            const levelKey = `level${i}`;
            // 前の設定をクリア
            setElementValue(levelKey, "");
            const hiddenImageInputElement = getElementById<HTMLInputElement>(
              `${levelKey}_img_hidden`
            );
            if (hiddenImageInputElement) {
              hiddenImageInputElement.value = "";
            }
            const previewElem = getElementById<HTMLDivElement>(
              `${levelKey}_preview`
            );
            if (previewElem) {
              previewElem.style.backgroundImage = "";
              previewElem.style.backgroundColor = "";
            }

            // 画像があればそれを優先して反映、なければ色を反映
            if (selectedPreset[`${levelKey}_img`]) {
              processImage(
                selectedPreset[`${levelKey}_img`],
                30,
                30,
                (base64) => {
                  if (previewElem) {
                    previewElem.style.backgroundImage = `url(${base64})`;
                  }
                  const hiddenImageInputElement =
                    getElementById<HTMLInputElement>(`${levelKey}_img_hidden`);
                  if (hiddenImageInputElement) {
                    hiddenImageInputElement.value = base64;
                  }
                }
              );
            } else {
              setElementValue(levelKey, selectedPreset[levelKey]);
              if (previewElem) {
                previewElem.style.backgroundColor = selectedPreset[levelKey];
              }
            }
          }
        });
      }
    });
}

function saveSettings() {
  // 既存の設定を読み込む
  chrome.storage.local.get("settings", (result) => {
    console.log("Initial settings from storage: ", result.settings); // ポイント1
    const settings: Settings = result.settings || {};

    for (let i = 0; i <= 4; i++) {
      const levelKey = `level${i}`;

      // 色の情報を取得
      const colorValue =
        getElementById<HTMLInputElement>(levelKey)?.value || "";

      console.log(`Initial ${levelKey} color value: ${colorValue}`); // ポイント2

      // 画像の情報を取得
      const hiddenImageInputElement = getElementById<HTMLInputElement>(
        `${levelKey}_img_hidden`
      );

      // 画像が選択されているか確認
      if (hiddenImageInputElement && hiddenImageInputElement.value) {
        console.log(
          `New image value for ${levelKey}: ${hiddenImageInputElement.value}`
        ); // ポイント2
        settings[`${levelKey}_img`] = hiddenImageInputElement.value;
      } else {
        settings[`${levelKey}_img`] = undefined;
        settings[levelKey] = colorValue; // 画像が選択されていない場合のみ、色の情報を保存
      }
    }

    console.log("Final settings to be saved: ", settings); // ポイント3

    // 新しい設定を保存する
    chrome.storage.local.set({ settings }, () => {
      loadSettings();
    });
  });
}

function applyFirstTimeUI() {
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");

  const makeItKawaiiBtn = document.createElement("button");
  makeItKawaiiBtn.id = "makeItKawaiiBtn";
  makeItKawaiiBtn.innerText = "Make it Kawaii";
  makeItKawaiiBtn.onclick = () => {
    // 最初にタブをリロード
    chrome.tabs.reload(() => {
      fetch("./preset/preset.json")
        .then((response) => response.json())
        .then((presets) => {
          const preset1 = presets[0];

          // すべての画像の処理を非同期で待つ
          const promises = [];
          for (let i = 0; i <= 4; i++) {
            const levelKey = `level${i}`;
            if (preset1[`${levelKey}_img`]) {
              promises.push(
                new Promise<void>((resolve) => {
                  processImage(preset1[`${levelKey}_img`], 30, 30, (base64) => {
                    const previewElem = getElementById<HTMLDivElement>(
                      `${levelKey}_preview`
                    );
                    if (previewElem) {
                      previewElem.style.backgroundImage = `url(${base64})`;
                    }
                    const hiddenImageInputElement =
                      getElementById<HTMLInputElement>(
                        `${levelKey}_img_hidden`
                      );
                    if (hiddenImageInputElement) {
                      hiddenImageInputElement.value = base64;
                    }
                    resolve();
                  });
                })
              );
            }
          }

          // すべての画像の処理が完了したらUIを更新して設定を保存
          Promise.all(promises).then(() => {
            updateUI(preset1);
            saveSettings();
            overlay.remove();
          });
        });
    });
  };

  const skipBtn = document.createElement("button");
  skipBtn.id = "skipBtn";
  skipBtn.innerText = "Skip";
  skipBtn.onclick = () => {
    // スキップボタンを押したときもタブをリロードする
    chrome.tabs.reload(() => {
      overlay.remove();
    });
  };

  overlay.appendChild(makeItKawaiiBtn);
  overlay.appendChild(skipBtn);
  document.body.appendChild(overlay);
}

function setDefaultSettings() {
  fetchDefaultSettingsAndUpdateUI();
}

function isGithubProfilePage(url: string) {
  const regex = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+(?:\?.+|#.+)?$/;
  return regex.test(url);
}

// Initialize
window.onload = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    if (currentTab.url) {
      // GitHubのプロフィールページでない場合
      if (!isGithubProfilePage(currentTab.url)) {
        document.body.style.margin = "0";
        document.body.style.display = "flex";
        document.body.style.justifyContent = "center";
        document.body.style.alignItems = "center";
        document.body.style.height = "100vh";
        document.body.style.width = "300px";
        document.body.style.fontSize = "18px";
        document.body.style.fontFamily = "Arial, sans-serif";
        document.body.style.textAlign = "center";
        document.body.style.backgroundColor = "#f6f8fa";

        document.body.innerHTML = `
                <div style="text-align: center;">
                    Please Open at GitHub Profile Page <br>
                    <a href="https://github.com/" target="_blank">
                    <i class="fab fa-github" style="color: #000000;font-size: 15px; margin-top: 15px"></i>
                    </a>
                </div>
                `;
        return;
      }
    }

    // 初回起動を確認
    chrome.storage.local.get("isFirstTime", (result) => {
      if (result.isFirstTime) {
        applyFirstTimeUI();
        chrome.storage.local.set({ isFirstTime: false });
      }
    });
    chrome.storage.local.get("isFirstTimeUpdate", (result) => {
      if (result.isFirstTime) {
        chrome.tabs.reload();
        chrome.storage.local.set({ isFirstTimeUpdate: false });
      }
    });
    loadSettings();
    loadPresets();
    initializeEventListeners();
  });
};
