/* eslint-disable no-alert */
/* eslint-disable no-console */
const TARGET_ITEM = ['10_138', '10_59', '10_79', '10_534', '10_546']
const RAID_NAME = ['cb', 'tuyobaha', 'tuyobaha', 'akx', 'gurande']
const Revans_RAID_ITEM = ['10_585']
const Revans_RAID_NAME = ['Diaspora']
const re = /waaatanuki.[a-zA-Z]+.io\/gbf-app/
const urlREG = /granbluefantasy.jp\/#result_multi\/[0-9]+/
const defaultQuestData = [
  {
    alias: '大巴',
    id: 301061,
    raidName: 'tuyobaha',
    count: 0,
    blueChest: 0,
    goldBrick: 0,
    ring1: 0,
    ring2: 0,
    ring3: 0,
    lastBlueChestCount: 0,
  },
  {
    alias: '阿卡夏',
    id: 303251,
    raidName: 'akx',
    count: 0,
    blueChest: 0,
    goldBrick: 0,
    ring1: 0,
    ring2: 0,
    ring3: 0,
    lastBlueChestCount: 0,
  },
  {
    alias: '大公',
    id: 305161,
    raidName: 'gurande',
    count: 0,
    blueChest: 0,
    goldBrick: 0,
    ring1: 0,
    ring2: 0,
    ring3: 0,
    lastBlueChestCount: 0,
  },
  {
    alias: '机神',
    id: 305391,
    raidName: 'Diaspora',
    count: 0,
    blueChest: 0,
    goldBrick: 0,
    ring1: 0,
    ring2: 0,
    ring3: 0,
    lastBlueChestCount: 0,
    sandglass: 0,
  },
]

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message)
  if (message.todo === 'getBattleResult') {
    const start = setInterval(async () => {
      if (!urlREG.test(document.URL)) {
        clearInterval(start)
        return
      }
      console.log('2.0 start')
      const itemListEl = document.querySelector('.prt-item-list')
      const idRE = document.URL.match(/[0-9]+/g)
      if (itemListEl && idRE) {
        clearInterval(start)
        const id = idRE[0]
        const result: any = {}
        for (let i = 0; i < TARGET_ITEM.length; i++) {
          if (
            document.querySelector(`.prt-item-list div[data-key='${TARGET_ITEM[i]}']`)
          && !document.querySelector('.prt-item-list div[data-item-kind=\'1\']')
          ) {
            result.timestamp = Date.now()
            result.raidName = RAID_NAME[i]
            result.isSave = true
            const goldBrickEl = document.querySelector('.prt-item-list div[data-key=\'17_20004\']')
            result.goldBrick = goldBrickEl instanceof HTMLElement ? goldBrickEl.dataset.box : false

            result.goldBrick && sendResponse({ name: 'goldbrick' })

            const blueChestsEl = document.querySelector('.prt-item-list div[data-box=\'11\']')
            result.blueChests = blueChestsEl instanceof HTMLElement ? blueChestsEl.dataset.key : false

            break
          }
        }

        for (let i = 0; i < Revans_RAID_ITEM.length; i++) {
          if (document.querySelector(`.prt-item-list div[data-key='${Revans_RAID_ITEM[i]}']`)) {
            result.timestamp = Date.now()
            result.raidName = Revans_RAID_NAME[i]

            const sandglassEl = document.querySelector('.prt-item-list div[data-key=\'10_215\']')
            result.sandglass = sandglassEl instanceof HTMLElement ? sandglassEl.dataset.box : false

            result.sandglass && sendResponse({ name: 'sandglass' })

            const blueChestsEl = document.querySelector('.prt-item-list div[data-box=\'11\']')
            result.blueChests = blueChestsEl instanceof HTMLElement ? blueChestsEl.dataset.key : false

            break
          }
        }

        if (Object.keys(result).length === 0)
          return

        result.isSave && await chrome.storage.local.set({ [id]: result })

        const storage = await chrome.storage.local.get('QuestTableData')
        const tableData: any[] = storage.QuestTableData ? Object.values(storage.QuestTableData) : defaultQuestData

        try {
          if (!tableData.some(quest => quest.raidName === result.raidName))
            tableData.push(defaultQuestData.find(quest => quest.raidName === result.raidName))

          const targetQuestInfo = tableData.find(quest => quest.raidName === result.raidName)

          targetQuestInfo.count++
          result.blueChests && targetQuestInfo.blueChest++
          result.goldBrick === '11' && targetQuestInfo.goldBrick++
          result.blueChests === '73_1' && targetQuestInfo.ring1++
          result.blueChests === '73_2' && targetQuestInfo.ring2++
          result.blueChests === '73_3' && targetQuestInfo.ring3++
          result.blueChests === '10_215' && targetQuestInfo.sandglass++

          targetQuestInfo.lastBlueChestCount
            = result.blueChests === '17_20004'
              ? 0
              : result.blueChests
                ? targetQuestInfo.lastBlueChestCount || 0 + 1
                : targetQuestInfo.lastBlueChestCount || 0

          await chrome.storage.local.set({ QuestTableData: tableData })
        }
        catch (error) {
          console.log(error)
          console.log('数据异常')
        }
      }
    }, 200)
  }

  if (message.todo === 'importData') {
    if (re.test(document.URL)) {
      console.log('开始导入...')
      const DBOpenRequest = window.indexedDB.open('gbfApp')
      let db: IDBDatabase

      DBOpenRequest.onupgradeneeded = function (event) {
        const request = event.target as IDBOpenDBRequest
        db = request.result
        if (!db.objectStoreNames.contains('GoldBrick'))
          db.createObjectStore('GoldBrick')
      }
      DBOpenRequest.onsuccess = async function (event) {
        const request = event.target as IDBOpenDBRequest
        db = request.result

        chrome.storage.local.get(null, (result) => {
          const questTableData = result.QuestTableData
          delete result.QuestTableData
          const rawData: { [key: string]: any }[] = []

          Object.keys(result).forEach((key) => {
            rawData.push({ [key]: result[key] })
          })

          importFromJson(db, 'GoldBrick', rawData, (err: any) => {
            if (!err) {
              alert('成功导入')
              chrome.storage.local.clear(() => {
                chrome.storage.local.set({ QuestTableData: questTableData })
                console.log('导入成功,并清空chrome storage。')
                location.reload()
              })
            }
            else {
              console.log(err)
            }
          })
        })
      }
    }
    else {
      alert('只能在gbfApp网站导入')
    }
  }
  return true
})

function importFromJson(
  idbDatabase: IDBDatabase,
  storeName: string,
  data: { [key: string]: any }[],
  cb: any,
) {
  const length = idbDatabase.objectStoreNames.length

  if (length === 0 || data.length === 0) {
    cb(null)
  }
  else {
    const transaction = idbDatabase.transaction(storeName, 'readwrite')
    transaction.oncomplete = () => cb(null)
    transaction.onerror = event => cb(event)

    const objectStore = transaction.objectStore(storeName)

    data.forEach((item) => {
      const request = objectStore.put(
        Object.values(item)[0],
        Object.keys(item)[0],
      )
      request.onerror = (event) => {
        cb(event)
      }
    })
  }
}
