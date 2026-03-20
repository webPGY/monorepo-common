import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { compression } from 'vite-plugin-compression2'
import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'

/** 与根目录 pnpm-workspace 中的 widgets 等包通过软链引用时，需允许读取仓库根路径 */
const monorepoRoot = path.resolve(__dirname, '../..')

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, monorepoRoot, '')
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/',
    plugins: [
      vue(),
      compression({
        algorithms: ['gzip'],
        threshold: 10240,
        deleteOriginalAssets: false
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/variables.scss" as *;`,
          api: 'modern-compiler'
        }
      }
    },
    server: {
      port: 3000,
      open: false,
      host: true,
      hmr: { overlay: true },
      fs: {
        allow: [monorepoRoot]
      }
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : []
    },
    build: {
      outDir: '../../dist/web',
      emptyOutDir: true,
      sourcemap: mode !== 'production' ? 'inline' : false,
      minify: 'esbuild',
      cssMinify: 'esbuild',
      target: 'es2015',
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            naiveui: ['naive-ui'],
            vendor: ['@vicons/ionicons5']
          }
        }
      }
    }
  }
})
