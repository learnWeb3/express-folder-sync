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
exports.FolderSyncRouterMaster = void 0;
const path_1 = require("path");
const process_1 = require("process");
const express_1 = __importDefault(require("express"));
const body_params_middlewraes_1 = require("../middlewares/body-params.middlewraes");
const folder_sync_service_1 = require("../services/folder-sync.service");
const errors_helper_1 = require("../helpers/errors.helper");
const http_errors_1 = require("../errors/http.errors");
const { Router } = express_1.default;
const diffRouteDefaultOptions = {
    name: "diff",
    middlewares: [],
};
const filesRouteDefaultOptions = {
    name: "files",
    middlewares: [],
};
const statusRouteDefaultOptions = {
    name: "status",
    middlewares: [],
};
class FolderSyncRouterMaster {
    constructor(diffRoute = Object.assign({}, diffRouteDefaultOptions), filesRoute = Object.assign({}, filesRouteDefaultOptions), statusRoute = Object.assign({}, statusRouteDefaultOptions), syncedDirPath = (0, path_1.join)((0, process_1.cwd)(), "public")) {
        this.syncedDirPath = syncedDirPath;
        this.diffRoute = Object.assign(Object.assign({}, diffRouteDefaultOptions), diffRoute);
        this.filesRoute = Object.assign(Object.assign({}, filesRouteDefaultOptions), filesRoute);
        this.statusRoute = Object.assign(Object.assign({}, statusRoute), statusRouteDefaultOptions);
        this.router = Router();
        this._init();
        return this.router;
    }
    _init() {
        this.router.get(`/${this.statusRoute.name}`, (req, res) => __awaiter(this, void 0, void 0, function* () {
            return res.status(200).json({
                message: "master server alive",
                endpoints: {
                    diff: {
                        name: this.diffRoute.name,
                    },
                    files: {
                        name: this.filesRoute.name,
                    },
                },
            });
        }));
        this.router.post(`/${this.diffRoute.name}`, (0, body_params_middlewraes_1.requireBodyParams)({
            syncDirContentTree: true,
        }), ...this.diffRoute.middlewares, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { body: { syncDirContentTree }, } = req;
                const FOLDER_SYNC_SERVICE = new folder_sync_service_1.FolderSyncService(this.syncedDirPath);
                const masterSyncDirContentTree = yield FOLDER_SYNC_SERVICE.getHashedMapTree();
                const upsertTree = FOLDER_SYNC_SERVICE.getDiffTree(masterSyncDirContentTree, syncDirContentTree);
                const deleteTree = FOLDER_SYNC_SERVICE.getDiffTree(syncDirContentTree, masterSyncDirContentTree);
                return res.status(200).json({
                    upsertTree,
                    deleteTree,
                });
            }
            catch (error) {
                (0, errors_helper_1.handleError)(new http_errors_1.InternalServerError("unexpected error encountred"), req, res);
            }
        }));
        this.router.post(`/${this.filesRoute.name}`, (0, body_params_middlewraes_1.requireBodyParams)({
            upsertTree: true,
        }), ...this.filesRoute.middlewares, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { body: { upsertTree }, } = req;
                const FOLDER_SYNC_SERVICE = new folder_sync_service_1.FolderSyncService(this.syncedDirPath);
                const filesPaths = FOLDER_SYNC_SERVICE.extractUniqueFilesPaths(upsertTree, this.syncedDirPath);
                const zipBuffer = FOLDER_SYNC_SERVICE.zipFiles(filesPaths);
                const zipArchiveName = "master_sync_files";
                res.status(200);
                res.set({
                    "Content-Disposition": `attachment; filename=${zipArchiveName}`,
                    "Content-type": "application/zip",
                });
                return res.send(zipBuffer);
            }
            catch (error) {
                (0, errors_helper_1.handleError)(new http_errors_1.InternalServerError("unexpected error encountred"), req, res);
            }
        }));
    }
}
exports.FolderSyncRouterMaster = FolderSyncRouterMaster;
//# sourceMappingURL=FolderSyncRouterMaster.js.map