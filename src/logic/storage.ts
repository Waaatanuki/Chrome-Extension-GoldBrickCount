import { useStorageLocal } from '~/composables/useStorageLocal'

export const storageDemo = useStorageLocal('webext-demo', 'Storage Demo')
export const goldBrickData = useStorageLocal('goldBrickData', [] as GoldBrickData[])
export const dropData = useStorageLocal('dropData', [] as DropInfo[])

export interface GoldBrickData {
  timestamp: number
  raidName: string
  resultId: string
  blueChests?: string
  goldBrick?: string
}

export interface DropInfo {
  timestamp: number
  raidName: string
  blueChest?: string
  redChest?: string
}
