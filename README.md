# OpenClaw Project

基于 Vue 3 + Naive UI + Vite + TypeScript + eslint + husky 的 Monorepo 前端脚手架工程

## ✨ 特性

- 🚀 **多环境构建** - 通过环境变量区分 development / production
- 📦 **多包构建支持** - 支持按目标项目独立或全量构建
- 🐳 **Docker 容器化** - 多阶段构建，支持 Jenkins CI/CD 集成
- 🎨 **SCSS 样式系统** - 完整的变量、混入和全局样式
- 🔧 **Monorepo 架构** - 统一管理多个前端项目
- 💪 **TypeScript** - 完整的类型支持
- 📝 **代码规范** - ESLint + Prettier
- 🤖 **Cursor AI** - 内置 `.cursor` Rules、子代理（Agents）与 Skill，便于团队与 AI 协作时口径一致

## 技术栈

- **框架**: Vue 3 (Composition API)
- **UI 库**: Naive UI
- **构建工具**: Vite
- **语言**: TypeScript
- **样式**: SCSS
- **代码规范**: ESLint + Prettier
- **包管理**: pnpm
- **架构**: Monorepo
- **容器化**: Docker + Nginx

## 项目结构

```
openclaw-project/
├── .cursor/                 # Cursor：项目级规则、子代理与技能（见下文「.cursor 目录」）
│   ├── rules/
│   │   ├── base/            # 全项目通用规则（语言、结构约定等）
│   │   └── frontend/        # 前端规则（Vue、TypeScript、Git、文档等）
│   ├── agents/              # 子代理说明（安全审查、实现验证等）
│   └── skills/              # Agent Skills（如代码风格）
├── widgets/                 # 可独立发布的 NPM 包（workspace，详见 widgets/README.md）
├── packages/
│   ├── web/                 # 用户端应用
│   │   ├── src/
│   │   │   ├── views/       # 页面组件
│   │   │   ├── styles/      # 样式文件
│   │   │   ├── router/      # 路由配置
│   │   │   ├── App.vue      # 根组件
│   │   │   └── main.ts      # 入口文件
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── admin/               # 管理后台应用
│       ├── src/
│       │   ├── views/       # 页面组件
│       │   ├── styles/      # 样式文件
│       │   ├── router/      # 路由配置
│       │   ├── App.vue
│       │   └── main.ts
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
├── scripts/
│   ├── dev-selector.js      # 开发服务器选择器（交互式）
│   └── build-selector.js    # 构建脚本（环境变量驱动）
├── docker/
│   └── nginx.conf           # Nginx 配置
├── .env.development          # 开发环境变量
├── .env.production           # 生产环境变量
├── Dockerfile                # 多阶段 Docker 构建
├── .dockerignore
├── pnpm-workspace.yaml       # Monorepo 配置
├── tsconfig.json             # TypeScript 配置
└── package.json
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

**交互式启动面板：**

1. 使用 ↑↓ 键移动光标
2. 按 空格键 选择/取消选择项目
3. 按 回车键 确认并启动选中的项目

## 构建项目

### 环境变量

项目通过根目录的 `.env.*` 文件管理不同环境的配置：

| 文件               | 说明                     |
| ------------------ | ------------------------ |
| `.env.development` | 开发环境配置             |
| `.env.production`  | 生产环境配置             |
| `.env*.local`      | 本地覆写（已 gitignore） |

**核心变量：**

| 变量                | 说明         | 可选值                       |
| ------------------- | ------------ | ---------------------------- |
| `NODE_ENV`          | 构建模式     | `development` / `production` |
| `BUILD_TARGET`      | 构建目标项目 | `web` / `admin` / `all`      |
| `VITE_API_BASE_URL` | API 基础地址 | 任意 URL                     |
| `VITE_APP_TITLE`    | 应用标题     | 任意字符串                   |

> `VITE_` 前缀的变量会自动注入到 Vite 子项目中，可在前端代码通过 `import.meta.env.VITE_*` 访问。

### 构建命令

```bash
# 默认构建（读取环境变量或 .env 文件）
pnpm build

# 按环境构建全部项目
pnpm build:dev          # 开发环境 - 全部
pnpm build:prod         # 生产环境 - 全部

# 按项目构建（生产环境）
pnpm build:web          # 生产环境 - 仅 web
pnpm build:admin        # 生产环境 - 仅 admin
pnpm build:all          # 生产环境 - 全部

# 按项目构建（开发环境）
pnpm build:web:dev      # 开发环境 - 仅 web
pnpm build:admin:dev    # 开发环境 - 仅 admin
```

**构建差异：**

| 特性             | development    | production |
| ---------------- | -------------- | ---------- |
| sourcemap        | inline         | 关闭       |
| console/debugger | 保留           | 移除       |
| API 地址         | localhost:8080 | /api       |

构建产物输出到 `dist/<package>/` 目录。

## widgets 与 GitHub Packages

- 发布：`pnpm publish:widgets`（详见 [`widgets/README.md`](widgets/README.md)）。
- **包会出现在与 npm scope 一致的 GitHub 用户/组织的 Packages 页**（例如 `@webPGY/...` 对应 `webPGY`），不一定自动出现在某个仓库侧栏。
- **若要在本仓库首页看到 Packages**：请在对应 widget 的 `package.json` 中配置 `repository`（monorepo 建议同时设置 `repository.directory`）。示例见 `widgets/openclaw-components/package.json`。

## Docker 部署

项目提供多阶段 Dockerfile，通过 `--build-arg` 参数选择构建环境和目标项目。

### 构建镜像

```bash
# 构建 web 用户端
docker build --build-arg BUILD_TARGET=web --build-arg NODE_ENV=production -t openclaw-web .

# 构建 admin 管理后台
docker build --build-arg BUILD_TARGET=admin --build-arg NODE_ENV=production -t openclaw-admin .

# 构建全部
docker build --build-arg BUILD_TARGET=all --build-arg NODE_ENV=production -t openclaw-all .
```

### 运行容器

```bash
docker run -d -p 80:80 openclaw-all
```

### Jenkins CI/CD 集成

Dockerfile 的 ARG 参数可直接对接 Jenkins 的参数化构建：

```groovy
pipeline {
    agent any
    parameters {
        choice(name: 'BUILD_TARGET', choices: ['all', 'web', 'admin'], description: '构建目标')
        choice(name: 'NODE_ENV', choices: ['production', 'development'], description: '构建环境')
    }
    stages {
        stage('Build') {
            steps {
                sh """
                    docker build \
                        --build-arg BUILD_TARGET=${params.BUILD_TARGET} \
                        --build-arg NODE_ENV=${params.NODE_ENV} \
                        -t openclaw-${params.BUILD_TARGET}:${BUILD_NUMBER} .
                """
            }
        }
        stage('Deploy') {
            steps {
                sh "docker run -d -p 80:80 openclaw-${params.BUILD_TARGET}:${BUILD_NUMBER}"
            }
        }
    }
}
```

### Docker 构建参数

| 参数           | 默认值       | 说明                                   |
| -------------- | ------------ | -------------------------------------- |
| `BUILD_TARGET` | `all`        | 构建目标：`web` / `admin` / `all`      |
| `NODE_ENV`     | `production` | 构建环境：`development` / `production` |

### Nginx 配置

容器内使用 Nginx 提供静态文件服务，默认配置（`docker/nginx.conf`）：

- `/` → web 用户端
- `/admin` → admin 管理后台
- `/api/` → 反向代理到后端服务

## 代码格式化

```bash
pnpm format
```

## 代码检查

```bash
pnpm lint
```

## .cursor 目录（Cursor AI）

仓库内维护 Cursor 使用的**项目规则**、**子代理**与 **Skill**，与 ESLint/Prettier 互补：前者主要约束 AI 对话与生成代码时的习惯，后者约束构建与提交时的静态检查。

### Rules（`.cursor/rules/`）

| 路径                               | 说明                                                           |
| ---------------------------------- | -------------------------------------------------------------- |
| `rules/base/core.mdc`              | 通用规则：中文回复、沿用项目既有风格、精简输出等               |
| `rules/base/project-structure.mdc` | Monorepo 与业务应用目录约定、命名规范                          |
| `rules/frontend/general.mdc`       | 技术栈与通用开发原则（Vue 3、Vite、Pinia、Naive UI / Vant 等） |
| `rules/frontend/vue.mdc`           | Vue 组件与组合式 API 约定                                      |
| `rules/frontend/typescript.mdc`    | TypeScript 使用约定                                            |
| `rules/frontend/git.mdc`           | 辅助生成符合规范的 Git 提交信息                                |
| `rules/frontend/document.mdc`      | 文档与 README 编写规范                                         |

### Agents（`.cursor/agents/`）

| 文件                   | 用途                                              |
| ---------------------- | ------------------------------------------------- |
| `security-reviewer.md` | 安全审查子代理：注入、XSS、硬编码密钥、认证授权等 |
| `verifier-reviewer.md` | 验证子代理：核对实现、跑测试并汇总结果            |

### Skills（`.cursor/skills/`）

| 路径                  | 说明                                                   |
| --------------------- | ------------------------------------------------------ |
| `code-style/SKILL.md` | 代码风格 Skill：命名、缩进、注释、与项目既有风格对齐等 |

> 增删或调整上述文件后，建议同步更新本 README 的表格与「项目结构」树状图。

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
- 遵循 ESLint 和 Prettier 规范；与 AI 协作时同时参考 `.cursor/rules` 与 `skills/code-style`
- 组件命名使用 PascalCase
- 文件命名使用 PascalCase (Vue 组件) 或 camelCase (TS 文件)

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## License

MIT
