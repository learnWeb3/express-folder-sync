import { Axios } from "axios";
interface HeadersKeysMap {
    [key: string]: boolean;
}
interface ApiRoute {
    name: string;
    middlewares?: any[];
}
interface MasterServerOptions {
    baseURL: string;
    httpRequestTimeout: number;
    httpRequestHeaders: Object;
    routerPrefix: string;
    diffRoute: ApiRoute;
    filesRoute: ApiRoute;
    statusRoute: ApiRoute;
    check: boolean;
}
export declare class FolderSyncRouterSlave {
    masterServerOptions: MasterServerOptions;
    httpService: Axios;
    httpRequestHeaders: Object;
    forwardedHeadersKeysMap: HeadersKeysMap;
    syncRoute: ApiRoute;
    routerPrefix: string;
    diffRoute: ApiRoute;
    filesRoute: ApiRoute;
    statusRoute: ApiRoute;
    tempDirPath: string;
    syncedDirPath: string;
    cleanTempDir: boolean;
    router: any;
    constructor(masterServerOptions?: MasterServerOptions, syncedDirPath?: string, tempDirPath?: string, syncRoute?: ApiRoute, forwardedHeadersKeysMap?: HeadersKeysMap, cleanTempDir?: boolean);
    private _getEndpoint;
    private _checkMaster;
    private _checkPathExists;
    private _warnings;
    private _extractForwardedHeaders;
    private _init;
}
export {};
