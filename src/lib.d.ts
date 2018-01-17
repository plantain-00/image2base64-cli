declare module 'file-type' {
    function fileType (buffer: Buffer): { ext: string; mime: string }
    export = fileType
}
