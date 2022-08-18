import { Axios } from "axios";
interface HeadersKeysMap {
  [key: string]: boolean;
}
interface ApiRoute {
  name: string;
  middlewares?: any[];
}
interface MasterServerOptions {
  /**
   * server implementing FolderSyncMaster class base URL ex : http://localhost:9000
   */
  baseURL: string;
  /**
   * timeout for the underlying requests sent to the server implementing FolderSyncMaster class
   */
  httpRequestTimeout: number;
  /**
   * extra headers to be added to the underlying requests sent to the server implementing FolderSyncMaster class
   */
  httpRequestHeaders: Object;
  /**
   * router prefix used on the server implementing FolderSyncMaster class (app.use(prefix, FolderSyncMaster))
   */
  routerPrefix: string;
  /**
   * Object containing a name property representing the route/endpoint to call on the FolderSyncMaster class to ask for the difference of content between folders
   */
  diffRoute: ApiRoute;
  /**
   * Object containing a name property representing the route/endpoint to call on the FolderSyncMaster class to ask for the files (binary) data updated or missing on the slave
   */
  filesRoute: ApiRoute;
  /**
   * Object containing a name property representing the route/endpoint to call on the FoldeSyncMaster class to ask for the status (online/offline) and configuration check of the server implementing the FolderSyncMaster class
   */
  statusRoute: ApiRoute;
  /**
   * *Boolean representing whether to perform the HTTP api call to check status and configurations of the server implementing the FolderSyncMaster class
   */
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
  constructor(
    masterServerOptions?: MasterServerOptions,
    syncedDirPath?: string,
    tempDirPath?: string,
    syncRoute?: ApiRoute,
    forwardedHeadersKeysMap?: HeadersKeysMap,
    cleanTempDir?: boolean
  );
  private _getEndpoint;
  private _checkMaster;
  private _checkPathExists;
  private _warnings;
  private _extractForwardedHeaders;
  private _init;
}
export {};
