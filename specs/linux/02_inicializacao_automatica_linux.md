# Spec 02: Inicialização Automática (Linux)

Esta especificação define o comportamento do recurso de inicialização automática (auto-start) em distribuições Linux compatíveis com os padrões do XDG (como Ubuntu, Fedora, Debian, etc.).

---

## ⚙️ Funcionamento Técnico

No Linux, a inicialização automática de programas baseia-se na criação de um arquivo de configuração de entrada do Desktop (`.desktop`) dentro da pasta de configurações do usuário.

*   **Diretório Alvo:** `~/.config/autostart/`
*   **Nome do Arquivo:** `semaphorejs.desktop` (baseado no nome do aplicativo).

Quando o usuário habilita a inicialização no painel de configurações, o Electron cria essa pasta (se não existir) e gera o arquivo `.desktop` contendo a especificação padrão para o ambiente gráfico de janelas.

---

## 📄 Estrutura do Arquivo `.desktop` Gerado

O arquivo criado dinamicamente possui o seguinte formato padrão XDG:

```ini
[Desktop Entry]
Type=Application
Version=1.0
Name=SemaphoreJS
Comment=Semáforo para Agentes de IA
Exec="/caminho/absoluto/do/appimage-ou-executavel"
StartupNotify=false
Terminal=false
```

---

## 🛡️ Particularidades do Linux

1.  **Execução com AppImage**:
    Se o usuário estiver rodando o aplicativo como uma imagem portátil (`AppImage`), o caminho em `Exec` apontará para o local físico do arquivo `.AppImage` no disco do usuário. Se o usuário mover ou deletar esse arquivo, o autostart falhará silenciosamente no próximo login.
2.  **Permissões de Execução**:
    O arquivo `.desktop` gerado deve possuir permissões de execução (normalmente `chmod +x`) para que o sistema gerenciador de sessão (GNOME, KDE, XFCE) possa inicializá-lo corretamente. O módulo `app.setLoginItemSettings` do Electron cuida disso automaticamente na maioria das distribuições modernas.
