# EXPRESS-FOLDER-SYNC

This package allow you to synchronize folders across remote servers (master and slaves).
This package exports two express js routers FolderSyncRouterMaster and FolderSyncRouterSlave containing necessary logic to perform sync tasks.

Sync task is optimized so that an heavy media already synced over the network wont be sent again optimizing time and network bandwidth.

Caluculation of the difference of contents is made leveraging hashing techniques in order to detect updates. (Hash map tree reprepresentation of synced folders diffing is done before compressing a zip archive containing the actual ressource to be sent over the network).


## How does it works

Folders are being synced over two subsequent HTTP calls performed from the slave endpoint (sync) to master API.

1- ask the difference of content SLAVE (syncedDirPath) vs MASTER (syncedDirPath)
2- using the response of the first call (upsertTree and deleteTree objects) ask for the updated and new data (binary data) and place it into the syncedDirPath folder using the upsertTree and delete old data using the deleteTree 

Trees are builded using the hash of the files in order to optimize the HTTP calls and data usage.

## Warning 

The sync operation is not automatically triggered or based on a timer. You have to perform an initial HTTP call to the SLAVE syncRoute endpoint in order to trigger an update.

## Quick start

Install the package in your project

```bash
npm i express-folder-sync
```

### Master server (source of truth)

All options used in the constructor are default options so you do not have to change any of them nor pass it in the constructor.
In order to use the default options you must ensure that :
- syncedDirPath is a valid path


```js
const express = require("express");
const { FolderSyncRouterMaster } = require("express-folder-sync/build/master");
const app = express();
app.use(express.json());
app.use("/api", new FolderSyncRouterMaster(
    diffRoute = { // name of the route retrieving the content diff on the master server vs slave server
       name: "diff",
       middlewares: [], // extra middlewares can be used to perform logic before calling the endpoint (logging ? )
    },
    filesRoute = { // name of the route sending zip archive containing updated and new files on the master server vs slave server
      name: "files",
      middlewares: [], // extra middlewares can be used to perform logic before calling the endpoint  (logging ? )
    },
    statusRoute = {  // name of the route sending master server status and performing a check of configuration between slave and master
       name: "status",
       middlewares: [], // extra middlewares can be used to perform logic before calling the endpoint (logging ? )
    },
    syncedDirPath = join(cwd(), "public") // directory to be synced (source of truth - the content of this directory will be copied to the slave(s) syncedDirPath dirtectorie(s)) 
));

app.listen(9000, 'localhost', () =>
  console.log(
    `master running at http://localhost:9000`
  )
);
```

### Slave

All options used in the constructor are default options so you do not have to change any of them nor pass it in the constructor.
In order to use the default options you must ensure that :
- syncedDirPath is a valid path
- tempDirPath is a valid path
- masterServerOptions.baseURL is valid

```js
const express = require("express");
const { FolderSyncRouterSlave } = require("express-folder-sync/build/slave");
const app = express();
app.use(express.json());
app.use(
  "/api",
  new FolderSyncRouterSlave(
    masterServerOptions = {  // options related to the master server
      baseURL: "http://localhost:9000", // root url of the master server instance
      httpRequestTimeout: 5000, // request timeout (axios is used underneath to perform http calls from the slave router to the master router and ask for data)
      httpRequestHeaders: {}, // extra headers to be used when making http calls to the master server instance 
      routerPrefix: "api", // prefix of the router aka app.use(prefix, FolderSyncRouterMaster)
      diffRoute: { // name of the route retrieving the content diff on the master server vs slave server
        name: "diff",
      },
      filesRoute: { // name of the route sending zip archive containing updated and new files on the master server vs slave server
        name: "files",
      },
      statusRoute: { // name of the route sending master server status and performing a check of configuration between slave and master
        name: "status",
      },
      check: true, // allowing initial request to satus endpoint to be disabled (request is performed at server runtime could be disabled in production environement for example)
    },
   syncedDirPath = join(cwd(), "public"), // path to the folder being synchronized on the slave
   tempDirPath = join(cwd(), "temp"), // path to a temporary directory to store zip files before merging them into the synchronized directory on the slave
   syncRoute = { // endpoint name on the slave (to be called to trigger the syncronization process)
     name: "sync",
     middlewares: [], // extra middlewares can be used to perform logic before calling the endpoint (logging ? )
    },
   forwardedHeadersKeysMap = { // headers keys to be forwarded from the original request when performing http calls to the master api 
      Authorization: true, // allowing for example to pass an authorization headers content for authentication/authorization purposes
    },
   cleanTempDir = true // cleaning temp directory after having merged the content to the syncronized folder
  )
);

app.listen(3000, 'localhost', () =>
  console.log(
    `slave running at http://localhost:3000`
  )
);
```


## Dependencies 

[adm-zip](managing zip archive)
[axios](simple http wrapper)
[express](simple node js HTTP server)
[folder-hash](extract hashed folder tree)
[fs-extra](node js filesystem wrapper)
