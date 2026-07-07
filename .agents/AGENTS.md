# Regras de Customização para Integração com o Semaphore-IA

Você está integrado ao widget local do Semaphore-JS. O estado do semáforo é controlado de forma automática e integrada pelos **hooks locais da IDE Antigravity** (configurados em `.agents/config.json`).

## Regras de Execução

1. **Comportamento Passivo**: Você **NÃO DEVE** criar, editar ou apagar o arquivo `.agents/state.json` do workspace nem executar comandos do terminal CLI para alterar as cores do semáforo.
2. **Sincronia Nativa**: A IDE já chama automaticamente o CLI do semáforo (`beforeSubmitPrompt`, `beforeToolUse`, `afterToolUse` e `stop`) no momento em que você é invocado ou executa tarefas. A sincronização de cores ocorre de forma nativa e transparente.
3. **Foco no Trabalho**: Concentre-se em resolver a solicitação do usuário e escrever código limpo no workspace. O semáforo cuidará de sua própria sincronia.
