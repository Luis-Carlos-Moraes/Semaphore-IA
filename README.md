# Semaphore JS - Semáforo para Agentes de IA / Traffic Light for AI Agents

[🇧🇷 Versão em Português](#-versão-em-português) | [🇺🇸 English Version](#-english-version)

---

## 🇧🇷 Versão em Português

O **Semaphore JS** é um aplicativo leve, rápido e compatível com **Windows, macOS e Linux**, desenvolvido em **JavaScript, Node.js e Electron**. Ele exibe um widget flutuante premium e translúcido (com efeito glassmorphism) na tela para monitorar visualmente o estado de execução de agentes de IA locais (ocioso, pensando, executando ferramentas) em tempo real, integrando-se via hooks locais.

---

### 🏗️ Arquitetura Geral

```text
[ IDEs com Hooks (Cursor, Cline) ]    [ IDE Antigravity (Sincronia Passiva) ]
             │                                     │
             ▼ (Dispara hook via terminal)         ▼ (Lê o transcript.jsonl localmente)
[ CLI Client (Node.js) ]                [ IdeWatcher Integrado (Polling) ]
             │                                     │
             └──────────────────┬──────────────────┘
                                ▼ 
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

O Semaphore-IA já possui um **Observador Nativo (IdeWatcher)** embutido que se conecta automaticamente à IDE Antigravity. Você **não precisa** configurar nenhum "hook" manual em `.agents/config.json`.

Basta abrir o aplicativo do Semáforo, e ele começará a ler os arquivos internos da IDE (`transcript.jsonl`) em segundo plano para capturar as ações do agente.

> [!WARNING]
> **Aviso Importante: Efeito "Replay" (Log Buffering da IDE)**
> A IDE Antigravity não emite eventos em tempo real. Ela armazena as ações do agente na memória RAM e só descarrega tudo no arquivo de log do disco rígido quando o agente **termina de formular a resposta inteira**. 
> 
> Por causa disso, o Semáforo funciona como um **Feedback Visual de Conclusão**. Quando o agente termina de pensar, o Semáforo recebe a carga inteira de logs de uma vez e pisca na tela (Amarelo -> Vermelho -> Verde) confirmando que a ação foi efetuada e o agente está livre novamente.
> **Isso não é um bug do Semáforo**, e sim o limite técnico imposto pela arquitetura fechada da IDE Antigravity atual.

Para outras IDEs (como Cursor, Cline, etc) que possuam suporte a ganchos locais reais via terminal, você pode continuar usando os comandos CLI abaixo:

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

```text
[ IDEs with Hooks (Cursor, Cline) ]   [ Antigravity IDE (Passive Sync) ]
             │                                     │
             ▼ (Fires shell hook)                  ▼ (Reads local transcript.jsonl)
[ CLI Client (Node.js) ]                [ Built-in IdeWatcher (Polling) ]
             │                                     │
             └──────────────────┬──────────────────┘
                                ▼ 
[ IPC Server (Embedded Node 'net' module in Electron) ]
                                │
                                ▼ (Updates global state)
[ Main Widget (Electron Frameless & Transparent) ] ──> Updates HTML/CSS Traffic Light
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

Semaphore JS includes a built-in **Native Observer (IdeWatcher)** that connects automatically to the Antigravity IDE. You **do not** need to configure any manual "hooks" in `.agents/config.json`.

Simply open the Semaphore app, and it will begin reading the IDE's internal log files (`transcript.jsonl`) in the background to capture the agent's actions.

> [!WARNING]
> **Important Notice: "Replay" Effect (IDE Log Buffering)**
> The Antigravity IDE does not emit events in real time. It stores the agent's actions in RAM and only flushes everything to the hard drive log file when the agent **finishes formulating the entire response**.
> 
> Because of this, the Semaphore functions as a **Visual Completion Feedback**. When the agent finishes thinking, Semaphore receives the entire load of logs at once and blinks on the screen (Yellow -> Red -> Green), confirming that the action was performed and the agent is idle again.
> **This is not a Semaphore bug**, but rather a technical limit imposed by the current closed architecture of the Antigravity IDE.

For other IDEs (like Cursor, Cline, etc.) that support real local terminal hooks, you can continue using the CLI commands below:

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
