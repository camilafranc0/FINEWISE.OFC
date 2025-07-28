const electron = require("electron");
const { app, BrowserWindow, ipcMain } = electron;
const path = require("node:path");
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(
  path.join(__dirname, "bd_finance.db"),
  (err) => {
    if (err) {
      console.error("Erro ao conectar ao banco de dados:", err.message);
    } else {
      console.log("Conectado ao banco de dados SQLite.");

      // Cria a tabela se não existir
      db.run(
        `
                CREATE TABLE IF NOT EXISTS usuarios (
                    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL UNIQUE,
                    nome_completo TEXT NOT NULL,
                    username TEXT NOT NULL UNIQUE,
                    senha TEXT NOT NULL            
                )
            `,
        (err) => {
          if (err) {
            console.error("Erro ao criar tabela:", err.message);
          } else {
            console.log("Tabela usuarios criada/verificada");
          }
        }
      );

      db.run(`ALTER TABLE usuarios ADD COLUMN salario REAL`, (err) => {
        if (err && !err.message.includes("duplicate column")) {
          console.error("Erro ao adicionar a coluna salario:", err.message);
        }
      });
    }
  }
);

db.serialize(() => {
  db.run(
    `
            CREATE TABLE IF NOT EXISTS despesas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                descricao TEXT,
                categoria TEXT NOT NULL,
                valor REAL NOT NULL,
                id_usuario INTEGER NOT NULL,
                FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE
            )
        `,
    (err) => {
      if (err) console.error("Erro ao criar tabela financas:", err.message);
      else console.log("✅ Tabela 'financas' criada com sucesso!");
    }
  );
});
var mainWindow = null;
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1220,
    height: 800,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await mainWindow.loadFile("src/pages/login/index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // Limpar dados sensíveis
  if (process.platform !== "darwin") {
    // Pode adicionar mais limpezas se necessário
    app.quit();
  }
});

ipcMain.handle("criar-usuario", (_, usuario) => {
  return new Promise((resolve, reject) => {
    if (
      !usuario.email ||
      !usuario.nome ||
      !usuario.username ||
      !usuario.senha
    ) {
      return reject("Todos os campos são obrigatórios");
    }

    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios'",
      (err, row) => {
        if (err) return reject(err.message);
        if (!row) return reject("Tabela usuarios não existe");

        const query = `INSERT INTO usuarios (email, nome_completo, username, senha) VALUES (?, ?, ?, ?)`;
        db.run(
          query,
          [usuario.email, usuario.nome, usuario.username, usuario.senha],
          function (err) {
            if (err) reject(err.message);
            else resolve({ id_usuario: this.lastID });
          }
        );
      }
    );
  });
});

ipcMain.handle("login", (_, loginData) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM usuarios WHERE email = ? AND senha = ?`;
    db.get(query, [loginData.email, loginData.senha], (err, row) => {
      if (err) reject(err.message);
      else if (row) resolve(row);
      else resolve(null);
    });
  });
});

ipcMain.handle("cadastrar-despesa", (_, despesa) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO despesas (titulo, descricao, categoria, valor, id_usuario)
                        VALUES (?, ?, ?, ?, ?)`;
    db.run(
      query,
      [
        despesa.titulo,
        despesa.descricao,
        despesa.categoria,
        despesa.valor,
        despesa.id_usuario,
      ],
      function (err) {
        if (err) reject(err.message);
        else resolve({ id: this.lastID });
      }
    );
  });
});

ipcMain.handle("listar-despesas", (_, id_usuario) => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM despesas WHERE id_usuario = ?",
      [id_usuario],
      (err, rows) => {
        if (err) reject(err.message);
        else resolve(rows);
      }
    );
  });
});

ipcMain.handle("atualizar-salario", (event, { id, novoSalario }) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE usuarios SET salario = ? WHERE id_usuario = ?`, // Substitui o valor
      [novoSalario, id], // Novo valor enviado
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
});

ipcMain.handle("buscar-salario", (event, id_usuario) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT salario FROM usuarios WHERE id_usuario = ?",
      [id_usuario],
      (err, row) => {
        if (err) reject(err.message);
        else resolve(row?.salario || 0);
      }
    );
  });
});

ipcMain.handle(
  "filtrarDespesasPorCategoria",
  (event, { id_usuario, categoria }) => {
    return new Promise((resolve, reject) => {
      let query = "SELECT * FROM despesas WHERE id_usuario = ?";
      const params = [id_usuario];

      if (categoria && categoria !== "Todas") {
        query += " AND categoria = ?";
        params.push(categoria);
      }

      db.all(query, params, (err, rows) => {
        if (err) {
          console.error("Erro ao filtrar despesas:", err);
          reject(err.message);
        } else {
          resolve(rows);
        }
      });
    });
  }
);

// Adicione esses handlers no ipcMain
ipcMain.handle("excluir-despesa", (_, id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM despesas WHERE id = ?", [id], function(err) {
            if (err) reject(err.message);
            else resolve(this.changes > 0);
        });
    });
});

ipcMain.handle("editar-despesa", (_, despesa) => {
    return new Promise((resolve, reject) => {
        const query = `UPDATE despesas 
                      SET titulo = ?, descricao = ?, categoria = ?, valor = ?
                      WHERE id = ? AND id_usuario = ?`;
        db.run(
            query,
            [
                despesa.titulo,
                despesa.descricao,
                despesa.categoria,
                despesa.valor,
                despesa.id,
                despesa.id_usuario
            ],
            function(err) {
                if (err) reject(err.message);
                else resolve(this.changes > 0);
            }
        );
    });
});
module.exports = db;
