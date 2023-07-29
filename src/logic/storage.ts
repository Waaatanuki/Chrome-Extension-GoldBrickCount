import { useStorageLocal } from '~/composables/useStorageLocal'
import { Raid_EternitySand, Raid_GoldBrick } from '~/constants/raid'

const eternitySandDataInit = Raid_EternitySand.reduce((pre, cur) => {
  const data: RaidInfo = { ...cur }
  data.total = 0
  data.blueChest = 0
  data.eternitySand = 0
  pre.push(data)
  return pre
}, [] as RaidInfo[])

export const goldBrickTableDataInit = Raid_GoldBrick.reduce((pre, cur) => {
  const data: GoldBrickTableData = {
    quest_id: cur.quest_id,
    total: 0,
    blueChest: 0,
    goldBrick: 0,
    ring1: 0,
    ring2: 0,
    ring3: 0,
    lastBlueChestCount: 0,
  }
  pre.push(data)
  return pre
}, [] as GoldBrickTableData[])

export const storageDemo = useStorageLocal('webext-demo', 'Storage Demo')
export const goldBrickData = useStorageLocal('goldBrickData', [] as GoldBrickData[])
export const goldBrickTableData = useStorageLocal('goldBrickTableData', goldBrickTableDataInit as GoldBrickTableData[])
export const eternitySandData = useStorageLocal('eternitySandData', eternitySandDataInit as RaidInfo[])
export const battleMemo = useStorageLocal('battleMemo', [] as BattleMemo[])
export const dropData = useStorageLocal('dropData', [] as DropInfo[])

export interface RaidInfo {
  quest_id: string
  level: string
  element: string
  tweet_name_en: string
  tweet_name_jp: string
  quest_name_en: string
  quest_name_jp: string
  impossible: number
  difficulty: string
  stage_id: string
  thumbnail_image: string
  is_blue_treasure: boolean
  total?: number
  blueChest?: number
  eternitySand?: number
}

export interface GoldBrickTableData {
  quest_id: string
  total: number
  blueChest: number
  goldBrick: number
  ring1: number
  ring2: number
  ring3: number
  lastBlueChestCount: number
}

export interface GoldBrickData {
  timestamp: number
  raidName: string
  battleId: string
  blueChests?: string
  goldBrick?: string
}

export interface BattleMemo {
  battle_id: string
  quest_id: string
  timestamp: number
}

export interface DropInfo {
  timestamp: number
  raidName: string
  blueChest?: string
  redChest?: string
}
