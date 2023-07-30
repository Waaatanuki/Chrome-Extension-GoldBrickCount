<script setup lang="ts">
import RaidCard from './components/RaidCard.vue'
import { eternitySandData } from '~/logic/storage'
</script>

<template>
  <main font-sans>
    <RaidCard :data="eternitySandData.filter(i => i.visiable)" />

    <el-collapse>
      <el-collapse-item>
        <template #title>
          <div ml-5>
            <el-text size="large">
              隐藏副本
            </el-text>
          </div>
        </template>
        <RaidCard is-collapse :data="eternitySandData.filter(i => !i.visiable)" />
      </el-collapse-item>
    </el-collapse>
  </main>
</template>
