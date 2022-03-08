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
    const formdata = {};
}