/// <reference types="node" />
interface ZipContent {
    folderName: string;
    folderPath: string;
    files: string[];
}
interface HashFileMap {
    [key: string]: boolean;
}
interface Tree {
    children?: Tree[];
    name?: string;
    hash?: string;
}
interface FilePath {
    path: string;
    hash: string;
}
export declare class FolderSyncService {
    path: string;
    hashMapTree: any;
    constructor(path: string);
    getHashedMapTree(): Promise<Tree>;
    zipFiles(filesPaths?: FilePath[]): Buffer;
    upsertFiles(upsertTree: Tree, syncedFolderDirectoryPath: string, fileTempDirectoryPath: string, tempFilesNames?: string[]): Promise<void>;
    deleteFiles(syncedFolderDirectoryPath: string, deleteTree: Tree): Promise<void>;
    unzipFilesToFolderDestination(dataBuffer: ArrayBuffer, tempDirectoryPath: string): Promise<ZipContent>;
    extractUniqueFilesPaths(tree: Tree, rootPath: string, filesPathsObjects?: FilePath[], mappingHashFiles?: HashFileMap): FilePath[];
    getDiffTree(masterFilesHashMap: Tree, filesHashMap: Tree, diff?: Tree, rootFolder?: string): Tree;
}
export {};
