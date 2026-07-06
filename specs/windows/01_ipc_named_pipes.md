# Spec 01: Comunicação IPC via Named Pipes (Windows)

Esta especificação define o mecanismo de comunicação local de baixa latência utilizado pelo Semaphore-IA em sistemas operacionais Windows.

---

## 🔗 Canal de Comunicação (Named Pipe)

No Windows, a comunicação entre a Interface de Linha de Comando (CLI) e o processo principal do Electron é realizada utilizando **Named Pipes** (Tubos Nomeados).

*   **Identificador do Pipe:** `\\.\pipe\semaphore-js`
*   **Mecanismo:** Módulo nativo `net` do Node.js.

---

## 🛠️ Ciclo de Vida da Comunicação

```
+------------------+                   +--------------------+
|  CLI Client      |                   | Electron Main      |
|  (src/cli)       |                   | (IPC Server)       |
+--------+---------+                   +---------+----------+
         |                                       |
         | 1. Conecta ao pipe                    |
         |-------------------------------------->|
         |                                       |
         | 2. Escreve JSON payload               |
         |-------------------------------------->|
         |    {"cmd": "set",                     |
         |     "state": "yellow",                |
         |     "session": "default"}             |
         |                                       |
         | 3. Fecha a conexão                    |
         |-------------------------------------->|
         |                                       |
         v                                       v
    Finaliza (exit 0)                     Processa e repassa
                                          para o Renderer
```

### 1. Inicialização do Servidor (Processo Principal)
O servidor IPC é iniciado no [main.js](../../src/main.js#L175) através da função `startIpcServer()`:
```javascript
const ipcPath = '\\\\.\\pipe\\semaphore-js';
ipcServer = net.createServer((socket) => { ... });
ipcServer.listen(ipcPath);
```

### 2. Disparo de Sinalizações (CLI Client)
O cliente CLI [index.js (CLI)](../../src/cli/index.js) cria uma conexão única e envia o payload serializado:
```javascript
const client = net.createConnection('\\\\.\\pipe\\semaphore-js', () => {
  client.write(JSON.stringify({ cmd: 'set', state, session }));
  client.end();
});
```

---

## 🛡️ Tratamento de Erros e Resiliência

1.  **Servidor Inativo:**
    Caso o widget do semáforo não esteja aberto/rodando, a tentativa de conexão pelo CLI falhará. O erro é capturado silenciosamente (`client.on('error', ...)`), finalizando o script com código de saída `exit 0` para evitar o travamento de execuções ou pipelines de CI/CD.
2.  **Fechamento do App:**
    Durante o ciclo de encerramento (`before-quit`), o servidor IPC fecha todas as conexões ativas para liberar os recursos do Windows.
