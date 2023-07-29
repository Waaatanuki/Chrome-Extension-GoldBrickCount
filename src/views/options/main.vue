<!-- eslint-disable no-console -->
<!-- eslint-disable no-alert -->
<script setup lang="ts">
import { eternitySandData } from '~/logic/storage'
</script>

<template>
  <el-card v-for="data in eternitySandData" :key="data.quest_id">
    {{ data }}
  </el-card>
</template>
