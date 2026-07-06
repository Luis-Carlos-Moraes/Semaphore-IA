# Spec 02: Comportamento de Interface no macOS (Barra de Menus e Dock)

Esta especificação define o comportamento visual e a integração nativa com o sistema operacional macOS.

---

## 🎨 Ocultação do Ícone do Dock

Como o Semaphore-IA foi projetado para ser um widget utilitário flutuante leve e discreto, ele não deve ocupar espaço na barra de aplicativos ativa (Dock) do macOS.

### Implementação
No processo principal [main.js](../../src/main.js#L306), o Dock é ocultado assim que a aplicação estiver pronta (`app.whenReady`):

```javascript
// Hide Dock icon on macOS
if (process.platform === 'darwin') {
  app.dock.hide();
}
```

Isso garante que o usuário veja apenas o widget translúcido na tela e o ícone de controle na barra de menus superior, sem janelas abertas poluindo a lista de aplicativos ativos.

---

## 🍏 Barra de Menus (StatusItem / Tray Menu)

No macOS, o sistema de ícones de bandeja é chamado de *StatusItem*. O aplicativo utiliza o módulo `Tray` para criar um ponto de controle rápido na barra de menus.

### Template Images (Tema Claro vs Escuro)
O macOS permite que o usuário alterne dinamicamente entre o tema claro e escuro do sistema. Para que o ícone do Semaphore se ajuste automaticamente a essa variação (ficando preto em barras claras e branco em barras escuras), utilizamos a propriedade de **Template Image** do Electron:

```javascript
let trayImage = nativeImage.createFromPath(TRAY_ICON_PATH);
if (process.platform === 'darwin') {
  trayImage.setTemplateImage(true);
}
tray = new Tray(trayImage);
```

### Regras de Imagem do Ícone
*   O arquivo de ícone original `assets/tray.png` deve ser transparente e de cor única (preto) para que a API `setTemplateImage` do macOS possa inverter os canais alfa e colorir o ícone de acordo com o tema ativo do sistema operacional.
