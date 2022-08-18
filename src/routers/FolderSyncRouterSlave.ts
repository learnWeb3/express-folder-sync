import fs from "fs";
import { join } from "path";
import { cwd } from "process";
import express from "express";
import axios, { Axios } from "axios";
import { FolderSyncService } from "../services/folder-sync.service";
import { remove } from "fs-extra";
import { handleError } from "../helpers/errors.helper";
import { InternalServerError } from "../errors/http.errors";

const { Router } = express;

const syncRouteDefaultOptions = {
  name: "sync",
  middlewares: [],
};

const forwardedHeadersKeysMapDefaultOptions = {
  Authorization: true,
};

interface HeadersKeysMap {
  [key: string]: boolean;
}

interface ApiRoute {
  /**
   * name of the endpoint
   */
  name: string;
  /**
   * middlewares to be applied to the request before processing
   */
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

export class FolderSyncRouterSlave {
  public masterServerOptions: MasterServerOptions;
  public httpService: Axios;
  public httpRequestHeaders: Object;
  public forwardedHeadersKeysMap: HeadersKeysMap;
  public syncRoute: ApiRoute;
  public routerPrefix: string;
  public diffRoute: ApiRoute;
  public filesRoute: ApiRoute;
  public statusRoute: ApiRoute;
  public tempDirPath: string;
  public syncedDirPath: string;
  public cleanTempDir: boolean;
  public router: any;

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
    masterServerOptions: MasterServerOptions = {
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
    },
    syncedDirPath: string = join(cwd(), "public"),
    tempDirPath: string = join(cwd(), "temp"),
    syncRoute: ApiRoute = {
      ...syncRouteDefaultOptions,
    },
    forwardedHeadersKeysMap: HeadersKeysMap = {
      ...forwardedHeadersKeysMapDefaultOptions,
    },
    cleanTempDir: boolean = true
  ) {
    const {
      baseURL,
      httpRequestHeaders,
      httpRequestTimeout,
      routerPrefix,
      diffRoute,
      filesRoute,
      statusRoute,
      check,
    } = masterServerOptions;
    this.httpService = axios.create({
      baseURL: baseURL,
      timeout: httpRequestTimeout,
    });
    this.httpRequestHeaders = httpRequestHeaders;
    this.forwardedHeadersKeysMap = forwardedHeadersKeysMap;
    this.syncRoute = {
      ...syncRouteDefaultOptions,
      ...syncRoute,
    };
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

  private _getEndpoint(
    route = {
      name: "diff",
    }
  ) {
    return this.routerPrefix + "/" + route.name;
  }

  private async _checkMaster() {
    console.log("[folder-sync]: checking master status...");
    const masterStatusResponse = await this.httpService
      .get(this._getEndpoint(this.statusRoute), {
        headers: {
          "Content-type": "application/json",
        },
      })
      .catch((error) => {
        console.log(error);
        throw new Error(
          `[folder-sync]: master server is offline or master server options are invalid, this option has been configured in class constructor`
        );
      });
    console.log("[folder-sync]: master alive.");
    console.log("[folder-sync]: checking master/slave endpoint match...");
    const {
      data: {
        endpoints: { diff, files },
      },
    } = masterStatusResponse;

    if (diff.name !== this.diffRoute.name) {
      throw new Error(
        "[folder-sync]: master/slave route mismatch for diff endpoint, this option has been configured in class constructor"
      );
    }

    if (files.name !== this.filesRoute.name) {
      throw new Error(
        "[folder-sync]: master/slave route mismatch for files download endpoint, this option has been configured in class constructor"
      );
    }
    console.log("[folder-sync]: master/slave endpoint do match.");
  }

  private _checkPathExists(path) {
    if (!fs.existsSync(path)) {
      throw new Error(
        `[folder-sync]: ${path} does not exists on the server, this option has been configured in class constructor`
      );
    }
  }

  private _warnings() {
    if (this.syncRoute.middlewares.length) {
      console.log(
        "[folder-sync]: Warning: middlewares will be applied in the order of the array, (middlewares order always matter!)"
      );
    }
    if (Object.values(this.httpRequestHeaders).length) {
      console.log(
        "[folder-sync]: Warning: headers forwarded from request and headers set in global options could overlap"
      );
    }
  }

  private _extractForwardedHeaders(requestHeaders) {
    const forwardedHeaders = {};
    for (const key in requestHeaders) {
      if (this.forwardedHeadersKeysMap[key]) {
        forwardedHeaders[key] = requestHeaders[key];
      }
    }
    return forwardedHeaders;
  }

  private _init() {
    this.router.post(
      `/${this.syncRoute.name}`,
      ...this.syncRoute.middlewares,
      async (req, res, next) => {
        // request headers are forwarded when calling master (used for authorization purpose for exaample)
        const forwardedHeaders = this._extractForwardedHeaders(req.headers);

        const FOLDER_SYNC_SERVICE = new FolderSyncService(this.syncedDirPath);

        // GETTING CONTENT OF SLAVE SYNCED FOLDER
        const syncDirContentTree = await FOLDER_SYNC_SERVICE.getHashedMapTree();

        // ASKING SERVER THE DATA TO BE DELETED AND THE DATA TO BE UPSERTED (DIFF VS MASTER)
        try {
          const diffMasterResponse = await this.httpService.post(
            this._getEndpoint(this.diffRoute),
            {
              syncDirContentTree,
            },
            {
              // Warning: headers forwarded from request and headers set in global options could overlap
              headers: {
                ...forwardedHeaders,
                ...this.httpRequestHeaders,
                "Content-type": "application/json",
              } as any,
            }
          );

          // SERVER RESPONDING WITH TWO TREES (DATA TO BE INSERTED/UPDATED aka upsert tree AND DATA TO BE DELETED aka delete tree)
          const {
            data: { upsertTree, deleteTree },
          } = diffMasterResponse;

          // REQUESTING ACTUAL FILES TO BE UPSERTED (binary data)
          const filesMasterResponse = await this.httpService.post(
            this._getEndpoint(this.filesRoute),
            {
              upsertTree,
            },
            {
              // Warning: headers forwarded from request and headers set in global options could overlap
              responseType: "arraybuffer",
              headers: {
                ...forwardedHeaders,
                ...this.httpRequestHeaders,
                "Content-type": "application/json",
              } as any,
            }
          );
          // EXTRACTING FILES TO A TEMP LOCATION ON THE SLAVE SERVER
          const { folderPath: fileTempDirectoryPath, files: tempFilesNames } =
            await FOLDER_SYNC_SERVICE.unzipFilesToFolderDestination(
              filesMasterResponse.data,
              this.tempDirPath
            );

          // DELETING CNTENT IN SYNCED DIRECTORY
          await FOLDER_SYNC_SERVICE.deleteFiles(this.syncedDirPath, deleteTree);

          // // UPDATING/INSERTING CONTENT IN SYNCED DIRECTORY
          await FOLDER_SYNC_SERVICE.upsertFiles(
            upsertTree,
            this.syncedDirPath,
            fileTempDirectoryPath,
            tempFilesNames
          );

          this.cleanTempDir && (await remove(fileTempDirectoryPath));

          res.status(200).json({
            message: `${this.syncedDirPath} synced successfully using master as source of truth`,
          });
        } catch (error) {
          handleError(
            new InternalServerError("unexpected error encountred"),
            req,
            res
          );
        }
      }
    );
  }
}
