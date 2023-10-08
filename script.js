document.addEventListener("DOMContentLoaded", function() {
    chrome.storage.local.get('settings', function(data) {
        if (!data.settings) {
            chrome.runtime.sendMessage({ action: "getDefaultColor" }, function(response) {
                document.getElementById('level0').value = response.colorL0;
                document.getElementById('level1').value = response.colorL1;
                document.getElementById('level2').value = response.colorL2;
                document.getElementById('level3').value = response.colorL3;
                document.getElementById('level4').value = response.colorL4;
            });
        }
    });
});
