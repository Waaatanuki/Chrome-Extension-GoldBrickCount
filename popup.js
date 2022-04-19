const importButton = document.getElementById("import");
const exportButton = document.getElementById("export");
const importItemButton = document.getElementById("importItem");
const exportItemButton = document.getElementById("exportItem");

importButton.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // console.log("import start");
        tabs.length != 0 && chrome.tabs.sendMessage(tabs[0].id, { todo: "import" });
    });
});
exportButton.addEventListener("click", function () {
    chrome.storage.sync.get(null, function (result) {
        const data = [];
        for (const k in result) {
            if (Object.hasOwnProperty.call(result, k)) {
                data.push({ [k]: result[k] });
            }
        }
        exportJSONFile(data);

        chrome.storage.sync.clear(() => {
            console.log("导出成功,并清空chrome storage。");
        });
    });
});
importItemButton.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // console.log("import start");
        tabs.length != 0 && chrome.tabs.sendMessage(tabs[0].id, { todo: "importItem" });
    });
});
exportItemButton.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // console.log("import start");
        tabs.length != 0 && chrome.tabs.sendMessage(tabs[0].id, { todo: "exportItem" });
    });
});

function exportJSONFile(itemList) {
    if (itemList.length == 0) {
        alert("没有数据");
    } else {
        const data = JSON.stringify(itemList);
        let content = new Blob([data]);
        let urlObject = window.URL || window.webkitURL || window;
        let url = urlObject.createObjectURL(content);
        let el = document.createElement("a");
        el.href = url;
        el.download = "gbfApp_金本统计数据.json";
        el.click();
        urlObject.revokeObjectURL(url);
    }
}
// const showButton = document.getElementById("show");
// showButton.addEventListener("click", function () {
//     chrome.storage.sync.get(null, function (result) {
//         console.log(result);
//     });
//     chrome.storage.sync.clear(() => {
//         console.log("导入成功,并清空chrome storage。");
//     });
// });
