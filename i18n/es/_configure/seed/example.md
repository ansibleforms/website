---
layout: default
title: Ejemplo
parent: Semilla de configuración
nav_order: 1
translated_from: cf1f2b0122ca5cd2dfcc411e4ed20fb683b079bf
---

# Ejemplo
{: .no_toc }

Un archivo de semilla completo, sección por sección
{: .fs-6 .fw-300 }

---

El siguiente archivo de semilla declara todas las secciones excepto `oauth2` y la obsoleta `awx`; los secretos salen de variables
de entorno como `${SEED_AWX_TOKEN}`:

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

databases:                       # from 7.5.0
  items:
    - name: production-db        # the name a field's dbConfig gives
      description: The CMDB
      credential: production-db  # a credential of the credentials section, of type database

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

`provider` es uno de:

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
* `custom` : cualquier otro endpoint compatible con OpenAI

Como `ldap`, la sección `chat` es una sola fila, así que todos los campos son obligatorios salvo los
opcionales; un campo opcional que se omite se deja sin cambios.

El asistente de chat también necesita `ENABLE_CHAT=1`; consulta la página [Asistente de chat](../chat).

Desde la 7.3.0 un runner inicia sesión con una credencial de su tipo, que guarda la dirección de su servidor en `url`. Un runner con su propio `token`,
o `username` y `password`, sigue funcionando: la semilla registra un aviso y los convierte en una credencial así, con el nombre del runner. Un
runner que indica una credencial `api` o `userpass` también sigue funcionando, con un aviso: dale a esa credencial el tipo del runner.
Ambas formas están obsoletas desde la 7.3.0 y se eliminan en la 8.0.0. Un runner RTE sin `rte_mode` está en modo base de datos, obsoleto (consulta
[Modos](../rte/modes.html)). Un runner con `enabled: false` no recibe ningún trabajo, aunque sea el predeterminado de su tipo (consulta
[Predeterminado y Activado](../runners/list.html#default-and-enabled)); sin `enabled`, la semilla lo deja como está.

Un elemento de runner acepta estas claves además de `name`, `type`, `description`, `credential`, `is_default` y `enabled`:

| Clave | Qué define |
|---|---|
| `rte_mode` | El modo de un RTE: `outbound`, `inbound` o `database` (obsoleto, el predeterminado) |
| `rte_max_jobs` | El **Máximo de trabajos simultáneos** de un RTE en modo socket, de `0` a `10000` (`0`: sin límite) |
| `rte_cache_mb` | Su **Caché de archivos** en MB, de `0` a `1048576` (`0` no guarda ninguno) |
| `rte_files` | Sus **Archivos de trabajo**: `transfer` o `local` |
| `rte_drain_seconds` | Su **Tiempo de espera al parar** en segundos, de `0` a `86400` |
| `flavour` | Un runner `awx` que es un AAP o un Ascender: `aap` o `ascender`; ninguno para AWX |
| `project` | El id de proyecto de un runner de Semaphore, el nombre de proyecto de un runner de Rundeck, la carpeta de un runner de Jenkins |
| `uri`, `ignore_certs`, `ca_bundle` | La dirección y el TLS propios del runner, de antes de la 7.3.0: solo se usan mientras su credencial no tenga `url` |

Los cuatro ajustes `rte_*` son los de la pestaña RTE de la página del runner (consulta [Los ajustes de un RTE](../runners/runner-page.html#an-rtes-settings)):
prevalecen sobre las mismas variables definidas en el RTE, y un RTE en modo base de datos los ignora. Un valor fuera de su rango hace fallar la
validación de la semilla.

Un RTE en modo base de datos puede registrarse por sí mismo antes de que se aplique la semilla. Un runner RTE de la semilla cuya `uri` sea la dirección con la que
se registró ese RTE **adopta** esa fila: toma el nombre y los campos declarados, y el worker ya no la elimina cuando el RTE deja
de responder, en lugar de tener un segundo runner para el mismo RTE.

Desde la 7.5.0 la sección `databases` declara las [bases de datos](../databases.html) que consultan los formularios. Una entrada tiene un `name`, una
`credential` de tipo base de datos y una `description` opcional; la semilla la aplica después de las credenciales, y rechaza una credencial de otro tipo.
