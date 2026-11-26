---
layout: default
title: Exemplo
parent: Config seed
nav_order: 1
translated_from: 4c570ca726391f1d55f86eafe947111c14a8ca11
---

# Exemplo
{: .no_toc }

Um ficheiro de seed completo, secção a secção
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## O ficheiro

O ficheiro de seed seguinte declara todas as secções exceto a obsoleta `awx`. Os segredos vêm de variáveis de ambiente como
`${SEED_AWX_TOKEN}`, e as secções usam os seus nomes da 7.8.0 (consulte [Secções renomeadas](./#renamed-sections)):

```yaml
version: 1

runners:
  items:
    - name: rte01
      type: rte                  # rte, awx, semaphore, rundeck or jenkins
      rte_mode: inbound          # an RTE's RTE_MODE: outbound, inbound or database (deprecated, the default)
      credential: rte01          # a credential of the credentials section, of the runner's type
      is_default: true           # playbook forms that name no runner run here
    - name: tower
      type: awx
      credential: tower
      is_default: true           # one default per type
      enabled: true              # false: no job goes to it; left as it is when not declared

secret_stores:
  items:
    - name: vault
      type: vault
      credential: vault-login    # a vault credential of the credentials section: the store's address and token

credentials:
  items:
    - name: vault-login
      credential_type: vault     # how the secret store vault logs in, and where
      url: https://vault.example.com:8200
      password: ${SEED_VAULT_TOKEN}   # the Vault token
    - name: rte01
      credential_type: rte       # an RTE's token, and its address unless it is outbound
      url: http://rte01.example.com:8000
      password: ${SEED_RTE_TOKEN}   # the RTE_TOKEN of that RTE
    - name: tower
      credential_type: awx       # also aap, ascender, semaphore, rundeck, jenkins
      url: https://tower.example.com
      password: ${SEED_AWX_TOKEN}
    - name: production-db
      user: svc_forms
      password: ${SEED_DB_PW}
      host: db.example.com
      port: 3306
      db_type: mysql
      credential_type: database
    - name: ontap-rest
      credential_type: userpass   # a user and password for a REST API, the default
      user: svc_forms
      password: ${SEED_ONTAP_PW}
    - name: smtp-login
      credential_type: smtp      # a mail server and its login: host is required
      host: smtp.example.com
      port: 587
      secure: false              # true: Use TLS to the mail server
      user: svc_forms            # leave user and password out for a relay
      password: ${SEED_SMTP_PW}
    - name: m365-mail
      credential_type: entraid   # an app registration, to send through Microsoft 365 (from 7.6.0)
      tenant_id: ${SEED_M365_TENANT}
      user: ${SEED_M365_CLIENT_ID}    # the client ID
      password: ${SEED_M365_SECRET}   # the client secret ; or client_cert and client_key

databases:                       # from 7.5.0
  items:
    - name: production-db        # the name a field's dbConfig gives
      description: The CMDB
      credential: production-db  # a credential of the credentials section, of type database

sso:                             # oauth2 before 7.8.0
  items:
    - name: corp
      provider: entraid          # entraid (Microsoft Entra ID, azuread before 7.8.0) or oidc
      tenant_id: ${SEED_ENTRA_TENANT}
      client_id: ${SEED_ENTRA_CLIENT_ID}
      client_secret: ${SEED_ENTRA_SECRET}   # or credential: an entraid credential
      enable: true

repositories:
  prune: true
  items:
    - name: forms
      uri: https://git.example.com/forms.git
      branch: main
      use_for_forms: true
      use_for_roles: true        # since 7.8.0, with use_for_categories and use_for_constants
      use_for_categories: true   # instead of use_for_config
      use_for_constants: true
      rebase_on_start: true

syslog:                          # syslog_servers before 7.8.0
  items:
    - name: siem
      host: siem.example.com
      port: 6514
      protocol: tls4             # udp4 (default), udp6, tcp4, tcp6, tls4, tls6, unix, unix-connect
      type: "5424"               # BSD (default) or 5424
      receives: audit            # log, audit or both (default)
      enabled: true
    - name: syslog
      host: syslog.example.com
      level: notice              # the lowest level of the server log it gets (info by default)
      receives: log

notifications:                   # notification_channels before 7.8.0
  items:
    - name: mail
      type: mail                 # mail, slack, teams, telegram or webhook
      credential: smtp-login     # an smtp credential: the server, port, TLS and login it sends with
      from_address: ansibleforms@example.com
      is_active: true            # the mail channel the application sends its mail with
    - name: relay
      type: mail                 # no credential (from 7.6.0): its own server, sent without a login
      server: relay.example.com
      port: 25
      secure: false
      from_address: ansibleforms@example.com
    - name: m365
      type: mail
      credential: m365-mail      # an entraid credential: mail through Microsoft 365
      send_through: graph        # graph (the default) or smtp
      from_address: noreply@example.com
    - name: ops-slack
      type: slack
      webhook_url: ${SEED_SLACK_WEBHOOK}

labels:
  items:
    - name: Production           # the text of a label beside the header's logo, 40 characters at most
      color: red                 # blue, green, amber, orange, red or grey
      enabled: true
      position: 1                # its place among the labels, lowest first

# ldap is a single-row section, so EVERY field must be declared : see "Single-row
# sections are all or nothing" on Managed objects. Empty is a perfectly good value.
ldap:
  server: ldap.example.com
  port: 389
  ignore_certs: false
  enable_tls: false
  cert: ""
  ca_bundle: ""
  bind_user_dn: cn=bind,dc=example,dc=com
  bind_user_pw: ${SEED_LDAP_PW}
  search_base: dc=example,dc=com
  username_attribute: uid
  groups_attribute: memberOf
  enable: true
  groups_search_base: ""
  group_class: ""
  group_member_attribute: ""
  group_member_user_attribute: ""
  mail_attribute: mail
  groupfilter: ""            # optional

settings:
  url: https://forms.example.com   # the only key it needs from 7.6.0

chat_assistant:              # the chat assistant's model provider ; chat before 7.8.0
  provider: anthropic        # see below, or "" (chat off)
  api_key: ${SEED_CHAT_API_KEY}   # or "" with credential: an api credential (since 7.8.0)
  base_url: ""               # empty for the provider default ; azure and custom need one
  model: claude-opus-5-5
  max_turns: 20
  max_tool_rounds: 6
  timeout_seconds: 60
  allow_job_status: true
  # optional - for a proxy or a vendor with its own ways
  auth_type: ""              # "" (provider default) | bearer | api-key | x-api-key | none
  api_version: ""            # e.g. 2024-10-21 for Azure OpenAI
  request_user: ""           # sent as user, e.g. for a proxy that requires one
  ignore_certs: false        # true skips the certificate check (a self-signed proxy) - insecure
  extra_headers:             # a mapping of extra request headers
    X-Org: ops

# since 7.8.0 : made or changed at each apply, never deleted
groups:
  items:
    - name: operators
      description: Run the day-to-day forms
      users:                 # its members : usernames of local users
        - alice

users:
  items:
    - username: alice        # a local user (type: local, the default)
      email: alice@example.com
      password: ${SEED_ALICE_PW}
    - username: jdoe
      type: ldap             # ldap, entraid or oidc : only description and blocked
      blocked: true
      description: Left on 2026-10-31

# since 7.8.0 : each declared field read only on its Settings page
defaults:
  default_theme: dark        # system, light or dark
  default_language: fr
  default_timezone: Europe/Brussels
  default_date_format: DD/MM/YYYY
  default_forms_view: tiles

logo:
  logo: images/logo.png      # relative to the seed file ; "" restores the bundled one

icon:
  icon: images/icon.svg

name:
  app_name: ACME Automation

links:
  show_designer: true
  header_links:
    - id: docs
      label: Docs
      url: https://docs.example.com
      icon: book
      newTab: true

mcp:                         # environment variable names in lower case
  enable_mcp: true
  mcp_read_only: true
  mcp_chat_forms_only: false

# since 7.8.0 : made or changed at each apply, never read only
announcements:
  items:
    - name: Maintenance
      message: The app is down on Sunday from 8 to 10.
      level: warning           # info, warning or danger
      start_at: 2030-01-06T08:00:00Z
      end_at: 2030-01-06T10:00:00Z

disclaimer:
  items:
    - version: 2
      title: Terms of use
      text: Use this tool for your own team's systems only.
      checkbox_label: I agree
      enabled: true          # the version in force, one at most
      ask_again: true        # a changed text asks everyone who accepted it again

ssh:
  private_key: ${SEED_SSH_PRIVATE_KEY}
  known_hosts:               # one known_hosts line each ; [] clears them
    - git.example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
```
As secções abaixo explicam as partes que precisam de mais do que um comentário.

---

## Runners

Desde a 7.3.0, um runner inicia sessão com uma credencial do seu tipo, que contém o endereço do seu servidor em `url`. Um runner com o seu próprio `token`,
ou `username` e `password`, continua a funcionar: o seed regista um aviso e transforma-os numa credencial dessas, com o nome do runner. Um
runner que nomeia uma credencial `api` ou `userpass` também continua a funcionar, com um aviso: dê antes a essa credencial o tipo do runner.
Ambos estão obsoletos desde a 7.3.0 e são removidos na 8.0.0. Um runner RTE sem `rte_mode` está em modo base de dados, obsoleto (consulte
[Modos](../rte/modes.html)). Um runner com `enabled: false` não recebe nenhuma tarefa, nem como predefinido do seu tipo (consulte
[Predefinido e Ativado](../runners/list.html#default-and-enabled)); sem `enabled`, o seed deixa-o como está.

Um item de runner aceita estas chaves além de `name`, `type`, `description`, `credential`, `is_default` e `enabled`:

| Chave | O que define |
|---|---|
| `rte_mode` | O modo de um RTE: `outbound`, `inbound` ou `database` (obsoleto, a predefinição) |
| `rte_max_jobs` | O **Máximo de trabalhos em simultâneo** de um RTE em modo socket, de `0` a `10000` (`0`: sem limite) |
| `rte_cache_mb` | A sua **Cache de ficheiros** em MB, de `0` a `1048576` (`0` não guarda nada) |
| `rte_files` | Os seus **Ficheiros de trabalho**: `transfer` ou `local` |
| `rte_drain_seconds` | O seu **Tempo de espera ao parar** em segundos, de `0` a `86400` |
| `flavour` | Um runner `awx` que é um AAP ou um Ascender: `aap` ou `ascender`; nenhum para o AWX |
| `project` | O id do projeto de um runner Semaphore, o nome do projeto de um runner Rundeck, a pasta de um runner Jenkins |
| `uri`, `ignore_certs`, `ca_bundle` | O endereço e o TLS próprios do runner, de antes da 7.3.0: usados só enquanto a sua credencial não tiver `url` |

As quatro definições `rte_*` são as do separador RTE da página do runner (consulte [As definições de um RTE](../runners/runner-page.html#an-rtes-settings)):
prevalecem sobre as mesmas variáveis definidas no RTE, e um RTE em modo base de dados ignora-as. Um valor fora do seu intervalo faz falhar a
validação do seed.

Um RTE em modo base de dados pode registar-se a si próprio antes de o seed ser aplicado. Um runner RTE do seed cujo `uri` é o endereço em que um RTE destes
se registou **adota** essa linha: fica com o nome e os campos declarados, e o worker deixa de o remover quando o RTE deixa de
responder, em vez de haver um segundo runner para o mesmo RTE.

A partir da 7.5.0, a secção `databases` declara as [bases de dados](../databases.html) que os formulários consultam. Um item tem um `name`, uma
`credential` do tipo base de dados e uma `description` opcional; o seed aplica-o depois das credenciais, e recusa uma credencial de outro tipo.

---

## SSO

A secção `sso` (`oauth2` antes da 7.8.0) declara os [fornecedores SSO](../authentication/), cada um com o seu cliente: um `client_id` e
um `client_secret`, ou uma `credential` da secção de credenciais.

Desde a 7.8.0, o Microsoft Entra ID é `provider: entraid`, como os repositórios o escrevem. `provider: azuread`, o seu nome anterior, continua a
ser lido da mesma forma, obsoleto desde a 7.8.0 e removido na 8, com um aviso no registo do servidor. O outro fornecedor é `oidc`, e só um
fornecedor de cada tipo pode ter `enable: true`.

---

## Repositórios

Um item de repositório tem um `name`, um `uri`, um `branch` opcional (o predefinido do remoto quando omitido), uma `credential`, `rebase_on_start`,
o horário de pull `cron`, e uma flag `use_for_*` para cada tipo de utilização: o que a aplicação lê dele.

Desde a 7.8.0, cada tipo de utilização tem a sua flag. `use_for_forms`, `use_for_playbooks`, `use_for_workflows` e `use_for_inventories` já existiam
antes; as outras são novas:

| Categoria | Flags |
|---|---|
| Designer | `use_for_categories`, `use_for_constants`, `use_for_forms`, `use_for_inventories`, `use_for_playbooks`, `use_for_workflows` |
| Tarefas | `use_for_schedules` |
| Sistema | `use_for_general` |
| Aparência | `use_for_defaults`, `use_for_logo`, `use_for_icon`, `use_for_name`, `use_for_links`, `use_for_labels`, `use_for_announcements` |
| Acesso | `use_for_disclaimer`, `use_for_users`, `use_for_groups`, `use_for_roles`, `use_for_ldap`, `use_for_sso` |
| Ligações | `use_for_repositories`, `use_for_credentials`, `use_for_secret_stores`, `use_for_databases`, `use_for_runners`, `use_for_ssh`, `use_for_notifications`, `use_for_chat_assistant`, `use_for_mcp`, `use_for_syslog` |

Vários repositórios podem conter formulários, workflows e inventários. Qualquer outro tipo é contido por um repositório no máximo: um seed que
define a mesma dessas flags em dois repositórios é recusado. O que cada tipo guarda no git está descrito em
[Repositórios git](../repositories/).

`use_for_config` está obsoleta desde a 7.8.0 e é removida na 8. Continua a ser lida, como `use_for_roles`, `use_for_categories` e
`use_for_constants`, com um aviso no registo do servidor. Quando vários repositórios a declaram, o que já contém essas três
fica com elas (senão o primeiro no ficheiro), e os outros não recebem nenhuma. Declare antes as três flags.

---

## Email

O email passa pelos canais de email de `notifications:` (consulte [Email](../notification-channels/mail.html)). As chaves
`mail_server`, `mail_port`, `mail_secure`, `mail_username`, `mail_password` e `mail_from` em `settings:` estão obsoletas
desde a 7.6.0 e são removidas na 8.0.0. Continuam a funcionar e registam um aviso uma vez: o seed transforma-as num canal de email
chamado `default`, com uma credencial smtp `mail-login` quando há um `mail_username`, ou com o seu próprio servidor para um relay.
Declare antes o canal de email e a sua credencial, como `mail` e `smtp-login` no ficheiro acima.

---

## Assistente de chat

A secção `chat_assistant` (`chat` antes da 7.8.0) define o fornecedor de modelo do assistente de chat. `provider` é um de:

* `anthropic`
* `openai`
* `azure`
* `gemini`
* `grok`
* `mistral`
* `deepseek`
* `groq`
* `openrouter`
* `ollama`
* `custom` : qualquer outro endpoint compatível com OpenAI

Tal como `ldap`, a secção `chat_assistant` é uma linha única, por isso todos os campos são obrigatórios exceto os
opcionais; um campo opcional omitido fica sem alterações.

Desde a 7.8.0 aceita também `credential`, uma credencial api da secção de credenciais cuja palavra-passe é a chave, em vez da
`api_key` (declare então `api_key: ""`). O assistente de chat precisa também de `ENABLE_CHAT=1`, que o seed não define; consulte a
página [Assistente de chat](../chat/).

---

## Utilizadores e grupos

Desde a 7.8.0, as secções `groups` e `users` declaram grupos e utilizadores locais. São criados ou alterados em cada aplicação, nunca eliminados,
e continuam editáveis na aplicação (consulte [Utilizadores e grupos](../users-and-groups.html)).

Um item de grupo tem um `name`, uma `description` opcional e os seus membros em `users`: os nomes de utilizador de utilizadores locais. O item de um
utilizador não diz nada dos seus grupos, por isso um grupo lista os seus membros num só sítio. O seed aplica os grupos antes dos utilizadores.

Um item de utilizador tem um `username` e um `type`:

| Tipo | O que o seu item dá |
|---|---|
| `local` (a predefinição) | `email`, `description`, `blocked`, e `password` como referência `${ENV}`, como todos os segredos do seed |
| `ldap`, `entraid`, `oidc` | Só `description` e `blocked`: o resto vem do seu diretório em cada início de sessão |

Um utilizador local novo fica com os grupos do seed que o listam, por isso dê-lhe pelo menos um. Sem `password` não pode iniciar sessão até um
admin definir uma na aplicação. Um utilizador de diretório é criado antes de alguma vez iniciar sessão, por isso quem sai é bloqueado antes de tentar. O admin
incorporado nunca é declarado: continua a ser o caminho de regresso.

---

## Aparência, MCP e SSH

Desde a 7.8.0, o seed também declara definições de que a aplicação tem uma só, cada secção no formato da mesma página num repositório git.

| Secção | Página | Chaves |
|---|---|---|
| `defaults` | **Definições > Aparência > Predefinições** | `default_theme`, `default_theme_color`, `default_forms_view`, `default_timezone`, `default_date_format`, `default_language` |
| `logo`, `icon` | **Logótipo** e **Ícone** | `logo` ou `icon`: o caminho de um ficheiro de imagem, relativo ao ficheiro de seed; `""` repõe o incluído |
| `name` | **Nome** | `app_name` |
| `links` | **Ligações** | `header_links` (cada um com `id`, `label`, `url`, `icon`, `newTab`, `parent`) e `show_designer` |
| `mcp` | **Definições > Ligações > MCP** | `enable_mcp`, `mcp_read_only`, `mcp_chat_forms_only` |
| `ssh` | **Definições > Ligações > SSH** | `private_key` e `known_hosts` |
| `announcements` | **Definições > Aparência > Anúncios** | Itens com `name`, `message`, `level`, `enabled`, `start_at`, `end_at` |
| `disclaimer` | **Definições > Acesso > Aviso legal** | Itens com `version`, `title`, `text`, `checkbox_label`, `enabled`, `ask_again` |

Todas as chaves são opcionais: o que uma secção omite fica como a aplicação o tem. O logótipo e o ícone são verificados como um carregamento (uma imagem,
no máximo 900 KB para o logótipo e 256 KB para o ícone).

As chaves de `mcp` são as variáveis de ambiente do [servidor MCP](../mcp/) em minúsculas. Uma variável que o ambiente real
define mantém o valor do ambiente: o registo do servidor indica-o, e o arranque continua.

`ssh` contém a chave privada da aplicação, como referência `${ENV}` (a sua chave pública é gerada a partir dela), e os servidores em que a aplicação confia, uma
linha known_hosts cada um (os hosts, o tipo de chave e a chave). É aplicada em cada arranque.

Um anúncio cujo `end_at` já passou é deixado de fora. Uma `version` do aviso legal é um número, no máximo uma está `enabled`, e um texto alterado
corrige essa versão; com `ask_again: true`, todos os que a aceitaram são questionados de novo.

Até onde o seed é dono de cada uma destas está em [Objetos geridos](managed-objects.html#settings-the-seed-declares).
