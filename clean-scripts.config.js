const { checkGitStatus } = require('clean-scripts')

const tsFiles = `"src/**/*.ts" "spec/**/*.ts" "demo/**/*.ts"`
const jsFiles = `"*.config.js"`

const tscSrcCommand = `tsc -p src`
const demoCommand = 'node dist/index.js demo/*.ico --json demo/variables.json --scss demo/variables.scss --less demo/variables.less --es6 demo/variables.js --base demo'

module.exports = {
  build: [
    `rimraf dist/`,
    tscSrcCommand,
    'rimraf demo/variables.*',
    demoCommand
  ],
  lint: {
    ts: `tslint ${tsFiles}`,
    js: `standard ${jsFiles}`,
    export: `no-unused-export ${tsFiles}`
  },
  test: [
    'tsc -p spec',
    'jasmine',
    () => checkGitStatus()
  ],
  fix: {
    ts: `tslint --fix ${tsFiles}`,
    js: `standard --fix ${jsFiles}`
  },
  release: `clean-release`,
  watch: {
    ts: `${tscSrcCommand} --watch`,
    demo: `${demoCommand} --watch`
  }
}
