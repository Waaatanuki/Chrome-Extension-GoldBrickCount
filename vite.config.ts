import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fg from 'fast-glob'
import fsPromises from 'node:fs/promises'
import Unocss from 'unocss/vite'

function getEntry() {
  const list = {}
  // 遍历文件夹中含有main.ts的文件夹路径
  fg('./src/views/**/main.ts').then(entries => {
    entries.forEach(async (entry: string) => {
      const pathArr = entry.split('/')
      const name = pathArr[pathArr.length - 2]
      const tempHtml = `src/views/${name}/main.html`
      // 获取模板
      const temp = await fsPromises.readFile(tempHtml)
      // 判断文件是否存在
      fsPromises
        .access(tempHtml)
        .then(() => {})
        .catch(async () => {
          console.log(`创建${name}/main.html文件`)
          const index = temp.toString().indexOf('</body>')
          const content =
            temp.toString().slice(0, index) +
            `<script type="module" src=".${entry}"></script>` +
            temp.toString().slice(index)

          await fsPromises.writeFile(tempHtml, content)
        })

      // input中的配置
      list['assets/' + name] = path.resolve(__dirname, tempHtml)
    })
  })

  list['background'] = path.resolve(__dirname, './src/script/background.ts')
  list['content_script'] = path.resolve(
    __dirname,
    './src/script/content_script.ts'
  )
  return list
}

export default defineConfig({
  plugins: [vue(), Unocss()],
  resolve: {
    alias: {
      '@': path.join(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: getEntry(),
      output: {
        entryFileNames: '[name].js',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString()
          }
        },
      },
    },
  },
})
