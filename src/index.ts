import * as fs from "fs";
import * as minimist from "minimist";
import * as glob from "glob";
import * as path from "path";
import fileType = require("file-type");
import flatten = require("lodash.flatten");
import uniq = require("lodash.uniq");
import * as camelcase from "camelcase";
import * as chokidar from "chokidar";

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

function getVariableName(filePath: string) {
    return camelcase(path.normalize(filePath).replace(/\\|\//g, "-"));
}

function printInConsole(message: any) {
    // tslint:disable-next-line:no-console
    console.log(message);
}

async function executeCommandLine() {
    const argv = minimist(process.argv.slice(2), { "--": true });

    const inputFiles = argv._;
    if (!inputFiles || inputFiles.length === 0) {
        throw new Error("Error: no input files.");
    }

    const filePaths: string[][] = [];
    for (const filePath of inputFiles) {
        filePaths.push(await globAsync(filePath));
    }
    const uniqFiles = uniq(flatten(filePaths));

    const base = argv.base;

    const watchMode: boolean = argv.w || argv.watch;
    if (watchMode) {
        const variables: Variable[] = [];
        let count = 0;
        chokidar.watch(inputFiles).on("all", (type: string, file: string) => {
            printInConsole(`Detecting ${type}: ${file}`);
            count++;
            if (type === "add" || type === "change") {
                const index = variables.findIndex(v => v.file === file);
                imageToBase64(file, base).then(variable => {
                    if (index === -1) {
                        variables.push(variable);
                    } else {
                        variables[index] = variable;
                    }
                    if (count >= uniqFiles.length) {
                        writeVariables(argv, variables);
                    }
                });
            } else if (type === "unlink") {
                const index = variables.findIndex(v => v.file === file);
                if (index !== -1) {
                    variables.splice(index, 1);
                    writeVariables(argv, variables);
                }
            }
        });
        return;
    }

    if (uniqFiles.length > 0) {
        const variables = await Promise.all(uniqFiles.map(file => imageToBase64(file, base)));
        await writeVariables(argv, variables);
    }
}

async function imageToBase64(file: string, base: string) {
    const buffer = await readFileAsync(file);
    const mime = fileType(buffer).mime;
    const base64 = `data:${mime};base64,${buffer.toString("base64")}`;
    return { name: base ? path.relative(base, file) : file, file, base64 };
}

async function writeVariables(argv: minimist.ParsedArgs, variables: Variable[]) {
    variables.sort((v1, v2) => v1.name.localeCompare(v2.name));
    if (argv.json) {
        await writeFileAsync(argv.json, JSON.stringify(variables, null, "  "));
    }
    if (argv.scss) {
        await writeFileAsync(argv.scss, variables.map(v => `$${v.name.split(".").join("-")}: '${v.base64}';\n`).join(""));
    }
    if (argv.less) {
        await writeFileAsync(argv.less, variables.map(v => `@${v.name.split(".").join("-")}: '${v.base64}';\n`).join(""));
    }
    if (argv.es6) {
        await writeFileAsync(argv.es6, variables.map(v => `export const ${getVariableName(v.name)} = "${v.base64}";\n`).join(""));
    }
}

type Variable = { name: string; file: string; base64: string; };

executeCommandLine().then(() => {
    printInConsole("image to base64 success.");
}, error => {
    printInConsole(error);
    process.exit(1);
});
