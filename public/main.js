const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const { execSync } = require("child_process");
const { autoUpdater } = require("electron-updater");
const i18next = require("./i18next");
const ytdl = require("ytdl-core");
const path = require("path");
const isDev = require("electron-is-dev");
const ProgressBar = require("electron-progressbar");
const { v1 } = require("uuid");
const fs = require("fs");
const log = require('electron-log');
const Store = require('electron-store');
const store = new Store();

let mainWindow, progressBar, queue ,downloadItem, isDownload;
mainWindow = null;
progressBar = null;
queue = new Map();
downloadItem = null;
isDownload = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 640,
    height: 744,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0f172a',
      symbolColor: '#f8fafc',
      height: 56
    },
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      devTools: isDev,
      contextIsolation: false,
      webviewTag: true
    },
  });

  mainWindow.loadURL(
    isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`
  );

  if (isDev) mainWindow.webContents.openDevTools({ mode: "detach" });

  mainWindow.setResizable(true);
  mainWindow.on("closed", () => (mainWindow = null));

  !store.get("language") && store.set("language", app.getLocale());
  store.get("language") && i18next.changeLanguage(store.get("language"));
  
  ipcMain.on("SEND_GET_LANGUAGE", (event, args) => event.reply("REPLY_GET_LANGUAGE", {language: store.get("language")}));
  ipcMain.on("SEND_CHANGE_LANGUAGE", (event, args) => {
    store.set("language", args.language);
    i18next.changeLanguage(args.language);
  });
  
  (store.get("autoDownload") === undefined || store.get("autoDownload") === null) && store.set("autoDownload", true);
  ipcMain.on("SEND_GET_AUTO_DOWNLOAD", (event, args) => event.reply("REPLY_GET_AUTO_DOWNLOAD", {autoDownload: store.get("autoDownload")}));
  ipcMain.on("SEND_CHANGE_AUTO_DOWNLOAD", (event, args) => store.set("autoDownload", args.autoDownload));
  
  !store.get("output") && store.set("output", app.getPath("desktop"));
  ipcMain.on("SEND_GET_OUTPUT", (event, args) => event.reply("REPLY_GET_OUTPUT", {output: store.get("output")}));
  ipcMain.on("SEND_CHANGE_OUTPUT", (event, args) => {
    const newOutput = dialog.showOpenDialogSync({properties: ["openDirectory"]})[0];
    store.set("output", newOutput);
    event.reply("REPLY_GET_OUTPUT", {output: newOutput})
  });
  ipcMain.on("SEND_OPEN_OUTPUT", (event, args) => execSync(`start ${store.get("output")}`));
  ipcMain.on("SEND_RESET_OUTPUT", (event, args) => {
    const resetPath = app.getPath("desktop");
    store.set("output", resetPath);
    event.reply("REPLY_GET_OUTPUT", {output: resetPath});
  });

  ipcMain.on("SEND_GET_INFO", async (event, args) => {
    let info, infoData;
    infoData = null;
    try {
      info = await ytdl.getInfo(args.videoURL);
      infoData = {
        title: info.videoDetails.title,
        videoURL: args.videoURL,
        videoFormats: info.formats.filter(item => item.hasVideo).sort((a,b) => b.hasAudio - a.hasAudio),
        audioFormats: info.formats.filter(item => !item.hasVideo && item.hasAudio)
      };
    } catch (error) {
      console.error(error.message);
      let message;
      if(error.message.indexOf("Not a YouTube domain") > -1){
        message = i18next.t("Not a YouTube domain.");
      }else if(error.message.indexOf("No video id found") > -1){
        message = i18next.t("No video id found.");
      }else{
        message = error;
      };
      
      dialog.showMessageBoxSync(
        {
          title: i18next.t("Error"), 
          type: "error", 
          message: message
        }
      );
    };
    event.reply("REPLY_GET_INFO", { info: infoData });
  });

  ipcMain.on("SEND_GET_QUEUE", (event, args) => event.reply("REPLY_GET_QUEUE", {queue: queue}));
  ipcMain.on("SEND_ADD_QUEUE", (event, args) => {
    const { title, downloadURL, container } = args;
    queue.set(v1(), {
      title: title,
      downloadURL: downloadURL,
      container: container,
      output: store.get("output"),
      receivedBytes: 0,
      totalBytes: 0,
      isState: "BEFORE_DOWNLOAD"
    });

    event.reply("REPLY_GET_QUEUE", {queue: queue});
  });
  ipcMain.on("SEND_REMOVE_DOWNLOADED_QUEUE", (event, args) => {
    queue = new Map([...queue].filter(item => item[1].isState !== "DOWNLOADED"));
    event.reply("REPLY_GET_QUEUE", {queue: queue});
  });
  ipcMain.on("SEND_REMOVE_QUEUE", (event, args) => {
    const queueItem = queue.get(args.queueID);
    if(queueItem.isState === "DOWNLOADING"){
      downloadItem.cancel();
      isDownload = null;
      downloadItem = null;
      queue.delete(args.queueID);
      event.reply("REPLY_DOWNLOAD", {isDownload: isDownload});
    }else{
      queue.delete(args.queueID);
    };

    event.reply("REPLY_GET_QUEUE", {queue: queue});
  });

  ipcMain.on("SEND_DOWNLOAD", async (event, args) => {
    if(downloadItem === null){
      const beforeDownloadQueues = [...queue].filter(item => item[1].isState === "BEFORE_DOWNLOAD");
      if(beforeDownloadQueues.length > 0){
        mainWindow.webContents.downloadURL(beforeDownloadQueues[0][1].downloadURL);
        isDownload = "DOWNLOADING";
      }else{
        isDownload = null;
      };
    }else{
      downloadItem.resume();
      isDownload = "DOWNLOADING";
    };
    event.reply("REPLY_DOWNLOAD", {isDownload: isDownload});
  });
  ipcMain.on("SEND_PAUSE", (event, args) => {
    downloadItem.pause();
    isDownload = "PAUSE";
    event.reply("REPLY_DOWNLOAD", {isDownload: isDownload});
  });

  ipcMain.on("SEND_GET_STATE", (event, args) => event.reply("REPLY_DOWNLOAD", {isDownload: isDownload}));
  ipcMain.on("SEND_OPEN_HELP", (event, args) => execSync(`start /max ${args.url}`));

  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    downloadItem = item;
    
    let beforeDownloadQueues = [...queue].filter(item => item[1].isState === "BEFORE_DOWNLOAD");
    let downloadQueueID = beforeDownloadQueues.length > 0 ? beforeDownloadQueues[0][0] : null;
    let data = queue.get(downloadQueueID);

    if(beforeDownloadQueues.length !== 0 && downloadQueueID !== null){
      let fileName = `${data.title}.${data.container}`.replace(/[`~!@#$%^&*|\\\'\";:\/?]/gi, "");
      const exists = fs.existsSync(path.join(store.get("output"), fileName));
      if(exists){
        dialog.showMessageBoxSync(mainWindow, {
          type: "info", 
          title: i18next.t("Info"), 
          message: i18next.t("This file name already exists.\nEnter a new file name."), 
          buttons: ["YES"]
        });
        const newOutput = dialog.showSaveDialogSync(mainWindow, {defaultPath: store.get("output"), filters:[{name: data.container, extensions: [data.container]}]});
        item.setSavePath(newOutput);
      }else{
        item.setSavePath(path.join(store.get("output"), fileName));
      };
    };

    item.on('updated', (event, state) => {
      let queueData = queue.get(downloadQueueID);
      queueData.isState = "DOWNLOADING";
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed')
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused')
        } else {
          queueData.receivedBytes = item.getReceivedBytes();
          queueData.totalBytes = item.getTotalBytes();
          queue.set(downloadQueueID, queueData);
          console.log(`Received bytes: ${item.getReceivedBytes()} / ${item.getTotalBytes()}`)
        }
      }
    });
    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download successfully')
      } else {
        console.log(`Download failed: ${state}`)
      };
      
      let queueData = queue.get(downloadQueueID);
      queueData.isState = "DOWNLOADED";

      downloadQueueID = null;
      downloadItem = null;
      isDownload = null;
    });
  });

  mainWindow.focus();
};


autoUpdater.on("update-available", info => {
  const messageBoxIndex = dialog.showMessageBoxSync({
    type: "info",
    title: i18next.t("Update available"),
    message: i18next.t("A new update has been released. Would you like to download it?"),
    buttons: [i18next.t("Update"), i18next.t("Later")]
  });

  if(messageBoxIndex === 0){
    progressBar = new ProgressBar({
      text: i18next.t("Wait..."),
      detail: i18next.t("Downloading install files...")
    });
    progressBar.on("completed", () => {
      progressBar.text = i18next.t("Complete!");
      progressBar.detail = i18next.t("Download complete.");
    });

    mainWindow.close();
  };
});
autoUpdater.on("error", err => {
  log.error("error", err);
  log.transports.file.resolvePath = () => path.join(app.getPath("userData"), 'main.log');
});
autoUpdater.on("download-progress", progressObj => {
  let detail = `${progressObj.transferred} / ${progressObj.total}`
  !progressBar.isCompleted() && (progressBar.detail = detail);
});
autoUpdater.on("update-downloaded", info => {
  autoUpdater.quitAndInstall();
  progressBar.setCompleted();
  progressBar = null;
});

app.on("ready", () => {
  createWindow();
  autoUpdater.checkForUpdates();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});