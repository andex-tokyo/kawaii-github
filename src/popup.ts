chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0].id) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: changeBackgroundColor
      });
    }
  });
  
  function changeBackgroundColor() {
    document.body.style.backgroundColor = "lightblue";
  }
  