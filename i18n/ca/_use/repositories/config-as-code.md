---
layout: default
title: Configuració a git
parent: Repositoris Git
nav_order: 5
translated_from: 81365c1e3028835d57540b008c112e67f1cffbef
---

# Configuració a git
{: .no_toc }

Cada ajust guardat en un repositori git, llegit i escrit en tots dos sentits
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per als administradors que volen els ajustos, els usuaris i les connexions d'AnsibleForms revisats i versionats a git, des de la 7.8.0.

---

## Els tipus d'ús

El pas **Ús** d'un repositori, al seu assistent i a la pestanya **Ús** de la seva pàgina, indica què n'agafa l'aplicació.

Els tipus s'agrupen sota sis encapçalaments, cadascun amb el nombre de tipus que conté, per exemple **Dissenyador (6)**. Cada tipus té
la seva pròpia casella i una línia curta que diu què hi conté el repositori; la casella d'un encapçalament marca o desmarca tots els
tipus d'aquest encapçalament que es poden marcar.

| Encapçalament | Tipus d'ús (indicador) |
|---|---|
| **Dissenyador** | **Categories** (`use_for_categories`), **Constants** (`use_for_constants`), **Formularis** (`use_for_forms`), **Inventaris** (`use_for_inventories`), **Playbooks** (`use_for_playbooks`), **Workflows** (`use_for_workflows`) |
| **Tasques** | **Programacions** (`use_for_schedules`) |
| **Sistema** | **General** (`use_for_general`) |
| **Aparença** | **Valors predeterminats** (`use_for_defaults`), **Logotip** (`use_for_logo`), **Icona** (`use_for_icon`), **Nom** (`use_for_name`), **Enllaços** (`use_for_links`), **Etiquetes** (`use_for_labels`), **Anuncis** (`use_for_announcements`) |
| **Accés** | **Avís legal** (`use_for_disclaimer`), **Usuaris** (`use_for_users`), **Grups** (`use_for_groups`), **Rols** (`use_for_roles`), **LDAP** (`use_for_ldap`), **SSO** (`use_for_sso`) |
| **Connexions** | **Repositoris** (`use_for_repositories`), **Credencials** (`use_for_credentials`), **Magatzems de secrets** (`use_for_secret_stores`), **Bases de dades** (`use_for_databases`), **Runners** (`use_for_runners`), **SSH** (`use_for_ssh`), **Notificacions** (`use_for_notifications`), **Assistent de xat** (`use_for_chat_assistant`), **MCP** (`use_for_mcp`), **Syslog** (`use_for_syslog`) |

**Formularis**, **Inventaris** i **Workflows** es poden marcar en diversos repositoris. Els **Playbooks** venen d'un de sol: el pas Ús
el posa en gris als altres, i el servidor agafa el primer amb un avís. Cadascun dels altres tipus pertany a un repositori com a màxim, i
l'API i el config seed en rebutgen un segon. Un tipus que té un altre repositori es mostra marcat en gris i desactivat, amb un tooltip que
anomena aquest repositori: `Ja el gestiona el repositori "platform"`.

Activar o desactivar un tipus d'ús és un canvi només per a administradors, com ho són l'**URI** i la **Branca** (vegeu
[Qui pot canviar un repositori](adding.html#who-may-change-a-repository)).

---

## On els guarda un repositori

Un repositori conté un tipus en qualsevol fitxer YAML, amb qualsevol nom i a qualsevol carpeta: la clau de nivell superior del fitxer diu quin tipus conté.

Aquesta clau és sempre `controller_` i la clau del tipus: `controller_credentials:`, `controller_roles:`, `controller_defaults:`.
S'examinen tots els fitxers `.yaml` o `.yml` del repositori, a qualsevol profunditat, excepte els fitxers i les carpetes ocults. Un fitxer
pot contenir diversos tipus, i un tipus es pot repartir en molts fitxers.

| Clau | Conté |
|---|---|
| `controller_general:`, `controller_mcp:`, `controller_ssh:`, `controller_chat_assistant:`, `controller_defaults:`, `controller_logo:`, `controller_icon:`, `controller_name:`, `controller_links:` | un mapa, per al que l'aplicació només en té un; el dona un fitxer com a màxim |
| `controller_users:` | una llista d'usuaris, cadascun identificat pel seu `type` (local si s'omet) i el seu `username` |
| `controller_disclaimer:` | una llista de versions, cadascuna identificada per la seva `version` |
| `controller_roles:`, `controller_categories:`, `controller_constants:` | els rols, les categories i les constants, en el seu format habitual |
| qualsevol altra clau `controller_` | una llista d'entrades, cadascuna identificada pel seu `name` |

Un objecte s'identifica pel seu nom dins del seu tipus, mai pel seu fitxer: una entrada moguda a un altre fitxer conserva el seu objecte.
Una clau simple (`credentials:`, el `roles:` d'un fitxer de requisits de Galaxy, el `labels:` d'un fitxer de variables) no és de cap tipus,
i l'aplicació mai no la llegeix ni l'escriu. Un formulari mai no és el fitxer d'un tipus, i una clau d'un tipus per al qual no es fa servir
el repositori es deixa tal com és, amb una indicació a la sortida del pull.

### Rols, categories i constants

Aquests tres mantenen el format de `config.yaml`, ara cadascun sota la seva pròpia clau, en un tipus d'ús propi (un repositori cadascun).

Cadascun es llegeix del fitxer del seu repositori que dona la seva clau al nivell superior, amb qualsevol nom i a qualsevol carpeta; un
fitxer pot donar-ne tots tres. Quan cap fitxer no la dona, encara es llegeix el `config.yaml` del repositori, amb les seves claus simples
`roles:`, `categories:` i `constants:`: això és obsolet des de la 7.8.0 i ja no es llegeix a la 8.0, i el log del servidor, la sortida del
pull i la pàgina del repositori ho indiquen. Mou cada clau a un fitxer propi, per exemple `roles.yaml` amb `controller_roles:`.

Una clau que no conté cap repositori ve de la configuració base, com abans: la seva còpia a la base de dades, o el fitxer de
[`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH). L'interruptor **Utilitzar per a la configuració ?** d'abans ha
desaparegut: una instància actualitzada dona **Rols**, **Categories** i **Constants** al repositori que el tenia. El config seed, les
entrades `controller_repositories:` d'un repositori i l'API encara accepten `use_for_config` com a àlies obsolet dels tres, amb un avís.

---

## En tots dos sentits: git i l'aplicació

Un repositori que es fa servir per a un tipus es manté sincronitzat amb l'aplicació en tots dos sentits, i la base de dades de l'aplicació continua sent el que s'executa.

| Sentit | Què passa |
|---|---|
| De git a l'aplicació | Després de cada pull, clonatge o restabliment del repositori, i quan el servidor arrenca, se'n llegeixen els fitxers: un nom nou crea un objecte, una entrada canviada el canvia, una entrada eliminada l'elimina |
| De l'aplicació a git | Un desament a l'aplicació s'escriu de tornada al fitxer de l'entrada: només els camps que ha canviat, conservant els comentaris del fitxer, les altres claus i les altres entrades. Un objecte nou va al final del primer fitxer que dona la clau del tipus, o si no a `<key>.yaml` a l'arrel (`credentials.yaml`), que es crea; una supressió n'elimina l'entrada. Queda a l'espera del **Push** del repositori |

Una entrada no vàlida es rebutja sola, amb la seva ubicació i el motiu, i l'objecte del seu nom es queda com era. Una entrada que anomena un
objecte que encara no existeix (un runner i la seva credencial) espera, i es torna a llegir al següent pull d'aquest tipus. Un canvi de nom
a git se segueix quan un nom surt d'un fitxer i hi apareix un nom nou, sense cap altre canvi.

### Activar o desactivar un ús

Desar un repositori amb un tipus activat o desactivat pregunta primer què cal fer, i mostra què farà el canvi.

| Canvi | Pregunta | Què fa |
|---|---|---|
| Activar | **Activar Credencials**: `Fer servir platform per a Credencials?` | Es fa pull del repositori i se'n llegeixen les entrades; git guanya en un nom que tenen tots dos; els altres objectes de l'aplicació s'escriuen al repositori, a l'espera del **Push**, sense els seus secrets |
| Desactivar | **Desactivar Credencials**: `Deixar de fer servir platform per a Credencials?` | Es fa pull del repositori una vegada més i després se'n desvinculen els objectes: es queden a l'aplicació tal com són, i els fitxers de git no es toquen |
| Diversos | **Canviar l'ús**: `Canviar per a què es fa servir platform?` | Una sola pregunta, amb una secció per tipus, confirmada amb **Desar l'ús** |

La pregunta també llista el que es queda a l'aplicació: els objectes del config seed, els runners que un RTE ha registrat per si mateix i
els que esperen aprovació. Després, un missatge diu què ha agafat cada tipus, per exemple
`Credencials: 2 llegits dels seus fitxers, 3 escrits al repositori (a l'espera del Push), 1 substituïts per git, 0 conservats en aquesta aplicació.`

### Què diu la sortida del pull

El **Mostra la sortida de l'últim pull** del repositori conté una línia per tipus després de la sortida de git mateix.

```
Credentials: 1 created, 2 updated, 0 deleted, 5 unchanged, 1 refused
Refused connections.yaml#ops-api: password must be an ${ENV} reference: a secret is never written plain in git
Renamed prod-db to main-db (its secrets kept)
Not in git, their secrets kept from the database: smtp-login
```

Un objecte guardat en un repositori mostra **Repositori: platform** a la seva pàgina (el nom del seu repositori), amb el fitxer de la
seva entrada al tooltip. Desar-lo escriu aquest fitxer, i el **Push** del repositori l'envia a git.

---

## Secrets

Git mai no conté un secret en clar: un camp secret d'una entrada és només una referència `${ENV}`, resolta des de l'entorn.

Les contrasenyes, els tokens, els client secrets i les claus s'escriuen com a `${SEED_RTE_TOKEN}`, igual que al [config seed](../seed/).
Una entrada amb un secret en clar, o que anomena una variable no definida, es rebutja i s'anomena a la sortida del pull; el mateix passa
amb una variable del servidor mateix (`DB_*`, `ACCESS_TOKEN_*`, `ENCRYPTION_*`, `ADMIN_*` ...). Un secret omès en una entrada conserva el
de la base de dades de l'aplicació, i l'aplicació escriu els seus propis objectes a git sense els seus secrets.

Un secret escrit a l'aplicació per a un objecte l'entrada del qual el dona com a referència `${ENV}` es rebutja: canvia la variable, o l'entrada a git.

---

## El dissenyador i aquests fitxers

El dissenyador es manté fora dels fitxers dels tipus d'ús, així que editar un formulari mai no canvia un ajust.

Mai no llista, llegeix, escriu ni suprimeix un fitxer que dona la clau d'un tipus que conté el seu repositori, ni les imatges que anomena
aquest fitxer. També es nega a escriure un fitxer el contingut del qual donaria la clau d'un tipus, i la càrrega de formularis mai no llegeix aquest fitxer com a formulari.

---

## Cada tipus, amb un exemple

Les entrades de cada tipus són en el format del config seed, així que un element del seed i una entrada de repositori són intercanviables.

Els noms de fitxer de sota són exemples: qualsevol nom i qualsevol carpeta servirien.

### Categories, constants i rols

Les categories i els rols són llistes, les constants un mapa, cadascun sota la seva pròpia clau.

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

Cada rol es comprova per separat: un que no és vàlid es rebutja sol, i els altres se serveixen. Els rols es poden repartir en diversos
fitxers, i se serveixen en l'ordre dels seus fitxers. Vegeu [Rols](../config/roles.html).

### Programacions

Les programacions són una llista `controller_schedules:`, cada entrada anomena el formulari que executa i es temporitza amb exactament un
de `cron`, `rrule` o `one_time_run`.

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

Les tasques "Executa més tard" que planifiquen els usuaris es queden a l'aplicació. Vegeu [Programacions](../jobs/schedules.html) per als horaris i les preguntes.

### General

Els ajustos de **General** són un mapa, pels seus noms de variable d'entorn en minúscules.

```yaml
controller_general:
  job_retention_days: 30
  log_level: info
  metrics_token: ${METRICS_TOKEN}
```

Només s'agafen les variables que canvia la pàgina General; una clau en majúscules, o una variable definida a l'entorn real, es rebutja.
Una variable el nom de la qual acaba en `_PASSWORD`, `_SECRET` o `_TOKEN` és només una referència `${ENV}`.

### Valors predeterminats, logotip, icona, nom i enllaços

Les pàgines d'Aparença són un mapa cadascuna, amb el que desa la pàgina.

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

El logotip i la icona són imatges del repositori, indicades respecte al fitxer que les anomena. Un camp que declara el config seed continua
sent del seed.

### Etiquetes i anuncis

Les etiquetes i els anuncis són llistes d'entrades, cadascuna identificada pel seu nom.

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

Un anunci el final del qual ja ha passat no s'importa, i s'indica en una línia `Not imported` de la sortida del pull.

### Avís legal

L'avís legal és una llista de versions, cadascuna identificada per la seva `version`, amb una d'activada com a màxim.

```yaml
controller_disclaimer:
  - version: 2
    title: Terms of use
    text: Use this tool for your own team's systems only.
    checkbox_label: I agree
    enabled: true
    ask_again: true
```

Un text canviat des de git corregeix aquesta versió; `ask_again: true` torna a preguntar a tothom qui l'havia acceptada. Qui ha acceptat què mai no és a git.

### Usuaris i grups

L'entrada d'un grup llista els seus membres locals; l'entrada d'un usuari no diu res dels seus grups.

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

La `password` d'un usuari local és només una referència `${ENV}`, amb hash en llegir-la. Un usuari d'un directori (`ldap`, `entraid`,
`oidc`) només dona la seva `description` i `blocked`. L'admin integrat mai no es llegeix de git ni s'hi escriu.

### LDAP i SSO

Els directoris LDAP i els proveïdors SSO són llistes, i cadascun anomena la credencial amb què inicia la sessió.

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

L'entrada anomenada `main` és el directori principal, que mai no es canvia de nom ni se suprimeix. `position` manté l'ordre de cerca.

### Repositoris

Un repositori pot contenir els altres repositoris, en el format dels elements `repositories:` del config seed.

```yaml
controller_repositories:
  - name: forms
    uri: https://git.example.com/forms.git
    branch: main
    credential: git-bot
    use_for_forms: true
    cron: "*/15 * * * *"
```

El repositori que els conté mai no és als seus propis fitxers, una entrada mai no defineix `use_for_repositories`, i un usuari o un token
a la `uri` es rebutja: anomena una credencial en lloc seu. Una entrada eliminada suprimeix el seu repositori, tret que tingui canvis que encara no s'han enviat.

### Credencials, magatzems de secrets i bases de dades

Primer es llegeixen les credencials, i després tot el que n'anomena alguna.

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

Eliminar l'entrada d'una credencial mentre alguna cosa encara la fa servir es rebutja, i s'indica a la sortida del pull.

### Runners

Un runner anomena la seva credencial, del tipus del runner, i espera mentre falta.

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

Un runner que un RTE ha registrat per si mateix, o un que espera aprovació, es queda a l'aplicació.

### SSH

La clau SSH de l'aplicació i els hosts en què confia són un mapa, llegit just després dels repositoris, abans de clonar-los.

```yaml
controller_ssh:
  private_key: ${SSH_PRIVATE_KEY}
  known_hosts:
    - git.example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
```

`private_key` és només una referència `${ENV}`, mai no s'escriu a git: si s'omet, l'aplicació conserva la seva. `known_hosts` conté
una línia de known_hosts per servidor, i una llista buida els esborra.

### Notificacions i syslog

Els canals de notificació i els servidors syslog són llistes d'entrades.

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

### Assistent de xat i MCP

L'assistent de xat i els ajustos de MCP són un mapa cadascun.

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

`enable_chat` i les claus de MCP són noms de variable d'entorn en minúscules. Una variable definida a l'entorn real mai no s'escriu, i un
mapa que la dona es rebutja. `api_key` és només una referència `${ENV}`, o s'omet.
