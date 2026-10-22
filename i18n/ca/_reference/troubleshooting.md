---
layout: default
title: Resolució de problemes
nav_order: 4
translated_from: b7b3f3dfe9b603afe24b167dcc2fc117601638d5
---

# Resolució de problemes
{: .no_toc }

Missatges d'error i símptomes, per què passen i com corregir-los
{: .fs-6 .fw-300 }

---

Cada problema següent té com a títol el missatge o el símptoma que veus, seguit de la causa i la solució. Els missatges es citen
exactament com els escriu AnsibleForms; `<name>` representa un valor que canvia en cada cas. La majoria acaben al registre del
servidor, que pots llegir a [Registre del servidor](gui/administration.html#server-log) o amb `docker logs`.

**Base de dades i inici**

* [Mysql not ready yet](#mysql-not-ready-yet)
* [Schema is not ready, skipping group and user initialization](#schema-is-not-ready-skipping-group-and-user-initialization)
* [Schema creation is disabled](#schema-creation-is-disabled)
* [Config seed failed, refusing to start](#config-seed-failed-refusing-to-start)
* [ENCRYPTION_SECRET is not set](#encryption_secret-is-not-set)

**Configuració i formularis**

* [Could not load the forms](#could-not-load-the-forms)
* [La configuració base té una secció forms](#the-base-config-has-a-forms-section)
* [Falta un formulari al tauler](#a-form-is-missing-from-the-dashboard)
* [Could not save the forms](#could-not-save-the-forms)
* [The editor is read-only](#the-editor-is-read-only)
* [Abuse attempt of eval function](#abuse-attempt-of-eval-function)
* [Destination is not in REST_ALLOWED_HOSTS](#destination-is-not-in-rest_allowed_hosts)

**Inici de sessió**

* [Authentication failed: Invalid credentials](#authentication-failed-invalid-credentials)
* [LDAP check failed](#ldap-check-failed)
* [Falla l'autenticació d'Azure AD o OIDC](#azure-ad-or-oidc-authentication-failed)
* [Not authenticated, login is not enabled for this user](#not-authenticated-login-is-not-enabled-for-this-user)
* [Sessió tancada després d'un reinici o al cap d'un dia](#logged-out-after-a-restart-or-after-a-day)
* [Formularis i tasques buits després d'un inici de sessió únic (HTTP 431)](#empty-forms-and-jobs-after-a-single-sign-on-http-431)

**Tasques**

* [Playbook failed with status](#playbook-failed-with-status)
* [Playbook was aborted by the main process](#playbook-was-aborted-by-the-main-process)
* [Failed to launch awx template](#failed-to-launch-awx-template)
* [Una tasca mostra l'estat abandoned](#a-job-shows-the-status-abandoned)
* [Un RTE no es connecta](#an-rte-does-not-connect)
* [The form data is not valid](#the-form-data-is-not-valid)

**Repositoris git i còpies de seguretat**

* [Falla el clonatge o el pull d'un repositori](#a-repository-clone-or-pull-failed)
* [El repositori de formularis encara no està clonat](#the-forms-repository-is-not-cloned-yet)
* [Falla una còpia de seguretat](#a-backup-failed)

Les [PMF](faq.html) tracten a fons dos problemes relacionats: una
[contrasenya d'administrador perduda](faq.html#recovering-a-lost-admin-password) i
[restringir les destinacions dels helpers REST](faq.html#restricting-rest-helper-destinations-allowdeny-lists).

---

## Mysql not ready yet

AnsibleForms no s'inicia, i el registre repeteix aquestes línies cada 5 segons:

```
Waiting for mysql to start
[ansibleforms] Query error : Error: <reason>
Mysql not ready yet
```

**Per què passa**

En iniciar-se, AnsibleForms espera fins que la base de dades respon una consulta, i continua esperant mentre no ho faci.
El `<reason>` és el missatge del mateix controlador de la base de dades: una connexió rebutjada o que ha esgotat el temps apunta al host o al port,
un missatge d'accés denegat al nom d'usuari o a la contrasenya.

**Com corregir-ho**

Comprova [`DB_HOST`](customization/server.html#env_DB_HOST), [`DB_PORT`](customization/server.html#env_DB_PORT),
[`DB_USER`](customization/server.html#env_DB_USER) i [`DB_PASSWORD`](customization/server.html#env_DB_PASSWORD).
Des de dins d'un contenidor, `localhost` és el mateix contenidor, no l'host que executa MySQL. Assegura't que MySQL escolta
en una adreça de xarxa i que l'usuari es pot connectar des de l'host d'AnsibleForms. AnsibleForms continua tot sol tan aviat
com la base de dades respon; no cal reiniciar.

---

## Schema is not ready, skipping group and user initialization

El navegador obre una pàgina de base de dades en lloc de la pàgina d'inici de sessió, i el registre mostra:

```
Schema is not ready, skipping group and user initialization
Please create the schema via the /schema endpoint
```

**Per què passa**

Falta l'esquema `AnsibleForms` o està incomplet. Una base de dades *buida* s'aprovisiona automàticament en iniciar-se, tret que
[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) sigui `0`. Si això falla, per exemple perquè
l'usuari de la base de dades no pot crear un esquema, el registre diu `Failed to create the schema automatically : <reason>`. Un esquema
que existeix però al qual falten taules (`Table '<name>' is not present`) mai es torna a crear automàticament, perquè crear
l'esquema primer elimina totes les taules. Aleshores la pàgina de base de dades diu *It appears that you have an unuseable schema*.

**Com corregir-ho**

En una instal·lació nova, dona a l'usuari de la base de dades el dret de crear l'esquema `AnsibleForms` i reinicia, o prem
**Crea** a la pàgina de base de dades. Amb un esquema present només en part, restaura una còpia de seguretat o elimina l'esquema `AnsibleForms`
incomplet perquè AnsibleForms el pugui tornar a crear. El registre llista quines taules i quins pedaços han fallat.

---

## Schema creation is disabled

Crear l'esquema, des de la pàgina de base de dades o amb `POST /api/v2/schema`, falla amb:

```
Schema creation is disabled
```

**Per què passa**

[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) és `0`, cosa que desactiva tant la creació
automàtica en iniciar-se com l'endpoint. En una base de dades que ja té usuaris, l'endpoint també rebutja qui no hagi
iniciat sessió com a administrador, amb `Schema creation requires an authenticated administrator`.

**Com corregir-ho**

Crea l'esquema amb `ALLOW_SCHEMA_CREATION=1` una vegada (és el valor predeterminat), o restaura'l a partir d'una còpia de seguretat, i després torna a posar la
variable a `0`. En una base de dades aprovisionada, inicia sessió com a administrador abans de tornar a crear l'esquema, i recorda
que elimina i torna a crear totes les taules.

---

## Config seed failed, refusing to start

El contenidor surt just després d'iniciar-se, i la seva sortida acaba amb:

```
Config seed failed, refusing to start : <reason>
```

**Per què passa**

El fitxer de [`CONFIG_SEED_PATH`](customization/configuration.html#env_CONFIG_SEED_PATH) no s'ha pogut aplicar: no és YAML
vàlid o incompleix l'esquema del seed, per exemple; `<reason>` diu què ha anat malament. AnsibleForms es nega a iniciar-se en lloc
d'executar-se amb la meitat dels objectes declarats. El motiu també s'escriu a la sortida d'error estàndard, així que `docker logs` i `kubectl logs` el mostren.

**Com corregir-ho**

Corregeix el que indica `<reason>` i torna a iniciar. Consulta [Recàrrega i inici](seed/reloading.html) per veure com s'aplica el seed,
i [Exemple](seed/example.html) per a un fitxer vàlid.

---

## ENCRYPTION_SECRET is not set

Cada inici registra aquest avís:

```
[SECURITY] ENCRYPTION_SECRET is not set. Stored passwords are encrypted with the default key, which is public in the source code. Set ENCRYPTION_SECRET: the stored ones are re-encrypted with it on the next start.
```

O el worker es nega a iniciar-se amb:

```
[SECURITY] The stored secrets were encrypted with a key that is not ENCRYPTION_SECRET: set ENCRYPTION_SECRET_PREVIOUS to the key they were encrypted with, and they are re-encrypted with ENCRYPTION_SECRET on the next start. Nothing was changed.
```

**Per què passa**

Els secrets desats es xifren amb [`ENCRYPTION_SECRET`](customization/security.html#env_ENCRYPTION_SECRET): des de la 7.3.0 són a les
credencials (les contrasenyes i els tokens de directoris LDAP, proveïdors d'SSO, runners i magatzems de secrets, entre d'altres), al costat de les adreces dels webhooks de Slack
i Teams. Sense aquesta variable, es fa servir una clau que és pública al codi font. Des de la 7.3.0, un inici amb un
`ENCRYPTION_SECRET` nou torna a xifrar tots els secrets desats amb aquesta clau, en una sola transacció: des de la clau predeterminada quan es defineix per primera
vegada, o des d'[`ENCRYPTION_SECRET_PREVIOUS`](customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS) quan canvia. Quan els
secrets desats no s'han xifrat amb cap de les dues, no es canvia res i AnsibleForms no s'inicia.

**Com corregir-ho**

Defineix `ENCRYPTION_SECRET`, i guarda'l amb els altres secrets: les còpies de seguretat mai el contenen. El següent inici registra
`[SECURITY] Re-encrypted <n> stored secrets from the default key with ENCRYPTION_SECRET`. Per canviar-lo més endavant, posa el valor nou a
`ENCRYPTION_SECRET` i l'antic a `ENCRYPTION_SECRET_PREVIOUS` durant un inici, i després treu `ENCRYPTION_SECRET_PREVIOUS`. Quan el
worker es nega a iniciar-se, posa a `ENCRYPTION_SECRET_PREVIOUS` la clau amb què es van xifrar els secrets, o torna a posar el valor antic.

---

## Could not load the forms

El tauler no mostra cap formulari i informa:

```
Could not load the forms.

Failed to get forms list

<reason>
```

**Per què passa**

La configuració base (`config.yaml`) no s'ha pogut llegir o no és vàlida. El `<reason>` diu quin és el cas:

| Motiu | Causa |
|--------|-------|
| `Error parsing the base config, it's not valid yaml. : <error>` | Un error de sintaxi YAML |
| `The base config has no content. It must be a yaml mapping holding at least 'categories' and 'roles'.` | Un fitxer buit, o un amb només comentaris |
| `Duplicate role name(s) : <names>. Each role must appear once.` | El mateix rol està definit dues vegades |
| `There is no config.yaml nor could one be created from template.` | Falta `config.yaml` i la seva carpeta no té permisos d'escriptura |
| `There is no forms directory nor could there be one created from template.` | Falta la carpeta de formularis i no es pot crear |
| Qualsevol altra línia | La configuració incompleix l'esquema, per exemple un rol sense `groups` |

**Com corregir-ho**

Corregeix el fitxer que indica [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH), o el `config.yaml` del
repositori que es fa servir per a la configuració. Quan falten fitxers, fes que [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) i
[`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) apuntin a una ubicació persistent amb permisos d'escriptura. Consulta
[config.yaml](config/) per a l'estructura.

---

## La configuració base té una secció forms

Després d'actualitzar des de la 6.x el tauler és buit, i el panell d'avisos mostra:

```
The base config has a 'forms' section. Since 7.0.0 forms are no longer read from the base config - move each form to its own file in the forms folder (FORMS_FOLDER_PATH).
```

**Per què passa**

Des de la 7.0.0, cada formulari és al seu propi fitxer a la carpeta de formularis. Els formularis que encara figuren a `config.yaml`
s'ignoren.

**Com corregir-ho**

Mou cada formulari al seu propi fitxer a [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH). Consulta
[Actualitzar a la 7.x](upgrade-7.html).

---

## Falta un formulari al tauler

Existeix un fitxer de formulari, però un usuari no veu el formulari al tauler.

**Per què passa**

Un usuari només veu un formulari quan un dels `roles` del formulari és un dels rols de l'usuari; els administradors veuen tots els formularis. Tots els usuaris tenen
el rol `default`, així que un formulari amb `roles: [default]` és visible per a tothom. Els rols d'un usuari vénen dels grups i els usuaris
llistats a `roles` a `config.yaml`. Un formulari sense `categories` apareix a **Default**, així que no surt a les
altres categories, tot i que continua llistat a **Tots els formularis**. Finalment, un formulari que no supera la validació s'omet. Aleshores el
tauler mostra un botó **Aquesta configuració té Avisos o errors**, que obre missatges com ara:

```
Failed to validate form '<name>'.
skipping duplicate form <name>
Form found with no name.
```

**Com corregir-ho**

Obre el panell d'avisos i corregeix el que hi llista. Comprova els rols de l'usuari a
[Permisos](profile/permissions.html) al perfil, i els `roles` i les `categories` del formulari. Consulta
[Rols](config/roles.html) i [Categories](config/categories.html). Quan dos fitxers defineixen el mateix nom de formulari,
guanya el primer que es carrega.

---

## Could not save the forms

Desar al dissenyador falla amb:

```
Could not save the forms.

Failed to save forms

<messages>
```

**Per què passa**

El dissenyador valida cada formulari amb l'esquema abans d'escriure res. Cada línia de `<messages>` indica el
formulari i el camp que incompleixen una regla. Les opcions eliminades a la 7.0.0 tenen un missatge propi, per exemple
`Field '<name>' : the table field was removed in 7.0.0, see https://ansibleforms.com/upgrade-7 - use a list field with a subform`.

**Com corregir-ho**

Corregeix els camps que indiquen els missatges. Per a les opcions que la 7.0.0 ha eliminat, segueix [Actualitzar a la 7.x](upgrade-7.html).
Per validar els fitxers de formulari abans que arribin a AnsibleForms, consulta
[Validació a VS Code per als fitxers de formulari](faq.html#vs-code-validation-for-form-files) a les PMF.

---

## The editor is read-only

El dissenyador mostra **Bloquejat per** amb el nom d'un altre usuari, i desar falla amb:

```
The editor is read-only
```

**Per què passa**

Només una persona alhora pot editar els formularis. El bloqueig es pren quan algú inicia el dissenyador, i es manté fins que
l'atura, fins i tot si ha tancat el navegador sense aturar-lo. L'API rebutja un desament de qualsevol altra persona amb
`Designer is locked by <username>`.

**Com corregir-ho**

Demana a `<username>` que aturi el dissenyador. Si no és possible, fes servir **Force Unlock** al dissenyador. Qui té el
bloqueig perd els canvis que no hagi desat.

---

## Abuse attempt of eval function

Un camp d'expressió mostra un error, i el registre té una línia com ara:

```
Error in expression : Error: Abuse attempt of eval function, using custom functions, try runLocal
```

**Per què passa**

Les expressions del costat del servidor es comproven abans d'executar-se. Només poden cridar funcions `fn.` i `fnc.`; es rebutgen les sentències múltiples,
les línies múltiples, els template literals, `process.env` i paraules com ara `require` o `constructor`. El missatge
diu quina regla s'ha incomplert. Amb [`EXPRESSION_SANITIZER`](customization/security.html#env_EXPRESSION_SANITIZER) a
`off`, totes les expressions del servidor fallen amb
`Server expressions are disabled (EXPRESSION_SANITIZER=off), use runLocal`.

**Com corregir-ho**

Reescriu l'expressió com una sola crida `fn.` o una operació simple, o executa-la al navegador amb `runLocal: true`. Consulta
[Expressions](expressions/) i [Expressions locals](expressions/local.html).

---

## Destination is not in REST_ALLOWED_HOSTS

Un camp que crida una API REST es queda buit, i el registre mostra:

```
Error in expression : Error: [hostfilter] destination <host> (<addresses>) is not in REST_ALLOWED_HOSTS
```

**Per què passa**

[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) està definit, i l'host de l'URL no hi és.
Un host que coincideix amb [`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS) es rebutja amb
`blocked by REST_DENIED_HOSTS entry "<entry>"`, i un host que no es resol amb `cannot resolve <host>`.

**Com corregir-ho**

Afegeix el nom d'host, o un CIDR que en cobreixi les adreces, a `REST_ALLOWED_HOSTS`, o treu de
`REST_DENIED_HOSTS` l'entrada que el bloqueja. Consulta [Restringir les destinacions dels helpers REST](faq.html#restricting-rest-helper-destinations-allowdeny-lists).

---

## Authentication failed: Invalid credentials

La pàgina d'inici de sessió rebutja un nom d'usuari i una contrasenya amb:

```
Authentication failed: Invalid credentials
```

**Per què passa**

La pàgina d'inici de sessió dona la mateixa resposta per a qualsevol error, perquè no reveli si un usuari existeix. AnsibleForms
prova primer els usuaris locals i després LDAP: amb diversos directoris, un nom d'usuari es busca en el seu ordre a **Accés > LDAP**,
tret que indiqui un directori (`corp\jane`) o un dels seus dominis d'inici de sessió (`jane@corp.example`). El motiu real va al registre. Els errors
de LDAP es registren com a `Error connecting to ldap: <reason>`, amb motius com ara `Wrong binding credentials` o
`Unable to verify the certificate`; els codis d'Active Directory es tradueixen a `Wrong password`, `User not found`,
`Account disabled`, `Account locked` o `Password expired`.

**Com corregir-ho**

Llegeix el motiu al registre. Per obtenir el motiu complet de cada inici de sessió fallit, posa
[`LOG_LEVEL`](customization/logging.html#env_LOG_LEVEL) a `debug`, que registra `Ldap authentication failed: <reason>`.
Si s'ha perdut la contrasenya de l'administrador local, consulta [Recuperar una contrasenya d'administrador perduda](faq.html#recovering-a-lost-admin-password).

---

## LDAP check failed

Provar un directori LDAP a **Accés > LDAP** falla amb un d'aquests:

```
LDAP check failed: Error: Wrong binding credentials
LDAP check failed: Error: Bad server or port (connection failed)
LDAP check failed: Error: Unable to verify the certificate
LDAP check failed: Error: Certificate is not valid
```

**Per què passa**

L'usuari de bind o la seva contrasenya són incorrectes, el servidor o el port no són accessibles o, amb TLS, el certificat del servidor no es pot
verificar amb el paquet de CA. Des de la 7.3.0 això és a la credencial ldap del directori, a **Connexions > Credencials**. Un usuari de prova que no existeix
continua comptant com una prova correcta, perquè la connexió i el bind han funcionat.

**Com corregir-ho**

Obre la credencial que indica el directori (el directori predeterminat és `main`) a **Connexions > Credencials**, i corregeix el DN de
bind i la seva contrasenya, els servidors i el port (normalment 389, o 636 per a LDAPS). Per a problemes de TLS, enganxa el paquet de CA que ha signat el
certificat del servidor LDAP; ometre la comprovació del certificat no és per a producció. Consulta [LDAP](authentication/ldap.html).

---

## Falla l'autenticació d'Azure AD o OIDC

Un inici de sessió únic torna a la pàgina d'inici de sessió amb:

```
Azure AD authentication failed: <reason>
OIDC authentication failed: <reason>
```

**Per què passa**

El proveïdor d'identitat ha retornat l'usuari, però AnsibleForms no ha pogut completar l'inici de sessió. Motius habituals són
`azuread login is not enabled` o `oidc login is not enabled` (el proveïdor està desactivat), i `jwt expired`, perquè
el traspàs des del proveïdor només és vàlid durant 5 minuts. Un error durant la crida de retorn del proveïdor també es mostra
a la pàgina d'inici de sessió, i es registra.

**Com corregir-ho**

Activa el proveïdor a **Accés > SSO**, i registra l'URL de retorn al proveïdor d'identitat exactament com
el fa servir AnsibleForms: `https://<your host>/api/v2/auth/entraid/callback` per a Entra ID (des de la 7.3.0; `azureadoauth2` continua funcionant), o
`https://<your host>/api/v2/auth/oidc/callback` per a OIDC. Un URL de retorn amb `/api/v1/`, d'abans de la 7 o d'abans de la
6.1.5, s'ha d'actualitzar: si no, la pàgina d'inici de sessió es torna a carregar sense iniciar la sessió i sense cap error. Torna a provar l'inici de sessió després
d'un traspàs caducat.

---

## Not authenticated, login is not enabled for this user

Un usuari amb una contrasenya vàlida no pot iniciar sessió, i rep:

```
Not authenticated, login is not enabled for this user.
```

**Per què passa**

Un dels rols de l'usuari defineix l'opció de rol `allowLogin` com a `false`. El registre diu
`Login is disabled for user '<username>' in the configuration (allowLogin option is set to false), please check your settings`.

**Com corregir-ho**

Treu `allowLogin: false` del rol, o treu l'usuari d'aquest rol. Consulta [Rols](config/roles.html).

---

## Sessió tancada després d'un reinici o al cap d'un dia

Tots els usuaris tornen a la pàgina d'inici de sessió després que AnsibleForms es reiniciï, o després d'un dia d'ús.

**Per què passa**

Quan [`ACCESS_TOKEN_SECRET`](customization/security.html#env_ACCESS_TOKEN_SECRET) no està definit, cada inici genera una
clau de signatura nova, i registra
`[SECURITY] JWT signing secret was auto-generated. All tokens will be invalidated on restart. Set the ACCESS_TOKEN_SECRET environment variable for persistent token signing.`
Aleshores els tokens d'abans del
reinici ja no s'accepten. Independentment, una sessió acaba quan caduca el seu token de renovació
(`Refresh token is expired`), passat
[`ACCESS_TOKEN_REFRESH_EXPIRATION`](customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION), 24 hores per defecte.

**Com corregir-ho**

Defineix `ACCESS_TOKEN_SECRET` amb un valor fix i secret. Augmenta `ACCESS_TOKEN_REFRESH_EXPIRATION` si un dia és massa curt. Per a
un accés a l'API de llarga durada, fes servir un [token d'API](profile/api-token.html).

---

## Formularis i tasques buits després d'un inici de sessió únic (HTTP 431)

Un usuari inicia sessió amb Entra ID o OIDC sense cap error, però les pàgines de formularis i de tasques es queden buides. La pestanya
de xarxa del navegador mostra les crides a l'API respostes amb:

```
431 Request Header Fields Too Large
```

El registre del servidor no mostra res per a aquestes crides, i el mateix usuari pot funcionar bé amb un compte LDAP o local.

**Per què passa**

Abans de la 7.1.0, el token d'inici de sessió portava tots els grups de l'usuari, i els grups d'Entra ID hi eren dues vegades, per id d'objecte
i per nom. El navegador envia aquest token a la capçalera `Authorization` de cada petició, així que un usuari en uns cent
grups o més acaba amb una capçalera de bastant més de 16 KB. Node.js rebutja les capçaleres de petició de més de 16 KB amb un 431,
abans que la petició arribi a AnsibleForms, i per això no es registra res. Un servidor intermediari invers al davant pot rebutjar la
petició fins i tot abans: Nginx permet 8 KB per camp de capçalera per defecte
(`large_client_header_buffers 4 8k`), i respon 400.

**Com corregir-ho**

Actualitza a la 7.1.0 o posterior: el token d'inici de sessió ja no porta els grups, així que la seva mida ja no depèn de quants
grups té un usuari, i la interfície ho indica quan una petició es rebutja amb 431 en lloc de mostrar pàgines buides.
Mentre no puguis actualitzar, pots:

* definir un **Filtre de grups** al proveïdor a **Accés > SSO**, una expressió regular que només conservi els grups que fan servir els teus
  rols, consulta [Entra ID](authentication/entra-id.html) o [OIDC](authentication/oidc.html); l'usuari torna a iniciar sessió
  per obtenir un token més petit
* o augmentar el límit de Node.js amb la variable d'entorn `NODE_OPTIONS=--max-http-header-size=65536`, i
  reiniciar AnsibleForms

Des de la 7.1.0, [`MAX_HTTP_HEADER_SIZE`](customization/server.html#env_MAX_HTTP_HEADER_SIZE) defineix el mateix límit, 16384
bytes per defecte i llegit en iniciar-se, per a altres capçaleres grans, com ara cookies grans que defineix una passarel·la d'inici de sessió únic al
davant. Augmenta també els límits de capçalera del servidor intermediari, consulta [Mida de les capçaleres de petició](production/reverse-proxy.html#request-header-size).

---

## Playbook failed with status

Una tasca d'Ansible acaba com a fallida, i la darrera línia de la seva sortida és:

```
[ERROR]: Playbook failed with status (<code>)
```

**Per què passa**

`ansible-playbook` ha sortit amb un codi diferent de zero. Les línies de sobre contenen l'error del mateix Ansible: no s'ha pogut trobar el playbook,
un host no era accessible, una tasca ha fallat o l'inventari és incorrecte. El playbook es busca al repositori
amb **Utilitzar per als playbooks ?** activat, o a [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH); la línia del registre
`Running from directory : <path>` mostra la carpeta que s'ha fet servir.

**Com corregir-ho**

Llegeix la sortida de la tasca per sobre de la darrera línia. Quan no es troba el playbook, compara el `playbook` del formulari amb la
carpeta de `Running from directory`. Consulta [Formularis d'Ansible](forms/ansible.html).

---

## Playbook was aborted by the main process

Una tasca d'Ansible acaba com a fallida amb:

```
Playbook was aborted by the main process.  Likely some buffer or memory error occured.  Also check the maxBuffer option.
```

**Per què passa**

El procés `ansible-playbook` de l'RTE ha acabat per un senyal, i ningú no ha avortat la tasca. Des de la 7.0.0 la mida de la
sortida ja no ho provoca: passat [`PROCESS_MAX_BUFFER`](customization/server.html#env_PROCESS_MAX_BUFFER) (50 MB per flux
per defecte) la resta de la sortida no es desa, la tasca mostra
`[WARNING]: the stdout of this job passed PROCESS_MAX_BUFFER (<bytes> bytes) : the rest is not stored, the playbook goes on`,
i el playbook s'executa fins al final. Ara la causa habitual és la memòria: el contenidor de l'RTE ha arribat al seu límit de memòria i el
nucli ha matat el playbook, per exemple amb molts forks o facts grans.

**Com corregir-ho**

Comprova la memòria del contenidor de l'RTE mentre s'executa el playbook (`docker stats`, `kubectl top pod`) i augmenta'n el límit, o redueix
l'ús de memòria del playbook (menys `forks`, sense recollir facts innecessaris). Quan només veus l'avís de `PROCESS_MAX_BUFFER` i
necessites tota la sortida, augmenta `PROCESS_MAX_BUFFER` a l'entorn del contenidor de l'RTE; el llegeix l'RTE, no l'aplicació.
---

## Failed to launch awx template

Una tasca d'AWX acaba com a fallida, amb una sortida que comença amb:

```
failed to launch awx template <name>
```

**Per què passa**

La línia següent dona el motiu. `Request failed with status code 401` vol dir que es rebutja el token o el nom d'usuari i la contrasenya de la
credencial del runner d'AWX. `could not find job template <name>` vol dir que cap job template ni cap workflow job template
té exactament aquest nom, o que l'usuari de la connexió no el pot veure. Un error de certificat, com ara
`unable to verify the first certificate`, vol dir que el certificat d'AWX no és de confiança.

**Com corregir-ho**

Fes servir **Prova la connexió** al runner (**Connexions > Runners**), que respon `Runner connection is OK` quan funciona. Des de la
7.3.0 el token o l'usuari i la contrasenya, l'adreça i el **Paquet de CA** són a la credencial del runner, a
**Connexions > Credencials**: renova-hi el token o la contrasenya, i per als errors de certificat enganxa la CA al seu **Paquet de CA**.
Comprova el nom i els permisos de la plantilla. Introdueix l'adreça sense `/api/v2`: AnsibleForms hi afegeix
[`AWX_API_PREFIX`](customization/features.html#env_AWX_API_PREFIX) ell mateix.
Consulta [Formularis d'AWX](forms/awx.html).

---

## Una tasca mostra l'estat abandoned

Una tasca que s'estava executant ara està marcada com a `abandoned`, i el registre d'un node o d'un RTE mostra un d'aquests:

```
Abandoned <n> jobs this node followed before it restarted
Abandoned <n> jobs this worker followed before it restarted
Abandoned <n> jobs followed by a node that stopped answering
Job <id>: RTE '<name>' came back without it: abandoned
Abandoned <n> jobs
```

Un RTE en mode database, obsolet, registra els seus propis:

```
RTE: abandoned <n> job(s) left running by a previous start
RTE: stopping with <n> job(s) still running: they end as abandoned
```

**Per què passa**

Una tasca pertany al contenidor que l'executa o la segueix: un playbook al seu RTE, qualsevol altra tasca (una tasca d'AWX, els passos d'un formulari de
diversos passos) al node d'aplicació que la va iniciar. Quan aquest contenidor es reinicia, acaba les seves pròpies tasques no acabades. Quan desapareix, un
pod substituït per exemple, el worker acaba les seves tasques un cop fa dos minuts que no respon. Un RTE en un mode de socket que torna sense
una tasca que estava executant, un contenidor nou sense el seu spool per exemple, fa que aquesta tasca acabi com a abandonada. Un RTE que s'atura espera primer
[`RTE_DRAIN_SECONDS`](customization/server.html#env_RTE_DRAIN_SECONDS) els seus playbooks. Cada hora, les tasques que fa més
d'un dia que s'executen també es marquen com a abandonades.

Des de la 7.3.0 una tasca a AWX, AAP o Ascender continua al seu runner: just després que un reinici l'abandoni, un node la torna a seguir,
si s'ha iniciat en les darreres 24 hores, i acaba amb el que realment hi ha passat. Aleshores el registre diu `Following <n> abandoned job(s) again on their runner`.

**Com corregir-ho**

Rellança una tasca de playbook. Reinicia o actualitza els RTE i els nodes d'aplicació mentre no s'executi cap tasca, i dona prou temps a un RTE que s'atura
(consulta [Escalat](rte/run.html)). Comprova si el playbook realment ha acabat als hosts gestionats abans de
rellançar, perquè pot haver-se executat en part.

---

## Un RTE no es connecta

**Prova la connexió** en un runner RTE (**Connexions > Runners**) falla amb:

```
the RTE '<name>' (outbound) is not connected: it has not dialed the app: check its APP_URL, its token and the network from the RTE to the app
the RTE '<name>' (inbound) is not connected: no app node could dial it at <address>: check its RTE_URL, its token and the network from the app to the RTE
```

**Per què passa**

Un RTE en un mode de socket parla amb l'aplicació a través d'un WebSocket: en outbound truca a l'aplicació, en inbound l'aplicació el truca (consulta
[Modes](rte/modes.html)). Els registres de l'aplicació i de l'RTE diuen per què el socket no està obert:

| Missatge | On | Què vol dir |
|---|---|---|
| `RTE: refused a socket without the right token from <address>` | L'RTE (inbound) | El token de la credencial d'RTE del runner no és el `RTE_TOKEN` de l'RTE |
| `Runner '<name>': the RTE at <address> refused the socket (401): check its RTE_TOKEN` | L'aplicació (inbound) | El mateix, vist des de l'aplicació |
| `the token of RTE '<name>' is not the one stored for its runner: check its RTE_TOKEN` | L'aplicació, i l'RTE rebutjat (`401`) | L'RTE s'autentica amb un token diferent del que l'aplicació guarda per al seu runner |
| `RTE '<name>': waiting for an admin to approve it under Connections > Runners (fingerprint <fingerprint>)` | L'RTE (outbound) | Ha demanat unir-se i espera una aprovació |
| `RTE '<name>': asked to join as inbound runner '<name>': the app dials it once an admin approves it under Connections > Runners (fingerprint <fingerprint>)` | L'RTE (inbound, amb `APP_URL`) | El mateix, per a un RTE inbound |
| `runner '<name>' is managed by the config seed in database mode: set rte_mode: outbound for it in the seed (and its credential), then restart this RTE` | L'aplicació, i l'RTE rebutjat (`409`) | El config seed declara el runner sense `rte_mode`, per tant en mode database, i és el seed qui en decideix el mode. Un RTE inbound rep `rte_mode: inbound` i `(and its credential with the address the app dials, RTE_URL)` |
| `RTE: RTE_MODE=inbound with APP_URL registers with the app, which then dials RTE_URL : set RTE_URL (http://this-host:8000) ; refusing to start` | L'RTE | Un RTE inbound que es registra ell mateix necessita l'adreça on el truca l'aplicació |
| `Runner '<name>': dialing <address>: <reason>` | L'aplicació, al nivell `debug` | L'aplicació no pot obrir el socket, per exemple perquè el certificat de l'RTE no és el fixat per al seu runner |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set): it holds the database's credentials and reads and writes it itself. Set RTE_MODE=outbound (it dials the app, APP_URL) or RTE_MODE=inbound (the app dials it, RTE_URL), and drop DB_* from its environment. Database mode is removed in 8.0.0.` | L'RTE | S'executa en mode database, i no obre cap socket |

**Com corregir-ho**

* **Un token rebutjat** : dona a l'RTE el token de la credencial d'RTE del seu runner (**Connexions > Credencials**), o a l'inrevés
* **Esperant aprovació** : aprova'l a **Connexions > Runners**, després de comprovar que l'empremta que s'hi mostra és la del seu
  registre (consulta [Aprovar un RTE](runners/registration.html#approving-an-rte))
* **Gestionat pel config seed en mode database** : defineix `rte_mode` al runner al seed, amb una credencial d'RTE (per a inbound, la seva
  adreça), i després reinicia l'RTE
* **Inbound sense `RTE_URL`** : defineix `RTE_URL` amb l'adreça per on l'aplicació arriba a l'RTE, o deixa fora `APP_URL` i declara el
  runner al seed o a **Connexions > Runners**
* **Un certificat que no és el fixat** : un RTE inbound per HTTPS envia el seu certificat quan es registra, i l'aplicació només el truca
  amb aquell. Després d'un certificat nou, l'RTE el torna a enviar quan es registra; quan el paquet de CA de la credencial s'ha definit
  a mà, l'aplicació el conserva i registra
  `Runner '<name>': its ca_bundle was set by hand: the certificate its RTE sent (fingerprint <fingerprint>) is not stored. Empty the ca_bundle to have the RTE's certificate pinned again`
* **L'avís [DEPRECATED]** : defineix `RTE_MODE` a l'RTE, treu `DB_*` del seu entorn, i posa el seu runner en aquest mode (consulta
  [Modes](rte/modes.html))

---

## The form data is not valid

Amb la validació del llançament a `enforce`, un llançament es rebutja amb `422` i:

```
The form data is not valid
```

**Per què passa**

El servidor ha comprovat els valors dels camps amb les regles del formulari i ha trobat camps que falten o que no són vàlids; la resposta els llista
a `details`. També es rebutja un llançament sense `rawFormData`. Un formulari que encara no es pot comprovar, com ara un assistent,
es rebutja amb `Form '<name>' cannot be launched with launch validation 'enforce' yet : <reason>`.

**Com corregir-ho**

Corregeix els camps que indiquen els detalls, o les regles del formulari si són massa estrictes. Executa primer en mode `log`: registra
`Launch validation would refuse form '<name>' ...` sense rebutjar res. Consulta
[Què fa enforce](launch-validation/log-and-enforce.html#what-enforce-does) i
[Desplegar-la](launch-validation/rolling-it-out.html).

---

## Falla el clonatge o el pull d'un repositori

Un repositori mostra un estat fallit, i la seva sortida conté l'error de git, o el registre mostra
`Background clone of '<name>' failed : <reason>`.

**Per què passa**

Git no ha pogut arribar al remot o autenticar-s'hi. Per als URL SSH (`git@host:path`), el remot ha d'acceptar la clau pública
d'AnsibleForms; per a HTTPS, el nom d'usuari i el token han de ser vàlids. També es rebutja un pull quan l'arbre de treball té
canvis, amb
`Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.`

**Com corregir-ho**

Per a SSH, copia la clau pública de la pestanya **Clau** de **Connexions > SSH** i afegeix-la com a deploy key, o a un usuari amb
accés al repositori. AnsibleForms afegeix l'host remot als amfitrions coneguts en un clonatge; per a altres hosts, fes servir la
pestanya **Amfitrions coneguts** de la mateixa pàgina. Per a
HTTPS, renova el token. Consulta [Repositoris git](gui/designer-and-git.html#git-repositories) i
[Sobre els repositoris](faq.html#about-repositories).

---

## El repositori de formularis encara no està clonat

Desar formularis al dissenyador falla amb:

```
The forms repository '<name>' is not cloned yet ; clone it from the repositories settings first
```

**Per què passa**

Un repositori amb **Utilitzar per als formularis ?** activat encara no té arbre de treball, perquè el clonatge no s'ha executat o ha fallat.

**Com corregir-ho**

Clona el repositori des de la configuració de repositoris. Si el clonatge falla, consulta
[Falla el clonatge o el pull d'un repositori](#a-repository-clone-or-pull-failed).

---

## Falla una còpia de seguretat

Una còpia de seguretat falla, i no s'afegeix res a la llista de còpies de seguretat. El motiu és un d'aquests:

```
'mariadb-dump' was not found on this system. Install the mysql/mariadb client tools, or set MYSQLDUMP_COMMAND to a command that works here.
The database dump is empty, '<file>' was not written
The command timed out
```

**Per què passa**

L'ordre de bolcat, [`MYSQLDUMP_COMMAND`](customization/retention.html#env_MYSQLDUMP_COMMAND), no està instal·lada, no s'ha pogut
connectar, o ha generat un fitxer buit. Una base de dades gran també pot trigar més de
[`BACKUP_COMMAND_TIMEOUT_SECONDS`](customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS), una hora per defecte.
Una còpia de seguretat fallida no deixa cap carpeta; el registre diu `Backup failed, removing the incomplete folder '<folder>' : <reason>`.

**Com corregir-ho**

Instal·la les eines de client de MySQL o MariaDB, o defineix `MYSQLDUMP_COMMAND` (i `MYSQL_COMMAND` per a les restauracions) amb una ordre
que funcioni en aquest host i amb la versió del teu servidor. Augmenta `BACKUP_COMMAND_TIMEOUT_SECONDS` per a una base de dades gran.
Consulta [Còpies de seguretat](gui/administration.html#backups).
