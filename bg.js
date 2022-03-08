chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (
        changeInfo.hasOwnProperty("status") &&
        changeInfo.status == "complete" &&
        tab.url.indexOf("granbluefantasy.jp/#result_multi") != -1 &&
        tab.url.indexOf("empty") == -1
    ) {
        console.log(tab);
        console.log(changeInfo);
        chrome.tabs.query({ active: true, currentWindow: true, status: "complete" }, function (tabs) {
            console.log("count start");
            chrome.tabs.sendMessage(tabId, { todo: "count" });
        });
    }
});
