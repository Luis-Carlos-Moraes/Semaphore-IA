# Semaphore JS - Semáforo para Agentes de IA / Traffic Light for AI Agents

[🇧🇷 Versão em Português](#-versão-em-português) | [🇺🇸 English Version](#-english-version)

---

## 🇧🇷 Versão em Português

O **Semaphore JS** é um aplicativo leve, rápido e compatível com **Windows, macOS e Linux**, desenvolvido em **JavaScript, Node.js e Electron**. Ele exibe um widget flutuante premium e translúcido (com efeito glassmorphism) na tela para monitorar visualmente o estado de execução de agentes de IA locais (ocioso, pensando, executando ferramentas) em tempo real, integrando-se via hooks locais.

---

### 🏗️ Arquitetura Geral

```
[ IDE Antigravity / Agente de IA ]
             │
             ▼ (Dispara hook de ciclo de vida)
[ CLI Client (Node.js) ] 
             │
             ▼ (Escreve JSON via Pipe Nomeado / Socket Unix)
[ IPC Server (Módulo Node 'net' embutido no Electron) ]
             │
             ▼ (Atualiza o estado global)
[ Widget Principal (Electron Frameless & Transparent) ] ──> Atualiza o HTML/CSS do Semáforo
```

---

### 🚀 Funcionalidades Principais

*   **Design Premium (Glassmorphism)**: Interface translúcida com desfoque de fundo (`backdrop-filter`) e animações pulsantes coloridas de acordo com o estado do agente.
*   **Comunicação de Baixa Latência (IPC)**: Integração ultra-rápida via Named Pipes no Windows e Unix Sockets no macOS e Linux.
*   **Máquina de Estados Multi-sessão**: Suporta múltiplos agentes rodando simultaneamente sem conflito de cores, respeitando a prioridade de exibição:
    *   🔴 **Vermelho** (Executando Ferramenta/Escrevendo) > 🟡 **Amarelo** (Raciocinando) > 🟢 **Verde** (Ocioso).
*   **Inatividade Inteligente (Idle Timeout)**: Restaura automaticamente o semáforo para o estado ocioso (Verde) caso o agente trave ou não envie atualizações após um período configurável.
*   **Modo Furtivo (Stealth Mode)**: Opção para proteger o widget contra capturas de tela e gravações de vídeo.
*   **Painel de Configurações**: Opções de ajuste de layout (vertical/horizontal), tempo de timeout, modo furtivo e inicialização automática com o sistema.
*   **Tray Menu (Bandeja)**: Menu rápido no sistema para redefinir as luzes, abrir as configurações, exibir/ocultar o widget ou fechar o app.
*   **CLI Resiliente**: Um cliente CLI de conexão única extremamente rápido que se comunica com o semáforo e falha silenciosamente (`exit 0`) se o widget não estiver aberto, impedindo travamento de fluxos ou terminais.

---

### 📁 Estrutura do Projeto

*   `src/main.js`: Processo principal do Electron (cria as janelas, tray menu e o servidor IPC).
*   `src/config.js`: Gerenciador de persistência das configurações da aplicação.
*   `src/state.js`: Máquina de estados das sessões de agentes de IA locais.
*   `src/cli/index.js`: Cliente CLI leve executado por hooks externos.
*   `src/renderer/`: Códigos da interface visual (HTML, CSS, JS do Widget e do painel de Configurações).
*   `assets/`: Ícones e imagens da aplicação.

---

### ⚙️ Instalação e Execução

#### Pré-requisitos
*   Node.js (versão 16 ou superior)
*   npm

#### Passos para Rodar Localmente
1. Instale as dependências de desenvolvimento:
   ```bash
   npm install
   ```

2. Execute o aplicativo em modo de desenvolvimento:
   ```bash
   npm start
   ```

---

### 🔌 Integração Prática: IDE Antigravity

Você pode configurar a IDE Antigravity ou outros agentes de IA locais para enviar atualizações de estado ao Semaphore JS adicionando chamadas de CLI nos ganchos de ciclo de execução.

Abaixo está um exemplo de configuração no arquivo do workspace (`.agents/config.json`):

```json
{
  "agent": {
    "name": "Antigravity",
    "hooks": {
      "beforeSubmitPrompt": "node C:\\caminho\\para\\semaphore\\src\\cli\\index.js yellow",
      "beforeToolUse": "node C:\\caminho\\para\\semaphore\\src\\cli\\index.js red",
      "afterToolUse": "node C:\\caminho\\para\\semaphore\\src\\cli\\index.js yellow",
      "stop": "node C:\\caminho\\para\\semaphore\\src\\cli\\index.js green"
    }
  }
}
```

#### Sintaxe de Comandos da CLI
```bash
node src/cli/index.js <green|yellow|red> [id_da_sessao]
```
*   `green`: Define o estado do agente para Ocioso.
*   `yellow`: Define o estado do agente para Pensando/Raciocinando.
*   `red`: Define o estado do agente para Executando Ferramenta/Escrevendo.
*   `[id_da_sessao]` *(opcional)*: Permite isolar o estado de um agente ou aba específica caso execute múltiplos simultaneamente.

---

### 📦 Empacotamento para Distribuição

Para gerar instaladores finais prontos para produção em cada plataforma:

*   **Apenas gerar compilação rápida de teste**:
    ```bash
    npm run pack
    ```

*   **Gerar instaladores finais (`.exe`, `.dmg`, `.deb`, `AppImage`)**:
    ```bash
    npm run dist
    ```
    Os pacotes instaláveis gerados estarão no diretório `dist/`.

---

## 🇺🇸 English Version

**Semaphore JS** is a lightweight, fast, and cross-platform desktop application (**Windows, macOS, and Linux**) built with **JavaScript, Node.js, and Electron**. It displays a premium translucent floating widget (featuring a glassmorphism effect) on your screen to visually monitor the execution state of local AI agents (idle, thinking, executing tools) in real-time, integrating via local hooks.

---

### 🏗️ General Architecture

```
[ Antigravity IDE / AI Agent ]
             │
             ▼ (Triggers lifecycle hook)
[ CLI Client (Node.js) ] 
             │
             ▼ (Writes JSON via Named Pipe / Unix Socket)
[ IPC Server (Built-in Node 'net' module in Electron) ]
             │
             ▼ (Updates global state)
[ Main Widget (Electron Frameless & Transparent) ] ──> Updates Semaphore HTML/CSS
```

---

### 🚀 Key Features

*   **Premium Design (Glassmorphism)**: Translucent interface with background blur (`backdrop-filter`) and colored pulsing animations matching the agent's current state.
*   **Low-Latency Communication (IPC)**: Ultra-fast integration via Named Pipes on Windows and Unix Sockets on macOS and Linux.
*   **Multi-Session State Machine**: Supports multiple agents running concurrently without color conflicts, respecting priority display rules:
    *   🔴 **Red** (Executing Tool/Writing) > 🟡 **Yellow** (Thinking) > 🟢 **Green** (Idle).
*   **Smart Idle Timeout**: Automatically restores the semaphore to the idle state (Green) if the agent crashes or fails to send updates after a configurable period.
*   **Stealth Mode**: Option to protect the widget from screenshots and video recordings.
*   **Settings Panel**: Layout orientation options (vertical/horizontal), timeout duration, stealth mode toggle, and system auto-start.
*   **Tray Menu**: Fast system tray access to reset lights, open settings, toggle widget visibility, or quit the application.
*   **Resilient CLI**: An extremely fast, connection-and-done CLI client that communicates with the semaphore and fails silently (`exit 0`) if the widget is closed, preventing terminal or workflow blockages.

---

### 📁 Project Structure

*   `src/main.js`: Main Electron process (handles window creation, tray menu, and the IPC server).
*   `src/config.js`: Configuration persistence manager.
*   `src/state.js`: State machine for local AI agent sessions.
*   `src/cli/index.js`: Lightweight CLI client triggered by external hooks.
*   `src/renderer/`: User interface code (HTML, CSS, and JS for both the Widget and the Settings panel).
*   `assets/`: Icons and application assets.

---

### ⚙️ Installation and Execution

#### Prerequisites
*   Node.js (version 16 or newer)
*   npm

#### Local Running Steps
1. Install development dependencies:
   ```bash
   npm install
   ```

2. Run the application in development mode:
   ```bash
   npm start
   ```

---

### 🔌 Practical Integration: Antigravity IDE

You can configure the Antigravity IDE or other local AI agents to send state updates to Semaphore JS by adding CLI calls to execution lifecycle hooks.

Below is an example configuration in the workspace file (`.agents/config.json`):

```json
{
  "agent": {
    "name": "Antigravity",
    "hooks": {
      "beforeSubmitPrompt": "node C:\\path\\to\\semaphore\\src\\cli\\index.js yellow",
      "beforeToolUse": "node C:\\path\\to\\semaphore\\src\\cli\\index.js red",
      "afterToolUse": "node C:\\path\\to\\semaphore\\src\\cli\\index.js yellow",
      "stop": "node C:\\path\\to\\semaphore\\src\\cli\\index.js green"
    }
  }
}
```

#### CLI Command Syntax
```bash
node src/cli/index.js <green|yellow|red> [session_id]
```
*   `green`: Set agent state to Idle.
*   `yellow`: Set agent state to Thinking/Reasoning.
*   `red`: Set agent state to Executing Tool/Writing.
*   `[session_id]` *(optional)*: Isolate the state of a specific agent or tab when running multiple simultaneously.

---

### 📦 Packaging for Distribution

To generate production-ready installers for each platform:

*   **Quick build for testing**:
    ```bash
    npm run pack
    ```

*   **Generate final installers (`.exe`, `.dmg`, `.deb`, `AppImage`)**:
    ```bash
    npm run dist
    ```
    The generated packages will be located in the `dist/` directory.
