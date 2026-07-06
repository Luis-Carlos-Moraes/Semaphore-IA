# Semaphore JS - Semáforo para Agentes de IA

O **Semaphore JS** é um aplicativo leve, rápido e compatível com **Windows, macOS e Linux**, desenvolvido em **JavaScript, Node.js e Electron**. Ele exibe um widget flutuante premium e translúcido (com efeito glassmorphism) na tela para monitorar visualmente o estado de execução de agentes de IA locais (ocioso, pensando, executando ferramentas) em tempo real, integrando-se via hooks locais.

---

## 🏗️ Arquitetura Geral

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

## 🚀 Funcionalidades Principais

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

## 📁 Estrutura do Projeto

*   `src/main.js`: Processo principal do Electron (cria as janelas, tray menu e o servidor IPC).
*   `src/config.js`: Gerenciador de persistência das configurações da aplicação.
*   `src/state.js`: Máquina de estados das sessões de agentes de IA locais.
*   `src/cli/index.js`: Cliente CLI leve executado por hooks externos.
*   `src/renderer/`: Códigos da interface visual (HTML, CSS, JS do Widget e do painel de Configurações).
*   `assets/`: Ícones e imagens da aplicação.

---

## ⚙️ Instalação e Execução

### Pré-requisitos
*   Node.js (versão 16 ou superior)
*   npm

### Passos para Rodar Localmente
1. Instale as dependências de desenvolvimento:
   ```bash
   npm install
   ```

2. Execute o aplicativo em modo de desenvolvimento:
   ```bash
   npm start
   ```

---

## 🔌 Integração Prática: IDE Antigravity

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

### Sintaxe de Comandos da CLI
```bash
node src/cli/index.js <green|yellow|red> [id_da_sessao]
```
*   `green`: Define o estado do agente para Ocioso.
*   `yellow`: Define o estado do agente para Pensando/Raciocinando.
*   `red`: Define o estado do agente para Executando Ferramenta/Escrevendo.
*   `[id_da_sessao]` *(opcional)*: Permite isolar o estado de um agente ou aba específica caso execute múltiplos simultaneamente.

---

## 📦 Empacotamento para Distribuição

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

