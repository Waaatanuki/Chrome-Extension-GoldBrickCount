<!-- eslint-disable no-console -->
<!-- eslint-disable no-alert -->
<script setup lang="ts">
import { defaultQuestData } from '~/settings'
import { goldBrickData } from '~/logic/storage'

const questTableData = ref<any>([])
const diasporaData = ref<any>()
onMounted(() => {
  chrome.storage.local.get('QuestTableData').then((result) => {
    questTableData.value = result.QuestTableData
      ? Object.values(result.QuestTableData)
      : defaultQuestData
    diasporaData.value = questTableData.value[3] || defaultQuestData[3]
    questTableData.value = questTableData.value.slice(0, 3)
  })
})

async function resetData() {
  questTableData.value = defaultQuestData
  await chrome.storage.local.set({ QuestTableData: defaultQuestData })
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
    else { alert('只能在gbfApp网站导入') }
  })
}

function exportData() {
  if (goldBrickData.value.length === 0)
    return ElMessage.info('当前没有可导出的数据')
  const exportData = goldBrickData.value.reduce((pre, cur) => {
    const val: any = { ...cur }
    delete val.resultId
    pre.push({ [cur.resultId]: val })
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
  <div w-500px>
    <el-table :data="questTableData">
      <el-table-column prop="name" align="center">
        <template #header>
          <div
            class="icon-btn" m-auto dark:i-carbon-moon i-carbon-sun
            @click="toggleDark()"
          />
        </template>
        <template #default="{ row }">
          <img w-full m-auto :src="getImgSrc(row.id)">
        </template>
      </el-table-column>
      <el-table-column prop="blueChest" align="center">
        <template #header="{ column }">
          <img w-30px m-auto :src="getImgSrc(column.property)">
        </template>
        <template #default="{ row }">
          <el-tooltip effect="dark" placement="top">
            <template #content>
              总次数：{{ row.count }}<br>
              蓝箱率：{{
                ((row.blueChest / row.count || 0) * 100).toFixed(1)
              }}%
            </template>
            {{ row.blueChest }}
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="goldBrick" align="center">
        <template #header="{ column }">
          <img w-30px m-auto :src="getImgSrc(column.property)">
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
          <img w-30px m-auto :src="getImgSrc(column.property)">
        </template>
      </el-table-column>
      <el-table-column prop="ring2" align="center">
        <template #header="{ column }">
          <img w-30px m-auto :src="getImgSrc(column.property)">
        </template>
      </el-table-column>
      <el-table-column prop="ring1" align="center">
        <template #header="{ column }">
          <img w-30px m-auto :src="getImgSrc(column.property)">
        </template>
      </el-table-column>
    </el-table>
    <div flex justify-between>
      <div>
        <el-button m-2 size="small" type="danger" @click="resetData">
          <div mr-1 i-carbon:reset />
          重置
        </el-button>
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
      </div>
    </div>
    <div p-2>
      <el-descriptions border title="机神">
        <el-descriptions-item label="总次数" align="center">
          {{ diasporaData?.count }}
        </el-descriptions-item>
        <el-descriptions-item label="蓝箱" align="center">
          <el-tooltip effect="dark" placement="top">
            <template #content>
              蓝箱率：{{ ((diasporaData.blueChest / diasporaData.count || 0) * 100).toFixed(1) }}%
            </template>
            {{ diasporaData?.blueChest }}
          </el-tooltip>
        </el-descriptions-item>
        <el-descriptions-item label="沙漏" align="center">
          <el-tooltip effect="dark" placement="top">
            <template #content>
              蓝箱沙漏率：{{ ((diasporaData.sandglass / diasporaData.blueChest || 0) * 100).toFixed(1) }}%
            </template>
            {{ diasporaData?.sandglass }}
          </el-tooltip>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>
