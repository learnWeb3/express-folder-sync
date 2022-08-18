"use strict";
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
exports.FolderSyncRouterMaster = void 0;
var path_1 = require("path");
var process_1 = require("process");
var express_1 = __importDefault(require("express"));
var body_params_middlewraes_1 = require("../middlewares/body-params.middlewraes");
var folder_sync_service_1 = require("../services/folder-sync.service");
var errors_handler_middleware_1 = require("../middlewares/errors-handler.middleware");
var Router = express_1.default.Router;
var diffRouteDefaultOptions = {
    name: "diff",
    middlewares: [],
};
var filesRouteDefaultOptions = {
    name: "files",
    middlewares: [],
};
var statusRouteDefaultOptions = {
    name: "status",
    middlewares: [],
};
var FolderSyncRouterMaster = (function () {
    function FolderSyncRouterMaster(diffRoute, filesRoute, statusRoute, syncedDirPath) {
        if (diffRoute === void 0) { diffRoute = __assign({}, diffRouteDefaultOptions); }
        if (filesRoute === void 0) { filesRoute = __assign({}, filesRouteDefaultOptions); }
        if (statusRoute === void 0) { statusRoute = __assign({}, statusRouteDefaultOptions); }
        if (syncedDirPath === void 0) { syncedDirPath = (0, path_1.join)((0, process_1.cwd)(), "public"); }
        this.syncedDirPath = syncedDirPath;
        this.diffRoute = __assign(__assign({}, diffRouteDefaultOptions), diffRoute);
        this.filesRoute = __assign(__assign({}, filesRouteDefaultOptions), filesRoute);
        this.statusRoute = __assign(__assign({}, statusRoute), statusRouteDefaultOptions);
        this.router = Router();
        this.router.use(errors_handler_middleware_1.errorHandler);
        this._init();
        return this.router;
    }
    FolderSyncRouterMaster.prototype._init = function () {
        var _a, _b;
        var _this = this;
        this.router.get("/".concat(this.statusRoute.name), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, res.status(200).json({
                        message: "master server alive",
                        endpoints: {
                            diff: {
                                name: this.diffRoute.name,
                            },
                            files: {
                                name: this.filesRoute.name,
                            },
                        },
                    })];
            });
        }); });
        (_a = this.router).post.apply(_a, __spreadArray(__spreadArray(["/".concat(this.diffRoute.name), (0, body_params_middlewraes_1.requireBodyParams)({
                syncDirContentTree: true,
            })], this.diffRoute.middlewares, false), [function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var syncDirContentTree, FOLDER_SYNC_SERVICE, masterSyncDirContentTree, upsertTree, deleteTree;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            syncDirContentTree = req.body.syncDirContentTree;
                            FOLDER_SYNC_SERVICE = new folder_sync_service_1.FolderSyncService(this.syncedDirPath);
                            return [4, FOLDER_SYNC_SERVICE.getHashedMapTree()];
                        case 1:
                            masterSyncDirContentTree = _a.sent();
                            upsertTree = FOLDER_SYNC_SERVICE.getDiffTree(masterSyncDirContentTree, syncDirContentTree);
                            deleteTree = FOLDER_SYNC_SERVICE.getDiffTree(syncDirContentTree, masterSyncDirContentTree);
                            return [2, res.status(200).json({
                                    upsertTree: upsertTree,
                                    deleteTree: deleteTree,
                                })];
                    }
                });
            }); }], false));
        (_b = this.router).post.apply(_b, __spreadArray(__spreadArray(["/".concat(this.filesRoute.name), (0, body_params_middlewraes_1.requireBodyParams)({
                upsertTree: true,
            })], this.filesRoute.middlewares, false), [function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var upsertTree, FOLDER_SYNC_SERVICE, filesPaths, zipBuffer, zipArchiveName;
                return __generator(this, function (_a) {
                    upsertTree = req.body.upsertTree;
                    FOLDER_SYNC_SERVICE = new folder_sync_service_1.FolderSyncService(this.syncedDirPath);
                    filesPaths = FOLDER_SYNC_SERVICE.extractUniqueFilesPaths(upsertTree, this.syncedDirPath);
                    zipBuffer = FOLDER_SYNC_SERVICE.zipFiles(filesPaths);
                    zipArchiveName = "master_sync_files";
                    res.status(200);
                    res.set({
                        "Content-Disposition": "attachment; filename=".concat(zipArchiveName),
                        "Content-type": "application/zip",
                    });
                    return [2, res.send(zipBuffer)];
                });
            }); }], false));
    };
    return FolderSyncRouterMaster;
}());
exports.FolderSyncRouterMaster = FolderSyncRouterMaster;
//# sourceMappingURL=FolderSyncRouterMaster.js.map