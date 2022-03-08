chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.todo == "count") {
        console.log("加载插件");
        console.log(document.querySelector(".prt-item-list"));
        chrome.storage.sync.set({ 213331: "baha" }, function () {
            console.log("Value is set to tome");
        });
    }
    if (message.todo == "import") {
        const DBOpenRequest = window.indexedDB.open("gbfApp");
        var db;
        const jsonstr = {
            BlueChests: [
                { 0: { name: "baha", age: 0 } },
                { 1: { name: "akx", age: 1 } },
                { 2: { name: "haha", age: 2 } },
            ],
        };
        DBOpenRequest.onupgradeneeded = function (event) {
            db = event.target.result;
            if (!db.objectStoreNames.contains("BlueChests")) {
                console.log(123);
                db.createObjectStore("BlueChests");
            }
        };
        DBOpenRequest.onsuccess = async function (event) {
            db = DBOpenRequest.result;

            importFromJson(db, JSON.stringify(jsonstr), function (err) {
                if (!err) {
                    console.log("Imported data successfully");
                }
            });
        };
    }
    return true;
});

const importFromJson = function (idbDatabase, jsonString, cb) {
    console.log(idbDatabase);
    const objectStoreNamesSet = new Set(idbDatabase.objectStoreNames);
    console.log(objectStoreNamesSet);
    const size = objectStoreNamesSet.size;
    if (size === 0) {
        cb(null);
    } else {
        const objectStoreNames = Array.from(objectStoreNamesSet);
        const transaction = idbDatabase.transaction(objectStoreNames, "readwrite");
        transaction.onerror = event => cb(event);

        const importObject = JSON.parse(jsonString);

        // Delete keys present in JSON that are not present in database
        Object.keys(importObject).forEach(storeName => {
            if (!objectStoreNames.includes(storeName)) {
                delete importObject[storeName];
            }
        });

        if (Object.keys(importObject).length === 0) {
            // no object stores exist to import for
            cb(null);
        }

        objectStoreNames.forEach(storeName => {
            let count = 0;

            const aux = Array.from(importObject[storeName] || []);
            console.log(aux);
            if (importObject[storeName] && aux.length > 0) {
                aux.forEach(toAdd => {
                    console.log(Object.keys(toAdd)[0]);
                    const request = transaction
                        .objectStore(storeName)
                        .add(toAdd[Object.keys(toAdd)[0]], Object.keys(toAdd)[0]);
                    request.onsuccess = () => {
                        count++;
                        if (count === importObject[storeName].length) {
                            // added all objects for this store
                            delete importObject[storeName];
                            if (Object.keys(importObject).length === 0) {
                                // added all object stores
                                cb(null);
                            }
                        }
                    };
                    request.onerror = event => {
                        console.log(event);
                    };
                });
            } else {
                if (importObject[storeName]) {
                    delete importObject[storeName];
                    if (Object.keys(importObject).length === 0) {
                        // added all object stores
                        cb(null);
                    }
                }
            }
        });
    }
};

function init() {
    const formdata = {
        parentQid: document.URL.split("/")[document.URL.split("/").indexOf("summary") + 1],
        sid: document.getElementById("sid").value,
        startrange: parseInt(document.getElementById("startrange").value),
        endrange: parseInt(document.getElementById("endrange").value),
        maxrange: parseInt(document.querySelector(".brand-blue").innerHTML),
        keyword: document.querySelector("strong").innerHTML,
        exporttype: document.getElementById("exporttype").value,
        retry: 0,
    };

    if (endrange - startrange < 0) {
        alert("输入不合理");
        return;
    } else {
        console.log("=======下载开始======");
        document.getElementById("exportBtn").disabled = true;
        document.getElementById("exportBtn").value = "导出中";
        exporter(startrange, endrange < maxrange ? endrange : maxrange, parentQid, keyword, exporttype, retry);
    }
}

function exporter(startrange, endrange, parentQid, keyword, exporttype, retry) {
    let current = endrange - startrange > 999 ? parseInt(startrange) + 999 : endrange;
    console.log("第" + startrange + "-" + current + "篇论文正在下载...");
    ajax = $.ajax({
        type: "POST",
        url: " http://www-webofscience-com-s.vpn1.bigc.edu.cn:8118/api/wosnx/indic/export/saveToFile?sf_request_type=ajax",
        headers: {
            Accept: "application/json, text/plain, */*",
            "Accept-Language": "zh-CN,zh;q=0.9,ja;q=0.8",
            "Content-Type": "application/json",
            "X-1P-WOS-SID": sid,
            "X-Sec-Clge-Req-Type": "ajax",
        },
        data: JSON.stringify({
            parentQid: parentQid,
            sortBy: "relevance",
            displayTimesCited: "true",
            displayCitedRefs: "true",
            product: "UA",
            colName: "ALLDB",
            displayUsageInfo: "true",
            fileOpt: exporttype == "txt" ? "othersoftware" : "xls",
            action: exporttype == "txt" ? "saveToFieldTagged" : "saveToExcel",
            markFrom: startrange.toString(),
            markTo: current.toString(),
            view: "summary",
            isRefQuery: "false",
            locale: "zh-CN",
            filters: "authorTitleSource",
        }),
        xhrFields: {
            responseType: "blob",
        },
        timeout: 20000,
        error: function (jqXHR, textStatus, errorThrown) {
            if (textStatus == "abort") {
                console.log("=======停止下载======");
                document.getElementById("exportBtn").disabled = false;
                document.getElementById("exportBtn").value = "导出";
            } else {
                retry++;

                if (retry < 6) {
                    textStatus == "error" &&
                        console.log("下载出错，状态码:" + jqXHR.status + "，重试第" + retry + "次。");
                    textStatus == "timeout" && console.log("下载超时，重试第" + retry + "次。");
                    exporter(startrange, endrange, parentQid, keyword, exporttype, retry);
                } else {
                    console.log("连续下载失败超过5次，请检查网络情况或稍后再试");
                    document.getElementById("exportBtn").disabled = false;
                    document.getElementById("exportBtn").value = "导出";
                }
            }
        },

        success: function (data) {
            retry = 0;
            const blob = new Blob([data], {
                type: exporttype == "txt" ? "text/plain" : "application/vnd.ms-excel",
            });
            // console.log(blob);
            let link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = "关键字" + keyword + "编号" + startrange + "-" + current;
            link.click();
            console.log("第" + startrange + "-" + current + "篇论文下载完毕。");
            window.URL.revokeObjectURL(blob);
            startrange = current + 1;

            if (current == endrange) {
                console.log("=======下载结束======");
                document.getElementById("exportBtn").disabled = false;
                document.getElementById("exportBtn").value = "导出";
                return;
            } else {
                exporter(startrange, endrange, parentQid, keyword, exporttype, retry);
            }
        },
    });
}

function stopAjax() {
    ajax && ajax.abort();
}
