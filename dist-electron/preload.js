"use strict";
const electron = require("electron");
const api = {
  // Agent
  agentExecute: (params) => electron.ipcRenderer.invoke("agent:execute", params),
  agentStop: (taskId) => electron.ipcRenderer.send("agent:stop", taskId),
  onAgentEvent: (callback) => {
    const handler = (_event, data) => callback(data);
    electron.ipcRenderer.on("agent:event", handler);
    return () => electron.ipcRenderer.removeListener("agent:event", handler);
  },
  // File
  fileRead: (filePath) => electron.ipcRenderer.invoke("file:read", filePath),
  fileWrite: (filePath, content) => electron.ipcRenderer.invoke("file:write", filePath, content),
  fileList: (dirPath) => electron.ipcRenderer.invoke("file:list", dirPath),
  fileDelete: (filePath) => electron.ipcRenderer.invoke("file:delete", filePath),
  fileMkdir: (dirPath) => electron.ipcRenderer.invoke("file:mkdir", dirPath),
  getWorkspacePath: (taskId) => electron.ipcRenderer.invoke("file:getWorkspacePath", taskId),
  selectDirectory: () => electron.ipcRenderer.invoke("file:selectDirectory"),
  // Storage
  storageGet: (key) => electron.ipcRenderer.invoke("storage:get", key),
  storageSet: (key, value) => electron.ipcRenderer.invoke("storage:set", key, value),
  storageDelete: (key) => electron.ipcRenderer.invoke("storage:delete", key)
};
electron.contextBridge.exposeInMainWorld("electronAPI", api);
