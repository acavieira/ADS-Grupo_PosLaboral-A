# R5 · Identificação dos colaboradores

Risco da matriz (secção 5.3 do relatório): reconhecer uma pessoa através da combinação de métricas, datas e padrões de atividade.
Medida: usar dados agregados quando bastam e oferecer pseudónimos quando a comparação individual não exige a identidade (5.2.5 e 5.3.1).

## Inventário das vistas que identificam pessoas

Só aparecem aqui os pedidos que a interface faz (`packages/frontend/GitDash/src`).

| Vista | Pedido | Campos enviados | Identifica? |
|---|---|---|---|
| Collaborators (tabela) | `GET /api/github/collaborators/{repo}/{intervalo}` | `login`, `avatarUrl`, `role`, `commits`, `pullRequests`, `issues` | Sim: login, avatar, papel e métricas |
| Separadores por colaborador (`RepositoryDetails`) | (a mesma lista) | `login` como título e `avatarUrl` como ícone | Sim |
| PersonalStats | `GET /api/github/repositories/{repo}/collaborators/{login}/activity` | commits, PRs (total e fundidos), issues (total e fechadas), revisões feitas | Sim: o login vai no URL e as métricas são individuais |
| PersonalStats | `.../collaborators/{login}/code-changes` | linhas adicionadas e removidas | Sim |
| PersonalStats | `.../collaborators/{login}/weekly-activity` | commits por semana nas últimas 12 semanas | Sim: é um padrão de atividade |
| Overview | `GET /api/github/stats/{repo}/{intervalo}` | totais, dia e hora de pico, tamanho da equipa | Não: só agregados |
| Cabeçalho e cartão do Overview | (nome do repositório, `dono/repo`) | o login do dono | Sim, nos repositórios pessoais: o dono é o `admin` da tabela, logo o "Colaborador 1" |

Fora da interface:

- `GET /api/github/commits?fullName=` devolve `authorName`, `authorEmail` e a data de cada commit. Nenhuma vista o usa, mas o endpoint continua exposto. Pertence ao R3 (informação desnecessária).
- `HeaderMenu.vue` mostra avatares de colaboradores, mas não é usado em nenhuma página e a rota `personal-stats` que referencia não existe.

## O que foi alterado

- **Backend.** `GET /api/github/collaborators/{repo}/{intervalo}?pseudonymize=true` devolve `alias` ("Colaborador 1..n"), `role`, `commits`, `pullRequests` e `issues`. A resposta não tem `login` nem `avatarUrl`.
  - A numeração segue a atividade (mais commits primeiro). A ordem do GitHub não é usada, porque uma ordem alfabética revelaria o login. Os empates ficam em ordem aleatória.
  - Não se guarda tabela de correspondência: a numeração é refeita em cada pedido.
  - Cada elemento traz também `reference`, um token cifrado (Data Protection do ASP.NET) com o repositório e o login lá dentro. Só o servidor o consegue abrir. É válido 1 hora, só serve para o repositório em que foi emitido e muda a cada pedido. Serve para abrir a vista individual (`.../collaborators/{reference}/activity`, `code-changes` e `weekly-activity` aceitam-no no lugar do login, e o caminho passa a registar o token e não o login).
  - O campo `repository` da resposta pseudonimizada esconde o dono quando ele é um dos colaboradores (repositório pessoal): `ines/projeto` passa a `Colaborador 1/projeto`. Numa organização o nome mantém-se, porque não é uma pessoa. A resposta não diz qual das linhas é a do dono; a etiqueta serve só para mostrar, os pedidos usam sempre o nome real.
  - Sem o parâmetro, o comportamento mantém-se (e a resposta passa a trazer `"pseudonymized": false`).
- **Frontend.** Um interruptor "Pseudonymize collaborators" no separador Collaborators, **ativo por omissão**. Com a opção ativa a tabela e as bolinhas do cabeçalho mostram um avatar genérico (desenhado localmente, sem pedir nenhuma imagem) em vez da foto, o título de cada bolinha é "Colaborador N", a tabela deixa de mostrar `@login` e aparece o aviso sobre anonimato. As bolinhas continuam a abrir a vista individual (PersonalStats), que pede os dados com a `reference` em vez do login. O cabeçalho, o cartão do Overview e os avisos de erro mostram o nome do repositório com a etiqueta da API (`Colaborador 1/projeto`); enquanto não há resposta, ou se a lista falhar, mostram `•••/projeto`, para o nome real do dono nunca aparecer. Ao desligar, voltam os logins, avatares e o nome real.
- **Kit.** `./avaliacao/avaliar.sh colaboradores <fase>` pede a lista sem e com a opção e procura o login da conta A e a palavra `avatar` na lista `collaborators` da resposta.

## Limitações que se mantêm

1. **Um pseudónimo não garante anonimato.** As métricas, o papel e as datas continuam a poder ser comparados com a atividade pública do repositório no GitHub (commits, pull requests e issues públicos mostram quem fez o quê e quando). Num repositório com poucos colaboradores, o papel `admin` e o número de commits bastam para identificar a pessoa.
2. **A API continua a devolver logins e avatares por omissão.** A pseudonimização no ecrã vem ligada, mas quem chamar `GET /api/github/collaborators/...` sem `?pseudonymize=true` recebe a lista completa (o `avaliar.sh` mede isso em R5.1). A opção é opcional na API para não alterar quem já a consome.
3. **A `reference` é reversível pelo servidor.** Não há tabela de correspondência, mas o login vai cifrado dentro do token, e quem tiver a chave do servidor consegue abri-lo. Para a vista individual funcionar é inevitável que o servidor saiba voltar ao login. Como os pseudónimos são refeitos a cada pedido, quando a lista muda (por exemplo ao trocar o intervalo) uma vista individual aberta volta à tabela, para não mostrar os dados de outra pessoa sob o mesmo "Colaborador N".
4. **Os endpoints individuais continuam acessíveis** a quem conheça o login (`.../collaborators/{login}/activity`, etc.). A opção muda o que a lista devolve, não restringe o acesso a esses pedidos.
5. **A cache continua a guardar a lista completa** (com logins e avatares). A pseudonimização aplica-se à resposta, não ao que fica no Redis. Os registos de acesso passam a registar só o caminho do pedido (sem o parâmetro). Os pedidos individuais feitos com pseudónimos registam a `reference` cifrada, mas os feitos com o login (opção desligada) continuam a registá-lo no caminho. Ambos pertencem a R3 e R4.
6. **A escolha não persiste:** ao mudar de repositório ou recarregar a página o interruptor volta a "ativo" (o valor seguro), mesmo que a pessoa o tenha desligado.
7. **Esconder o dono só vale no ecrã.** O nome do repositório, a descrição e as linguagens continuam públicos no GitHub: quem conheça o repositório descobre o dono lá. Os pedidos à API também continuam a usar o nome real.

## Evidência (prints, com os mesmos nomes em `antes` e `depois`)

- `R5-frontend-colaboradores.png`: separador Collaborators (antes: logins, avatares e um separador por pessoa; depois: opção ativa por omissão, "Colaborador 1..n" e bolinhas do cabeçalho com avatar genérico, sem fotos nem logins).
- `R5-swagger-colaboradores.png`: resposta de `GET /api/github/collaborators/{fullName}/{timeRange}` (antes: `login` e `avatarUrl`; depois: com `pseudonymize=true`, só `alias` e métricas).
