module.exports = {
  types: [
    { value: 'feat', name: 'feat:     新功能' },
    { value: 'fix', name: 'fix:      修复Bug' },
    { value: 'docs', name: 'docs:     文档变更' },
    { value: 'style', name: 'style:    代码格式（不影响功能）' },
    { value: 'refactor', name: 'refactor: 代码重构（非新增功能/修复Bug）' },
    { value: 'perf', name: 'perf:     性能优化' },
    { value: 'test', name: 'test:     添加测试' },
    { value: 'build', name: 'build:    构建相关变更' },
    { value: 'ci', name: 'ci:       CI/CD 配置变更' },
    { value: 'chore', name: 'chore:    其他变更' },
    { value: 'revert', name: 'revert:   回退提交' }
  ],
  scopes: [
    { name: 'web' },
    { name: 'admin' },
    { name: 'root' },
    { name: 'scripts' },
    { name: 'config' }
  ],
  messages: {
    type: '请选择提交类型:',
    scope: '请选择影响范围（可选）:',
    customScope: '请输入自定义影响范围:',
    subject: '请简要描述提交内容（必填）:',
    body: '请输入详细描述（可选）:',
    breaking: '列出所有Breaking Changes（可选）:',
    footer: '请输入关联的Issue（可选，如: #31, #34）:',
    confirmCommit: '确认提交以上信息?'
  },
  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix'],
  subjectLimit: 100
}
