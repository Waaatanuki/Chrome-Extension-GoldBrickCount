import { load } from 'cheerio'

import type { GoldBrickData } from '~/logic/storage'

import { goldBrickData } from '~/logic/storage'
import { isForbiddenUrl } from '~/env'
import { goldBrickRaidList, noticeItem } from '~/constants';

(() => {
  const resultUrlREG = /granbluefantasy.jp\/#result_multi\/[0-9]+/
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // if (changeInfo.url && tab.favIconUrl && resultUrlREG.test(changeInfo.url)) {
    if (changeInfo.url && changeInfo.url.includes('foo') && !isForbiddenUrl(changeInfo.url)) {
      chrome.tabs.sendMessage(tabId, { todo: 'getBattleResult' }).then((res) => {
        if (!res?.domStr)
          return

        const $ = load(res.domStr)
        const treasureList: Treasure[] = []

        $('.btn-treasure-item').each((i, elem) => {
          const count = $(elem).find('.prt-article-count')?.text().split('x')[1]
          treasureList.push({
            box: String($(elem).data().box),
            key: $(elem).data().key as string,
            count: count ? Number(count) : 1,
          })
        })
        showNotifications(treasureList)
        checkGoldBrick(treasureList, res.resultId)
      })
    }
  })

  function showNotifications(treasureList: Treasure[]) {
    const hitTreasure = treasureList.find(treasure => noticeItem.some(item => item.key === treasure.key))
    if (hitTreasure) {
      chrome.notifications.create({
        iconUrl: `/assets/${hitTreasure.key}.png`,
        message: ' Get☆Daze!',
        type: 'basic',
        title: '通知',
      })
    }
  }

  function checkGoldBrick(treasureList: Treasure[], resultId: string) {
    // todo: 增加是否掉落武器检验,排除小巴
    const hitRaid = goldBrickRaidList.find(raid =>
      treasureList.reduce((pre, cur) => {
        if (raid.targetItem.includes(cur.key))
          pre = true
        return pre
      }, false),
    )

    if (!hitRaid)
      return

    const data: GoldBrickData = {
      raidName: hitRaid.name,
      resultId,
      timestamp: Date.now(),
    }
    treasureList.forEach((treasure) => {
      if (treasure.box === '11')
        data.blueChests = treasure.key
      if (treasure.key === '17_20004')
        data.goldBrick = treasure.box
    })
    goldBrickData.value.push(data)
  }

  function setBadge() {
    const total = goldBrickData.value.length
    const color = total <= 100 ? '#25b506' : total <= 200 ? '#becc00' : '#be0000'
    chrome.action.setBadgeText({ text: total.toString() }, () => {
      chrome.action.setBadgeBackgroundColor({ color })
    })
  }

  chrome.runtime.onInstalled.addListener(() => {
    setBadge()
  })

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.goldBrickData) {
      goldBrickData.value = JSON.parse(changes.goldBrickData.newValue)
      setBadge()
    }
  })
})()

interface Treasure {
  box: string
  key: string
  count: number
}
