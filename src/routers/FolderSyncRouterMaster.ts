import { join } from "path";
import { cwd } from "process";
import express from "express";
import { requireBodyParams } from "../middlewares/body-params.middlewraes";
import { FolderSyncService } from "../services/folder-sync.service";
import { handleError } from "../helpers/errors.helper";
import { InternalServerError } from "../errors/http.errors";

const { Router } = express;

const diffRouteDefaultOptions: ApiRoute = {
  name: "diff",
  middlewares: [],
};

const filesRouteDefaultOptions: ApiRoute = {
  name: "files",
  middlewares: [],
};

const statusRouteDefaultOptions: ApiRoute = {
  name: "status",
  middlewares: [],
};

interface ApiRoute {
  name: string;
  middlewares?: any[];
}

export class FolderSyncRouterMaster {
  public syncedDirPath: string;
  public diffRoute: ApiRoute;
  public filesRoute: ApiRoute;
  public statusRoute: ApiRoute;
  public router: any;

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
    diffRoute: ApiRoute = {
      ...diffRouteDefaultOptions,
    },
    filesRoute: ApiRoute = {
      ...filesRouteDefaultOptions,
    },
    statusRoute: ApiRoute = {
      ...statusRouteDefaultOptions,
    },
    syncedDirPath: string = join(cwd(), "public")
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

  private _init() {
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
        try {
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
        } catch (error) {
          handleError(
            new InternalServerError("unexpected error encountred"),
            req,
            res
          );
        }
      }
    );

    this.router.post(
      `/${this.filesRoute.name}`,
      requireBodyParams({
        upsertTree: true,
      }),
      ...this.filesRoute.middlewares,
      async (req, res) => {
        try {
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
