# widgets

存放可独立发布的 NPM 包（与 `packages` 下的应用/库并列，由根 workspace 链接）。

## 约定

- 每个子目录一个包，根目录需有 `package.json`，`name` 的 scope（`@xxx/`）须与 **GitHub 用户名或组织名** 一致，否则无法发到 GitHub Packages。
- **`packages` 内代码必须通过包名引用**，禁止写相对/绝对路径指向 `widgets`（由 ESLint 校验）。

## 示例包

| 目录 | 包名 | 说明 |
|------|------|------|
| `openclaw-components` | `@webPGY/openclaw-components` | 演示组件 `OpenclawWidgetDemo`；用户端联调路由：`/widget-demo`（`packages/web`） |

## 在 packages 中依赖

在对应应用的 `package.json` 的 `dependencies` 中声明：

```json
{
  "dependencies": {
    "@webPGY/openclaw-components": "workspace:*"
  }
}
```

然后执行 `pnpm install`。

## 发布到 GitHub Packages

### 为什么「发布成功」但 GitHub 里看不到包？

常见原因：

1. **看错了入口：仓库主页 ≠ 包一定挂在仓库下**  
   GitHub Packages 的 npm 包**默认挂在「与 scope 同名的用户或组织」**下。例如 `@webPGY/openclaw-components` 会出现在 **用户/组织 `webPGY` 的 Packages**，地址类似：  
   `https://github.com/orgs/webPGY/packages` 或 `https://github.com/webPGY?tab=packages`  
   **若希望在本仓库首页右侧也出现「Packages」**，必须在 `package.json` 里配置 **`repository`**（指向该 GitHub 仓库；monorepo 建议加 **`directory`** 指向子目录）。本仓库示例包已配置 `repository` + `directory: widgets/openclaw-components`。  
   修改仓库地址时请同步改 `widgets/<包名>/package.json` 里的 `repository.url`。

2. **实际发到了 npm 官方源**  
   若未指定 `registry` 或未配置 `@scope:registry=https://npm.pkg.github.com`，`pnpm publish` 可能走 `https://registry.npmjs.org/`。  
   本项目 `publish:widgets` 默认使用 `https://npm.pkg.github.com`，且包内配有 `publishConfig.registry`。

3. **scope 必须对应 GitHub 用户或组织**  
   `@你的GitHub用户名或组织名/包名` 与发布所用 token 的主体必须一致，且 token 需含 `write:packages`。

4. **`private: true` 会导致根本发不出去**  
   npm / pnpm 规定：`package.json` 里 **`"private": true` 的包禁止发布到任何 registry**。此时即使用 `publish:widgets` 也可能在「构建成功」后于发布步骤失败，或你以为发了但 registry 上永远没有版本。要发到 GitHub Packages 的 widget 包请使用 **`"private": false`**（本仓库示例包已按此配置）。

5. **`npm view` 未带 token 时，GitHub 常直接返回 404**（不代表一定没有包）。请带认证再查，例如先准备仅含下列内容的临时 `.npmrc`（勿提交）：

   ```ini
   @webPGY:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=你的token
   ```

   然后：

   ```bash
   npm view @webPGY/openclaw-components --registry=https://npm.pkg.github.com
   ```

   或在同一终端已 `export NPM_GH_TOKEN=...` 且使用上面 `.npmrc` 的 `${NPM_GH_TOKEN}` 写法后再执行 `npm view`。

### 认证（勿把 token 写进 Git）

- 将 `widgets/openclaw-components/.npmrc.example` 复制为同目录 `.npmrc`（`.npmrc` 已被 `.gitignore` 忽略）。
- 使用环境变量 `NPM_GH_TOKEN`（或脚本支持的 `NPM_TOKEN`），不要在仓库中提交明文 token。  
- 若 token 曾提交到 Git，请在 GitHub 上**立即撤销该 token** 并重新生成。

### 发布流程

1. 在 GitHub 创建 Personal Access Token（需 `write:packages`，组织包还需对应组织权限）。
2. 配置 registry 与认证（推荐环境变量，勿把 token 写进仓库）：
   - 复制 `widgets/openclaw-components/.npmrc.example` 为同目录 `.npmrc`；
   - 在发布终端执行：`export NPM_GH_TOKEN=ghp_xxxx`（Windows 可用 `set` / `$env:`）。`publish-widgets` 会读取 `NPM_GH_TOKEN` 或 `NPM_TOKEN`，并在对应 widget 目录下**临时写入** `.npmrc`（若已有则先备份，结束后还原）；pnpm 的 `publish` 子命令**不支持** `--token`。
3. `@webPGY/openclaw-components` 已配置 `publishConfig.registry` 为 `https://npm.pkg.github.com`；根目录 `pnpm publish:widgets` **默认也会带** `--registry https://npm.pkg.github.com`。
4. 在仓库根目录执行：

   ```bash
   pnpm publish:widgets
   ```

   脚本会：多选包 → 构建 → 临时切换 `exports` 指向 `dist/` → `pnpm publish --filter` → 恢复 `exports`。

5. 若需改发 npm 官方源，可显式覆盖：

   ```bash
   NPM_PUBLISH_REGISTRY=https://registry.npmjs.org pnpm publish:widgets
   ```

### 构建说明

- 开发模式：`exports` 指向 `src/`，Vite 直接编译 `.vue` 源码（支持 HMR）
- 发布模式：构建生成 `dist/`，发布时 `exports` 临时切换为 `dist/`，发布后恢复
- 类型定义：`types` 字段指向 `src/index.ts`（包含在发布包中，供 TypeScript 使用）
