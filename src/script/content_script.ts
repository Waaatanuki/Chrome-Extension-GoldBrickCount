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
    const start = setInterval(() => {
      // if (!urlREG.test(document.URL))
      if (!document.URL.includes('foo'))
        clearInterval(start)

      console.log('监测到结算')
      const itemListEl = document.querySelector('.prt-item-list')
      const idRE = document.URL.match(/[0-9]+/g)
      if (itemListEl && idRE) {
        clearInterval(start)
        sendResponse({
          resultId: idRE[0],
          domStr: itemListEl.innerHTML,
        })
        // const result: any = {}
        // for (let i = 0; i < Revans_RAID_ITEM.length; i++) {
        //   if (document.querySelector(`.prt-item-list div[data-key='${Revans_RAID_ITEM[i]}']`)) {
        //     result.timestamp = Date.now()
        //     result.raidName = Revans_RAID_NAME[i]

        //     const sandglassEl = document.querySelector('.prt-item-list div[data-key=\'10_215\']')
        //     result.sandglass = sandglassEl instanceof HTMLElement ? sandglassEl.dataset.box : false

        //     result.sandglass && sendResponse({ name: 'sandglass' })

        //     const blueChestsEl = document.querySelector('.prt-item-list div[data-box=\'11\']')
        //     result.blueChests = blueChestsEl instanceof HTMLElement ? blueChestsEl.dataset.key : false

        //     break
        //   }
        // }

        // const storage = await chrome.storage.local.get('QuestTableData')
        // const tableData: any[] = storage.QuestTableData ? Object.values(storage.QuestTableData) : defaultQuestData

        // try {
        //   if (!tableData.some(quest => quest.raidName === result.raidName))
        //     tableData.push(defaultQuestData.find(quest => quest.raidName === result.raidName))

        //   const targetQuestInfo = tableData.find(quest => quest.raidName === result.raidName)

        //   targetQuestInfo.count++
        //   result.blueChests && targetQuestInfo.blueChest++
        //   result.goldBrick === '11' && targetQuestInfo.goldBrick++
        //   result.blueChests === '73_1' && targetQuestInfo.ring1++
        //   result.blueChests === '73_2' && targetQuestInfo.ring2++
        //   result.blueChests === '73_3' && targetQuestInfo.ring3++
        //   result.blueChests === '10_215' && targetQuestInfo.sandglass++

        //   targetQuestInfo.lastBlueChestCount
        //     = result.blueChests === '17_20004'
        //       ? 0
        //       : result.blueChests
        //         ? targetQuestInfo.lastBlueChestCount || 0 + 1
        //         : targetQuestInfo.lastBlueChestCount || 0

        //   await chrome.storage.local.set({ QuestTableData: tableData })
        // }
        // catch (error) {
        //   console.log(error)
        //   console.log('数据异常')
        // }
      }
    }, 200)
  }

  if (message.todo === 'importData') {
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

      chrome.storage.local.get('goldBrickData', (result) => {
        importFromJson(db, 'GoldBrick', JSON.parse(result.goldBrickData), (err: any) => {
          if (!err) {
            sendResponse({ isDone: true })
            alert('成功导入')
            location.reload()
          }
          else { console.log(err) }
        })
      })
    }
  }

  return true
})

function importFromJson(idbDatabase: IDBDatabase, storeName: string, data: GoldBrickData[] = [], cb: any) {
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
      const value: any = { ...item }
      const key = item.resultId
      delete value.resultId
      const request = objectStore.put(value, key)
      request.onerror = (event) => {
        cb(event)
      }
    })
  }
}

interface GoldBrickData {
  timestamp: number
  raidName: string
  resultId: string
  blueChests?: string
  goldBrick?: string
}
