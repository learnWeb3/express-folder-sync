"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderSyncService = void 0;
var folder_hash_1 = require("folder-hash");
var adm_zip_1 = __importDefault(require("adm-zip"));
var fs_extra_1 = require("fs-extra");
var path_1 = require("path");
var fs_1 = require("fs");
var FolderSyncServiceHashingContentFailedError = (function (_super) {
    __extends(FolderSyncServiceHashingContentFailedError, _super);
    function FolderSyncServiceHashingContentFailedError(message) {
        return _super.call(this, message) || this;
    }
    return FolderSyncServiceHashingContentFailedError;
}(Error));
var FolderSyncServiceZipFileNotFoundError = (function (_super) {
    __extends(FolderSyncServiceZipFileNotFoundError, _super);
    function FolderSyncServiceZipFileNotFoundError(message) {
        return _super.call(this, message) || this;
    }
    return FolderSyncServiceZipFileNotFoundError;
}(Error));
var FolderSyncService = (function () {
    function FolderSyncService(path) {
        this.path = path;
        this.hashMapTree = {};
    }
    FolderSyncService.prototype.getHashedMapTree = function () {
        return __awaiter(this, void 0, void 0, function () {
            var options;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = {
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
                        return [4, (0, folder_hash_1.hashElement)(this.path, options)
                                .then(function (hash) { return JSON.parse(JSON.stringify(hash)); })
                                .catch(function (error) {
                                throw new FolderSyncServiceHashingContentFailedError("hashing content of folder ".concat(_this.path, " failed, reason: ").concat(error.message));
                            })];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    FolderSyncService.prototype.zipFiles = function (filesPaths) {
        if (filesPaths === void 0) { filesPaths = []; }
        var errors = [];
        var zip = new adm_zip_1.default();
        for (var _i = 0, filesPaths_1 = filesPaths; _i < filesPaths_1.length; _i++) {
            var _a = filesPaths_1[_i], path = _a.path, hash = _a.hash;
            if ((0, fs_extra_1.existsSync)(path)) {
                var bufferContent = (0, fs_1.readFileSync)(path, {
                    encoding: "utf-8",
                });
                zip.addFile(hash, bufferContent);
            }
            else {
                errors.push("file at ".concat(path, " does not exists"));
            }
        }
        if (errors.length) {
            throw new FolderSyncServiceZipFileNotFoundError(errors.join(", "));
        }
        var buffer = zip.toBuffer();
        return buffer;
    };
    FolderSyncService.prototype.upsertFiles = function (upsertTree, syncedFolderDirectoryPath, fileTempDirectoryPath, tempFilesNames) {
        if (tempFilesNames === void 0) { tempFilesNames = []; }
        return __awaiter(this, void 0, void 0, function () {
            var upsertFilesRecursively;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        upsertFilesRecursively = function (upsertTree, syncedFolderDirectoryPath, fileTempDirectoryPath, tempFilesNames) { return __awaiter(_this, void 0, void 0, function () {
                            var index, child, isDir, dirPath, fileToMoveName, fileToMoveSourcePath, fileToMoveDestinationPath;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        index = 0;
                                        _a.label = 1;
                                    case 1:
                                        if (!(index < upsertTree.children.length)) return [3, 7];
                                        child = upsertTree.children[index];
                                        isDir = child.children;
                                        if (!isDir) return [3, 4];
                                        dirPath = (0, path_1.join)(syncedFolderDirectoryPath, child.name);
                                        return [4, (0, fs_extra_1.ensureDir)(dirPath)];
                                    case 2:
                                        _a.sent();
                                        return [4, upsertFilesRecursively(upsertTree.children[index], dirPath, fileTempDirectoryPath, tempFilesNames)];
                                    case 3:
                                        _a.sent();
                                        return [3, 6];
                                    case 4:
                                        fileToMoveName = child.hash;
                                        if (!fileToMoveName) {
                                            throw new Error("missing file in temp directory ".concat(child.hash.toLowerCase()));
                                        }
                                        fileToMoveSourcePath = (0, path_1.join)(fileTempDirectoryPath, fileToMoveName);
                                        fileToMoveDestinationPath = (0, path_1.join)(syncedFolderDirectoryPath, child.name);
                                        return [4, (0, fs_extra_1.copy)(fileToMoveSourcePath, fileToMoveDestinationPath, {
                                                overwrite: true,
                                            })];
                                    case 5:
                                        _a.sent();
                                        _a.label = 6;
                                    case 6:
                                        index++;
                                        return [3, 1];
                                    case 7: return [2];
                                }
                            });
                        }); };
                        return [4, upsertFilesRecursively(upsertTree, syncedFolderDirectoryPath, fileTempDirectoryPath, tempFilesNames)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    FolderSyncService.prototype.deleteFiles = function (syncedFolderDirectoryPath, deleteTree) {
        return __awaiter(this, void 0, void 0, function () {
            var deleteFileRecursively;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        deleteFileRecursively = function (syncedFolderDirectoryPath, deleteTree) { return __awaiter(_this, void 0, void 0, function () {
                            var index, child, filePath, folderPath;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        index = 0;
                                        _a.label = 1;
                                    case 1:
                                        if (!(index < deleteTree.children.length)) return [3, 7];
                                        child = deleteTree.children[index];
                                        if (!(child.hash && !child.children)) return [3, 5];
                                        filePath = (0, path_1.join)(syncedFolderDirectoryPath, child.name);
                                        return [4, (0, fs_extra_1.remove)(filePath)];
                                    case 2:
                                        _a.sent();
                                        if (!(0, fs_extra_1.emptyDirSync)(syncedFolderDirectoryPath)) return [3, 4];
                                        return [4, (0, fs_extra_1.remove)(syncedFolderDirectoryPath)];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4: return [3, 6];
                                    case 5:
                                        folderPath = (0, path_1.join)(syncedFolderDirectoryPath, child.name);
                                        deleteFileRecursively(folderPath, deleteTree.children[index]);
                                        _a.label = 6;
                                    case 6:
                                        index++;
                                        return [3, 1];
                                    case 7: return [2];
                                }
                            });
                        }); };
                        return [4, deleteFileRecursively(syncedFolderDirectoryPath, deleteTree)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    FolderSyncService.prototype.unzipFilesToFolderDestination = function (dataBuffer, tempDirectoryPath) {
        return __awaiter(this, void 0, void 0, function () {
            var tempDataDirName, tempDataDirPath, zip, files;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tempDataDirName = "temp_".concat(Date.now());
                        tempDataDirPath = (0, path_1.join)(tempDirectoryPath, tempDataDirName);
                        zip = new adm_zip_1.default(dataBuffer);
                        return [4, (0, fs_extra_1.ensureDir)(tempDataDirPath)];
                    case 1:
                        _a.sent();
                        zip.extractAllTo(tempDataDirPath, true);
                        files = (0, fs_extra_1.readdirSync)(tempDataDirPath, { encoding: "utf-8" });
                        return [2, {
                                folderName: tempDataDirName,
                                folderPath: tempDataDirPath,
                                files: files,
                            }];
                }
            });
        });
    };
    FolderSyncService.prototype.extractUniqueFilesPaths = function (tree, rootPath, filesPathsObjects, mappingHashFiles) {
        if (filesPathsObjects === void 0) { filesPathsObjects = []; }
        if (mappingHashFiles === void 0) { mappingHashFiles = {}; }
        var self = this;
        for (var _i = 0, _a = tree.children; _i < _a.length; _i++) {
            var child = _a[_i];
            if (child.children) {
                var folderPath = rootPath + "/" + child.name;
                var folderFilesPaths = self.extractUniqueFilesPaths(child, folderPath, filesPathsObjects, mappingHashFiles);
                filesPathsObjects = Object.values(__spreadArray(__spreadArray([], filesPathsObjects, true), folderFilesPaths, true).reduce(function (mappingObj, filePathObject) {
                    mappingObj[filePathObject.path] = filePathObject;
                    return mappingObj;
                }, {}));
            }
            else {
                if (!mappingHashFiles[child.hash]) {
                    mappingHashFiles[child.hash] = true;
                    var filePath = rootPath + "/" + child.name;
                    var fileHash = child.hash;
                    filesPathsObjects = __spreadArray(__spreadArray([], filesPathsObjects, true), [
                        { path: filePath, hash: fileHash },
                    ], false);
                }
            }
        }
        return filesPathsObjects;
    };
    FolderSyncService.prototype.getDiffTree = function (masterFilesHashMap, filesHashMap, diff, rootFolder) {
        if (diff === void 0) { diff = {
            name: null,
            children: [],
        }; }
        if (rootFolder === void 0) { rootFolder = this.path; }
        var self = this;
        if (masterFilesHashMap.hash !== filesHashMap.hash) {
            diff.name = masterFilesHashMap.name;
            var _loop_1 = function (index) {
                var checkExists = filesHashMap.children.find(function (child) { return child.hash === masterFilesHashMap.children[index].hash; });
                if (!checkExists) {
                    var masterFolder_1 = masterFilesHashMap.children[index];
                    var clientFolder_1 = filesHashMap.children.find(function (child) { return child.name === masterFolder_1.name; });
                    if (masterFilesHashMap.children[index].children && clientFolder_1) {
                        diff.children[index] = __assign(__assign({}, masterFolder_1), { children: masterFolder_1.children.filter(function (child) {
                                return !clientFolder_1.children.find(function (_child) {
                                    return _child.name === child.name && _child.hash === child.hash;
                                });
                            }) });
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
            };
            for (var index = 0; index < masterFilesHashMap.children.length; index++) {
                _loop_1(index);
            }
            if (diff.children) {
                diff.children = diff.children.filter(function (child) { return child !== null; });
            }
        }
        return diff;
    };
    return FolderSyncService;
}());
exports.FolderSyncService = FolderSyncService;
//# sourceMappingURL=folder-sync.service.js.map