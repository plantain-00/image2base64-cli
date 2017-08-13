import * as fs from "fs";
import * as minimist from "minimist";
import * as glob from "glob";
import * as path from "path";
import * as fileType from "file-type";
import * as flatten from "lodash.flatten";
import * as uniq from "lodash.uniq";
import * as camelcase from "camelcase";

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

    const filePaths: string[][] = [];
    for (const filePath of argv._) {
        filePaths.push(await globAsync(filePath));
    }
    const flattenedFilePaths = uniq(flatten(filePaths));
    if (flattenedFilePaths.length > 0) {
        const variables: { name: string; base64: string }[] = [];
        const base = argv.base;
        for (const filePath of flattenedFilePaths) {
            const buffer = await readFileAsync(filePath);
            const mime = fileType(buffer).mime;
            const base64 = `data:${mime};base64,${buffer.toString("base64")}`;
            variables.push({ name: base ? path.relative(base, filePath) : filePath, base64 });
        }
        if (argv.json) {
            await writeFileAsync(argv.json, JSON.stringify(variables, null, "  "));
        }
        if (argv.scss) {
            await writeFileAsync(argv.scss, variables.map(v => `$${v.name.replace(".", "-")}: '${v.base64}';\n`).join(""));
        }
        if (argv.less) {
            await writeFileAsync(argv.less, variables.map(v => `@${v.name.replace(".", "-")}: '${v.base64}';\n`).join(""));
        }
        if (argv.es6) {
            await writeFileAsync(argv.es6, variables.map(v => `export const ${getVariableName(v.name)} = "${v.base64}";\n`).join(""));
        }
    }

    printInConsole("success");
}

try {
    executeCommandLine();
} catch (error) {
    printInConsole(error);
    process.exit(1);
}
