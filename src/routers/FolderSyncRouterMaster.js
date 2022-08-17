const fs = require("fs");
const { join } = require("path");
const { cwd } = require("process");
const express = require("express");
const { Router } = express;
const { requireBodyParams } = require("../middlewares/body-params.middlewraes");
const FolderSyncService = require("../services/folder-sync.service");

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
  constructor(
    diffRoute = {
      ...diffRouteDefaultOptions,
    },
    filesRoute = {
      ...filesRouteDefaultOptions,
    },
    statusRoute = {
      ...statusRouteDefaultOptions,
    },
    syncedDirPath = join(cwd(), "public")
  ) {
    this.syncedDirPath = syncedDirPath;
    this.diffRoute = {
      ...diffRouteDefaultOptions,
      ...diffRoute,
    };
    this.filesRoute = {
      ...filesRouteDefaultOptions,
      ...filesRoute,
    };
    this.statusRoute = {
      ...statusRoute,
      ...statusRouteDefaultOptions,
    };
    this.router = Router();
    this._init();
    return this.router;
  }

  _init() {
    this.router.get(`/${this.statusRoute.name}`, async (req, res) => {
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
    });

    this.router.post(
      `/${this.diffRoute.name}`,
      requireBodyParams({
        syncDirContentTree: true,
      }),
      ...this.diffRoute.middlewares,
      async (req, res) => {
        const {
          body: { syncDirContentTree },
        } = req;
        const FOLDER_SYNC_SERVICE = new FolderSyncService(this.syncedDirPath);
        const masterSyncDirContentTree =
          await FOLDER_SYNC_SERVICE.getHashedMapTree();
        //return res.json(masterSyncDirContentTree);
        const upsertTree = FOLDER_SYNC_SERVICE.getDiffTree(
          masterSyncDirContentTree,
          syncDirContentTree
        );
        const deleteTree = FOLDER_SYNC_SERVICE.getDiffTree(
          syncDirContentTree,
          masterSyncDirContentTree
        );
        return res.status(200).json({
          upsertTree,
          deleteTree,
        });
      }
    );

    this.router.post(
      `/${this.filesRoute.name}`,
      requireBodyParams({
        upsertTree: true,
      }),
      ...this.filesRoute.middlewares,
      async (req, res) => {
        const {
          body: { upsertTree },
        } = req;
        const FOLDER_SYNC_SERVICE = new FolderSyncService(this.syncedDirPath);
        const filesPaths = FOLDER_SYNC_SERVICE.extractUniqueFilesPaths(
          upsertTree,
          this.syncedDirPath
        );
        const zipBuffer = FOLDER_SYNC_SERVICE.zipFiles(filesPaths);
        const zipArchiveName = "master_sync_files";
        res.status(200);
        res.set({
          "Content-Disposition": `attachment; filename=${zipArchiveName}`,
          "Content-type": "application/zip",
        });
        return res.send(zipBuffer);
      }
    );
  }
}

module.exports = FolderSyncRouterMaster;
