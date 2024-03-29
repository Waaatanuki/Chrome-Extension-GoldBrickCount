<script setup lang="ts">
import { eternitySandData, eternitySandDataInit, goldBrickData, goldBrickTableData, goldBrickTableDataInit } from '~/logic/storage'

const goldBrickTableShowData = computed(() => goldBrickTableData.value.filter(raid => raid.quest_id !== '303141'))

function openOptionsPage() {
  chrome.runtime.openOptionsPage()
}

function handleReset(command: string) {
  switch (command) {
    case 'all':
      goldBrickTableData.value = goldBrickTableDataInit
      eternitySandData.value = eternitySandDataInit
      ElMessage.success('全部数据已重置')
      break
    case 'goldBrick':
      goldBrickTableData.value = goldBrickTableDataInit
      ElMessage.success('金本数据已重置')
      break
    case 'eternitySand':
      eternitySandData.value = eternitySandDataInit
      ElMessage.success('沙漏本数据已重置')
      break
  }
}

function importData() {
  if (goldBrickData.value.length === 0)
    return ElMessage.info('当前没有可导入的数据')
  const re = /waaatanuki.[a-zA-Z]+.io\/gbf-app/

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0 && tabs[0].id && tabs[0].url && re.test(tabs[0].url)) {
      chrome.tabs.sendMessage(tabs[0].id, { todo: 'importData' }).then((res) => {
        if (res?.isDone)
          goldBrickData.value = []
      })
    }
    else {
      ElMessage.info('只能在gbfApp网站导入')
    }
  })
}

function exportData() {
  if (goldBrickData.value.length === 0)
    return ElMessage.info('当前没有可导出的数据')
  const exportData = goldBrickData.value.reduce((pre, cur) => {
    const val: any = { ...cur }
    delete val.battleId
    pre.push({ [cur.battleId]: val })
    return pre
  }, [] as any[])
  exportJSONFile(exportData)
  goldBrickData.value = []
  ElMessage.success('导出成功,并清空数据')
}

function exportJSONFile(itemList: any) {
  const data = JSON.stringify(itemList, null, 2)
  const content = new Blob([data])
  const urlObject = window.URL || window.webkitURL || window
  const url = urlObject.createObjectURL(content)
  const el = document.createElement('a')
  el.href = url
  el.download = 'gbfApp_金本统计数据.json'
  el.click()
  urlObject.revokeObjectURL(url)
}
</script>

<template>
  <main font-sans>
    <div w-500px>
      <el-table :data="goldBrickTableShowData">
        <el-table-column prop="name" align="center">
          <template #header>
            <div
              class="icon-btn" m-auto dark:i-carbon-moon i-carbon-sun
              @click="toggleDark()"
            />
          </template>
          <template #default="{ row }">
            <img w-full m-auto :src="getImgSrc(row.quest_id, 'raid')">
          </template>
        </el-table-column>
        <el-table-column prop="blueChest" align="center">
          <template #header="{ column }">
            <img w-30px m-auto :src="getImgSrc(column.property)">
          </template>
          <template #default="{ row }">
            <el-tooltip effect="dark" placement="top">
              <template #content>
                总次数：{{ row.total }}<br>
                蓝箱率：{{
                  ((row.blueChest / row.total || 0) * 100).toFixed(1)
                }}%
              </template>
              {{ row.blueChest }}
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="goldBrick" align="center">
          <template #header="{ column }">
            <img w-30px m-auto :src="getImgSrc(column.property, 'item')">
          </template>
          <template #default="{ row }">
            <el-tooltip effect="dark" placement="top">
              <template #content>
                蓝箱金率：{{ ((row.goldBrick / row.blueChest || 0) * 100).toFixed(1) }}%
                <br>
                已经{{ row.lastBlueChestCount }}个蓝箱没出金
              </template>
              {{ row.goldBrick }}
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="ring3" align="center">
          <template #header="{ column }">
            <img w-30px m-auto :src="getImgSrc(column.property, 'item')">
          </template>
        </el-table-column>
        <el-table-column prop="ring2" align="center">
          <template #header="{ column }">
            <img w-30px m-auto :src="getImgSrc(column.property, 'item')">
          </template>
        </el-table-column>
        <el-table-column prop="ring1" align="center">
          <template #header="{ column }">
            <img w-30px m-auto :src="getImgSrc(column.property, 'item')">
          </template>
        </el-table-column>
      </el-table>
      <div flex justify-between>
        <div>
          <el-dropdown @command="handleReset">
            <el-button m-2 size="small" type="danger">
              <div mr-1 i-carbon:reset />
              重置
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="all">
                  全部重置
                </el-dropdown-item>
                <el-dropdown-item command="goldBrick">
                  仅金本
                </el-dropdown-item>
                <el-dropdown-item command="eternitySand">
                  仅沙漏本
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div>
          <el-button m-2 size="small" type="primary" @click="importData">
            <div mr-1 i-carbon:document-import />
            导入
          </el-button>
          <el-button m-2 size="small" type="primary" @click="exportData">
            <div mr-1 i-carbon:document-export />
            导出
          </el-button>
          <el-button m-2 size="small" type="primary" @click="openOptionsPage">
            <div mr-1 i-carbon:notebook />
            更多
          </el-button>
        </div>
      </div>
    </div>
  </main>
</template>
