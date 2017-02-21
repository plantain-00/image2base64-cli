import * as fs from "fs";
import * as minimist from "minimist";
import * as glob from "glob";
const flatten: <T>(array: T[][]) => T[] = require("lodash.flatten");
const uniq: <T>(array: T[]) => T[] = require("lodash.uniq");

const argv = minimist(process.argv.slice(2), { "--": true });

const inputFiles = argv["_"];

function globAsync(pattern: string) {
    return new Promise<string[]>((resolve, reject) => {
        glob(pattern, (error, matches) => {
            if (error) {
                reject(error);
            } else {
                resolve(matches);
            }
        });
    });
}

function readFileAsync(filename: string) {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(filename, "base64", (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}

function accessAsync(path: string) {
    return new Promise<string>((resolve, reject) => {
        fs.access(path, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

Promise.all(inputFiles.map(file => globAsync(file))).then(files => {
    const uniqFiles = uniq(flatten(files));
    console.log(uniqFiles);
});
