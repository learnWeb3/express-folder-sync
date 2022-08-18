interface ApiRoute {
    name: string;
    middlewares?: any[];
}
export declare class FolderSyncRouterMaster {
    syncedDirPath: string;
    diffRoute: ApiRoute;
    filesRoute: ApiRoute;
    statusRoute: ApiRoute;
    router: any;
    constructor(diffRoute?: ApiRoute, filesRoute?: ApiRoute, statusRoute?: ApiRoute, syncedDirPath?: string);
    private _init;
}
export {};
