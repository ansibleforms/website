---
layout: default
title: Ejemplo
parent: Semilla de configuración
nav_order: 1
translated_from: 4c570ca726391f1d55f86eafe947111c14a8ca11
---

# Ejemplo
{: .no_toc }

Un archivo de semilla completo, sección por sección
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## El archivo

El siguiente archivo de semilla declara todas las secciones excepto la obsoleta `awx`. Los secretos salen de variables de entorno como
`${SEED_AWX_TOKEN}`, y las secciones usan sus nombres de la 7.8.0 (consulta [Secciones renombradas](./#renamed-sections)):

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

Las secciones siguientes explican las partes que necesitan más que un comentario.

---

## Runners

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

---

## SSO

La sección `sso` (`oauth2` antes de la 7.8.0) declara los [proveedores SSO](../authentication/), cada uno con su cliente: un `client_id` y
un `client_secret`, o una `credential` de la sección de credenciales.

Desde la 7.8.0 Microsoft Entra ID es `provider: entraid`, como lo escriben los repositorios. `provider: azuread`, su nombre anterior, se sigue
leyendo igual, obsoleto desde la 7.8.0 y eliminado en la 8, con un aviso en el log del servidor. El otro proveedor es `oidc`, y solo un
proveedor de cada tipo puede tener `enable: true`.

---

## Repositorios

Un elemento de repositorio tiene un `name`, una `uri`, una `branch` opcional (la predeterminada del remoto si se omite), una `credential`,
`rebase_on_start`, la programación de pull `cron`, y un indicador `use_for_*` por cada tipo de uso: lo que la aplicación lee de él.

Desde la 7.8.0 cada tipo de uso tiene su indicador. `use_for_forms`, `use_for_playbooks`, `use_for_workflows` y `use_for_inventories` ya
existían; los demás son nuevos:

| Categoría | Indicadores |
|---|---|
| Designer | `use_for_categories`, `use_for_constants`, `use_for_forms`, `use_for_inventories`, `use_for_playbooks`, `use_for_workflows` |
| Trabajos | `use_for_schedules` |
| Sistema | `use_for_general` |
| Apariencia | `use_for_defaults`, `use_for_logo`, `use_for_icon`, `use_for_name`, `use_for_links`, `use_for_labels`, `use_for_announcements` |
| Acceso | `use_for_disclaimer`, `use_for_users`, `use_for_groups`, `use_for_roles`, `use_for_ldap`, `use_for_sso` |
| Conexiones | `use_for_repositories`, `use_for_credentials`, `use_for_secret_stores`, `use_for_databases`, `use_for_runners`, `use_for_ssh`, `use_for_notifications`, `use_for_chat_assistant`, `use_for_mcp`, `use_for_syslog` |

Varios repositorios pueden contener formularios, workflows e inventarios. Cualquier otro tipo lo contiene un repositorio como máximo: una
semilla que pone el mismo de esos indicadores en dos repositorios se rechaza. Lo que cada tipo guarda en git se describe en
[Repositorios git](../repositories/).

`use_for_config` está obsoleto desde la 7.8.0 y se elimina en la 8. Se sigue leyendo, como `use_for_roles`, `use_for_categories` y
`use_for_constants`, con un aviso en el log del servidor. Cuando varios repositorios lo declaran, el que ya tiene esos tres los conserva
(si no, el primero del archivo), y los demás no reciben ninguno. Declara los tres indicadores en su lugar.

---

## Correo

El correo pasa por los canales de correo de `notifications:` (consulta [Correo](../notification-channels/mail.html)). Las claves
`mail_server`, `mail_port`, `mail_secure`, `mail_username`, `mail_password` y `mail_from` de `settings:` están obsoletas
desde la 7.6.0 y se eliminan en la 8.0.0. Siguen funcionando y registran un aviso una vez: la semilla las convierte en un canal de correo
llamado `default`, con una credencial smtp `mail-login` cuando hay un `mail_username`, o con su propio servidor para un relay. Declara tú
mismo el canal de correo y su credencial, como `mail` y `smtp-login` en el archivo de arriba.

---

## Asistente de chat

La sección `chat_assistant` (`chat` antes de la 7.8.0) define el proveedor de modelos del asistente de chat. `provider` es uno de:

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

Como `ldap`, la sección `chat_assistant` es una sola fila, así que todos los campos son obligatorios salvo los
opcionales; un campo opcional que se omite se deja sin cambios.

Desde la 7.8.0 también acepta `credential`, una credencial api de la sección de credenciales cuya contraseña es la clave, en lugar de
`api_key` (declara entonces `api_key: ""`). El asistente de chat también necesita `ENABLE_CHAT=1`, que la semilla no define; consulta la
página [Asistente de chat](../chat/).

---

## Usuarios y grupos

Desde la 7.8.0 las secciones `groups` y `users` declaran grupos y usuarios locales. Se crean o se cambian en cada aplicación, nunca se
eliminan, y siguen siendo editables en la aplicación (consulta [Usuarios y grupos](../users-and-groups.html)).

Un elemento de grupo tiene un `name`, una `description` opcional y sus miembros en `users`: los nombres de usuario de usuarios locales. El
elemento de un usuario no dice nada de sus grupos, así que un grupo lista sus miembros en un solo sitio. La semilla aplica los grupos antes que los usuarios.

Un elemento de usuario tiene un `username` y un `type`:

| Tipo | Qué da su elemento |
|---|---|
| `local` (el predeterminado) | `email`, `description`, `blocked`, y `password` como referencia `${ENV}`, como todo secreto de la semilla |
| `ldap`, `entraid`, `oidc` | Solo `description` y `blocked`: el resto viene de su directorio en cada inicio de sesión |

Un usuario local nuevo toma los grupos de la semilla que lo listan, así que dale al menos uno. Sin `password` no puede iniciar sesión hasta que
un admin le ponga una en la aplicación. Un usuario de directorio se crea antes de que inicie sesión nunca, así que alguien que se va queda
bloqueado antes de intentarlo. El admin integrado nunca se declara: sigue siendo la vía de entrada.

---

## Apariencia, MCP y SSH

Desde la 7.8.0 la semilla también declara ajustes de los que la aplicación tiene uno, cada sección en el formato de la misma página en un repositorio git.

| Sección | Página | Claves |
|---|---|---|
| `defaults` | **Configuración > Apariencia > Valores predeterminados** | `default_theme`, `default_theme_color`, `default_forms_view`, `default_timezone`, `default_date_format`, `default_language` |
| `logo`, `icon` | **Logo** e **Icono** | `logo` o `icon`: la ruta de un archivo de imagen, relativa al archivo de semilla; `""` restaura el incluido |
| `name` | **Nombre** | `app_name` |
| `links` | **Enlaces** | `header_links` (cada uno `id`, `label`, `url`, `icon`, `newTab`, `parent`) y `show_designer` |
| `mcp` | **Configuración > Conexiones > MCP** | `enable_mcp`, `mcp_read_only`, `mcp_chat_forms_only` |
| `ssh` | **Configuración > Conexiones > SSH** | `private_key` y `known_hosts` |
| `announcements` | **Configuración > Apariencia > Anuncios** | Elementos con `name`, `message`, `level`, `enabled`, `start_at`, `end_at` |
| `disclaimer` | **Configuración > Acceso > Aviso legal** | Elementos con `version`, `title`, `text`, `checkbox_label`, `enabled`, `ask_again` |

Todas las claves son opcionales: lo que una sección omite se queda como lo tiene la aplicación. El logotipo y el icono se comprueban como una
subida (una imagen, de 900 KB como máximo para el logotipo y 256 KB para el icono).

Las claves de `mcp` son las variables de entorno del [servidor MCP](../mcp/) en minúsculas. Una variable que define el entorno real
conserva el valor del entorno: el log del servidor lo indica, y el arranque continúa.

`ssh` contiene la clave privada de la aplicación, como referencia `${ENV}` (su clave pública se genera a partir de ella), y los servidores
en los que confía la aplicación, una línea de known_hosts cada uno (los hosts, el tipo de clave y la clave). Se aplica en cada arranque.

Un anuncio cuyo `end_at` ya ha pasado se omite. Una `version` del aviso legal es un número, como máximo una está `enabled`, y un texto
cambiado corrige esa versión; con `ask_again: true` se vuelve a preguntar a todos los que la aceptaron.

Hasta qué punto la semilla es dueña de cada uno de estos se explica en [Objetos gestionados](managed-objects.html#settings-the-seed-declares).
