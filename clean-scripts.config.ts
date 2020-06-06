import { checkGitStatus } from 'clean-scripts'

const tsFiles = `"src/**/*.ts"`
const jsFiles = `"*.config.js"`

const tscSrcCommand = `tsc -p src`
const demoCommand = 'node dist/index.js demo/*.ico --json demo/variables.json --scss demo/variables.scss --less demo/variables.less --es6 demo/variables.js --base demo'

export default {
  build: [
    `rimraf dist/`,
    tscSrcCommand,
    'rimraf demo/variables.*',
    demoCommand
  ],
  lint: {
    ts: `eslint --ext .js,.ts ${tsFiles} ${jsFiles}`,
    export: `no-unused-export ${tsFiles}`,
    commit: `commitlint --from=HEAD~1`,
    markdown: `markdownlint README.md`,
    typeCoverage: 'type-coverage -p src --strict'
  },
  test: [
    'clean-release --config clean-run.config.ts',
    () => checkGitStatus()
  ],
  fix: `eslint --ext .js,.ts ${tsFiles} ${jsFiles} --fix`,
  watch: {
    ts: `${tscSrcCommand} --watch`,
    demo: `${demoCommand} --watch`
  }
}
