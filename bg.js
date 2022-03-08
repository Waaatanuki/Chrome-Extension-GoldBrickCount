chrome.webRequest.onCompleted.addListener(
    function (details) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            console.log("count start");
            tabs.length != 0 && chrome.tabs.sendMessage(tabs[0].id, { todo: "count" });
        });
    },
    { urls: ["*://game.granbluefantasy.jp/resultmulti/data/*"] }
);
