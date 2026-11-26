---
layout: default
title: Configuração em git
parent: Repositórios git
nav_order: 5
translated_from: 80e30306a069294520da314840328f669e2a2019
---

# Configuração em git
{: .no_toc }

Todas as definições guardadas num repositório git, lidas e escritas nos dois sentidos
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores que querem as definições, os utilizadores e as ligações do AnsibleForms revistos e versionados em git, desde a 7.8.0.

---

## Os tipos de utilização

O passo **Utilização** de um repositório, no seu assistente e no separador **Utilização** da sua página, diz o que a aplicação tira dele.

Os tipos estão agrupados sob seis títulos, cada um com o número de tipos que contém, por exemplo **Designer (6)**. Cada tipo tem
a sua própria caixa de verificação e uma linha curta que diz o que o repositório contém para ele; a caixa de um título marca ou desmarca
todos os tipos desse título que podem ser marcados.

| Título | Tipos de utilização (opção) |
|---|---|
| **Designer** | **Categorias** (`use_for_categories`), **Constantes** (`use_for_constants`), **Formulários** (`use_for_forms`), **Inventários** (`use_for_inventories`), **Playbooks** (`use_for_playbooks`), **Workflows** (`use_for_workflows`) |
| **Tarefas** | **Agendamentos** (`use_for_schedules`) |
| **Sistema** | **Geral** (`use_for_general`) |
| **Aparência** | **Predefinições** (`use_for_defaults`), **Logótipo** (`use_for_logo`), **Ícone** (`use_for_icon`), **Nome** (`use_for_name`), **Ligações** (`use_for_links`), **Etiquetas** (`use_for_labels`), **Anúncios** (`use_for_announcements`) |
| **Acesso** | **Aviso legal** (`use_for_disclaimer`), **Utilizadores** (`use_for_users`), **Grupos** (`use_for_groups`), **Funções** (`use_for_roles`), **LDAP** (`use_for_ldap`), **SSO** (`use_for_sso`) |
| **Ligações** | **Repositórios** (`use_for_repositories`), **Credenciais** (`use_for_credentials`), **Cofres de segredos** (`use_for_secret_stores`), **Bases de dados** (`use_for_databases`), **Runners** (`use_for_runners`), **SSH** (`use_for_ssh`), **Notificações** (`use_for_notifications`), **Assistente de chat** (`use_for_chat_assistant`), **MCP** (`use_for_mcp`), **Syslog** (`use_for_syslog`) |

**Formulários**, **Inventários**, **Playbooks** e **Workflows** podem ser marcados em vários repositórios. Um formulário executa os
playbooks do primeiro repositório de **Playbooks**, a menos que indique o seu com `playbookRepository`. Cada um dos outros tipos pertence a um repositório no
máximo, e um segundo é recusado pela API e pelo config seed. Um tipo que outro repositório já tem aparece marcado a cinzento e
desativado, com uma dica que indica esse repositório: `Já gerido pelo repositório "platform"`.

Ativar ou desativar um tipo de utilização é uma alteração só de um administrador, tal como o **Uri** e o **Ramo** (ver
[Quem pode alterar um repositório](adding.html#who-may-change-a-repository)).

---

## Onde um repositório os guarda

Um repositório guarda um tipo em qualquer ficheiro YAML, com qualquer nome, em qualquer pasta: a chave de topo do ficheiro diz que tipo contém.

Essa chave é sempre `controller_` seguido da chave do tipo: `controller_credentials:`, `controller_roles:`, `controller_defaults:`.
São examinados todos os ficheiros `.yaml` ou `.yml` do repositório, a qualquer profundidade, exceto ficheiros e pastas ocultos. Um ficheiro
pode conter vários tipos, e um tipo pode estar repartido por muitos ficheiros.

| Chave | Contém |
|---|---|
| `controller_general:`, `controller_mcp:`, `controller_ssh:`, `controller_chat_assistant:`, `controller_defaults:`, `controller_logo:`, `controller_icon:`, `controller_name:`, `controller_links:` | um mapa, para aquilo de que a aplicação tem um só; dá-o um ficheiro no máximo |
| `controller_users:` | uma lista de utilizadores, cada um identificado pelo seu `type` (local quando omitido) e pelo seu `username` |
| `controller_disclaimer:` | uma lista de versões, cada uma identificada pela sua `version` |
| `controller_roles:`, `controller_categories:`, `controller_constants:` | as funções, as categorias e as constantes, no seu formato habitual |
| qualquer outra chave `controller_` | uma lista de entradas, cada uma identificada pelo seu `name` |

Um objeto é identificado pelo seu nome dentro do seu tipo, nunca pelo seu ficheiro: uma entrada movida para outro ficheiro mantém o seu objeto.
Uma chave simples (`credentials:`, o `roles:` de um ficheiro de requisitos do Galaxy, o `labels:` de um ficheiro de variáveis) não é de nenhum
tipo, e a aplicação nunca a lê nem a escreve. Um formulário nunca é o ficheiro de um tipo, e a chave de um tipo para o qual o repositório não é
usado fica intocada, com uma indicação na saída do pull.

### Funções, categorias e constantes

Estas três mantêm o formato do `config.yaml`, agora cada uma sob a sua própria chave, num tipo de utilização próprio (um repositório cada).

Cada uma é lida do ficheiro do seu repositório que dá a sua chave no nível de topo, com qualquer nome e em qualquer pasta; um ficheiro pode dar
as três. Quando nenhum ficheiro a dá, o `config.yaml` do repositório continua a ser lido, com as suas chaves simples `roles:`, `categories:` e
`constants:`: isto é obsoleto desde a 7.8.0 e já não é lido na 8.0, e o registo do servidor, a saída do pull e a página do
repositório indicam-no. Mova cada chave para um ficheiro próprio, por exemplo `roles.yaml` com `controller_roles:`.

Uma chave que nenhum repositório contém vem da configuração de base, como antes: a sua cópia na base de dados, ou o ficheiro em
[`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH). O interruptor **Usar para a configuração** de antes desapareceu: uma instância
atualizada dá **Funções**, **Categorias** e **Constantes** ao repositório que o tinha. O config seed, as entradas `controller_repositories:` de
um repositório e a API continuam a aceitar `use_for_config` como alias obsoleto dos três, com um aviso.

---

## Nos dois sentidos: o git e a aplicação

Um repositório usado para um tipo é mantido em sintonia com a aplicação nos dois sentidos, e a base de dados da aplicação continua a ser o que corre.

| Sentido | O que acontece |
|---|---|
| Do git para a aplicação | Depois de cada pull, clone ou reposição do repositório, e quando o servidor arranca, os seus ficheiros são lidos: um nome novo cria um objeto, uma entrada alterada altera-o, uma entrada removida remove-o |
| Da aplicação para o git | Guardar na aplicação escreve de volta no ficheiro da entrada: só os campos alterados, mantendo os comentários do ficheiro, as outras chaves e as outras entradas. Um objeto novo vai para o fim do primeiro ficheiro que dá a chave do tipo, senão para `<key>.yaml` na raiz (`credentials.yaml`), criado para isso; eliminar remove a sua entrada. Fica à espera do **Push** do repositório |

Uma entrada que não é válida é recusada sozinha, com o seu local e o motivo, e o objeto com esse nome fica como estava. Uma entrada que
indica um objeto que ainda não existe (um runner e a sua credencial) fica à espera, e é lida de novo no próximo pull desse tipo. Uma mudança
de nome no git é seguida quando um nome sai de um ficheiro e um nome novo aparece nele, sem mais alterações.

### Ativar ou desativar uma utilização

Guardar um repositório com um tipo ativado ou desativado pergunta primeiro o que fazer, e mostra o que a alteração vai fazer.

| Alteração | Pergunta | O que faz |
|---|---|---|
| Ativar | **Ativar Credenciais**: `Usar platform para Credenciais?` | É feito pull do repositório e as suas entradas são lidas; o git ganha num nome que ambos têm; os outros objetos da aplicação são escritos no repositório, à espera do **Push**, sem os seus segredos |
| Desativar | **Desativar Credenciais**: `Deixar de usar platform para Credenciais?` | É feito mais um pull do repositório, e depois os seus objetos são desligados: ficam na aplicação tal como estão, e os ficheiros no git ficam intocados |
| Várias | **Alterar a utilização**: `Alterar para que serve platform?` | Uma só pergunta, com uma secção por tipo, confirmada com **Guardar a utilização** |

A pergunta também lista o que fica na aplicação: os objetos do config seed, os runners que um RTE registou por si e os que
aguardam aprovação. Uma mensagem diz depois o que cada tipo recebeu, por exemplo
`Credenciais: 2 lidos dos seus ficheiros, 3 escritos no repositório (à espera do Push), 1 substituídos pelo git, 0 mantidos nesta aplicação.`

### O que diz a saída do pull

**Mostrar saída do último pull** do repositório contém uma linha por tipo depois da própria saída do git.

```
Credentials: 1 created, 2 updated, 0 deleted, 5 unchanged, 1 refused
Refused connections.yaml#ops-api: password must be an ${ENV} reference: a secret is never written plain in git
Renamed prod-db to main-db (its secrets kept)
Not in git, their secrets kept from the database: smtp-login
```

Um objeto guardado num repositório mostra **Repositório: platform** na sua página (o nome do seu repositório), com o ficheiro da sua entrada na
dica. Guardá-lo escreve esse ficheiro, e o **Push** do repositório envia-o para o git.

---

## Segredos

O git nunca contém um segredo em claro: o campo secreto de uma entrada é só uma referência `${ENV}`, resolvida a partir do ambiente.

Palavras-passe, tokens, segredos de cliente e chaves escrevem-se como `${SEED_RTE_TOKEN}`, tal como no [config seed](../seed/). Uma entrada com
um segredo em claro, ou que indica uma variável não definida, é recusada e indicada na saída do pull; o mesmo acontece com uma variável do próprio
servidor (`DB_*`, `ACCESS_TOKEN_*`, `ENCRYPTION_*`, `ADMIN_*` ...). Um segredo omitido numa entrada mantém o que está na base de dados
da aplicação, e a aplicação escreve os seus próprios objetos no git sem os seus segredos.

Um segredo escrito na aplicação para um objeto cuja entrada o dá como referência `${ENV}` é recusado: altere a variável, ou a
entrada no git.

---

## O designer e estes ficheiros

O designer mantém-se afastado dos ficheiros que pertencem aos tipos de utilização, por isso editar um formulário nunca altera uma definição.

Nunca lista, lê, escreve nem elimina um ficheiro que dá a chave de um tipo que o seu repositório contém, nem as imagens que esse ficheiro
indica. Também recusa escrever um ficheiro cujo conteúdo daria a chave de um tipo, e o carregamento dos formulários nunca lê esse ficheiro como formulário.

---

## Cada tipo, com um exemplo

As entradas de cada tipo estão no formato do config seed, por isso um item do seed e uma entrada de um repositório são intercambiáveis.

Os nomes de ficheiros abaixo são exemplos: qualquer nome e qualquer pasta serviriam.

### Categorias, constantes e funções

As categorias e as funções são listas, as constantes um mapa, cada uma sob a sua própria chave.

```yaml
# config/categories.yaml
controller_categories:
  - name: Default
    icon: bars
  - name: Storage
    icon: database
# config/constants.yaml
controller_constants:
  mail_domain: example.com
# config/roles.yaml
controller_roles:
  - name: admin
    groups:
      - local/admins
  - name: default
    groups: []
  - name: operators
    groups:
      - local/operators
    options:
      allowJobRelaunch: true
```

Cada função é verificada por si: uma que não é válida é recusada sozinha, e as outras são servidas. As funções podem estar repartidas
por vários ficheiros, servidas pela ordem dos seus ficheiros. Ver [Funções](../config/roles.html).

### Agendamentos

Os agendamentos são uma lista `controller_schedules:`, cada entrada indicando o formulário que executa, com o horário dado por exatamente um de
`cron`, `rrule` ou `one_time_run`.

```yaml
controller_schedules:
  - name: Nightly cleanup
    form: Cleanup
    rrule: DTSTART;TZID=Europe/Brussels:20261201T020000 RRULE:FREQ=DAILY;INTERVAL=1
    extra_data:
      retention_days: 14
  - name: Workday backup
    form: Backup
    cron: '30 22 * * 1-5'
```

As tarefas "Executar mais tarde" que os utilizadores planeiam ficam na aplicação. Ver [Agendamentos](../jobs/schedules.html) para os horários e as perguntas.

### Geral

As definições **Geral** são um mapa, pelos nomes das suas variáveis de ambiente em minúsculas.

```yaml
controller_general:
  job_retention_days: 30
  log_level: info
  metrics_token: ${METRICS_TOKEN}
```

Só são aceites as variáveis que a página Geral altera; uma chave em maiúsculas, ou uma variável definida no ambiente real, é
recusada. Uma variável cujo nome termina em `_PASSWORD`, `_SECRET` ou `_TOKEN` é só uma referência `${ENV}`.

### Predefinições, logótipo, ícone, nome e ligações

As páginas de Aparência são um mapa cada uma, com o que a página guarda.

```yaml
# branding.yaml, its images in the assets folder beside it
controller_defaults:
  default_theme: dark
  default_theme_color: "#198754"
  default_forms_view: tiles
  default_timezone: Europe/Brussels
  default_date_format: DD/MM/YYYY
  default_language: fr
controller_logo:
  logo: assets/logo.png
controller_icon:
  icon: assets/icon.svg
controller_name:
  app_name: ACME Automation
controller_links:
  show_designer: true
  header_links:
    - id: docs
      label: Docs
      url: https://docs.example.com
      icon: book
      newTab: true
```

O logótipo e o ícone são imagens do repositório, indicadas em relação ao ficheiro que as indica. Um campo que o config seed declara
continua a ser do seed.

### Etiquetas e anúncios

As etiquetas e os anúncios são listas de entradas, cada uma identificada pelo seu nome.

```yaml
controller_labels:
  - name: Production
    color: red
    enabled: true
    position: 1
controller_announcements:
  - name: Maintenance
    message: The app is down on Sunday from 8 to 10.
    level: warning
    start_at: 2030-01-06T08:00:00Z
    end_at: 2030-01-06T10:00:00Z
```

Um anúncio cujo fim já passou não é importado, o que é dito numa linha `Not imported` da saída do pull.

### Aviso legal

O aviso legal é uma lista de versões, cada uma identificada pela sua `version`, com no máximo uma ativada.

```yaml
controller_disclaimer:
  - version: 2
    title: Terms of use
    text: Use this tool for your own team's systems only.
    checkbox_label: I agree
    enabled: true
    ask_again: true
```

Um texto alterado no git corrige essa versão; `ask_again: true` volta a perguntar a todos os que a aceitaram. Quem aceitou o quê nunca está no git.

### Utilizadores e grupos

A entrada de um grupo lista os seus membros locais; a entrada de um utilizador não diz nada dos seus grupos.

```yaml
controller_groups:
  - name: operators
    description: Run the daily forms
    users:
      - alice
      - bob
controller_users:
  - username: alice
    email: alice@example.com
  - username: bob
    email: bob@example.com
    password: ${BOB_PASSWORD}
  - username: jdoe
    type: ldap
    blocked: true
    description: Left on 2026-10-31
```

A `password` de um utilizador local é só uma referência `${ENV}`, convertida em hash ao ser lida. Um utilizador de um diretório (`ldap`, `entraid`, `oidc`) dá
só a sua `description` e `blocked`. O admin incorporado nunca é lido do git nem escrito nele.

### LDAP e SSO

Os diretórios LDAP e os fornecedores SSO são listas, cada um indicando a credencial com que inicia sessão.

```yaml
controller_ldap:
  - name: main
    server: ldap.example.com
    credential: ldap-bind
    position: 1
controller_sso:
  - name: corp
    provider: entraid
    credential: corp-client
    enable: true
```

A entrada chamada `main` é o diretório principal, que nunca muda de nome nem é eliminado. `position` mantém a ordem de pesquisa.

### Repositórios

Um repositório pode conter os outros repositórios, no formato dos itens `repositories:` do config seed.

```yaml
controller_repositories:
  - name: forms
    uri: https://git.example.com/forms.git
    branch: main
    credential: git-bot
    use_for_forms: true
    cron: "*/15 * * * *"
```

O repositório que os contém nunca está nos seus próprios ficheiros, uma entrada nunca define `use_for_repositories`, e um utilizador ou um token no
`uri` é recusado: indique uma credencial em vez disso. Uma entrada removida elimina o seu repositório, a não ser que tenha alterações ainda não enviadas.

### Credenciais, cofres de segredos e bases de dados

As credenciais são lidas primeiro, e depois tudo o que indica uma delas.

```yaml
controller_credentials:
  - name: git-bot
    credential_type: git
    user: bot
    password: ${GIT_BOT_TOKEN}
  - name: cmdb-login
    credential_type: database
    db_type: mysql
    host: db.example.com
    port: 3306
    user: svc_forms
    password: ${CMDB_PASSWORD}
controller_secret_stores:
  - name: vault
    type: vault
    credential: vault-login
controller_databases:
  - name: cmdb
    description: The CMDB
    credential: cmdb-login
```

Remover a entrada de uma credencial enquanto algo ainda a usa é recusado, o que é dito na saída do pull.

### Runners

Um runner indica a sua credencial, do tipo do runner, e fica à espera enquanto ela falta.

```yaml
controller_runners:
  - name: rte-main
    type: rte
    rte_mode: outbound
    credential: rte-main
    rte_max_jobs: 4
    is_default: true
    enabled: true
```

Um runner que um RTE registou por si, ou um que aguarda aprovação, fica na aplicação.

### SSH

A chave SSH da aplicação e os hosts em que confia são um mapa, lido logo a seguir aos repositórios, antes de serem clonados.

```yaml
controller_ssh:
  private_key: ${SSH_PRIVATE_KEY}
  known_hosts:
    - git.example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
```

`private_key` é só uma referência `${ENV}`, nunca escrita no git: se for omitida, a aplicação mantém a sua. `known_hosts` contém uma
linha de known_hosts por servidor, e uma lista vazia limpa-os.

### Notificações e syslog

Os canais de notificação e os servidores syslog são listas de entradas.

```yaml
controller_notifications:
  - name: mail
    type: mail
    credential: smtp-login
    from_address: ansibleforms@example.com
    is_active: true
  - name: ops-slack
    type: slack
    webhook_url: ${SLACK_WEBHOOK}
controller_syslog:
  - name: siem
    host: siem.example.com
    port: 6514
    protocol: tls4
    receives: audit
```

### Assistente de chat e MCP

As definições do assistente de chat e de MCP são um mapa cada uma.

```yaml
controller_chat_assistant:
  enable_chat: true
  provider: openai
  model: gpt-5
  api_key: ${CHAT_API_KEY}
  allow_job_status: false
controller_mcp:
  enable_mcp: true
  mcp_read_only: true
  mcp_chat_forms_only: false
```

`enable_chat` e as chaves de MCP são nomes de variáveis de ambiente em minúsculas. Uma variável definida no ambiente real nunca é
escrita, e um mapa que a dá é recusado. `api_key` é só uma referência `${ENV}`, ou é omitida.
