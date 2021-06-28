const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("path");
let win;

async function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 900,
    frame: false,
    //transparent: true,
    webPreferences: {
      preload: path.join(__dirname, "./preload.js"),
      devTools: true
    }
  });

  win.setResizable(false);
  win.loadFile('index.html');


  win.on("closed", () => {
    win = null;
  });
}

app.on("ready", createWindow);

ipcMain.on("close", () => win.close())
ipcMain.on("minimize", () => win.minimize())