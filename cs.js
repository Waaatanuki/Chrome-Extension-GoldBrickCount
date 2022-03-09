const TARGET_ITEM = ["10_138", "10_59", "10_79", "10_534", "10_546"];
const RAID_NAME = ["cb", "tuyobaha", "tuyobaha", "akx", "gurande"];

chrome.runtime.onMessage.addListener(function (message) {
    if (message.todo == "count") {
        const start = setInterval(() => {
            console.log("start");
            document.URL.indexOf("empty") != -1 && clearInterval(start);

            if (document.querySelector(".prt-item-list")) {
                clearInterval(start);
                for (var i = 0; i < TARGET_ITEM.length; i++) {
                    if (
                        document.querySelector(".prt-item-list div[data-key='" + TARGET_ITEM[i] + "']") &&
                        !document.querySelector(".prt-item-list div[data-item-kind='1']")
                    ) {
                        const id = document.URL.match(/[0-9]+/g)[0];
                        const result = {};
                        result.timestamp = Date.now();
                        result.raidName = RAID_NAME[i];
                        result.goldBrick = document.querySelector(".prt-item-list div[data-key='17_20004']")
                            ? document.querySelector(".prt-item-list div[data-key='17_20004']").dataset.box
                            : false;
                        result.blueChests = document.querySelector(".prt-item-list div[data-box='11']")
                            ? document.querySelector(".prt-item-list div[data-box='11']").dataset.key
                            : false;

                        chrome.storage.sync.set({ [id]: result });
                    }
                }
            }
        }, 300);
    }
    if (message.todo == "import") {
        const re = /waaatanuki.[a-zA-Z]+.io\/gbf-app/;
        if (re.test(document.URL)) {
            console.log("开始导入...");
            const DBOpenRequest = window.indexedDB.open("gbfApp");
            let db;

            DBOpenRequest.onupgradeneeded = function (event) {
                db = event.target.result;
                if (!db.objectStoreNames.contains("GoldBrick")) {
                    db.createObjectStore("GoldBrick");
                }
            };
            DBOpenRequest.onsuccess = async function (event) {
                db = DBOpenRequest.result;

                chrome.storage.sync.get(null, function (items) {
                    const jsonstr = {
                        GoldBrick: [],
                    };

                    for (const k in items) {
                        if (Object.hasOwnProperty.call(items, k)) {
                            jsonstr.GoldBrick.push({ [k]: items[k] });
                        }
                    }

                    importFromJson(db, JSON.stringify(jsonstr), function (err) {
                        if (!err) {
                            chrome.storage.sync.clear(() => {
                                console.log("导入成功,并清空chrome storage。");
                            });
                        }
                    });
                });
            };
        } else {
            console.log("导入网页不正确");
        }
    }
    return true;
});

const importFromJson = function (idbDatabase, jsonString, cb) {
    const objectStoreNamesSet = new Set(idbDatabase.objectStoreNames);
    const size = objectStoreNamesSet.size;
    if (size === 0) {
        cb(null);
    } else {
        const objectStoreNames = Array.from(objectStoreNamesSet);
        const transaction = idbDatabase.transaction(objectStoreNames, "readwrite");
        transaction.onerror = event => cb(event);

        const importObject = JSON.parse(jsonString);

        Object.keys(importObject).forEach(storeName => {
            if (!objectStoreNames.includes(storeName)) {
                delete importObject[storeName];
            }
        });

        if (Object.keys(importObject).length === 0) {
            cb(null);
        }

        objectStoreNames.forEach(storeName => {
            let count = 0;

            const aux = Array.from(importObject[storeName] || []);
            console.log(aux);
            if (importObject[storeName] && aux.length > 0) {
                aux.forEach(toAdd => {
                    const request = transaction
                        .objectStore(storeName)
                        .put(toAdd[Object.keys(toAdd)[0]], Object.keys(toAdd)[0]);
                    request.onsuccess = () => {
                        count++;
                        if (count === importObject[storeName].length) {
                            delete importObject[storeName];
                            if (Object.keys(importObject).length === 0) {
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
                        cb(null);
                    }
                }
            }
        });
    }
};
