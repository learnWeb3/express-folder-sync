const { hashElement } = require("folder-hash");
const AdmZip = require("adm-zip");
const {
  existsSync,
  ensureDir,
  readdirSync,
  remove,
  emptyDirSync,
  move,
  copy,
} = require("fs-extra");
const { join } = require("path");
const { readFile, readFileSync, fstat } = require("fs");

class FolderSyncServiceHashingContentFailedError extends Error {
  constructor(message) {
    super(message);
  }
}

class FolderSyncServiceZipFileNotFoundError extends Error {
  constructor(message) {
    super(message);
  }
}

module.exports = class FolderSyncService {
  constructor(path) {
    this.path = path;
    this.hashMapTree = {};
  }

  async getHashedMapTree() {
    const options = {
      algo: "sha1", // see crypto.getHashes() for options in your node.js REPL
      encoding: "hex", // 'base64', 'hex' or 'binary' // avoid slashes by using hexadecimal encoding of hashes and not defautl base64
      folders: { exclude: [".*", "node_modules", "test_coverage"] },
      files: {
        include: [
          "*.js",
          "*.json",
          "*.mp4",
          "*.mp3",
          "*.doc",
          "*.pdf",
          "*.jpeg",
          "*.png",
        ],
      },
    };

    return await hashElement(this.path, options)
      .then((hash) => JSON.parse(JSON.stringify(hash)))
      .catch((error) => {
        throw new FolderSyncServiceHashingContentFailedError(
          `hashing content of folder ${this.path} failed, reason: ${error.message}`
        );
      });
  }

  /* filesPaths = [
    {
      path: string,
      hash: string
    }
  ]
  */
  zipFiles(filesPaths = []) {
    const errors = [];
    // creating archives
    const zip = new AdmZip();
    for (const { path, hash } of filesPaths) {
      if (existsSync(path)) {
        const bufferContent = readFileSync(path, {
          encoding: "utf-8",
        });
        zip.addFile(hash, bufferContent);
      } else {
        errors.push(`file at ${path} does not exists`);
      }
    }
    if (errors.length) {
      throw new FolderSyncServiceZipFileNotFoundError(errors.join(", "));
    }
    // get everything as a buffer
    const buffer = zip.toBuffer();
    return buffer;
  }

  async upsertFiles(
    upsertTree,
    syncedFolderDirectoryPath,
    fileTempDirectoryPath,
    tempFilesNames = []
  ) {
    const upsertFilesRecursively = async (
      upsertTree,
      syncedFolderDirectoryPath,
      fileTempDirectoryPath,
      tempFilesNames
    ) => {
      for (let index = 0; index < upsertTree.children.length; index++) {
        const child = upsertTree.children[index];
        const isDir = child.children;
        if (isDir) {
          const dirPath = join(syncedFolderDirectoryPath, child.name);
          await ensureDir(dirPath);
          await upsertFilesRecursively(
            upsertTree.children[index],
            dirPath,
            fileTempDirectoryPath,
            tempFilesNames
          );
        } else {
          const fileToMoveName = child.hash;
          if (!fileToMoveName) {
            throw new Error(
              `missing file in temp directory ${child.hash.toLowerCase()}`
            );
          }
          const fileToMoveSourcePath = join(
            fileTempDirectoryPath,
            fileToMoveName
          );
          const fileToMoveDestinationPath = join(
            syncedFolderDirectoryPath,
            child.name
          );

          await copy(fileToMoveSourcePath, fileToMoveDestinationPath, {
            overwrite: true,
          });
        }
      }
    };

    await upsertFilesRecursively(
      upsertTree,
      syncedFolderDirectoryPath,
      fileTempDirectoryPath,
      tempFilesNames
    );
  }

  async deleteFiles(syncedFolderDirectoryPath, deleteTree) {
    const deleteFileRecursively = async (
      syncedFolderDirectoryPath,
      deleteTree
    ) => {
      for (let index = 0; index < deleteTree.children.length; index++) {
        const child = deleteTree.children[index];
        if (child.hash && !child.children) {
          const filePath = join(syncedFolderDirectoryPath, child.name);
          await remove(filePath);
          if (emptyDirSync(syncedFolderDirectoryPath)) {
            await remove(syncedFolderDirectoryPath);
          }
        } else {
          const folderPath = join(syncedFolderDirectoryPath, child.name);
          deleteFileRecursively(folderPath, deleteTree.children[index]);
        }
      }
    };
    await deleteFileRecursively(syncedFolderDirectoryPath, deleteTree);
  }

  async unzipFilesToFolderDestination(dataBuffer, tempDirectoryPath) {
    const tempDataDirName = `temp_${Date.now()}`;
    const tempDataDirPath = join(tempDirectoryPath, tempDataDirName);
    const zip = new AdmZip(dataBuffer);
    await ensureDir(tempDataDirPath);
    zip.extractAllTo(tempDataDirPath, true);
    const files = readdirSync(tempDataDirPath, { encoding: "utf-8" });
    return {
      folderName: tempDataDirName,
      folderPath: tempDataDirPath,
      files,
    };
  }

  // unique files based on their hash to prevent sneding multiple times the same file
  extractUniqueFilesPaths(
    tree,
    rootPath,
    filesPathsObjects = [],
    mappingHashFiles = {}
  ) {
    const self = this;
    for (const child of tree.children) {
      if (child.children) {
        let folderPath = rootPath + "/" + child.name;
        const folderFilesPaths = self.extractUniqueFilesPaths(
          child,
          folderPath,
          filesPathsObjects,
          mappingHashFiles
        );
        filesPathsObjects = Object.values(
          [...filesPathsObjects, ...folderFilesPaths].reduce(
            (mappingObj, filePathObject) => {
              mappingObj[filePathObject.path] = filePathObject;
              return mappingObj;
            },
            {}
          )
        );
      } else {
        if (!mappingHashFiles[child.hash]) {
          mappingHashFiles[child.hash] = true;
          const filePath = rootPath + "/" + child.name;
          const fileHash = child.hash;
          filesPathsObjects = [
            ...filesPathsObjects,
            { path: filePath, hash: fileHash },
          ];
        }
      }
    }
    return filesPathsObjects;
  }

  getDiffTree(
    masterFilesHashMap,
    filesHashMap,
    diff = {
      name: null,
      children: [],
    },
    rootFolder = this.path
  ) {
    const self = this;
    if (masterFilesHashMap.hash !== filesHashMap.hash) {
      diff.name = masterFilesHashMap.name;
      for (let index = 0; index < masterFilesHashMap.children.length; index++) {
        const checkExists = filesHashMap.children.find(
          (child) => child.hash === masterFilesHashMap.children[index].hash
        );
        if (!checkExists) {
          const masterFolder = masterFilesHashMap.children[index];
          const clientFolder = filesHashMap.children.find(
            (child) => child.name === masterFolder.name
          );

          if (masterFilesHashMap.children[index].children && clientFolder) {
            diff.children[index] = {
              ...masterFolder,
              children: masterFolder.children.filter(
                (child) =>
                  !clientFolder.children.find(
                    (_child) =>
                      _child.name === child.name && _child.hash === child.hash
                  )
              ),
            };
          } else {
            diff.children[index] = masterFilesHashMap.children[index];
          }

          if (
            diff.children[index].children &&
            !diff.children[index].children.length
          ) {
            delete diff.children[index];
          }
        } else {
          self.getDiffTree(
            masterFilesHashMap.children[index],
            checkExists,
            diff.children[index],
            rootFolder
          );
        }
      }

      if (diff.children) {
        diff.children = diff.children.filter((child) => child !== null);
      }
    }
    return diff;
  }
};
