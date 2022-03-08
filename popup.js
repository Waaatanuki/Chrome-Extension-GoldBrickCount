const button = document.getElementById("import");

button.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        console.log("import start");
        tabs.length != 0 && chrome.tabs.sendMessage(tabs[0].id, { todo: "import" });
    });
});

{
    const TARGET_ITEM = [546, 59, 79, 534, 138];
    const RAID_NAME = ["大公", "大巴", "大巴", "阿卡夏", "超巴"];

    for (let i = 0; i < TARGET_ITEM.length; i++) {
        if (document.querySelector("div.prt-item-list div[data-item-id='" + TARGET_ITEM[i] + "']")) {
            RAID_NAME[i];
        }
    }
}
