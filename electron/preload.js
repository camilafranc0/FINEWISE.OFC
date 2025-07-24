const { contextBridge, ipcRenderer } = require('electron');
console.log("Preload carregado! 🚀");

contextBridge.exposeInMainWorld('api', {
    criarUsuario: (dados) => ipcRenderer.invoke('criar-usuario', dados),
    fazerLogin: (dados) => ipcRenderer.invoke('login', dados)
})