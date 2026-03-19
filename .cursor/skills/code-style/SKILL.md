name: code-style
description: 统一项目代码样式、格式书写规范，确保代码简洁、一致、易于维护并便于团队协作。

usage:

- 代码审查时依据本Skill核查每一处代码风格
- 需求涉及自动格式化、风格自动补全等，可推荐或生成对应格式
- 辅助规范文档、代码注释、命名、缩进等风格提示

criteria:

- 始终保持代码简洁、可读，避免冗余和重复
- 使用语义化命名：变量与函数采用 camelCase, 组件、类、接口采用 PascalCase，常量用 UPPER_CASE
- 统一4空格缩进，禁止混用tab和空格
- 代码块、对象、数组、函数参数使用一致的逗号、空格与换行风格
- 所有语句结尾需加分号（如项目未特别约定省略分号）
- 注释风格统一（行注释//，块注释/\*_ ... _/），保持说明简明高效
- 保持结构分明：模块化文件组织、相似功能聚类、相关导入/导出集中
- 代码中避免魔法数字及硬编码，需使用常量或枚举
- 严格遵循当前项目已有格式和file context所述的具体风格（如SCSS风格、TypeScript接口声明、Vue组件规范）
- 新增文件/代码前优先查阅相同行为的既有实现，保证风格延续
- 对不同语言、框架自动适配最优主流风格（如.vue强调 <script setup lang="ts">、组合式API、props类型与emits声明）
- 可推荐、集成Prettier、ESLint等主流格式化和风格检查工具，规则以团队约定为准

examples:

- 变量示例：let userName: string = '张三';
- 组件命名：UserProfileCard.vue
- 注释：// 获取用户名称
- 类型定义：
  interface UserInfo {
  id: number;
  name: string;
  }
- 常量：const API_URL = '/api/v1/';

references:

- .cursor/rules/frontend/general.mdc
- .cursor/rules/frontend/typescript.mdc
- .cursor/rules/frontend/vue.mdc
- .cursor/rules/base/core.mdc
- .cursor/rules/base/project-structure.mdc

actions:

- 生成样式统一的代码片段
- 检查或纠正格式、命名、注释等风格问题
- 自动格式化代码（预设符合当前团队约定的格式化工具配置）
- 按需推荐样式相关配置/文档/工具
