import * as fs from 'fs'
import minimist from 'minimist'
import glob from 'glob'
import * as path from 'path'
import { fromBuffer } from 'file-type'
import camelcase from 'camelcase'
import * as chokidar from 'chokidar'
import * as util from 'util'
import * as packageJson from '../package.json'

function showToolVersion() {
  console.log(`Version: ${packageJson.version}`)
}

function showHelp() {
  console.log(`Version ${packageJson.version}
Syntax:   image2base64-cli [options] [file...]
Examples: image2base64-cli favicon.ico --scss
          image2base64-cli *.ico --scss variables.scss
          image2base64-cli *.ico --less variables.less
          image2base64-cli *.ico --es6 variables.js
          image2base64-cli *.ico --scss variables.scss --less variables.less --json variables.json --es6 variables.js --base demo
          image2base64-cli *.ico --scss variables.scss --less variables.less --json variables.json --es6 variables.js --base demo --watch
Options:
 -h, --help                                         Print this message.
 -v, --version                                      Print the version
 -w, --watch                                        Watch mode
 --base                                             Base directory
 --json                                             Generate json file of variables
 --scss                                             Generate scss file
 --less                                             Generate less file
 --es6                                              Generate es6 file
`)
}

function globAsync(pattern: string, ignore?: string | string[]) {
  return new Promise<string[]>((resolve, reject) => {
    glob(pattern, { ignore }, (error, matches) => {
      if (error) {
        reject(error)
      } else {
        resolve(matches)
      }
    })
  })
}

const writeFileAsync = util.promisify(fs.writeFile)

function getVariableName(filePath: string) {
  return camelcase(path.normalize(filePath).replace(/\\|\//g, '-'))
}

interface Argv {
  _: string[]
  v?: boolean
  version?: boolean
  base: string
  w?: boolean
  watch?: boolean
  json: unknown
  scss: unknown
  less: unknown
  es6: unknown
  h?: unknown
  help?: unknown
}

async function executeCommandLine() {
  const argv = minimist(process.argv.slice(2), { '--': true }) as unknown as Argv

  const inputFiles = argv._
  const showVersion = argv.v || argv.version
  if (showVersion) {
    showToolVersion()
    return
  }

  if (argv.h || argv.help) {
    showHelp()
    return
  }

  if (!inputFiles || inputFiles.length === 0) {
    throw new Error('Error: no input files.')
  }

  const uniqFiles = await globAsync(argv._.length === 1 ? argv._[0]! : `{${argv._.join(',')}}`)
  const base = argv.base

  const watchMode = argv.w || argv.watch
  if (watchMode) {
    const variables: Variable[] = []
    let count = 0
    chokidar.watch(inputFiles).on('all', (type: string, file: string) => {
      console.log(`Detecting ${type}: ${file}`)
      if (type === 'add' || type === 'change') {
        const index = variables.findIndex(v => v.file === file)
        imageToBase64(file, base).then(variable => {
          if (index === -1) {
            variables.push(variable)
          } else {
            variables[index] = variable
          }
          count++
          if (count >= uniqFiles.length) {
            writeVariables(argv, variables)
          }
        })
      } else if (type === 'unlink') {
        const index = variables.findIndex(v => v.file === file)
        if (index !== -1) {
          variables.splice(index, 1)
          writeVariables(argv, variables)
        }
      }
    })
  } else if (uniqFiles.length > 0) {
    const variables = await Promise.all(uniqFiles.map(file => imageToBase64(file, base)))
    await writeVariables(argv, variables)
  }
}

const readFileAsync = util.promisify(fs.readFile)

async function imageToBase64(file: string, base: string) {
  const buffer = await readFileAsync(file)
  const fileTypeResult = await fromBuffer(buffer)
  if (fileTypeResult) {
    const mime = fileTypeResult.mime
    const base64 = `data:${mime};base64,${buffer.toString('base64')}`
    return { name: base ? path.relative(base, file) : file, file, base64 }
  } else {
    throw new Error('no valid file type')
  }
}

async function writeVariables(argv: Argv, variables: Variable[]) {
  variables.sort((v1, v2) => v1.name.localeCompare(v2.name))
  if (argv.json) {
    if (typeof argv.json === 'string') {
      await writeFileAsync(argv.json, JSON.stringify(variables, null, '  '))
    } else {
      console.log(JSON.stringify(variables, null, '  '))
    }
  }
  if (argv.scss) {
    const content = generatedHead + variables.map(v => `$${v.name.split('.').join('-')}: '${v.base64}';\n`).join('')
    if (typeof argv.scss === 'string') {
      await writeFileAsync(argv.scss, content)
    } else {
      console.log(content)
    }
  }
  if (argv.less) {
    const content = generatedHead + variables.map(v => `@${v.name.split('.').join('-')}: '${v.base64}';\n`).join('')
    if (typeof argv.less === 'string') {
      await writeFileAsync(argv.less, content)
    } else {
      console.log(content)
    }
  }
  const es6 = argv.es6
  if (es6) {
    const wantTypescript = typeof es6 === 'string' && es6.endsWith('.ts')
    let content = generatedHead
    if (wantTypescript) {
      content += '// tslint:disable\n// eslint:disable\n'
    } else {
      content += '// eslint:disable\n'
    }
    content += variables.map(v => `export const ${getVariableName(v.name)} = \`${v.base64}\`\n`).join('')
    if (wantTypescript) {
      content += '// tslint:enable\n// eslint:enable\n'
    } else {
      content += '// eslint:enable\n'
    }
    if (typeof es6 === 'string') {
      await writeFileAsync(es6, content)
    } else {
      console.log(content)
    }
  }
}

interface Variable { name: string; file: string; base64: string; }

const generatedHead = `/**
 * This file is generated by 'image2base64-cli'
 * It is not mean to be edited by hand
 */
`

executeCommandLine().then(() => {
  console.log('image to base64 success.')
}, (error: unknown) => {
  if (error instanceof Error) {
    console.log(error.message)
  } else {
    console.log(error)
  }
  process.exit(1)
})
