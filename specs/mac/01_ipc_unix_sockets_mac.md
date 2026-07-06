# Spec 01: Comunicação IPC via Unix Sockets (macOS)

Esta especificação define o mecanismo de comunicação local de baixa latência utilizado pelo Semaphore-IA em sistemas operacionais macOS.

---

## 🔗 Canal de Comunicação (Unix Socket)

No macOS, a comunicação entre a Interface de Linha de Comando (CLI) e o processo principal do Electron é baseada em **Unix Domain Sockets**.

*   **Identificador do Socket:** `/tmp/semaphore-js.sock`
*   **Mecanismo:** Módulo nativo `net` do Node.js.

---

## 🛠️ Ciclo de Vida da Comunicação

```
+------------------+                   +--------------------+
|  CLI Client      |                   | Electron Main      |
|  (src/cli)       |                   | (IPC Server)       |
+--------+---------+                   +---------+----------+
         |                                       |
         | 1. Conecta ao socket                  |
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
O servidor IPC limpa conexões antigas órfãs e escuta no caminho do socket Unix em [main.js](../../src/main.js#L175):
```javascript
const ipcPath = '/tmp/semaphore-js.sock';

// Limpa socket Unix antigo caso exista
if (fs.existsSync(ipcPath)) {
  fs.unlinkSync(ipcPath);
}

ipcServer = net.createServer((socket) => { ... });
ipcServer.listen(ipcPath);
```

### 2. Disparo de Sinalizações (CLI Client)
O cliente CLI [index.js (CLI)](../../src/cli/index.js) cria a conexão de socket de fluxo no caminho do Unix:
```javascript
const client = net.createConnection('/tmp/semaphore-js.sock', () => {
  client.write(JSON.stringify({ cmd: 'set', state, session }));
  client.end();
});
```

---

## 🛡️ Tratamento de Erros e Resiliência

1.  **Liberação de Recursos no Fechamento:**
    Diferente do Windows, o arquivo do socket no macOS permanece fisicamente no disco em `/tmp/semaphore-js.sock` mesmo depois do encerramento do processo. Por isso, a aplicação trata o evento `before-quit` para apagar o arquivo do disco usando `fs.unlinkSync(ipcPath)`.
2.  **Tratamento de Socket Travado na Inicialização:**
    Se a aplicação crashar ou for interrompida de forma abrupta, o arquivo do socket permanecerá no disco. Na próxima inicialização, o código remove o arquivo do socket orfão (`fs.unlinkSync(ipcPath)`) antes de chamar `ipcServer.listen(ipcPath)` para evitar o erro de endereço em uso (`EADDRINUSE`).
