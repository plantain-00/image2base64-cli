declare module "file-type" {
    function fileType(buffer: Buffer): { ext: string; mime: string };
    export = fileType;
    namespace fileType { }
}

declare module "lodash.flatten" {
    function flatten<T>(array: T[][]): T[];
    export = flatten;
    namespace flatten { }
}

declare module "lodash.uniq" {
    function uniq<T>(array: T[]): T[];
    export = uniq;
    namespace uniq { }
}
