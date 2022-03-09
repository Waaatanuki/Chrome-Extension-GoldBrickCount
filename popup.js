const button = document.getElementById("import");

button.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // console.log("import start");
        tabs.length != 0 && chrome.tabs.sendMessage(tabs[0].id, { todo: "import" });
    });
});
// const showButton = document.getElementById("show");
// showButton.addEventListener("click", function () {
//     chrome.storage.sync.get(null, function (result) {
//         console.log(result);
//     });
//     chrome.storage.sync.clear(() => {
//         console.log("导入成功,并清空chrome storage。");
//     });
// });
