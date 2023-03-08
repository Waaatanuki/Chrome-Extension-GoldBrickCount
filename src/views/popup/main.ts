import { createApp } from 'vue'
import Main from './main.vue'
import '@/styles/index.css'
import 'uno.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
createApp(Main).use(ElementPlus).mount('#app')
