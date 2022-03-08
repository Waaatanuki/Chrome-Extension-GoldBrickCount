const TARGET_ITEM = ["10_138", "10_59", "10_79", "10_534", "10_546", "10_10417"];
const RAID_NAME = ["cb", "tuyobaha", "tuyobaha", "akx", "gurande", "test"];

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.todo == "count") {
        const start = setInterval(() => {
            console.log(123);
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

                        chrome.storage.sync.set({ [id]: result }, function () {
                            console.log(result);
                        });
                    }
                }
            }
        }, 300);
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
