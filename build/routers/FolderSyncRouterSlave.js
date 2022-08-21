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
exports.FolderSyncRouterSlave = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const process_1 = require("process");
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const folder_sync_service_1 = require("../services/folder-sync.service");
const fs_extra_1 = require("fs-extra");
const errors_helper_1 = require("../helpers/errors.helper");
const http_errors_1 = require("../errors/http.errors");
const { Router } = express_1.default;
const syncRouteDefaultOptions = {
    name: "sync",
    middlewares: [],
};
const forwardedHeadersKeysMapDefaultOptions = {
    Authorization: true,
};
class FolderSyncRouterSlave {
    /**
     * @param masterServerOptions
     * Object representing the settings for the slave to be able to communicate with the master server
     * @param syncedDirPath
     * String representing the path to the directory to be synced
     * @param tempDirPath
     * String representing the path to a temp directory on the server (to store zip files before merging them into the synchronized directory)
     * @param syncRoute
     * Object with name and middlewares property representing the route/endpoint to be triggered in order to perform a synchronization of the files on the slave.
     * @param forwardedHeadersKeysMap
     * Mapping object containing the headers keys name to be forwarded with the underlying request to the folder sync master API server.
     * @param cleanTempDir
     * Boolean representing whether to clean the temp directory after having performed a merge operation (aka sync is complete)
     **/
    constructor(masterServerOptions = {
        baseURL: "http://localhost:9000",
        httpRequestTimeout: 5000,
        httpRequestHeaders: {},
        routerPrefix: "api",
        diffRoute: {
            name: "diff",
        },
        filesRoute: {
            name: "files",
        },
        statusRoute: {
            name: "status",
        },
        check: true,
    }, syncedDirPath = (0, path_1.join)((0, process_1.cwd)(), "public"), tempDirPath = (0, path_1.join)((0, process_1.cwd)(), "temp"), syncRoute = Object.assign({}, syncRouteDefaultOptions), forwardedHeadersKeysMap = Object.assign({}, forwardedHeadersKeysMapDefaultOptions), cleanTempDir = true) {
        const { baseURL, httpRequestHeaders, httpRequestTimeout, routerPrefix, diffRoute, filesRoute, statusRoute, check, } = masterServerOptions;
        this.httpService = axios_1.default.create({
            baseURL: baseURL,
            timeout: httpRequestTimeout,
        });
        this.httpRequestHeaders = httpRequestHeaders;
        this.forwardedHeadersKeysMap = forwardedHeadersKeysMap;
        this.syncRoute = Object.assign(Object.assign({}, syncRouteDefaultOptions), syncRoute);
        this.routerPrefix = routerPrefix;
        this.diffRoute = diffRoute;
        this.filesRoute = filesRoute;
        this.statusRoute = statusRoute;
        this.tempDirPath = tempDirPath;
        this.syncedDirPath = syncedDirPath;
        this.cleanTempDir = cleanTempDir;
        this.router = new Router();
        this._warnings();
        this._checkPathExists(this.tempDirPath);
        this._checkPathExists(this.syncedDirPath);
        this._init();
        if (check) {
            this._checkMaster();
        }
        return this.router;
    }
    _getEndpoint(route = {
        name: "diff",
    }) {
        return this.routerPrefix + "/" + route.name;
    }
    _checkMaster() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("[express-folder-sync]: checking master status...");
            const masterStatusResponse = yield this.httpService
                .get(this._getEndpoint(this.statusRoute), {
                headers: {
                    "Content-type": "application/json",
                },
            })
                .catch((error) => {
                console.log(error);
                throw new Error(`[express-folder-sync]: master server is offline or master server options are invalid, this option has been configured in class constructor`);
            });
            console.log("[express-folder-sync]: master alive.");
            console.log("[express-folder-sync]: checking master/slave endpoint match...");
            const { data: { endpoints: { diff, files }, }, } = masterStatusResponse;
            if (diff.name !== this.diffRoute.name) {
                throw new Error("[express-folder-sync]: master/slave route mismatch for diff endpoint, this option has been configured in class constructor");
            }
            if (files.name !== this.filesRoute.name) {
                throw new Error("[express-folder-sync]: master/slave route mismatch for files download endpoint, this option has been configured in class constructor");
            }
            console.log("[express-folder-sync]: master/slave endpoint do match.");
        });
    }
    _checkPathExists(path) {
        if (!fs_1.default.existsSync(path)) {
            throw new Error(`[express-folder-sync]: ${path} does not exists on the server, this option has been configured in class constructor`);
        }
    }
    _warnings() {
        if (this.syncRoute.middlewares.length) {
            console.log("[express-folder-sync]: Warning: middlewares will be applied in the order of the array, (middlewares order always matter!)");
        }
        if (Object.values(this.httpRequestHeaders).length) {
            console.log("[express-folder-sync]: Warning: headers forwarded from request and headers set in global options could overlap");
        }
    }
    _extractForwardedHeaders(requestHeaders) {
        const forwardedHeaders = {};
        for (const key in requestHeaders) {
            if (this.forwardedHeadersKeysMap[key]) {
                forwardedHeaders[key] = requestHeaders[key];
            }
        }
        return forwardedHeaders;
    }
    _init() {
        this.router.post(`/${this.syncRoute.name}`, ...this.syncRoute.middlewares, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            // request headers are forwarded when calling master (used for authorization purpose for exaample)
            const forwardedHeaders = this._extractForwardedHeaders(req.headers);
            const FOLDER_SYNC_SERVICE = new folder_sync_service_1.FolderSyncService(this.syncedDirPath);
            // GETTING CONTENT OF SLAVE SYNCED FOLDER
            const syncDirContentTree = yield FOLDER_SYNC_SERVICE.getHashedMapTree();
            // ASKING SERVER THE DATA TO BE DELETED AND THE DATA TO BE UPSERTED (DIFF VS MASTER)
            try {
                const diffMasterResponse = yield this.httpService.post(this._getEndpoint(this.diffRoute), {
                    syncDirContentTree,
                }, {
                    // Warning: headers forwarded from request and headers set in global options could overlap
                    headers: Object.assign(Object.assign(Object.assign({}, forwardedHeaders), this.httpRequestHeaders), { "Content-type": "application/json" }),
                });
                // SERVER RESPONDING WITH TWO TREES (DATA TO BE INSERTED/UPDATED aka upsert tree AND DATA TO BE DELETED aka delete tree)
                const { data: { upsertTree, deleteTree }, } = diffMasterResponse;
                // REQUESTING ACTUAL FILES TO BE UPSERTED (binary data)
                const filesMasterResponse = yield this.httpService.post(this._getEndpoint(this.filesRoute), {
                    upsertTree,
                }, {
                    // Warning: headers forwarded from request and headers set in global options could overlap
                    responseType: "arraybuffer",
                    headers: Object.assign(Object.assign(Object.assign({}, forwardedHeaders), this.httpRequestHeaders), { "Content-type": "application/json" }),
                });
                // EXTRACTING FILES TO A TEMP LOCATION ON THE SLAVE SERVER
                const { folderPath: fileTempDirectoryPath, files: tempFilesNames } = yield FOLDER_SYNC_SERVICE.unzipFilesToFolderDestination(filesMasterResponse.data, this.tempDirPath);
                // DELETING CNTENT IN SYNCED DIRECTORY
                yield FOLDER_SYNC_SERVICE.deleteFiles(this.syncedDirPath, deleteTree);
                // // UPDATING/INSERTING CONTENT IN SYNCED DIRECTORY
                yield FOLDER_SYNC_SERVICE.upsertFiles(upsertTree, this.syncedDirPath, fileTempDirectoryPath, tempFilesNames);
                this.cleanTempDir && (yield (0, fs_extra_1.remove)(fileTempDirectoryPath));
                res.status(200).json({
                    statusCode: 200,
                    datetimeMs: Date.now(),
                    message: "synced with success",
                });
                return;
            }
            catch (error) {
                (0, errors_helper_1.handleError)(new http_errors_1.InternalServerError("unexpected error encountred"), req, res);
            }
        }));
    }
}
exports.FolderSyncRouterSlave = FolderSyncRouterSlave;
//# sourceMappingURL=FolderSyncRouterSlave.js.map