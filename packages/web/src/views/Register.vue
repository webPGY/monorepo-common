<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <h1>用户注册</h1>
        <p>创建您的 OpenClaw Project 账号</p>
      </div>

      <n-form ref="formRef" :model="formValue" :rules="rules" size="large">
        <n-form-item path="username">
          <n-input v-model:value="formValue.username" placeholder="请输入用户名">
            <template #prefix>
              <n-icon :component="PersonOutline" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="email">
          <n-input v-model:value="formValue.email" placeholder="请输入邮箱">
            <template #prefix>
              <n-icon :component="MailOutline" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="phone">
          <n-input v-model:value="formValue.phone" placeholder="请输入手机号">
            <template #prefix>
              <n-icon :component="CallOutline" />
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

        <n-form-item path="confirmPassword">
          <n-input
            v-model:value="formValue.confirmPassword"
            type="password"
            show-password-on="click"
            placeholder="请确认密码"
          >
            <template #prefix>
              <n-icon :component="LockClosedOutline" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="agreement">
          <n-checkbox v-model:checked="formValue.agreement">
            我已阅读并同意
            <n-button text type="primary" size="small">《用户协议》</n-button>
            和
            <n-button text type="primary" size="small">《隐私政策》</n-button>
          </n-checkbox>
        </n-form-item>

        <n-form-item>
          <n-button type="primary" block @click="handleRegister" :loading="loading">
            注册
          </n-button>
        </n-form-item>

        <div class="register-footer">
          <span>已有账号？</span>
          <n-button text type="primary" @click="goToLogin">立即登录</n-button>
        </div>
      </n-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { PersonOutline, MailOutline, CallOutline, LockClosedOutline } from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const formValue = ref({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

const rules: FormRules = {
  username: {
    required: true,
    message: '请输入用户名',
    trigger: ['input', 'blur']
  },
  email: [
    { required: true, message: '请输入邮箱', trigger: ['input', 'blur'] },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['input', 'blur'] }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: ['input', 'blur'] },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: ['input', 'blur']
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: ['input', 'blur'] },
    { min: 6, message: '密码长度不能少于6位', trigger: ['input', 'blur'] }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: ['input', 'blur'] },
    {
      validator: (_rule, value) => {
        return value === formValue.value.password
      },
      message: '两次输入的密码不一致',
      trigger: ['input', 'blur']
    }
  ],
  agreement: {
    validator: (_rule, value) => {
      return value === true
    },
    message: '请阅读并同意用户协议和隐私政策',
    trigger: ['change']
  }
}

const handleRegister = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    // 模拟注册请求
    setTimeout(() => {
      loading.value = false
      message.success('注册成功！请登录')
      router.push('/login')
    }, 1500)
  } catch (error) {
    console.error('Validation failed:', error)
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
.register-container {
  width: 100%;
  min-height: 100vh;
  @include flex-center;
  background: $gradient-primary;
  padding: $spacing-xl 0;

  .register-box {
    width: 420px;
    padding: $spacing-xxl * 1.5;
    background: $bg-primary;
    border-radius: $border-radius-lg;
    box-shadow: $box-shadow-lg;
  }

  .register-header {
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

  .register-footer {
    text-align: center;
    margin-top: $spacing-base + $spacing-xs;
    color: $text-secondary;
  }
}

// 响应式设计
@include respond-to('phone') {
  .register-container .register-box {
    width: 90%;
    padding: $spacing-xl;
  }
}
</style>
