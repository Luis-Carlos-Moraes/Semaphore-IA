# Spec 01: Comunicação IPC via Sockets Unix (Linux)

Esta especificação define o mecanismo de comunicação local de baixa latência utilizado pelo Semaphore-IA em sistemas operacionais Linux.

---

## 🔗 Canal de Comunicação (Unix Socket)

No Linux, a comunicação local baseia-se em **Unix Domain Sockets** em arquivos de fluxo.

*   **Identificador do Socket:** `/tmp/semaphore-js.sock`
*   **Mecanismo:** Módulo nativo `net` do Node.js.

---

## 🛠️ Ciclo de Vida da Comunicação

A lógica segue a mesma estrutura implementada no macOS:
1.  **Servidor IPC**: Inicializa, valida se há um socket órfão deixado por um travamento anterior e executa o `listen`.
2.  **Escrita do Cliente**: CLI [index.js (CLI)](../../src/cli/index.js) escreve o payload serializado JSON direto para `/tmp/semaphore-js.sock`.
3.  **Remoção de Arquivos**: Ao encerrar o aplicativo, o arquivo do socket no caminho `/tmp/semaphore-js.sock` é removido utilizando `fs.unlinkSync()`.

---

## 🛡️ Particularidades do Linux

1.  **Permissões de Acesso**:
    Como o arquivo do socket é criado no diretório `/tmp/`, as permissões padrão do Linux se aplicam. O arquivo de socket herda as permissões do usuário que iniciou o Semaphore-IA. Portanto, o script CLI deve ser executado pelo **mesmo usuário** que iniciou a janela principal para evitar erros de permissão negada (`EACCES`).
2.  **Resiliência em Sistemas Multi-usuários**:
    Se múltiplos usuários compartilharem o mesmo ambiente Linux de teste, conflitos podem ocorrer em `/tmp/semaphore-js.sock`. Em futuras iterações, pode ser interessante variar o caminho do socket baseando-se no ID de usuário (como `/tmp/semaphore-js-${process.getuid()}.sock`).
