# OpenClaw Project

基于 Vue 3 + Naive UI + Vite + TypeScript 的 Monorepo 前端脚手架工程

## ✨ 特性

- 🚀 **交互式启动面板** - 可视化选择要启动的项目
- 📦 **多包构建支持** - 支持选择性地构建多个包
- 🎨 **SCSS 样式系统** - 完整的变量、混入和全局样式
- 🔧 **Monorepo 架构** - 统一管理多个前端项目
- 💪 **TypeScript** - 完整的类型支持
- 📝 **代码规范** - ESLint + Prettier

## 技术栈

- **框架**: Vue 3 (Composition API)
- **UI 库**: Naive UI
- **构建工具**: Vite
- **语言**: TypeScript
- **样式**: SCSS
- **代码规范**: ESLint + Prettier
- **包管理**: pnpm
- **架构**: Monorepo

## 项目结构

```
openclaw-project/
├── packages/
│   ├── web/                 # 用户端应用
│   │   ├── src/
│   │   │   ├── views/       # 页面组件
│   │   │   │   ├── Login.vue    # 登录页
│   │   │   │   └── Register.vue # 注册页
│   │   │   ├── styles/      # 样式文件
│   │   │   │   ├── variables.scss # SCSS 变量
│   │   │   │   ├── mixins.scss    # SCSS 混入
│   │   │   │   └── global.scss    # 全局样式
│   │   │   ├── router/      # 路由配置
│   │   │   ├── App.vue      # 根组件
│   │   │   └── main.ts      # 入口文件
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── admin/               # 管理后台应用
│       ├── src/
│       │   ├── views/       # 页面组件
│       │   │   └── Dashboard.vue # 控制台
│       │   ├── styles/      # 样式文件
│       │   ├── router/      # 路由配置
│       │   ├── App.vue
│       │   └── main.ts
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
├── scripts/
│   ├── dev-selector.js      # 开发服务器选择器
│   └── build-selector.js    # 构建选择器
├── pnpm-workspace.yaml      # Monorepo 配置
├── tsconfig.json            # TypeScript 配置
├── .eslintrc.cjs            # ESLint 配置
├── .prettierrc              # Prettier 配置
└── package.json
```

## 快速开始

### 安装依赖

```bash
cd E:\openclaw-project
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

**交互式启动面板特性：**
- ✅ 自动扫描 `packages/` 目录下的所有项目
- ✅ 支持上下键选择项目
- ✅ 支持空格键多选项目
- ✅ 支持同时启动多个项目
- ✅ 彩色终端输出，清晰易读

**操作说明：**
1. 使用 ↑↓ 键移动光标
2. 按 空格键 选择/取消选择项目
3. 按 回车键 确认并启动选中的项目

### 构建项目

```bash
# 交互式构建选择
pnpm build

# 构建所有项目
pnpm build:all
```

**构建选择器特性：**
- ✅ 支持选择性构建单个或多个项目
- ✅ 支持选择构建模式（生产/开发）
- ✅ 显示构建进度和统计信息
- ✅ 输出构建产物大小和路径
- ✅ 代码分包和压缩优化

### 代码格式化

```bash
pnpm format
```

### 代码检查

```bash
pnpm lint
```

## 页面功能

### 用户端 (@openclaw/web)

#### 登录页 (Login.vue)
- 用户名/密码登录
- 验证码功能
- 记住密码
- 忘记密码入口
- 跳转注册页
- 响应式设计

#### 注册页 (Register.vue)
- 用户名/邮箱/手机号注册
- 密码确认验证
- 用户协议勾选
- 表单验证（邮箱格式、手机号格式、密码强度）
- 跳转登录页
- 响应式设计

### 管理后台 (@openclaw/admin)

#### 控制台 (Dashboard.vue)
- 数据统计卡片
- 用户数统计
- 访问量统计
- 活跃用户统计
- 系统消息统计

## SCSS 样式系统

### 变量 (variables.scss)

```scss
// 颜色
$primary-color: #667eea;
$success-color: #52c41a;

// 字体
$font-size-base: 14px;

// 间距
$spacing-base: 12px;

// 圆角
$border-radius-base: 8px;
```

### 混入 (mixins.scss)

```scss
// Flex 布局
@include flex-center;
@include flex-between;

// 响应式
@include respond-to('phone') { ... }
@include respond-to('tablet') { ... }

// 文本截断
@include text-ellipsis;
@include text-ellipsis-multiline(2);

// 自定义滚动条
@include custom-scrollbar(6px, rgba(0, 0, 0, 0.2));
```

### 使用方法

```vue
<style lang="scss" scoped>
.container {
  @include flex-center;
  background: $gradient-primary;
  padding: $spacing-xl;
  
  .title {
    color: $text-primary;
    font-size: $font-size-xl;
  }
}

// 响应式
@include respond-to('phone') {
  .container {
    padding: $spacing-base;
  }
}
</style>
```

## 构建优化

### 代码分包

```javascript
manualChunks: {
  vue: ['vue', 'vue-router', 'pinia'],
  naiveui: ['naive-ui'],
  vendor: ['@vicons/ionicons5']
}
```

### 资源分类

```
dist/
├── assets/
│   ├── js/
│   │   ├── index-[hash].js
│   │   ├── vue-[hash].js
│   │   └── naiveui-[hash].js
│   ├── css/
│   │   └── index-[hash].css
│   └── [ext]/
```

## 开发规范

- 使用 Composition API (`<script setup>`)
- 使用 TypeScript 类型注解
- 使用 SCSS 编写样式
- 遵循 ESLint 和 Prettier 规范
- 组件命名使用 PascalCase
- 文件命名使用 PascalCase (Vue 组件) 或 camelCase (TS 文件)

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## License

MIT
