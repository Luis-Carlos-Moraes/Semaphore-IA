# Spec 02: Inicialização Automática e Registro (Windows)

Esta especificação define como o recurso de inicialização automática (auto-start) é gerenciado no Windows.

---

## ⚙️ Funcionamento Técnico

No Windows, para que um aplicativo inicie automaticamente com o login do usuário, ele precisa de uma entrada sob o registro do sistema (Windows Registry).

O Electron encapsula essa funcionalidade nativamente através da API `app.setLoginItemSettings`.

*   **Chave do Registro Afetada:** `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run`
*   **Nome do Valor:** Nome do aplicativo definido em `package.json` (`productName` ou `name`), que neste caso é `SemaphoreJS`.
*   **Conteúdo do Valor:** O caminho absoluto do executável (`app.getPath('exe')`).

---

## 💻 Implementação do Código

A ativação é executada em [main.js](../../src/main.js#L235) na função `applyAutoStart(enabled)`:

```javascript
function applyAutoStart(enabled) {
  try {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      path: app.getPath('exe')
    });
  } catch (err) {
    console.error('Failed to set login item settings:', err);
  }
}
```

Essa função é chamada sempre que o usuário salva as configurações no painel visual [settings.html](../../src/renderer/settings.html) e marca a caixa "Iniciar com o sistema".

---

## 🔍 Comportamento Esperado e Validação

1.  **Habilitar:** Ao marcar a opção e clicar em "Salvar", uma nova string correspondente a `SemaphoreJS` contendo o caminho do executável do aplicativo será injetada no registro sob a chave `Run`.
2.  **Desabilitar:** Ao desmarcar a opção, o valor correspondente a `SemaphoreJS` é removido da chave `Run` no registro do Windows.
3.  **Comportamento em Modo de Desenvolvimento:**
    *   Chamar essa API durante a execução com `electron .` ou `npm start` em modo de desenvolvimento adicionará a inicialização do executável geral do Electron (como `node_modules/electron/dist/electron.exe`), o que pode não ser o comportamento desejado. Portanto, em produção, isso só funcionará de forma correta quando o app estiver compilado e empacotado.
