const inquirer = require('inquirer')
const chalk = require('chalk')
const execa = require('execa')
const fs = require('fs')
const path = require('path')

const ROOT_DIST = path.join(__dirname, '..', 'dist')

function getBuiltPackages() {
  if (!fs.existsSync(ROOT_DIST)) return []

  return fs.readdirSync(ROOT_DIST).filter(dir => {
    const indexPath = path.join(ROOT_DIST, dir, 'index.html')
    return fs.existsSync(indexPath)
  })
}

async function main() {
  console.log(chalk.bold.cyan('\n👀  OpenClaw Project Previewer\n'))

  const packages = getBuiltPackages()

  if (packages.length === 0) {
    console.log(chalk.red('❌ 没有找到构建产物，请先执行 pnpm build'))
    process.exit(1)
  }

  const { selectedPackage, port } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedPackage',
      message: '请选择要预览的项目:',
      choices: packages.map(pkg => ({
        name: `${chalk.cyan(pkg)} ${chalk.gray(`(dist/${pkg})`)}`,
        value: pkg,
        short: pkg
      }))
    },
    {
      type: 'input',
      name: 'port',
      message: '预览端口号:',
      default: '4173',
      validate: val => /^\d+$/.test(val) ? true : '请输入有效的端口号'
    }
  ])

  const previewDir = path.join(ROOT_DIST, selectedPackage)

  console.log(chalk.cyan(`\n🌐 启动预览服务器: http://localhost:${port}`))
  console.log(chalk.gray(`   预览目录: ${previewDir}`))
  console.log(chalk.gray('   按 Ctrl+C 停止服务器\n'))

  await execa('npx', ['serve', previewDir, '-s', '-l', port], {
    stdio: 'inherit',
    shell: true
  })
}

main().catch(error => {
  console.error(chalk.red(error.message))
  process.exit(1)
})
