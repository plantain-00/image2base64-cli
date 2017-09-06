const childProcess = require('child_process')
const util = require('util')

const execAsync = util.promisify(childProcess.exec)

module.exports = {
  build: [
    `rimraf dist/`,
    `tsc -p src`
  ],
  lint: {
    ts: `tslint "src/**/*.ts" "spec/*.ts"`,
    js: `standard "**/*.config.js"`,
    export: `no-unused-export "src/**/*.ts" "spec/*.ts"`
  },
  test: [
    'tsc -p spec',
    'jasmine',
    [
      'rimraf demo/variables.*',
      'node dist/index.js demo/*.ico --json demo/variables.json --scss demo/variables.scss --less demo/variables.less --es6 demo/variables.js --base demo'
    ],
    async () => {
      const { stdout } = await execAsync('git status -s')
      if (stdout) {
        console.log(stdout)
        throw new Error(`generated files doesn't match.`)
      }
    }
  ],
  fix: {
    ts: `tslint --fix "src/**/*.ts" "spec/*.ts"`,
    js: `standard --fix "**/*.config.js"`
  },
  release: `clean-release`,
  watch: 'node dist/index.js demo/*.ico --json demo/variables.json --scss demo/variables.scss --less demo/variables.less --es6 demo/variables.js --base demo --watch'
}
