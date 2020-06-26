import { checkGitStatus } from 'clean-scripts'

const tsFiles = `"src/**/*.ts"`

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
    ts: `eslint --ext .js,.ts ${tsFiles}`,
    export: `no-unused-export ${tsFiles}`,
    markdown: `markdownlint README.md`,
    typeCoverage: 'type-coverage -p src --strict'
  },
  test: [
    'clean-release --config clean-run.config.ts',
    () => checkGitStatus()
  ],
  fix: `eslint --ext .js,.ts ${tsFiles} --fix`,
  watch: {
    ts: `${tscSrcCommand} --watch`,
    demo: `${demoCommand} --watch`
  }
}
