"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderSyncService = void 0;
const folder_hash_1 = require("folder-hash");
const adm_zip_1 = __importDefault(require("adm-zip"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const fs_1 = require("fs");
class FolderSyncServiceHashingContentFailedError extends Error {
    constructor(message) {
        super(message);
    }
}
class FolderSyncServiceZipFileNotFoundError extends Error {
    constructor(message) {
        super(message);
    }
}
class FolderSyncService {
    constructor(path) {
        this.path = path;
        this.hashMapTree = {};
    }
    getHashedMapTree() {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                algo: "sha1",
                encoding: "hex",
                folders: { exclude: [".*", "node_modules", "test_coverage"] },
                files: {
                    include: [
                        "*.js",
                        "*.json",
                        "*.mp4",
                        "*.mp3",
                        "*.doc",
                        "*.pdf",
                        "*.jpeg",
                        "*.png",
                    ],
                },
            };
            return yield (0, folder_hash_1.hashElement)(this.path, options)
                .then((hash) => JSON.parse(JSON.stringify(hash)))
                .catch((error) => {
                throw new FolderSyncServiceHashingContentFailedError(`hashing content of folder ${this.path} failed, reason: ${error.message}`);
            });
        });
    }
    /* filesPaths = [
      {
        path: string,
        hash: string
      }
    ]
    */
    zipFiles(filesPaths = []) {
        const errors = [];
        // creating archives
        const zip = new adm_zip_1.default();
        for (const { path, hash } of filesPaths) {
            if ((0, fs_extra_1.existsSync)(path)) {
                const bufferContent = (0, fs_1.readFileSync)(path, {
                    encoding: "utf-8",
                });
                zip.addFile(hash, bufferContent);
            }
            else {
                errors.push(`file at ${path} does not exists`);
            }
        }
        if (errors.length) {
            throw new FolderSyncServiceZipFileNotFoundError(errors.join(", "));
        }
        // get everything as a buffer
        const buffer = zip.toBuffer();
        return buffer;
    }
    upsertFiles(upsertTree, syncedFolderDirectoryPath, fileTempDirectoryPath, tempFilesNames = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const upsertFilesRecursively = (upsertTree, syncedFolderDirectoryPath, fileTempDirectoryPath, tempFilesNames) => __awaiter(this, void 0, void 0, function* () {
                for (let index = 0; index < upsertTree.children.length; index++) {
                    const child = upsertTree.children[index];
                    const isDir = child.children;
                    if (isDir) {
                        const dirPath = (0, path_1.join)(syncedFolderDirectoryPath, child.name);
                        yield (0, fs_extra_1.ensureDir)(dirPath);
                        yield upsertFilesRecursively(upsertTree.children[index], dirPath, fileTempDirectoryPath, tempFilesNames);
                    }
                    else {
                        const fileToMoveName = child.hash;
                        if (!fileToMoveName) {
                            throw new Error(`missing file in temp directory ${child.hash.toLowerCase()}`);
                        }
                        const fileToMoveSourcePath = (0, path_1.join)(fileTempDirectoryPath, fileToMoveName);
                        const fileToMoveDestinationPath = (0, path_1.join)(syncedFolderDirectoryPath, child.name);
                        yield (0, fs_extra_1.copy)(fileToMoveSourcePath, fileToMoveDestinationPath, {
                            overwrite: true,
                        });
                    }
                }
            });
            yield upsertFilesRecursively(upsertTree, syncedFolderDirectoryPath, fileTempDirectoryPath, tempFilesNames);
        });
    }
    deleteFiles(syncedFolderDirectoryPath, deleteTree) {
        return __awaiter(this, void 0, void 0, function* () {
            const deleteFileRecursively = (syncedFolderDirectoryPath, deleteTree) => __awaiter(this, void 0, void 0, function* () {
                for (let index = 0; index < deleteTree.children.length; index++) {
                    const child = deleteTree.children[index];
                    if (child.hash && !child.children) {
                        const filePath = (0, path_1.join)(syncedFolderDirectoryPath, child.name);
                        yield (0, fs_extra_1.remove)(filePath);
                        if ((0, fs_extra_1.emptyDirSync)(syncedFolderDirectoryPath)) {
                            yield (0, fs_extra_1.remove)(syncedFolderDirectoryPath);
                        }
                    }
                    else {
                        const folderPath = (0, path_1.join)(syncedFolderDirectoryPath, child.name);
                        deleteFileRecursively(folderPath, deleteTree.children[index]);
                    }
                }
            });
            yield deleteFileRecursively(syncedFolderDirectoryPath, deleteTree);
        });
    }
    unzipFilesToFolderDestination(dataBuffer, tempDirectoryPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const tempDataDirName = `temp_${Date.now()}`;
            const tempDataDirPath = (0, path_1.join)(tempDirectoryPath, tempDataDirName);
            const zip = new adm_zip_1.default(dataBuffer);
            yield (0, fs_extra_1.ensureDir)(tempDataDirPath);
            zip.extractAllTo(tempDataDirPath, true);
            const files = (0, fs_extra_1.readdirSync)(tempDataDirPath, { encoding: "utf-8" });
            return {
                folderName: tempDataDirName,
                folderPath: tempDataDirPath,
                files,
            };
        });
    }
    // unique files based on their hash to prevent sneding multiple times the same file
    extractUniqueFilesPaths(tree, rootPath, filesPathsObjects = [], mappingHashFiles = {}) {
        const self = this;
        for (const child of tree.children) {
            if (child.children) {
                let folderPath = rootPath + "/" + child.name;
                const folderFilesPaths = self.extractUniqueFilesPaths(child, folderPath, filesPathsObjects, mappingHashFiles);
                filesPathsObjects = Object.values([...filesPathsObjects, ...folderFilesPaths].reduce((mappingObj, filePathObject) => {
                    mappingObj[filePathObject.path] = filePathObject;
                    return mappingObj;
                }, {}));
            }
            else {
                if (!mappingHashFiles[child.hash]) {
                    mappingHashFiles[child.hash] = true;
                    const filePath = rootPath + "/" + child.name;
                    const fileHash = child.hash;
                    filesPathsObjects = [
                        ...filesPathsObjects,
                        { path: filePath, hash: fileHash },
                    ];
                }
            }
        }
        return filesPathsObjects;
    }
    getDiffTree(masterFilesHashMap, filesHashMap, diff = {
        name: null,
        children: [],
    }, rootFolder = this.path) {
        const self = this;
        if (masterFilesHashMap.hash !== filesHashMap.hash) {
            diff.name = masterFilesHashMap.name;
            for (let index = 0; index < masterFilesHashMap.children.length; index++) {
                const checkExists = filesHashMap.children.find((child) => child.hash === masterFilesHashMap.children[index].hash);
                if (!checkExists) {
                    const masterFolder = masterFilesHashMap.children[index];
                    const clientFolder = filesHashMap.children.find((child) => child.name === masterFolder.name);
                    if (masterFilesHashMap.children[index].children && clientFolder) {
                        diff.children[index] = Object.assign(Object.assign({}, masterFolder), { children: masterFolder.children.filter((child) => !clientFolder.children.find((_child) => _child.name === child.name && _child.hash === child.hash)) });
                    }
                    else {
                        diff.children[index] = masterFilesHashMap.children[index];
                    }
                    if (diff.children[index].children &&
                        !diff.children[index].children.length) {
                        delete diff.children[index];
                    }
                }
                else {
                    self.getDiffTree(masterFilesHashMap.children[index], checkExists, diff.children[index], rootFolder);
                }
            }
            if (diff.children) {
                diff.children = diff.children.filter((child) => child !== null);
            }
        }
        return diff;
    }
}
exports.FolderSyncService = FolderSyncService;
//# sourceMappingURL=folder-sync.service.js.map