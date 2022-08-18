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
exports.FolderSyncRouterSlave = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = require("path");
var process_1 = require("process");
var express_1 = __importDefault(require("express"));
var axios_1 = __importDefault(require("axios"));
var folder_sync_service_1 = require("../services/folder-sync.service");
var fs_extra_1 = require("fs-extra");
var errors_handler_middleware_1 = require("../middlewares/errors-handler.middleware");
var Router = express_1.default.Router;
var syncRouteDefaultOptions = {
    name: "sync",
    middlewares: [],
};
var forwardedHeadersKeysMapDefaultOptions = {
    Authorization: true,
};
var FolderSyncRouterSlave = (function () {
    function FolderSyncRouterSlave(masterServerOptions, syncedDirPath, tempDirPath, syncRoute, forwardedHeadersKeysMap, cleanTempDir) {
        if (masterServerOptions === void 0) { masterServerOptions = {
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
        }; }
        if (syncedDirPath === void 0) { syncedDirPath = (0, path_1.join)((0, process_1.cwd)(), "public"); }
        if (tempDirPath === void 0) { tempDirPath = (0, path_1.join)((0, process_1.cwd)(), "temp"); }
        if (syncRoute === void 0) { syncRoute = __assign({}, syncRouteDefaultOptions); }
        if (forwardedHeadersKeysMap === void 0) { forwardedHeadersKeysMap = __assign({}, forwardedHeadersKeysMapDefaultOptions); }
        if (cleanTempDir === void 0) { cleanTempDir = true; }
        var baseURL = masterServerOptions.baseURL, httpRequestHeaders = masterServerOptions.httpRequestHeaders, httpRequestTimeout = masterServerOptions.httpRequestTimeout, routerPrefix = masterServerOptions.routerPrefix, diffRoute = masterServerOptions.diffRoute, filesRoute = masterServerOptions.filesRoute, statusRoute = masterServerOptions.statusRoute, check = masterServerOptions.check;
        this.httpService = axios_1.default.create({
            baseURL: baseURL,
            timeout: httpRequestTimeout,
        });
        this.httpRequestHeaders = httpRequestHeaders;
        this.forwardedHeadersKeysMap = forwardedHeadersKeysMap;
        this.syncRoute = __assign(__assign({}, syncRouteDefaultOptions), syncRoute);
        this.routerPrefix = routerPrefix;
        this.diffRoute = diffRoute;
        this.filesRoute = filesRoute;
        this.statusRoute = statusRoute;
        this.tempDirPath = tempDirPath;
        this.syncedDirPath = syncedDirPath;
        this.cleanTempDir = cleanTempDir;
        this.router = new Router();
        this.router.use(errors_handler_middleware_1.errorHandler);
        this._warnings();
        this._checkPathExists(this.tempDirPath);
        this._checkPathExists(this.syncedDirPath);
        this._init();
        if (check) {
            this._checkMaster();
        }
        return this.router;
    }
    FolderSyncRouterSlave.prototype._getEndpoint = function (route) {
        if (route === void 0) { route = {
            name: "diff",
        }; }
        return this.routerPrefix + "/" + route.name;
    };
    FolderSyncRouterSlave.prototype._checkMaster = function () {
        return __awaiter(this, void 0, void 0, function () {
            var masterStatusResponse, _a, diff, files;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("[folder-sync]: checking master status...");
                        return [4, this.httpService
                                .get(this._getEndpoint(this.statusRoute), {
                                headers: {
                                    "Content-type": "application/json",
                                },
                            })
                                .catch(function (error) {
                                console.log(error);
                                throw new Error("[folder-sync]: master server is offline or master server options are invalid, this option has been configured in class constructor");
                            })];
                    case 1:
                        masterStatusResponse = _b.sent();
                        console.log("[folder-sync]: master alive.");
                        console.log("[folder-sync]: checking master/slave endpoint match...");
                        _a = masterStatusResponse.data.endpoints, diff = _a.diff, files = _a.files;
                        if (diff.name !== this.diffRoute.name) {
                            throw new Error("[folder-sync]: master/slave route mismatch for diff endpoint, this option has been configured in class constructor");
                        }
                        if (files.name !== this.filesRoute.name) {
                            throw new Error("[folder-sync]: master/slave route mismatch for files download endpoint, this option has been configured in class constructor");
                        }
                        console.log("[folder-sync]: master/slave endpoint do match.");
                        return [2];
                }
            });
        });
    };
    FolderSyncRouterSlave.prototype._checkPathExists = function (path) {
        if (!fs_1.default.existsSync(path)) {
            throw new Error("[folder-sync]: ".concat(path, " does not exists on the server, this option has been configured in class constructor"));
        }
    };
    FolderSyncRouterSlave.prototype._warnings = function () {
        if (this.syncRoute.middlewares.length) {
            console.log("[folder-sync]: Warning: middlewares will be applied in the order of the array, (middlewares order always matter!)");
        }
        if (Object.values(this.httpRequestHeaders).length) {
            console.log("[folder-sync]: Warning: headers forwarded from request and headers set in global options could overlap");
        }
    };
    FolderSyncRouterSlave.prototype._extractForwardedHeaders = function (requestHeaders) {
        var forwardedHeaders = {};
        for (var key in requestHeaders) {
            if (this.forwardedHeadersKeysMap[key]) {
                forwardedHeaders[key] = requestHeaders[key];
            }
        }
        return forwardedHeaders;
    };
    FolderSyncRouterSlave.prototype._init = function () {
        var _a;
        var _this = this;
        (_a = this.router).post.apply(_a, __spreadArray(__spreadArray(["/".concat(this.syncRoute.name)], this.syncRoute.middlewares, false), [function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var forwardedHeaders, FOLDER_SYNC_SERVICE, syncDirContentTree, diffMasterResponse, _a, upsertTree, deleteTree, filesMasterResponse, _b, fileTempDirectoryPath, tempFilesNames, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            forwardedHeaders = this._extractForwardedHeaders(req.headers);
                            FOLDER_SYNC_SERVICE = new folder_sync_service_1.FolderSyncService(this.syncedDirPath);
                            return [4, FOLDER_SYNC_SERVICE.getHashedMapTree()];
                        case 1:
                            syncDirContentTree = _d.sent();
                            return [4, this.httpService.post(this._getEndpoint(this.diffRoute), {
                                    syncDirContentTree: syncDirContentTree,
                                }, {
                                    headers: __assign(__assign(__assign({}, forwardedHeaders), this.httpRequestHeaders), { "Content-type": "application/json" }),
                                })];
                        case 2:
                            diffMasterResponse = _d.sent();
                            _a = diffMasterResponse.data, upsertTree = _a.upsertTree, deleteTree = _a.deleteTree;
                            return [4, this.httpService.post(this._getEndpoint(this.filesRoute), {
                                    upsertTree: upsertTree,
                                }, {
                                    responseType: "arraybuffer",
                                    headers: __assign(__assign(__assign({}, forwardedHeaders), this.httpRequestHeaders), { "Content-type": "application/json" }),
                                })];
                        case 3:
                            filesMasterResponse = _d.sent();
                            return [4, FOLDER_SYNC_SERVICE.unzipFilesToFolderDestination(filesMasterResponse.data, this.tempDirPath)];
                        case 4:
                            _b = _d.sent(), fileTempDirectoryPath = _b.folderPath, tempFilesNames = _b.files;
                            return [4, FOLDER_SYNC_SERVICE.deleteFiles(this.syncedDirPath, deleteTree)];
                        case 5:
                            _d.sent();
                            return [4, FOLDER_SYNC_SERVICE.upsertFiles(upsertTree, this.syncedDirPath, fileTempDirectoryPath, tempFilesNames)];
                        case 6:
                            _d.sent();
                            _c = this.cleanTempDir;
                            if (!_c) return [3, 8];
                            return [4, (0, fs_extra_1.remove)(fileTempDirectoryPath)];
                        case 7:
                            _c = (_d.sent());
                            _d.label = 8;
                        case 8:
                            _c;
                            res.status(200).json({
                                message: "".concat(this.syncedDirPath, " synced successfully using master as source of truth"),
                            });
                            return [2];
                    }
                });
            }); }], false));
    };
    return FolderSyncRouterSlave;
}());
exports.FolderSyncRouterSlave = FolderSyncRouterSlave;
//# sourceMappingURL=FolderSyncRouterSlave.js.map