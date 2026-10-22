---
layout: default
title: Enduriment
parent: Seguretat
nav_order: 1
redirect_from:
  - /production/hardening.html
translated_from: be22a8ac091b17a67815ab392de93cd0ff519dd9
---

# Enduriment
{: .no_toc }

El compte d'admin, els límits d'inici de sessió, la base de dades, les expressions, les dades de les tasques, la política del navegador, les funcions opcionals i les opcions de rol
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## El compte d'admin

El compte d'admin local es crea a la primera arrencada a partir d'[`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME)
i [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD), el valor predeterminat del qual és `AnsibleForms!123`.

* Un inici de sessió amb la contrasenya predeterminada pública `AnsibleForms!123` l'ha de canviar primer: fins aleshores el servidor respon
  a qualsevol petició excepte el canvi de contrasenya amb `403` (codi `password_change_required`), i el navegador mostra una
  pàgina de canvi de contrasenya que no es pot tancar. La contrasenya nova no pot tornar a ser la predeterminada.
* `ADMIN_PASSWORD` només es llegeix quan es crea el compte per primera vegada: defineix el teu propi valor abans de la primera arrencada.
* [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN)`=1` restableix la contrasenya a `ADMIN_PASSWORD` a cada
  arrencada. Fes-lo servir només per recuperar una contrasenya perduda, i després treu-lo i reinicia.
* Defineix primer els dos secrets mestres: vegeu [Secrets i xifratge](secrets.html).
* Quan l'inici de sessió per LDAP o SSO funcioni, conserva l'admin local només per a emergències, amb una contrasenya llarga desada al teu gestor de contrasenyes.

---

## Límits d'inici de sessió i contrasenyes

L'endevinament de contrasenyes es frena amb tres límits. Els errors es compten a la base de dades, de manera que tots els nodes d'aplicació veuen
els mateixos intents, i tots els límits s'apliquen sense reiniciar:

| Variable | Predeterminat | Què fa |
|----------|---------|--------------|
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | `5` | Després d'aquest nombre d'inicis de sessió fallits, un compte local o LDAP es bloqueja durant `LOGIN_LOCKOUT_MINUTES`. |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | `30` | Una adreça amb aquest nombre d'inicis de sessió fallits dins de `LOGIN_LOCKOUT_MINUTES` queda retinguda fins que acaba aquesta finestra: una adreça que prova molts comptes. |
| [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) | `15` | Quant de temps es manté bloquejat un compte, i la finestra en què es compten els errors. |
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | `120` | Peticions per minut des d'una adreça, per node d'aplicació, a l'inici de sessió, el tancament de sessió, la renovació del token i els retorns de l'inici de sessió únic. |

Un compte bloquejat o una adreça retinguda reben `429` amb una capçalera `Retry-After`, abans que es comprovi cap contrasenya i
tant si el compte existeix com si no; per sobre d'`AUTH_RATE_LIMIT` la resposta també és `429`. Un inici de sessió correcte esborra el
recompte del compte, i també ho fa un admin que posa la contrasenya de l'usuari. `0` desactiva un límit; `LOGIN_LOCKOUT_MINUTES=0`
desactiva tant el bloqueig com el límit per adreça.

`LOGIN_MAX_FAILURES_PER_IP` i `AUTH_RATE_LIMIT` compten per adreça de client: darrere d'un proxy invers, defineix `TRUST_PROXY`
perquè l'adreça sigui la del client i no la del proxy, vegeu [Adreces dels clients](../production/reverse-proxy.html#client-addresses).

Una contrasenya local definida a través de l'aplicació, per a un usuari nou, per un admin o pels usuaris que canvien la seva, ha de tenir
almenys [`PASSWORD_MIN_LENGTH`](../customization/security.html#env_PASSWORD_MIN_LENGTH) caràcters (`8` per defecte,
`0` no comprova cap longitud). No pot ser el nom d'usuari ni la contrasenya predeterminada pública. `ADMIN_PASSWORD` no es comprova.

---

## La base de dades

AnsibleForms conserva totes les credencials i totes les tasques a la seva base de dades MySQL, així que mantén aquesta base de dades fora de la xarxa:

* El projecte docker-compose publica MySQL a l'amfitrió (`MYSQLDB_LOCAL_PORT`, `3306`) i ve amb la contrasenya de root
  `AnsibleForms!123`. Treu aquest mapatge de port, o lliga'l a `127.0.0.1`, i canvia la contrasenya.
* Connecta't amb un compte dedicat en lloc de `root`, definit a [`DB_USER`](../customization/server.html#env_DB_USER) i
  [`DB_PASSWORD`](../customization/server.html#env_DB_PASSWORD). Només necessita permisos sobre l'esquema `AnsibleForms`:

  ```sql
  CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
  GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
  ```

  Això cobreix la creació de l'esquema (el `CREATE DATABASE` inclòs), l'aplicació de pedaços a les actualitzacions, i les
  [còpies de seguretat](../production/backups.html) i restauracions, que s'executen amb el mateix usuari: el bolcat es fa amb
  `--no-tablespaces`, de manera que no cal cap permís de tot el servidor com ara `PROCESS`. Substitueix `%` per l'adreça de
  l'aplicació sempre que puguis. Un usuari amb permisos sobre totes les bases de dades, com en té `root`, converteix un forat a l'aplicació en
  un forat a tot el servidor de bases de dades: la pàgina **Estat** n'avisa a la comprovació **Usuari de la base de dades**, i el registre
  a cada arrencada.
* Posa [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) a `0` un cop existeix l'esquema.
  Crear l'esquema elimina primer totes les taules; amb `0` ni l'arrencada inicial ni l'endpoint `/api/v2/schema`
  ho poden executar.

---

## Expressions i crides de sortida

Les expressions del servidor s'executen al servidor per a qualsevol usuari que hagi iniciat sessió, així que el sanejador i els filtres de sortida importen:

* [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) : `strict` o `paranoid`, mai `legacy`, que permet als usuaris executar codi al servidor.
* [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) : hosts als quals no poden arribar les expressions REST, p. ex. `169.254.169.254,127.0.0.0/8`.
* [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) : quan està definida, les expressions REST només poden arribar
  a aquests hosts i rangs. La llista de denegats hi guanya.

Totes dues llistes només cobreixen les funcions auxiliars REST del mateix AnsibleForms; els playbooks s'executen fora i no es filtren.

Des de la 7.3.0 les funcions auxiliars REST comproven el certificat de l'endpoint, com fan totes les altres connexions.
[`REST_IGNORE_CERTS`](../customization/security.html#env_REST_IGNORE_CERTS)`=1` desactiva la comprovació: fes-lo servir només per a
endpoints amb un certificat autosignat.

---

## Dades de les tasques

Les extravars i la sortida de les tasques es desen a la base de dades i es mostren a tothom qui pot veure la tasca:

* [`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX) : les extravars la clau de les quals coincideix
  es mostren com a `********`. El valor predeterminat és `password|secret|token`; els camps de contrasenya sempre s'emmascaren. Amplia'l amb
  els noms que fan servir els teus formularis, per exemple `password|secret|token|apikey|passphrase`.
* [`EXTRAVARS_USER_FIELDS`](../customization/security.html#env_EXTRAVARS_USER_FIELDS) : retalla l'objecte `ansibleforms_user`
  que s'envia amb cada tasca, que si no conté tota la pertinença a grups de l'usuari.
* [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT) només amaga tasques sorolloses; amaga els secrets amb `no_log`.

---

## La Content-Security-Policy

La interfície se serveix amb una capçalera Content-Security-Policy, que limita què pot carregar i executar una pàgina al navegador:

* Els scripts només vénen de la mateixa aplicació, de manera que un script injectat en una pàgina no s'executa.
* Cap altre lloc web no pot mostrar la interfície dins d'un frame.
* Permet el que necessita l'aplicació: les expressions locals dels formularis avaluades al navegador (`'unsafe-eval'`), els estils
  en línia, imatges de qualsevol URL (imatges de formularis i de categories), i els workers de l'editor de codi.

[`CONTENT_SECURITY_POLICY`](../customization/security.html#env_CONTENT_SECURITY_POLICY) és `1` per defecte i s'hi hauria de
quedar. Amb `0` la política s'envia com a `Content-Security-Policy-Report-Only`: la consola del navegador llista el que
bloquejaria, i no es bloqueja res. Fes servir `0` només per a una configuració que encara no pot funcionar amb la política, com ara un proxy invers
que injecta un script propi. Un canvi a la pàgina de configuració s'aplica sense reiniciar.

---

## Les pàgines de configuració i el dissenyador

Els administradors poden canviar bona part de la configuració des del navegador. Restringeix-ho quan la configuració viu en un altre lloc:

* [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0` : configuració només de lectura, per a un [entorn gestionat](../seed/environment-and-audit.html).
* [`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER)`=0` : treu el dissenyador integrat quan els formularis
  es mantenen a git.

---

## Funcions opcionals

Aquestes funcions estan desactivades per defecte. Activa-les només quan les facis servir; un canvi a la pàgina de configuració s'aplica sense reiniciar:

* [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) : serveix el [servidor MCP](../mcp/) a `/api/v2/mcp`,
  perquè els clients MCP puguin llançar formularis amb el token d'un usuari.
* [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT) : l'[assistent de xat](../chat/). Les definicions dels formularis
  i els valors que s'estan omplint s'envien al proveïdor de models configurat.

[`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) funciona al revés: és `enforce`
per defecte, de manera que el servidor rebutja un llançament els valors del qual incompleixen les regles del formulari, inclosos els llançaments per l'API REST.
Deixa-la així: `log` només registra el que es rebutjaria i `off` no comprova res, vegeu [Validació del llançament](../launch-validation/).

---

## Opcions de rol

Algunes opcions de rol de [config.yaml](../config/roles.html) donen més del que suggereix el seu nom. Concedeix-les amb cura:

| Opció | Per què importa |
|--------|----------------|
| `allowScheduledJobs` | Un usuari que la té veu i pot canviar totes les programacions, i una programació s'executa amb drets d'admin, per a qualsevol formulari. Tracta-la com una opció de nivell d'admin. |
| `allowBackupOps` | Inclou la **restauració**, que substitueix tota la base de dades. |
| `showSettings` | Obre les pàgines d'administració. Sense el rol admin, no pot canviar els comptes i els grups que nomena el rol admin, vegeu [Usuaris i grups](../users-and-groups.html#accounts-that-grant-admin). |
| `showLogs` | Mostra el registre del servidor, que pot contenir noms de host, noms d'usuari i detalls d'errors. |
| `showConnectionsSettings` | Obre les pàgines de connexions: credencials, runners, canals de notificació i més. Afegir, canviar i suprimir runners i magatzems de secrets continua sent cosa d'un admin, i també les credencials de les connexions i dels inicis de sessió. D'un repositori, afegir-lo o suprimir-lo i canviar-ne l'adreça, la branca o els indicadors `use_for_*` continua sent cosa d'un admin. |
| `showAllJobLogs` | Mostra les tasques de tots els usuaris, no només les de l'usuari. |
| `manageAllJobs` | Avorta, suprimeix i torna a llançar les tasques de tots els usuaris. |
| `allowApiTokens` | Permet a l'usuari crear tokens d'API que duren fins a [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) (90 per defecte). Tancar la sessió amb un token o revocar-lo l'acaba, i un canvi de contrasenya acaba tots els tokens de l'usuari, vegeu [Tokens](secrets.html#tokens). |
| `extendedTokenExpiration` | Amb `allowApiTokens`, també permet a l'usuari crear tokens d'API que no caduquen mai. |
| `allowFileUploads` | Permet a l'usuari pujar fitxers mitjançant els camps de fitxer d'un formulari. Activada per a tots els usuaris tret que un rol la desactivi. |
| `allowChat`, `allowMcp` | Permeten a l'usuari fer servir l'assistent de xat i el servidor MCP, quan estan activats. `allowChat` està activada per a tots els usuaris tret que un rol la desactivi, i `allowMcp` segueix `allowChat` tret que un rol la defineixi. |

Un usuari sense el rol `admin` no rep cap de les opcions de nivell d'admin de més amunt tret que un rol les hi doni. Quan el rol `admin`
no defineix cap opció, els seus usuaris reben `showSettings`, `showDesigner`, `showLogs`, `showAuditLog`, `allowBackupOps`,
`allowJobRelaunch`, `showAllJobLogs`, `manageAllJobs` i `allowScheduledJobs`. `allowApiTokens` i
`extendedTokenExpiration` continuen desactivades fins i tot per al rol `admin`: defineix-les als rols que les necessiten.

Quan diversos rols d'un usuari defineixen la mateixa opció, guanya `false`. Les opcions del rol `default` només completen les opcions
que no defineix cap dels rols propis de l'usuari; mai no les anul·len.
