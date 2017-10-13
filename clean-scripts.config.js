const childProcess = require('child_process')
const util = require('util')

const execAsync = util.promisify(childProcess.exec)

const tsFiles = `"src/**/*.ts" "spec/**/*.ts" "demo/**/*.ts"`
const jsFiles = `"*.config.js"`

module.exports = {
  build: [
    `rimraf dist/`,
    `tsc -p src`,
    'rimraf demo/variables.*',
    'node dist/index.js demo/*.ico --json demo/variables.json --scss demo/variables.scss --less demo/variables.less --es6 demo/variables.js --base demo'
  ],
  lint: {
    ts: `tslint ${tsFiles}`,
    js: `standard ${jsFiles}`,
    export: `no-unused-export ${tsFiles}`
  },
  test: [
    'tsc -p spec',
    'jasmine',
    async () => {
      const { stdout } = await execAsync('git status -s')
      if (stdout) {
        console.log(stdout)
        throw new Error(`generated files doesn't match.`)
      }
    }
  ],
  fix: {
    ts: `tslint --fix ${tsFiles}`,
    js: `standard --fix ${jsFiles}`
  },
  release: `clean-release`,
  watch: 'node dist/index.js demo/*.ico --json demo/variables.json --scss demo/variables.scss --less demo/variables.less --es6 demo/variables.js --base demo --watch'
}
