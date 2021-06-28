const { contextBridge, ipcRenderer } = require("electron");
//https://stackoverflow.com/questions/44391448/electron-require-is-not-defined
//IMPORTANT: When release, only allow whitelisted channels!!

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    receive: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
});