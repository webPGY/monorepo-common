const chalk = require('chalk')
const ora = require('ora')
const execa = require('execa')
const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.join(__dirname, '..')
const ROOT_DIST = path.join(ROOT_DIR, 'dist')

// 解析 .env 文件
function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {}
  const content = fs.readFileSync(envPath, 'utf-8')
  const env = {}
  content.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const [key, ...rest] = trimmed.split('=')
    if (key) env[key.trim()] = rest.join('=').trim()
  })
  return env
}

// 获取 packages 目录下所有的包
function getPackages() {
  const packagesDir = path.join(ROOT_DIR, 'packages')
  const packages = fs.readdirSync(packagesDir).filter(dir => {
    const pkgPath = path.join(packagesDir, dir, 'package.json')
    return fs.existsSync(pkgPath)
  })

  return packages.map(pkg => {
    const pkgJson = require(path.join(packagesDir, pkg, 'package.json'))
    return {
      name: pkgJson.name || pkg,
      path: pkg,
      description: pkgJson.description || '',
      version: pkgJson.version || '1.0.0'
    }
  })
}

// 清理根目录 dist 下指定子目录
function cleanDist(packageNames) {
  packageNames.forEach(name => {
    const distPath = path.join(ROOT_DIST, name)
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true, force: true })
    }
  })
}

// 获取目录大小
function getDirSize(dirPath) {
  let size = 0
  const files = fs.readdirSync(dirPath)
  files.forEach(file => {
    const filePath = path.join(dirPath, file)
    const stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      size += getDirSize(filePath).size
    } else {
      size += stats.size
    }
  })
  return { size }
}

// 格式化字节
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 主函数
async function main() {
  // 优先从命令行参数获取，其次从环境变量获取
  const mode = process.env.NODE_ENV || 'production'
  const buildTarget = process.env.BUILD_TARGET || 'all'

  // 加载对应的 .env 文件（仅作为 fallback，环境变量优先）
  const envFileName = mode === 'production' ? '.env.production' : '.env.development'
  const envFile = loadEnvFile(path.join(ROOT_DIR, envFileName))
  const finalTarget = process.env.BUILD_TARGET || envFile.BUILD_TARGET || 'all'

  console.log(chalk.bold.cyan('\n🏗️  OpenClaw Project Builder\n'))
  console.log(chalk.blue(`   环境: ${mode}`))
  console.log(chalk.blue(`   目标: ${finalTarget}\n`))

  const allPackages = getPackages()

  if (allPackages.length === 0) {
    console.log(chalk.red('❌ 没有找到可用的包'))
    process.exit(1)
  }

  // 根据 BUILD_TARGET 筛选要构建的包
  let selected
  if (finalTarget === 'all') {
    selected = allPackages.map(pkg => pkg.path)
  } else {
    const targets = finalTarget.split(',').map(t => t.trim())
    selected = allPackages
      .filter(pkg => targets.includes(pkg.path) || targets.includes(pkg.name))
      .map(pkg => pkg.path)
  }

  if (selected.length === 0) {
    console.log(chalk.red(`❌ 未找到匹配的构建目标: ${finalTarget}`))
    console.log(chalk.yellow(`   可用项目: ${allPackages.map(p => p.path).join(', ')}`))
    process.exit(1)
  }

  console.log(chalk.green(`✅ 将构建 ${selected.length} 个项目:\n`))
  selected.forEach(pkg => {
    console.log(chalk.white(`  - ${pkg}`))
  })
  console.log()

  cleanDist(selected)

  if (!fs.existsSync(ROOT_DIST)) {
    fs.mkdirSync(ROOT_DIST, { recursive: true })
  }

  // 收集 .env 文件中 VITE_ 开头的变量，注入到子项目构建中
  const viteEnv = {}
  Object.entries(envFile).forEach(([key, value]) => {
    if (key.startsWith('VITE_')) {
      viteEnv[key] = value
    }
  })

  let successCount = 0
  let failCount = 0

  for (const pkgPath of selected) {
    const pkgDir = path.join(ROOT_DIR, 'packages', pkgPath)
    const pkgJson = require(path.join(pkgDir, 'package.json'))

    const spinner = ora(`正在构建 ${pkgJson.name}...`).start()

    try {
      await execa('pnpm', ['build'], {
        cwd: pkgDir,
        stdio: 'pipe',
        shell: true,
        env: {
          ...process.env,
          ...viteEnv,
          NODE_ENV: mode
        }
      })

      spinner.succeed(`构建完成: ${pkgJson.name}`)
      successCount++

      const distPath = path.join(ROOT_DIST, pkgPath)
      if (fs.existsSync(distPath)) {
        const stats = getDirSize(distPath)
        console.log(chalk.gray(`   📦 产物大小: ${formatBytes(stats.size)}`))
        console.log(chalk.gray(`   📁 输出目录: ${distPath}\n`))
      }
    } catch (error) {
      spinner.fail(`构建失败: ${pkgJson.name}`)
      console.error(chalk.red(`   ❌ 错误信息: ${error.message}\n`))
      failCount++
    }
  }

  // 生成 version.txt 到每个成功构建的子项目 dist 目录
  if (successCount > 0) {
    const buildTime = new Date().toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    const rootPkgJson = require(path.join(ROOT_DIR, 'package.json'))

    for (const pkgPath of selected) {
      const distPath = path.join(ROOT_DIST, pkgPath)
      if (!fs.existsSync(distPath)) continue

      const pkgDir = path.join(ROOT_DIR, 'packages', pkgPath)
      const pkgJson = require(path.join(pkgDir, 'package.json'))

      const versionContent = [
        `project: ${pkgJson.name}`,
        `version: ${pkgJson.version}`,
        `environment: ${mode}`,
        `build_target: ${finalTarget}`,
        `build_time: ${buildTime}`,
        `node_env: ${mode}`,
        `app_version: ${rootPkgJson.version}`
      ].join('\n') + '\n'

      fs.writeFileSync(path.join(distPath, 'version.txt'), versionContent)
    }

    console.log(chalk.green('  📄 version.txt 已生成到各产物目录'))
  }

  console.log(chalk.bold.cyan('\n📊 构建统计:\n'))
  console.log(chalk.green(`  ✅ 成功: ${successCount} 个`))
  if (failCount > 0) {
    console.log(chalk.red(`  ❌ 失败: ${failCount} 个`))
  }
  console.log()

  if (failCount > 0) {
    process.exit(1)
  }
}

main().catch(error => {
  console.error(chalk.red(error.message))
  process.exit(1)
})
