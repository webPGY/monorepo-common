const inquirer = require('inquirer')
const chalk = require('chalk')
const ora = require('ora')
const execa = require('execa')
const fs = require('fs')
const path = require('path')

// 获取 packages 目录下所有的包
function getPackages() {
  const packagesDir = path.join(__dirname, '..', 'packages')
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

// 根目录 dist 路径
const ROOT_DIST = path.join(__dirname, '..', 'dist')

// 清理根目录 dist 下指定子目录
function cleanDist(packageNames) {
  packageNames.forEach(name => {
    const distPath = path.join(ROOT_DIST, name)
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true, force: true })
    }
  })
}

// 主函数
async function main() {
  console.log(chalk.bold.cyan('\n🏗️  OpenClaw Project Builder\n'))

  const packages = getPackages()

  if (packages.length === 0) {
    console.log(chalk.red('❌ 没有找到可用的包'))
    process.exit(1)
  }

  // 交互式选择
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedPackages',
      message: '请选择要构建的项目 (空格选择，回车确认):',
      choices: packages.map(pkg => ({
        name: `${chalk.cyan(pkg.name)} ${chalk.gray(`(${pkg.path})`)} ${pkg.description ? chalk.yellow(`- ${pkg.description}`) : ''}`,
        value: pkg.path,
        short: pkg.name
      })),
      pageSize: 10,
      validate: answer => {
        if (answer.length < 1) {
          return '请至少选择一个项目'
        }
        return true
      }
    },
    {
      type: 'list',
      name: 'buildMode',
      message: '请选择构建模式:',
      choices: [
        { name: '生产环境 (production)', value: 'production' },
        { name: '开发环境 (development)', value: 'development' }
      ],
      default: 'production'
    }
  ])

  const selected = answers.selectedPackages
  const mode = answers.buildMode

  if (selected.length === 0) {
    console.log(chalk.yellow('\n⚠️  没有选择任何项目'))
    process.exit(0)
  }

  console.log(chalk.green(`\n✅ 已选择 ${selected.length} 个项目:\n`))
  selected.forEach(pkg => {
    console.log(chalk.white(`  - ${pkg}`))
  })
  console.log(chalk.blue(`\n🔨 构建模式: ${mode}\n`))

  // 构建前清理对应的 dist 子目录
  cleanDist(selected)

  // 确保根目录 dist 存在
  if (!fs.existsSync(ROOT_DIST)) {
    fs.mkdirSync(ROOT_DIST, { recursive: true })
  }

  // 构建选中的项目
  let successCount = 0
  let failCount = 0

  for (const pkgPath of selected) {
    const pkgDir = path.join(__dirname, '..', 'packages', pkgPath)
    const pkgJson = require(path.join(pkgDir, 'package.json'))

    const spinner = ora(`正在构建 ${pkgJson.name}...`).start()

    try {
      await execa('pnpm', ['build'], {
        cwd: pkgDir,
        stdio: 'pipe',
        shell: true,
        env: { NODE_ENV: mode }
      })

      spinner.succeed(`构建完成: ${pkgJson.name}`)
      successCount++

      // 输出构建产物信息（产物在根目录 dist/<package> 下）
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

  // 输出构建统计
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

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

main().catch(error => {
  console.error(chalk.red(error.message))
  process.exit(1)
})
