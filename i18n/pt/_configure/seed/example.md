---
layout: default
title: Exemplo
parent: Config seed
nav_order: 1
translated_from: f085641a12234a5485ea59e73e76c29e7452d5e9
---

# Exemplo
{: .no_toc }

Um ficheiro de seed completo, secção a secção
{: .fs-6 .fw-300 }

---

O ficheiro de seed seguinte declara todas as secções exceto `oauth2` e a obsoleta `awx`; os segredos vêm de variáveis de
ambiente como `${SEED_AWX_TOKEN}`:

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

repositories:
  prune: true
  items:
    - name: forms
      uri: https://git.example.com/forms.git
      branch: main
      use_for_forms: true
      use_for_config: true
      rebase_on_start: true

syslog_servers:
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

notification_channels:
  items:
    - name: mail
      type: mail                 # mail, slack, teams, telegram or webhook
      credential: smtp-login     # an smtp credential: the server, port, TLS and login it sends with
      from_address: ansibleforms@example.com
      is_active: true            # the mail channel the application sends its mail with
    - name: ops-slack
      type: slack
      webhook_url: ${SEED_SLACK_WEBHOOK}

labels:
  items:
    - name: Production           # the text of a label beside the header's logo, 40 characters at most
      color: red                 # blue, green, amber, orange, red or grey
      enabled: true
      position: 1                # its place among the labels, lowest first

# ldap and settings are single-row sections, so EVERY field must be declared - see
# "Single-row sections are all or nothing" below. Empty is a perfectly good value.
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
  groupfilter: ""            # optional, see below

settings:
  mail_server: smtp.example.com
  mail_port: 587
  mail_secure: false
  mail_username: ""
  mail_password: ""
  mail_from: ansibleforms@example.com
  url: https://forms.example.com

chat:                        # the chat assistant's model provider (6.5)
  provider: anthropic        # see below, or "" (chat off)
  api_key: ${SEED_CHAT_API_KEY}
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
```

`provider` é um de:

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

Tal como `ldap`, a secção `chat` é uma linha única, por isso todos os campos são obrigatórios exceto os
opcionais; um campo opcional omitido fica sem alterações.

O assistente de chat precisa também de `ENABLE_CHAT=1`; consulte a página [Assistente de chat](../chat).

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
