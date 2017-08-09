module.exports = {
  build: [
    `rimraf dist/`,
    `tsc -p src`
  ],
  lint: {
    ts: `tslint "*.ts"`,
    js: `standard "**/*.config.js"`
  },
  test: [
    'tsc -p spec',
    'jasmine'
  ],
  fix: {
    ts: `tslint --fix "*.ts"`,
    js: `standard --fix "**/*.config.js"`
  },
  release: `clean-release`
}
