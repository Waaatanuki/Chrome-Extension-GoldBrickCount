const QUEST_LIST = [
  {
    alias: '大巴',
    id: 301061,
    raidName: 'tuyobaha',
  },
  {
    alias: '阿卡夏',
    id: 303251,
    raidName: 'akx',
  },
  {
    alias: '大公',
    id: 305161,
    raidName: 'gurande',
  },
]

export const defaultQuestData: QuestTableData[] = []

QUEST_LIST.forEach((quest) => {
  defaultQuestData.push({
    id: quest.id,
    alias: quest.alias,
    raidName: quest.raidName,
    count: 0,
    blueChest: 0,
    goldBrick: 0,
    ring1: 0,
    ring2: 0,
    ring3: 0,
    lastBlueChestCount: 0,
  })
})

interface QuestTableData {
  id: number
  alias: string
  raidName: string
  count: number
  blueChest: number
  goldBrick: number
  ring1: number
  ring2: number
  ring3: number
  lastBlueChestCount: number
}
