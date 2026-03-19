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

// 主函数
async function main() {
  console.log(chalk.bold.cyan('\n🚀 OpenClaw Project Dev Server\n'))

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
      message: '请选择要启动的项目 (空格选择，回车确认):',
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
    }
  ])

  const selected = answers.selectedPackages

  if (selected.length === 0) {
    console.log(chalk.yellow('\n⚠️  没有选择任何项目'))
    process.exit(0)
  }

  console.log(chalk.green(`\n✅ 已选择 ${selected.length} 个项目:\n`))
  selected.forEach(pkg => {
    console.log(chalk.white(`  - ${pkg}`))
  })
  console.log()

  // 启动选中的项目
  const spinner = ora('正在启动项目...').start()

  try {
    const children = selected.map(pkgPath => {
      const pkgDir = path.join(__dirname, '..', 'packages', pkgPath)
      const pkgJson = require(path.join(pkgDir, 'package.json'))

      const child = execa('pnpm', ['dev'], {
        cwd: pkgDir,
        stdio: 'inherit',
        shell: true
      })

      child.catch(error => {
        console.error(chalk.red(`\n❌ ${pkgJson.name} 异常退出: ${error.message}`))
      })

      return { name: pkgJson.name, process: child }
    })

    spinner.succeed('所有项目已启动')
    children.forEach(({ name }) => {
      console.log(chalk.green(`  ✔ ${name}`))
    })
    console.log(chalk.gray('\n按 Ctrl+C 停止所有项目\n'))

    const exitHandler = () => {
      console.log(chalk.yellow('\n\n🛑 正在停止所有项目...'))
      children.forEach(({ name, process: child }) => {
        child.kill()
        console.log(chalk.gray(`  ✔ 已停止 ${name}`))
      })
      process.exit(0)
    }

    process.on('SIGINT', exitHandler)
    process.on('SIGTERM', exitHandler)

    await Promise.all(children.map(({ process: child }) => child))
  } catch (error) {
    spinner.fail('启动失败')
    console.error(chalk.red(error.message))
    process.exit(1)
  }
}

main().catch(error => {
  console.error(chalk.red(error.message))
  process.exit(1)
})
