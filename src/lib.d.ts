declare module "file-type" {
    function fileType(buffer: Buffer): { ext: string; mime: string };
    export = fileType;
}

declare module "lodash.flatten" {
    function flatten<T>(array: T[][]): T[];
    export = flatten;
}

declare module "lodash.uniq" {
    function uniq<T>(array: T[]): T[];
    export = uniq;
}
