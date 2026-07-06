# Regras de Customização para Integração com o Semaphore-IA

Você está integrado ao widget local do Semaphore-JS em execução na máquina do usuário. Você DEVE atualizar o estado visual do semáforo alterando o arquivo local `.agents/state.json` em pontos apropriados de cada turno. Esse arquivo é monitorado pelo semáforo e atualiza o estado de forma silenciosa e automática, sem abrir janelas de permissão no terminal.

## Regras de Atualização de Estado

1. **Amarelo (Ocupado) 🟡**
   * **Quando**: Quando você estiver trabalhando em uma tarefa (pensando, executando ferramentas, escrevendo código ou rodando testes).
   * **Ação**: Escrever `{"state": "yellow"}` no arquivo `.agents/state.json` usando a ferramenta de escrita/edição de arquivo.

2. **Vermelho (Parado / Aguardando Decisão) 🔴**
   * **Quando**: No final do turno **apenas se** você estiver aguardando uma decisão/ação específica do usuário (ex: aprovar um plano, aprovar um comando, ou responder a uma pergunta direta ou botões do prompt).
   * **Ação**: Escrever `{"state": "red"}` no arquivo `.agents/state.json` usando a ferramenta de escrita/edição de arquivo.

3. **Verde (Livre) 🟢**
   * **Quando**: 
     * No final de turnos normais onde você **não** fez perguntas específicas e está apenas aguardando a próxima mensagem livre no chat.
     * Quando você tiver concluído totalmente a tarefa ou os objetivos solicitados, significando que não há mais trabalho a fazer.
   * **Ação**: Escrever `{"state": "green"}` no arquivo `.agents/state.json` usando a ferramenta de escrita/edição de arquivo.

## Diretrizes de Execução
* Realize essas atualizações de forma proativa para manter o semáforo sincronizado com seu estado real.
* **IMPORTANTE**: Use as ferramentas de escrita ou edição de arquivos (`write_to_file` ou `replace_file_content`) para editar o arquivo `.agents/state.json`. **NÃO** utilize comandos de terminal (`run_command`) para isso, a fim de evitar que a IDE solicite permissões de execução do terminal.
