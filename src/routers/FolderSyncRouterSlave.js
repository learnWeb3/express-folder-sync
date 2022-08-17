const fs = require("fs");
const { join } = require("path");
const { cwd } = require("process");
const express = require("express");
const { Router } = express;
const axios = require("axios");
const FolderSyncService = require("../services/folder-sync.service");
const { remove } = require("fs-extra");

const syncRouteDefaultOptions = {
  name: "sync",
  middlewares: [],
};

const forwardedHeadersKeysMapDefaultOptions = {
  Authorization: true,
};

class FolderSyncRouterSlave {
  constructor(
    masterServerOptions = {
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
    syncedDirPath = join(cwd(), "public"),
    tempDirPath = join(cwd(), "temp"),
    syncRoute = {
      ...syncRouteDefaultOptions,
    },
    forwardedHeadersKeysMap = {
      ...forwardedHeadersKeysMapDefaultOptions,
    },
    cleanTempDir = true
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

  getEndpoint(
    route = {
      name: "diff",
    }
  ) {
    return this.routerPrefix + "/" + route.name;
  }

  async _checkMaster() {
    console.log("[folder-sync]: checking master status...");
    const masterStatusResponse = await this.httpService
      .get(this.getEndpoint(this.statusRoute), {
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

  _checkPathExists(path) {
    if (!fs.existsSync(path)) {
      throw new Error(
        `[folder-sync]: ${path} does not exists on the server, this option has been configured in class constructor`
      );
    }
  }

  _warnings() {
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
    this.router.post(
      `/${this.syncRoute.name}`,
      ...this.syncRoute.middlewares,
      async (req, res) => {
        // request headers are forwarded when calling master (used for authorization purpose for exaample)
        const forwardedHeaders = this._extractForwardedHeaders(req.headers);

        const FOLDER_SYNC_SERVICE = new FolderSyncService(this.syncedDirPath);

        // GETTING CONTENT OF SLAVE SYNCED FOLDER
        const syncDirContentTree = await FOLDER_SYNC_SERVICE.getHashedMapTree();

        // ASKING SERVER THE DATA TO BE DELETED AND THE DATA TO BE UPSERTED (DIFF VS MASTER)
        const diffMasterResponse = await this.httpService.post(
          this.getEndpoint(this.diffRoute),
          {
            syncDirContentTree,
          },
          {
            // Warning: headers forwarded from request and headers set in global options could overlap
            headers: {
              ...forwardedHeaders,
              ...this.httpRequestHeaders,
              "Content-type": "application/json",
            },
          }
        );

        // SERVER RESPONDING WITH TWO TREES (DATA TO BE INSERTED/UPDATED aka upsert tree AND DATA TO BE DELETED aka delete tree)
        const {
          data: { upsertTree, deleteTree },
        } = diffMasterResponse;

        // REQUESTING ACTUAL FILES TO BE UPSERTED (binary data)
        const filesMasterResponse = await this.httpService.post(
          this.getEndpoint(this.filesRoute),
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
            },
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
      }
    );
  }
}

module.exports = FolderSyncRouterSlave;
