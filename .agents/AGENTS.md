# Regras de Customização para Integração com o Semaphore-IA

Você está integrado ao widget local do Semaphore-JS. O estado do semáforo é controlado de forma automática e integrada pelos **hooks locais da IDE Antigravity** (configurados em `.agents/config.json`).

## Regras de Execução

1. **Comportamento Passivo**: Você **NÃO DEVE** criar, editar ou apagar o arquivo `.agents/state.json` do workspace nem executar comandos do terminal CLI para alterar as cores do semáforo.
2. **Sincronia Nativa**: A IDE já chama automaticamente o CLI do semáforo (`beforeSubmitPrompt`, `beforeToolUse`, `afterToolUse` e `stop`) no momento em que você é invocado ou executa tarefas. A sincronização de cores ocorre de forma nativa e transparente.
3. **Foco no Trabalho**: Concentre-se em resolver a solicitação do usuário e escrever código limpo no workspace. O semáforo cuidará de sua própria sincronia.

---

## 🎨 Significado das Cores e Fluxo de Estados

O semáforo utiliza as três cores clássicas para indicar visualmente em qual fase de trabalho o agente de IA se encontra:

1. 🟢 **Verde (Livre / Ocioso / Idle)**
   * **O que representa**: O agente concluiu todas as tarefas solicitadas e está ocioso, aguardando o usuário enviar uma nova mensagem no chat.
   * **Gatilho**: Disparado automaticamente pelo gancho `stop` no encerramento da execução da resposta do agente.

2. 🟡 **Amarelo (Pensando / Planejando / Raciocinando)**
   * **O que representa**: O agente está processando a solicitação do usuário, planejando a estratégia de execução, interpretando saídas de ferramentas ou formulando a resposta em texto.
   * **Gatilho**: Disparado pelo gancho `beforeSubmitPrompt` (no recebimento da mensagem) e após o gancho `afterToolUse` (retomando o raciocínio pós-ferramenta).

3. 🔴 **Vermelho (Escrevendo / Executando Ferramenta / Aguardando Aprovação)**
   * **O que representa**: O agente está realizando ações diretas no workspace (lendo/escrevendo arquivos, executando testes/comandos no terminal) ou aguardando uma decisão/ação direta do usuário (como aprovação de planos ou interações no prompt).
   * **Gatilho**: Disparado pelo gancho `beforeToolUse` (antes da chamada de qualquer ferramenta).
