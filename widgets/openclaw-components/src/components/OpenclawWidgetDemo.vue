<template>
  <section class="openclaw-widget-demo">
    <header class="openclaw-widget-demo__header">
      <h2 class="openclaw-widget-demo__title">{{ title }}</h2>
      <p class="openclaw-widget-demo__desc">widgets/openclaw-components 测试组件</p>
    </header>
    <div class="openclaw-widget-demo__body">
      <span class="openclaw-widget-demo__badge">workspace 包引用正常</span>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  /** 展示标题 */
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: '来自 @openclaw/components'
})

defineOptions({
  name: 'OpenclawWidgetDemo'
})
</script>

<style scoped lang="scss">
.openclaw-widget-demo {
  max-width: 480px;
  padding: 20px 24px;
  border-radius: 12px;
  background: linear-gradient(145deg, #f0f7ff 0%, #e8f4ec 100%);
  border: 1px solid rgba(24, 160, 88, 0.25);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.openclaw-widget-demo__header {
  margin-bottom: 16px;
}

.openclaw-widget-demo__title {
  margin: 0 0 8px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
}

.openclaw-widget-demo__desc {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
}

.openclaw-widget-demo__body {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.openclaw-widget-demo__badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #18a058;
  background: rgba(24, 160, 88, 0.12);
  border-radius: 999px;
}
</style>
