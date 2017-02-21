import * as fs from "fs";
import * as minimist from "minimist";
import * as glob from "glob";
import * as path from "path";
const fileType: (buffer: Buffer) => { ext: string; mime: string } = require("file-type");
const flatten: <T>(array: T[][]) => T[] = require("lodash.flatten");
const uniq: <T>(array: T[]) => T[] = require("lodash.uniq");

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
    return new Promise<Buffer>((resolve, reject) => {
        fs.readFile(filename, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}

function writeFileAsync(filename: string, data: string) {
    return new Promise<void>((resolve, reject) => {
        fs.writeFile(filename, data, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

export async function run(inputFiles: string[], jsonFile: string | undefined, scssFile: string | undefined, lessFile: string | undefined) {
    const filePaths: string[][] = [];
    for (const filePath of inputFiles) {
        filePaths.push(await globAsync(filePath));
    }
    const flattenedFilePaths = uniq(flatten(filePaths));
    if (flattenedFilePaths.length > 0) {
        const variables: { name: string; base64: string }[] = [];
        for (const filePath of flattenedFilePaths) {
            const buffer = await readFileAsync(filePath);
            const mime = fileType(buffer).mime;
            const base64 = `data:${mime};base64,${buffer.toString("base64")}`;
            variables.push({ name: path.basename(filePath).replace(".", "-"), base64 });
        }
        if (jsonFile) {
            await writeFileAsync(jsonFile, JSON.stringify(variables, null, "  "));
        }
        if (scssFile) {
            await writeFileAsync(scssFile, variables.map(v => `$${v.name}: '${v.base64}';\n`).join(""));
        }
        if (lessFile) {
            await writeFileAsync(lessFile, variables.map(v => `@${v.name}: '${v.base64}';\n`).join(""));
        }
    }
}

export function executeCommandLine() {
    const argv = minimist(process.argv.slice(2), { "--": true });
    run(argv["_"], argv["json"], argv["scss"], argv["less"]);
}
