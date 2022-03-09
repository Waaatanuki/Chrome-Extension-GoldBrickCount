const re = /granbluefantasy.jp\/#result_multi\/[0-9]+/;

const setBadge = function () {
    chrome.storage.sync.get(null, function (items) {
        const total = Object.keys(items).length;
        const color = total <= 100 ? "#25b506" : total <= 200 ? "#becc00" : "#be0000";
        chrome.action.setBadgeText({ text: total.toString() }, function () {
            chrome.action.setBadgeBackgroundColor({ color });
        });
    });
};

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.hasOwnProperty("status") && changeInfo.status == "complete" && re.test(tab.url)) {
        chrome.tabs.query({ active: true, currentWindow: true, status: "complete" }, function (tabs) {
            // console.log("count!");
            chrome.tabs.sendMessage(tabId, { todo: "count" });
        });
    }
});

chrome.runtime.onInstalled.addListener(() => setBadge());

chrome.storage.onChanged.addListener(() => setBadge());
