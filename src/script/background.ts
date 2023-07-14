const resultUrlREG = /granbluefantasy.jp\/#result_multi\/[0-9]+/

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.favIconUrl && resultUrlREG.test(changeInfo.url)) {
    chrome.tabs.sendMessage(tabId, { todo: 'getBattleResult' }).then((res) => {
      if (res) {
        chrome.notifications.create({
          iconUrl: '/assets/icon.png',
          message: '菲菲金 Get☆Daze!',
          type: 'basic',
          title: '通知',
        })
      }
    })
  }
})

const setBadge = function () {
  chrome.storage.local.get(null, (items) => {
    const total = Object.hasOwnProperty.call(items, 'QuestTableData')
      ? Object.keys(items).length - 1
      : Object.keys(items).length
    const color = total <= 100 ? '#25b506' : total <= 200 ? '#becc00' : '#be0000'
    chrome.action.setBadgeText({ text: total.toString() }, () => {
      chrome.action.setBadgeBackgroundColor({ color })
    })
  })
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.remove('materialInfo')
  setBadge()
})

chrome.storage.onChanged.addListener(() => setBadge())
