<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>控制台</h1>
      <p>欢迎来到 OpenClaw Admin 管理后台</p>
    </div>

    <div class="dashboard-content">
      <n-grid :cols="4" :x-gap="16" :y-gap="16">
        <n-gi>
          <n-card class="stat-card">
            <n-statistic label="总用户数" :value="1234">
              <template #prefix>
                <n-icon :component="PeopleOutline" />
              </template>
            </n-statistic>
          </n-card>
        </n-gi>

        <n-gi>
          <n-card class="stat-card">
            <n-statistic label="今日访问" :value="5678">
              <template #prefix>
                <n-icon :component="EyeOutline" />
              </template>
            </n-statistic>
          </n-card>
        </n-gi>

        <n-gi>
          <n-card class="stat-card">
            <n-statistic label="活跃用户" :value="890">
              <template #prefix>
                <n-icon :component="TrendingUpOutline" />
              </template>
            </n-statistic>
          </n-card>
        </n-gi>

        <n-gi>
          <n-card class="stat-card">
            <n-statistic label="系统消息" :value="42">
              <template #prefix>
                <n-icon :component="NotificationsOutline" />
              </template>
            </n-statistic>
          </n-card>
        </n-gi>
      </n-grid>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PeopleOutline, EyeOutline, TrendingUpOutline, NotificationsOutline } from '@vicons/ionicons5'
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: $spacing-xxl;

  .dashboard-header {
    margin-bottom: $spacing-xxl;

    h1 {
      font-size: $font-size-xl + 8px;
      color: $text-primary;
      margin-bottom: $spacing-sm;
      font-weight: 600;
    }

    p {
      font-size: $font-size-base;
      color: $text-secondary;
    }
  }

  .dashboard-content {
    .stat-card {
      transition: $transition-base;

      &:hover {
        transform: translateY(-4px);
        box-shadow: $box-shadow-base;
      }

      :deep(.n-statistic .n-statistic-value) {
        font-size: 32px;
        font-weight: 600;
      }

      :deep(.n-icon) {
        font-size: 24px;
        color: $primary-color;
      }
    }
  }
}
</style>
