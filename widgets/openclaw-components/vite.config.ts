import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'OpenclawComponents',
      fileName: format => `index.${format}.js`,
      formats: ['es', 'umd']
    },
    outDir: 'dist',
    rollupOptions: {
      // 确保外部化处理vue依赖，不打包进输出文件
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    },
    emptyOutDir: true
  }
})
