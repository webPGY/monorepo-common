const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')
const ora = require('ora')
const execa = require('execa')

const rootDir = path.join(__dirname, '..')
const widgetsDir = path.join(rootDir, 'widgets')

function getWidgetPackages() {
  if (!fs.existsSync(widgetsDir)) {
    return []
  }
  return fs
    .readdirSync(widgetsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .filter(name => {
      const pkgPath = path.join(widgetsDir, name, 'package.json')
      return fs.existsSync(pkgPath)
    })
    .map(name => {
      const pkgPath = path.join(widgetsDir, name, 'package.json')
      const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
      return {
        dirName: name,
        name: pkgJson.name || name,
        version: pkgJson.version || '0.0.0',
        description: pkgJson.description || ''
      }
    })
}

function readWidgetPackageJson(pkgDir) {
  const pkgPath = path.join(pkgDir, 'package.json')
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
}

async function buildPackage(pkg) {
  const pkgDir = path.join(widgetsDir, pkg.dirName)
  const spinner = ora(`构建 ${pkg.name}...`).start()

  try {
    await execa('pnpm', ['run', 'build'], {
      cwd: pkgDir,
      stdio: 'pipe'
    })
    spinner.succeed(`构建完成: ${pkg.name}`)
    return true
  } catch (error) {
    spinner.fail(`构建失败: ${pkg.name}`)
    console.error(chalk.red(error.stdout || error.stderr || error.message))
    return false
  }
}

function updatePackageExportsForPublish(pkgDir) {
  const pkgPath = path.join(pkgDir, 'package.json')
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  const originalExports = JSON.parse(JSON.stringify(pkgJson.exports))

  // 更新 exports 指向 dist（发布时使用构建产物）
  if (pkgJson.exports && pkgJson.exports['.']) {
    pkgJson.exports['.'].import = './dist/index.es.js'
    pkgJson.exports['.'].require = './dist/index.umd.js'
    // types 保持指向 src，因为 .d.ts 可能未生成或需要源码类型
    if (!pkgJson.exports['.'].types || pkgJson.exports['.'].types.includes('dist')) {
      pkgJson.exports['.'].types = './src/index.ts'
    }
  }

  fs.writeFileSync(pkgPath, `${JSON.stringify(pkgJson, null, 2)}\n`, 'utf8')
  return originalExports
}

function restorePackageExports(pkgDir, originalExports) {
  const pkgPath = path.join(pkgDir, 'package.json')
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  pkgJson.exports = originalExports
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkgJson, null, 2)}\n`, 'utf8')
}
function getAccessToken() {
  // 优先使用环境变量 NPM_GH_TOKEN，其次 NPM_TOKEN
  return process.env.NPM_GH_TOKEN || process.env.NPM_TOKEN || null
}

/** pnpm 不支持 `publish --token`，在包目录写入临时 .npmrc（pnpm 会合并该目录下的配置） */
function buildPublishNpmrcContent(registry, token, packageName) {
  let host
  try {
    host = new URL(registry).host
  } catch {
    host = 'npm.pkg.github.com'
  }
  const scopeMatch = packageName.match(/^@([^/]+)\//)
  const lines = []
  if (scopeMatch) {
    lines.push(`@${scopeMatch[1]}:registry=${registry}`)
  }
  lines.push(`//${host}/:_authToken=${token}`)
  return `${lines.join('\n')}\n`
}

/**
 * 在 widget 包目录写入认证用 .npmrc，返回恢复函数（备份原文件若存在）
 */
function applyPublishNpmrc(pkgDir, registry, token, packageName) {
  const npmrcPath = path.join(pkgDir, '.npmrc')
  const backupPath = path.join(
    pkgDir,
    `.npmrc.__openclaw_publish_backup_${process.pid}_${Date.now()}`
  )
  const hadExisting = fs.existsSync(npmrcPath)
  if (hadExisting) {
    fs.copyFileSync(npmrcPath, backupPath)
  }
  fs.writeFileSync(npmrcPath, buildPublishNpmrcContent(registry, token, packageName), 'utf8')

  return function restorePublishNpmrc() {
    try {
      if (hadExisting) {
        fs.copyFileSync(backupPath, npmrcPath)
        fs.unlinkSync(backupPath)
      } else if (fs.existsSync(npmrcPath)) {
        fs.unlinkSync(npmrcPath)
      }
    } catch {
      // ignore
    }
  }
}

async function publishPackage(pkg, registry) {
  const pkgDir = path.join(widgetsDir, pkg.dirName)
  const spinner = ora(`发布 ${pkg.name}@${pkg.version}...`).start()

  try {
    // 临时更新 exports 指向 dist
    const originalExports = updatePackageExportsForPublish(pkgDir)

    let restorePublishNpmrc = null
    try {
      const token = getAccessToken()
      if (token) {
        restorePublishNpmrc = applyPublishNpmrc(pkgDir, registry, token, pkg.name)
      }

      const args = ['publish', '--filter', pkg.name, '--no-git-checks']
      if (registry) {
        args.push('--registry', registry)
      }
      if (registry && registry.includes('npm.pkg.github.com')) {
        const access = process.env.NPM_PUBLISH_ACCESS || 'public'
        args.push('--access', access)
      }
      await execa('pnpm', args, {
        cwd: rootDir,
        stdio: 'inherit'
      })
      spinner.succeed(`发布成功: ${pkg.name}@${pkg.version}`)
      return true
    } finally {
      if (typeof restorePublishNpmrc === 'function') {
        restorePublishNpmrc()
      }
      // 恢复 exports 指向 src（开发时使用）
      restorePackageExports(pkgDir, originalExports)
    }
  } catch (error) {
    spinner.fail(`发布失败: ${pkg.name}`)
    console.error(chalk.red(error.stdout || error.stderr || error.message))
    // 确保恢复 exports（pkgDir 已在上面定义）
    try {
      const pkgPath = path.join(pkgDir, 'package.json')
      const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
      if (pkgJson.exports && pkgJson.exports['.']) {
        pkgJson.exports['.'].import = './src/index.ts'
        pkgJson.exports['.'].types = './src/index.ts'
        delete pkgJson.exports['.'].require
        fs.writeFileSync(pkgPath, `${JSON.stringify(pkgJson, null, 2)}\n`, 'utf8')
      }
    } catch {
      console.error(chalk.yellow(`警告: 恢复 ${pkg.name} 的 exports 失败`))
    }
    return false
  }
}

const DEFAULT_GH_PACKAGES_REGISTRY = 'https://npm.pkg.github.com'

async function main() {
  // 未显式设置时默认发往 GitHub Packages，避免误发到 registry.npmjs.org
  const registry = process.env.NPM_PUBLISH_REGISTRY || DEFAULT_GH_PACKAGES_REGISTRY
  const pkgs = getWidgetPackages()

  if (pkgs.length === 0) {
    console.log(chalk.yellow('widgets/ 下未找到带 package.json 的包，跳过发布。'))
    process.exit(0)
  }

  console.log(chalk.bold.cyan('\n📦 发布 widgets 包\n'))
  if (registry) {
    console.log(chalk.gray(`registry: ${registry}\n`))
  }
  if (!getAccessToken() && registry && registry.includes('npm.pkg.github.com')) {
    console.log(
      chalk.yellow(
        '⚠️  未检测到 NPM_GH_TOKEN / NPM_TOKEN，发布 GitHub Packages 通常会失败。请 export 后再执行，或配置本机 ~/.npmrc。\n'
      )
    )
  }

  // 交互式选择要发布的包
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedPackages',
      message: '请选择要发布的包 (空格选择，回车确认):',
      choices: pkgs.map(pkg => ({
        name: `${chalk.cyan(pkg.name)} ${chalk.gray(`(${pkg.dirName})`)} ${chalk.yellow(`v${pkg.version}`)} ${pkg.description ? chalk.gray(`- ${pkg.description}`) : ''}`,
        value: pkg.dirName,
        short: pkg.name
      })),
      pageSize: 10,
      validate: answer => {
        if (answer.length < 1) {
          return '请至少选择一个包'
        }
        return true
      }
    }
  ])

  const selected = answers.selectedPackages

  if (selected.length === 0) {
    console.log(chalk.yellow('\n⚠️  没有选择任何包'))
    process.exit(0)
  }

  const selectedPkgs = pkgs.filter(pkg => selected.includes(pkg.dirName))

  console.log(chalk.green(`\n✅ 已选择 ${selectedPkgs.length} 个包:\n`))
  selectedPkgs.forEach(pkg => {
    console.log(chalk.white(`  - ${pkg.name}@${pkg.version} (${pkg.dirName})`))
  })
  console.log()

  // 确认发布
  const confirm = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: '确认发布以上包？',
      default: false
    }
  ])

  if (!confirm.confirmed) {
    console.log(chalk.yellow('\n已取消发布'))
    process.exit(0)
  }

  console.log()

  // 依次构建和发布
  const results = []
  for (const pkg of selectedPkgs) {
    console.log(chalk.bold(`\n处理: ${pkg.name}@${pkg.version}`))
    console.log(chalk.gray('─'.repeat(50)))

    const pkgDirForMeta = path.join(widgetsDir, pkg.dirName)
    try {
      const rawPkg = readWidgetPackageJson(pkgDirForMeta)
      if (rawPkg.private === true) {
        console.log(
          chalk.red(
            `\n❌ ${pkg.name}：package.json 中 "private": true 时 npm/pnpm **不会**把包装发到任何 registry（包括 GitHub Packages）。请改为 false 后再发布。\n`
          )
        )
        results.push({ pkg, success: false, step: 'private' })
        continue
      }
    } catch {
      console.log(chalk.red(`\n❌ 读取 ${pkg.name} 的 package.json 失败\n`))
      results.push({ pkg, success: false, step: 'read' })
      continue
    }

    // 先构建
    const buildSuccess = await buildPackage(pkg)
    if (!buildSuccess) {
      console.log(chalk.red(`\n❌ ${pkg.name} 构建失败，跳过发布\n`))
      results.push({ pkg, success: false, step: 'build' })
      continue
    }

    // 再发布
    const publishSuccess = await publishPackage(pkg, registry)
    if (publishSuccess) {
      results.push({ pkg, success: true })
    } else {
      results.push({ pkg, success: false, step: 'publish' })
    }
  }

  // 汇总结果
  console.log(chalk.bold.cyan('\n\n📊 发布结果汇总\n'))
  const successCount = results.filter(r => r.success).length
  const failCount = results.length - successCount

  results.forEach(({ pkg, success, step }) => {
    if (success) {
      console.log(chalk.green(`  ✅ ${pkg.name}@${pkg.version} - 发布成功`))
    } else {
      const stepMap = {
        build: '构建失败',
        publish: '发布失败',
        private: 'private:true 不可发布',
        read: '读取 package.json 失败'
      }
      const stepText = stepMap[step] || '发布失败'
      console.log(chalk.red(`  ❌ ${pkg.name}@${pkg.version} - ${stepText}`))
    }
  })

  console.log()
  if (failCount === 0) {
    console.log(chalk.green(`✅ 全部 ${successCount} 个包发布成功\n`))
  } else {
    console.log(chalk.yellow(`⚠️  成功: ${successCount}, 失败: ${failCount}\n`))
    process.exit(1)
  }
}

main().catch(err => {
  console.error(chalk.red(err.message || err))
  process.exit(1)
})
