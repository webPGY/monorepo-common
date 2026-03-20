<template>
  <div class="widget-demo-test">
    <n-card title="widgets 联调页" class="widget-demo-test__card">
      <n-space vertical :size="16">
        <n-text depth="3">
          以下组件由 workspace 包 <n-code>@webPGY/openclaw-components</n-code> 提供。
        </n-text>
        <OpenclawWidgetDemo />
        <OpenclawWidgetDemo title="自定义标题 props" />
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { OpenclawWidgetDemo } from '@webPGY/openclaw-components'
</script>

<style scoped lang="scss">
.widget-demo-test {
  min-height: 100vh;
  padding: 24px;
  background: #f5f5f5;
}

.widget-demo-test__card {
  max-width: 640px;
  margin: 0 auto;
}
</style>
