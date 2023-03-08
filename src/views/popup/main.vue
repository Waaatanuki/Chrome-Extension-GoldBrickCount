<template>
  <div w-500px>
    <el-table :data="questTableData">
      <el-table-column prop="name" align="center">
        <template #header>
          <div
            m-auto
            dark:i-carbon-moon
            i-carbon-sun
            @click="toggleDark()"
            class="text-[0.9em] inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-teal-600 !outline-none"
          />
        </template>
        <template #default="{ row }">
          <img w-full m-auto :src="getImgSrc(row.id)" />
        </template>
      </el-table-column>
      <el-table-column prop="blueChest" align="center">
        <template #header="{ column }">
          <img w-30px m-auto :src="getImgSrc(column.property)" />
        </template>
        <template #default="{ row }">
          <el-tooltip effect="dark" placement="top">
            <template #content>
              总次数：{{ row.count }}<br />
              蓝箱率：{{
                ((row.blueChest / row.count || 0) * 100).toFixed(1)
              }}%</template
            >
            {{ row.blueChest }}
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="goldBrick" align="center">
        <template #header="{ column }">
          <img w-30px m-auto :src="getImgSrc(column.property)" />
        </template>
        <template #default="{ row }">
          <el-tooltip effect="dark" placement="top">
            <template #content>
              蓝箱金率：
              {{ ((row.goldBrick / row.blueChest || 0) * 100).toFixed(1) }}%
              <br />
              已经{{ row.lastBlueChestCount }}个蓝箱没出金
            </template>
            {{ row.goldBrick }}
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="ring3" align="center">
        <template #header="{ column }">
          <img w-30px m-auto :src="getImgSrc(column.property)" />
        </template>
      </el-table-column>
      <el-table-column prop="ring2" align="center">
        <template #header="{ column }">
          <img w-30px m-auto :src="getImgSrc(column.property)" />
        </template>
      </el-table-column>
      <el-table-column prop="ring1" align="center">
        <template #header="{ column }">
          <img w-30px m-auto :src="getImgSrc(column.property)" />
        </template>
      </el-table-column>
    </el-table>

    <div flex justify-between>
      <div>
        <el-button m-2 @click="resetData" size="small" type="danger">
          <div mr-1 i-carbon:reset></div>
          重置</el-button
        >
      </div>
      <div>
        <el-button m-2 @click="importData" size="small" type="primary">
          <div mr-1 i-carbon:document-import></div>
          导入</el-button
        >
        <el-button m-2 @click="exportData" size="small" type="primary">
          <div mr-1 i-carbon:document-export></div>
          导出</el-button
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { defaultQuestData } from '@/settings'
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
const questTableData = ref<any>([])

onMounted(() => {
  chrome.storage.local.get('QuestTableData').then(function (result) {
    questTableData.value = result.QuestTableData
      ? Object.values(result.QuestTableData)
      : defaultQuestData
  })
})

function getImgSrc(prop: string) {
  return new URL(`/src/assets/image/${prop}.png`, import.meta.url).href
}
async function resetData() {
  questTableData.value = defaultQuestData
  await chrome.storage.local.set({ QuestTableData: defaultQuestData })
}
function importData() {
  const re = /waaatanuki.[a-zA-Z]+.io\/gbf-app/

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0 && tabs[0].id && tabs[0].url && re.test(tabs[0].url)) {
      chrome.tabs.sendMessage(tabs[0].id, { todo: 'importData' })
    } else {
      alert('只能在gbfApp网站导入')
    }
  })
}
function exportData() {
  chrome.storage.local.get(null, function (result) {
    delete result.QuestTableData
    const data: any[] = []
    Object.keys(result).forEach(k => {
      data.push({ [k]: result[k] })
    })
    exportJSONFile(data)
    chrome.storage.local.clear(() => {
      chrome.storage.local.set({ QuestTableData: questTableData.value })
      console.log('导出成功,并清空chrome storage。')
    })
  })
}
function exportJSONFile(itemList: any) {
  if (itemList.length == 0) {
    alert('没有数据可以导出')
  } else {
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
}
</script>
