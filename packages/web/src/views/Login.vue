<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>欢迎登录</h1>
        <p>OpenClaw Project 管理系统</p>
      </div>

      <n-form ref="formRef" :model="formValue" :rules="rules" size="large">
        <n-form-item path="username">
          <n-input v-model:value="formValue.username" placeholder="请输入用户名">
            <template #prefix>
              <n-icon :component="PersonOutline" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="password">
          <n-input
            v-model:value="formValue.password"
            type="password"
            show-password-on="click"
            placeholder="请输入密码"
          >
            <template #prefix>
              <n-icon :component="LockClosedOutline" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="captcha" v-if="showCaptcha">
          <div class="captcha-container">
            <n-input v-model:value="formValue.captcha" placeholder="验证码" style="flex: 1" />
            <div class="captcha-img" @click="refreshCaptcha">
              <span>{{ captchaText }}</span>
            </div>
          </div>
        </n-form-item>

        <div class="login-options">
          <n-checkbox v-model:checked="formValue.remember">记住密码</n-checkbox>
          <n-button text type="primary">忘记密码？</n-button>
        </div>

        <n-form-item>
          <n-button type="primary" block @click="handleLogin" :loading="loading">
            登录
          </n-button>
        </n-form-item>

        <div class="login-footer">
          <span>还没有账号？</span>
          <n-button text type="primary" @click="goToRegister">立即注册</n-button>
        </div>
      </n-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { PersonOutline, LockClosedOutline } from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const showCaptcha = ref(true)
const captchaText = ref('ABCD')

const formValue = ref({
  username: '',
  password: '',
  captcha: '',
  remember: false
})

const rules: FormRules = {
  username: {
    required: true,
    message: '请输入用户名',
    trigger: ['input', 'blur']
  },
  password: {
    required: true,
    message: '请输入密码',
    trigger: ['input', 'blur']
  },
  captcha: {
    required: true,
    message: '请输入验证码',
    trigger: ['input', 'blur']
  }
}

const refreshCaptcha = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaText.value = result
}

const handleLogin = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    // 模拟登录请求
    setTimeout(() => {
      loading.value = false
      message.success('登录成功！')
      // router.push('/')
    }, 1500)
  } catch (error) {
    console.error('Validation failed:', error)
  }
}

const goToRegister = () => {
  router.push('/register')
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.login-container {
  width: 100%;
  min-height: 100vh;
  @include flex-center;
  background: $gradient-primary;

  .login-box {
    width: 420px;
    padding: $spacing-xxl * 1.5;
    background: $bg-primary;
    border-radius: $border-radius-lg;
    box-shadow: $box-shadow-lg;
  }

  .login-header {
    text-align: center;
    margin-bottom: 32px;

    h1 {
      font-size: $font-size-xxl + 8px;
      color: $text-primary;
      margin-bottom: $spacing-sm;
      font-weight: 600;
    }

    p {
      font-size: $font-size-base;
      color: $text-secondary;
    }
  }

  .captcha-container {
    display: flex;
    gap: $spacing-base;
    width: 100%;
  }

  .captcha-img {
    width: 120px;
    height: 40px;
    background: $gradient-secondary;
    border-radius: $border-radius-sm;
    @include flex-center;
    cursor: pointer;
    font-weight: bold;
    font-size: $font-size-xl;
    letter-spacing: 4px;
    color: $primary-color;
    user-select: none;
    transition: $transition-fast;

    &:hover {
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg + $spacing-sm;
  }

  .login-footer {
    text-align: center;
    margin-top: $spacing-base + $spacing-xs;
    color: $text-secondary;
  }
}

// 响应式设计
@include respond-to('phone') {
  .login-container .login-box {
    width: 90%;
    padding: $spacing-xl;
  }
}
</style>
