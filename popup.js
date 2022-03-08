const button = document.getElementById("import");

button.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        console.log("go import");
        tabs.length != 0 && chrome.tabs.sendMessage(tabs[0].id, { todo: "import" });
    });
});
