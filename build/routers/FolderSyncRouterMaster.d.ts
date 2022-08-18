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
  /**
   * @param diffRoute
   * Object with name and middlewares property representing the route/endpoint retrieving the content diff based upon data (tree) sent by the slave.
   * @param filesRoute
   * Object with name and middlewares property representing the route/endpoint sending zip archive containing updated and new files based on the data (tree) sent by the slave.
   * @param statusRoute
   * Object with name and middlewares property representing the route/endpoint sending server status and performing a check of configuration between slave and master
   * @param syncedDirPath
   * String representing the path to the directory to be synced
   **/
  constructor(
    diffRoute?: ApiRoute,
    filesRoute?: ApiRoute,
    statusRoute?: ApiRoute,
    syncedDirPath?: string
  );
  private _init;
}
export {};
