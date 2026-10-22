---
layout: default
title: Actualitzar a la v7
parent: Actualització
nav_order: 0.5
translated_from: 8c6ca072978823febdff10a5f0a3c935f994b50b
---

# Actualitzar a la v7
{: .no_toc }

Què cal canviar mentre encara ets a la 6.5, i què canvia quan passes a la versió 7
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

La versió 7 elimina tot el que la 6.x havia declarat obsolet; corregeix-ho primer a la 6.5, on funcionen tant l'antic com el nou, i després actualitza.

---

## Abans d'actualitzar (a la 6.5)

### Els formularis són als seus propis fitxers

Els formularis només són a la carpeta de formularis (`FORMS_FOLDER_PATH`) o en un repositori de formularis; `config.yaml` conserva les categories, els rols i les constants.

- **Un fitxer `forms.yaml`:** canvia-li el nom a `config.yaml`. A la 6.5 la pàgina de configuració té un botó
  **Convert forms.yaml to config.yaml** per fer-ho.
- **Una secció `forms:` a la configuració base:** la versió 7 la rebutja. Mou cada formulari al seu propi fitxer, per exemple
  arrossegant-lo a un fitxer al dissenyador de la 6.5.
- **Variables d'entorn:**

  | Eliminada | Fes servir en el seu lloc |
  |---|---|
  | `FORMS_PATH` | `CONFIG_PATH` i `FORMS_FOLDER_PATH` |
  | `ENABLE_FORMS_YAML_IN_DATABASE` | `ENABLE_CONFIG_IN_DATABASE` |

### El camp `table`

La versió 7 rebutja els camps `table`, i les seves propietats (`tableFields`, `insertColumns`, `readonlyColumns`,
`tableTitleAdd`, `tableTitleEdit`) desapareixen amb ells: fes servir un camp `list` amb un `subform`, i converteix el `from` de cada columna en una expressió
sobre `__parent__` (consulta les [PMF](faq#how-do-i-migrate-from-table--tablefields-to-list--subform)).

### Propietats reanomenades

Cada propietat eliminada té un substitut directe:

| Eliminada | Fes servir en el seu lloc |
|---|---|
| `disableRelaunch: true` (formulari) | `allowRelaunch: false` |
| `noOutput: true` (camp) | `output: false` |
| `enableLogin` (opció de rol) | `allowLogin` |

### Fonts de dades i esquemes de dades

S'han eliminat les importacions de fonts de dades i les seves pàgines d'administració, així com la
col·lecció de Galaxy d'AnsibleForms, els mòduls de la qual només servien per a això.

- Les importacions programades s'aturen i les taules de fonts de dades s'eliminen: anota primer el que necessitis.
- Els esquemes de dades que omplia una importació són bases de dades pròpies i es conserven. Un formulari que
  les consulta mitjançant una credencial continua funcionant.
- Per mantenir aquestes dades actualitzades, executa la importació com un playbook propi, per exemple des d'una
  programació.

### API v1

`/api/v1/*` s'ha eliminat; fes servir `/api/v2/*` (documentació interactiva a `/api/v2/docs`). Les crides
que solen fer servir els scripts són:

| v1 | v2 |
|---|---|
| `POST /api/v1/auth/login` | `POST /api/v2/auth/login` |
| `POST /api/v1/token` | `POST /api/v2/token` |
| `POST /api/v1/job` | `POST /api/v2/job` |

La v2 respon amb codis d'estat HTTP (`400`, `403`, `404`, `422`) i un cos JSON simple, no amb l'embolcall
`{ status, message, data }` de la v1.

**Les crides de retorn d'inici de sessió únic també.** Un URL de redirecció amb `/api/v1/` ja no respon: l'inici de sessió torna a
la pàgina d'inici de sessió sense iniciar-la. Canvia-ho a `/api/v2/` en dos llocs, al proveïdor d'SSO d'
AnsibleForms i al proveïdor d'identitat (els URI de redirecció del registre d'aplicació d'Entra ID, els URI de redirecció vàlids del
client OIDC):

- Entra ID: `https://<your host>/api/v2/auth/azureadoauth2/callback`, o `/api/v2/auth/entraid/callback` des de la 7.3.0
- OIDC: `https://<your host>/api/v2/auth/oidc/callback`

---

## Què canvia a la 7

La versió 7 canvia com s'executen els playbooks i fa més estrictes diversos valors predeterminats. Comprova cadascun dels punts següents quan passis de la 6.5.

### Els playbooks s'executen en un RTE

La versió 7 ja no executa `ansible-playbook` al contenidor d'AnsibleForms. Els playbooks s'executen en un entorn d'execució (RTE),
un contenidor propi, i la imatge de l'aplicació ja no conté ni ansible ni python. Inicia un RTE al costat de l'aplicació, a partir de la
imatge `ghcr.io/ansibleforms/ansibleforms-rte-full:7`. Des de la 7.3.0 l'aplicació truca a l'RTE i hi manté un WebSocket obert (consulta
[Modes](rte/modes.html)): l'RTE no rep cap configuració de la base de dades ni `ENCRYPTION_SECRET`. La seva configuració:

| Paràmetre | Valor |
|---|---|
| `AF_ROLE` | `rte`. Les imatges de l'RTE ja el defineixen. |
| `RTE_MODE` | `inbound`: l'aplicació truca a l'RTE. Un Runner en una altra xarxa fa servir `outbound` (consulta [Modes](rte/modes.html)). |
| `RTE_TOKEN` | Un token d'almenys 16 caràcters. L'aplicació s'hi autentica al socket de l'RTE, i l'RTE es nega a iniciar-se sense. |
| `RTE_FILES` | `local` quan l'RTE munta la mateixa carpeta persistent que l'aplicació, com quan és al seu costat. |

Després mou els muntatges d'ansible del contenidor de l'aplicació a l'RTE:

- `ansible.cfg` a `/etc/ansible/ansible.cfg`, els teus rols a `/etc/ansible/roles` i les teves col·leccions a
  `/etc/ansible/collections`.
- Munta també a l'RTE la mateixa carpeta persistent que a l'aplicació, perquè hi trobi els playbooks i els repositoris.

Després declara l'RTE com a runner, al [config seed](seed/) com fa el projecte de Docker Compose, o a **Connexions → Runners**:
una credencial d'RTE amb l'adreça de l'RTE (per exemple `http://rte:8000`) i el mateix token, i un runner de tipus RTE, en mode inbound,
que l'anomeni:

```yaml
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://rte:8000
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
```

El seed llegeix `RTE_TOKEN` de l'entorn de l'aplicació. Consulta [Runners](runners.html) i [Entorns d'execució](rte/).

{: .warning }
> **El mateix contracte per a l'aplicació i l'RTE** L'aplicació resol les credencials d'una tasca i les lliura a l'RTE segellades per a
> aquell RTE (contracte d'RTE 2, nou a la 7.0.0). Un RTE d'un altre contracte rebutja les tasques de l'aplicació: executa la imatge de l'RTE de la mateixa
> versió que l'aplicació, i actualitza-les totes dues alhora. Les versions 7 posteriors continuen funcionant amb un RTE 7 més antic mentre el contracte
> sigui el mateix (consulta [Escalat](../rte/images.html#build-your-own-rte)).


### Què conté la imatge de l'RTE

L'RTE es presenta en tres capes, cadascuna construïda sobre l'anterior. Tria la que s'adapti als teus playbooks:

| Imatge | Contingut |
|---|---|
| `ansibleforms-rte-full` | La predeterminada. Ansible 14 amb ansible-core 2.21, i les col·leccions i les biblioteques de python que tenia la imatge de la 6.5. |
| `ansibleforms-rte-core` | Python 3.14, ansible-core i unes quantes biblioteques habituals, sense col·leccions. Afegeix-hi les teves en una imatge construïda a sobre. |
| `ansibleforms-rte-base` | Només el servidor, sense python ni ansible, per construir un RTE amb les teves pròpies versions. |

Passar de la 6.5 (ansible 12 amb ansible-core 2.19) també canvia això per als teus playbooks:

- **ansible-core 2.21:** llegeix les [guies de migració](https://docs.ansible.com/ansible/latest/porting_guides/porting_guides.html)
  de la 2.20 i la 2.21.
- **Python 3.14:** les capes de l'RTE s'executen amb python 3.14.
- **Ja no hi ha `boto`:** l'antiga biblioteca `boto` 2 ha desaparegut. La col·lecció `amazon.aws` fa servir `boto3`, que s'inclou.

Dues variables d'entorn ara pertanyen a l'RTE i l'aplicació ja no les llegeix, així que defineix-les al contenidor de l'RTE:

| Variable | Canvi |
|---|---|
| `ANSIBLE_PATH` | La carpeta de playbooks, a l'RTE. |
| `PROCESS_MAX_BUFFER` | Ara 50 MB per defecte. Si se supera, la sortida de la tasca ja no es desa (la tasca ho indica), però el playbook continua en lloc d'aturar-se. |


### Els contenidors s'executen amb l'uid 1000

Les imatges de l'aplicació i de l'RTE s'executen amb l'usuari `node` (uid 1000) en lloc de root, i el seu directori personal és `/home/node`:

- **Dona els volums a l'uid 1000, una sola vegada.** Per als volums persistent i ssh, executa
  `docker run --rm -v <volume>:/v alpine chown -R 1000:1000 /v`; per a una carpeta de l'amfitrió, `sudo chown -R 1000:1000 <folder>`.
  A Kubernetes, defineix `fsGroup: 1000`.
- **Munta la carpeta ssh a `/home/node/.ssh`**, no a `/root/.ssh`. Si havies definit
  [`HOME_PATH`](customization/paths.html#env_HOME_PATH) com a `/root`, treu-lo o defineix-lo com a `/home/node`.
- **La teva pròpia imatge d'RTE** construïda sobre una capa de l'RTE canvia a `USER root` per a les seves instal·lacions i torna a `USER node` al final.


### La validació del llançament està activada

[`LAUNCH_VALIDATION`](customization/features.html#env_LAUNCH_VALIDATION) ara és `enforce` per defecte (6.5: `off`). Cada
llançament, des del navegador o des de `POST /api/v2/job`, es comprova amb les regles del formulari, i la tasca executa les extravars i les
credencials que el servidor construeix a partir dels valors comprovats.

- **Qui crida l'API REST ha d'enviar `rawFormData`**, els valors en brut dels camps tal com els envia el navegador. Un llançament amb només
  `extravars` es rebutja, perquè els seus valors no es poden comprovar.
- **Per veure primer què es rebutjaria**, defineix `LAUNCH_VALIDATION=log` i llegeix els avisos al registre. `off` restableix el
  comportament de la 6.5.

Consulta [Validació del llançament](launch-validation/) per als detalls.


### Els playbooks ja no veuen la configuració de l'aplicació

Un playbook ja no hereta les variables d'entorn que llegeix el mateix AnsibleForms: `ENCRYPTION_SECRET`, els paràmetres `DB_*`,
`ACCESS_TOKEN_SECRET`, `RTE_TOKEN`, els paràmetres `VAULT_*`, totes les altres variables documentades i totes les variables `MYSQL_*`.
La resta de l'entorn de l'RTE, com ara `PATH`, els proxies, els paràmetres `ANSIBLE_*` i les credencials del núvol, es passa com abans.

Un playbook que en llegia alguna amb `lookup('env', ...)` ha d'obtenir el valor d'una altra manera: passa'l com a extravar o com a
credencial, o defineix-lo a l'RTE amb un altre nom.

### Només el rol admin gestiona els runners i els administradors

Un usuari amb accés a la configuració ja no té el control total sobre qui és administrador i on van les credencials:

- **Runners:** només el rol admin afegeix, canvia o suprimeix un runner, perquè un runner rep les credencials de les tasques
  que executa. Els usuaris amb accés a la configuració encara poden veure i provar els runners.
- **Comptes i grups d'administrador:** només el rol admin concedeix permisos d'administrador. Sense aquest rol, un usuari no pot posar un compte en un grup que
  anomena el rol admin, ni canviar, restablir o suprimir un compte d'administrador o un grup d'aquest tipus.
- **Rols:** un dissenyador sense el rol admin no pot canviar els rols. Es rebutja un desament o una restauració amb rols diferents.

Dona el rol admin a qui gestioni els runners, els administradors i els rols.

### Cal canviar la contrasenya predeterminada

Un usuari que inicia sessió amb la contrasenya predeterminada pública `AnsibleForms!123` l'ha de canviar primer. Fins aleshores, qualsevol altra crida a l'API
respon `403` amb el codi `password_change_required`, i el navegador mostra la pàgina de canvi de contrasenya.

Inicia sessió una vegada i tria una contrasenya nova, o defineix [`ADMIN_PASSWORD`](customization/server.html#env_ADMIN_PASSWORD) abans del
primer inici. Els scripts que inicien sessió amb la contrasenya predeterminada n'han de fer servir una altra.

### Els tokens s'acaben en tancar la sessió i en canviar la contrasenya

Ara un tancament de sessió acaba els tokens d'aquella sessió, i un canvi de contrasenya acaba totes les sessions d'aquell usuari, així que torna a iniciar sessió després de
canviar una contrasenya.

Un token d'API demanat amb `?expiryDays=` dura com a màxim [`API_TOKEN_MAX_DAYS`](customization/security.html#env_API_TOKEN_MAX_DAYS) dies
(90 per defecte). Els scripts que fan servir tokens d'API de llarga durada n'han de demanar un de nou abans que caduqui.

### Entra ID necessita el teu tenant

L'inici de sessió amb Entra ID (Azure AD) ara fa servir OpenID Connect només contra el teu propi tenant, i un usuari d'un altre tenant no pot iniciar
sessió. Es rebutja un proveïdor sense id de tenant, o amb `common`, `organizations` o `consumers`.

- **Defineix l'id del tenant** al proveïdor d'SSO: el Directory (tenant) ID, un GUID, o el domini del tenant.
- **Concedeix els permisos de Graph:** l'inici de sessió demana `openid profile email User.Read GroupMember.Read.All`. Dona al registre
  d'aplicació els permisos delegats de Microsoft Graph `User.Read` i `GroupMember.Read.All`, amb el consentiment de l'administrador.
- **Als rols, millor els id de grup:** anomena un grup com a `azuread/<object id>` (`entraid/<object id>` des de la 7.3.0) en lloc de fer-ho pel seu nom visible.

Consulta [Entra ID](authentication/entra-id.html) per a la configuració.

### Les contrasenyes tenen una longitud mínima

Una contrasenya local definida a través de l'aplicació necessita com a mínim
[`PASSWORD_MIN_LENGTH`](customization/security.html#env_PASSWORD_MIN_LENGTH) caràcters (8 per defecte), i no pot ser el nom d'usuari ni la
contrasenya predeterminada. `PASSWORD_MIN_LENGTH=0` desactiva la comprovació de longitud. Les contrasenyes existents continuen funcionant.

### Executa els contenidors amb una política de reinici

Ara una excepció no capturada acaba el procés, registrada amb el nivell `crit`, en lloc de deixar-lo en marxa en un estat desconegut. Executa
els contenidors amb una política de reinici, com ara `--restart unless-stopped` amb Docker (el projecte de docker-compose la defineix).
Kubernetes reinicia els pods tot sol.

### Connexions d'AWX i l'enllaç d'inici

Dues coses més desapareixen a la 7, sense que calgui fer res a la 6.5:

- **Connexions d'AWX i AAP:** la taula `awx`, `/api/v2/awx` i la pàgina A.A.P. han desaparegut. L'actualització mou cada connexió d'AWX o
  d'AAP a **Connexions → Runners**, com a runner de tipus `awx`, i els formularis amb `awx:` continuen funcionant.
- **`NAV_HOME_LABEL` i `NAV_HOME_ICON`:** ja no es llegeixen. El primer enllaç de la capçalera sempre és Formularis.

### Obsolet a la 7, eliminat a la 8

Això encara funciona a la 7, però cada element registra un avís quan es fa servir. Passa al substitut abans de la versió 8:

| Obsolet | Fes servir en el seu lloc |
|---|---|
| Variables d'entorn `VAULT_*` | Un magatzem de secrets anomenat `vault` (**Connexions → Magatzems de secrets**). El primer inici de la 7 importa les variables una vegada com aquest magatzem, i després les ignora. |
| Variables d'entorn `LOG_SYSLOG_*` | Un servidor syslog (**Connexions → Syslog**). Quan `LOG_SYSLOG_HOST` està definit, el primer inici de la 7 les importa una vegada com el servidor `syslog`, que rep el registre del servidor com abans, i després les ignora. Per enviar-hi també les entrades d'auditoria, configura'l perquè rebi tots dos. |
| `vault_path` en una credencial (API, config seed) | `secret_store` i `secret_ref`. Consulta [Magatzems de secrets](secret-stores/). |
| El rol `public` a `config.yaml` | El rol `default`. El fitxer es reanomena quan es carrega la configuració; reanomena a mà una plantilla ytt. `public` als `roles:` d'un formulari continua coincidint. |
| `POST /api/v2/config/vault/check`, `GET /api/v2/config/vault/mounts` | `POST /api/v2/secretstore/{id}/check`, `GET /api/v2/secretstore/{id}/mounts` |
| `hasApproval` en un formulari o un pas | `approval`. `hasApproval` no té cap efecte. |
| `awx: <name>` en un formulari | `runner: <name>`. Una connexió d'AWX és un runner de tipus `awx`. |
| `type: multistep` en un formulari, amb els seus `steps` | `type: workflow`, amb nodes que anomenen un `runner`. Consulta [Formularis de workflow](forms/workflow.html). |
| La secció `awx:` del config seed | Elements de `runners:` amb `type: awx` |
| `LOCK_PATH` | Res: ja no es llegeix, el bloqueig del dissenyador es guarda a la base de dades. |
| Un RTE en mode database, des de la 7.3.0: `RTE_MODE=database` o sense `RTE_MODE`, amb els `DB_*` i l'`ENCRYPTION_SECRET` de la base de dades a l'RTE | `RTE_MODE=outbound` o `RTE_MODE=inbound`, sense `DB_*`. L'RTE s'uneix una vegada amb un token d'unió (`RTE_JOIN_TOKEN`), o el seu runner es posa en aquest mode a **Connexions → Runners** o al config seed (`rte_mode`). Consulta [Modes](rte/modes.html). |
| `RTE_REGISTER`, des de la 7.3.0 (només mode database) | Un token d'unió (`RTE_JOIN_TOKEN`): l'RTE s'afegeix ell mateix com a runner que s'autentica amb una credencial d'RTE. |
| Una credencial `api` o `userpass` en un runner del config seed, des de la 7.3.0 | Una credencial del tipus del runner (`credential_type: rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck` o `jenkins`), amb el seu servidor a `url`. |
| Un runner del config seed amb el seu propi `token`, o `username` i `password`, des de la 7.3.0 | Una credencial del tipus del runner a la secció `credentials`, amb el seu servidor a `url`, que el runner anomena amb `credential:`. Mentrestant, el seed en crea una amb el nom del runner. |

`ENABLE_SSO` i `SSO_AUTO_LOGIN` ja no es llegeixen des de la 7.3.0. El primer inici de la 7.3 els trasllada una vegada: `ENABLE_SSO=0` desactiva
tots els proveïdors d'SSO, i `SSO_AUTO_LOGIN=1` marca **Salta la pàgina d'inici de sessió** a l'únic proveïdor activat. Després s'ignoren: cada inici
registra un avís mentre estan definits, i cada proveïdor té **Activat** i **Salta la pàgina d'inici de sessió** a **Accés → SSO**.

---

## Etiquetes d'imatge

`latest` passa a la 7 amb la 7.0.0. Per quedar-te a la 6, fes servir l'etiqueta `6` (o `6.5`) en lloc de `latest`.
Totes les etiquetes es llisten a [Etiquetes d'imatge](installation/#image-tags).

---

## Tornar enrere

Fes una còpia de seguretat abans d'actualitzar (**Configuració → Còpies de seguretat**). La 6.5 funciona amb una base de dades actualitzada a la 7, però només
la còpia de seguretat restaura les definicions de fonts de dades eliminades.
