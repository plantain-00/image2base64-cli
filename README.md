# image2base64-cli

[![Dependency Status](https://david-dm.org/plantain-00/image2base64-cli.svg)](https://david-dm.org/plantain-00/image2base64-cli)
[![devDependency Status](https://david-dm.org/plantain-00/image2base64-cli/dev-status.svg)](https://david-dm.org/plantain-00/image2base64-cli#info=devDependencies)
[![Build Status: Linux](https://travis-ci.org/plantain-00/image2base64-cli.svg?branch=master)](https://travis-ci.org/plantain-00/image2base64-cli)
[![Build Status: Windows](https://ci.appveyor.com/api/projects/status/github/plantain-00/image2base64-cli?branch=master&svg=true)](https://ci.appveyor.com/project/plantain-00/image2base64-cli/branch/master)
[![npm version](https://badge.fury.io/js/image2base64-cli.svg)](https://badge.fury.io/js/image2base64-cli)
[![Downloads](https://img.shields.io/npm/dm/image2base64-cli.svg)](https://www.npmjs.com/package/image2base64-cli)

A CLI tool to convert image file to base64 string.

## install

`yarn global add image2base64-cli`

## usage

`image2base64-cli favicon.ico --scss`

or

`image2base64-cli *.ico --scss variables.scss`

or

`image2base64-cli *.ico --less variables.less`

or

`image2base64-cli *.ico --es6 variables.js`

or

`image2base64-cli *.ico --scss variables.scss --less variables.less --json variables.json --es6 variables.js --base demo`

or

`image2base64-cli *.ico --scss variables.scss --less variables.less --json variables.json --es6 variables.js --base demo --watch`

## change logs

```txt
// v2
the variable name will be the whole path relative to `base`(by `--base basename`)

// v1
the variable name is the name of the image file
```
