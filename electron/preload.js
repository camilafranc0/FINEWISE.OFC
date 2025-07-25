const { contextBridge, ipcRenderer } = require("electron");
console.log("Preload carregado! 🚀");

contextBridge.exposeInMainWorld("api", {
  criarUsuario: (dados) => ipcRenderer.invoke("criar-usuario", dados),
  fazerLogin: (dados) => ipcRenderer.invoke("login", dados),
  cadastrarDespesa: (dados) => ipcRenderer.invoke("cadastrar-despesa", dados),
  listarDespesas: (id_usuario) =>
    ipcRenderer.invoke("listar-despesas", id_usuario),

  atualizarSalario: (dados) => ipcRenderer.invoke("atualizar-salario", dados),

  buscarSalario: (id_usuario) =>
    ipcRenderer.invoke("buscar-salario", id_usuario),
});
