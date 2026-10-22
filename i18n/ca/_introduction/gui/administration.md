---
layout: default
title: Administració
parent: Recorregut per la interfície
nav_order: 3
redirect_from:
  - /gui/settings.html
  - /gui/ldap-configuration.html
  - /gui/credential-manager.html
  - /gui/backups.html
  - /gui/restore.html
  - /gui/server-log.html
  - /gui/swagger-interface.html
translated_from: 65b6b65919b22de7d7973732ebd29647e20f3184
---

# Administració
{: .no_toc }

El menú Configuració: el sistema, la seva aparença, l'accés, les connexions i els registres
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## El menú Configuració

**Configuració** a la capçalera obre les pàgines d'administració, agrupades al menú de l'esquerra a **Sistema**, **Aparença**,
**Accés**, **Connexions** i **Registres**. Cada entrada només es mostra a un usuari amb l'opció de rol que necessita la seva pàgina:
`allowBackupOps` per a **Còpies de seguretat**, `showLogs` per a **Registre del servidor** i `showSettings` per a totes les altres pàgines.
Des de la 7.3.0, tres opcions n'obren una part sense la resta:

| Opció de rol | Obre |
|---|---|
| `showAppearanceSettings` | Les pàgines d'**Aparença** |
| `showConnectionsSettings` | Les pàgines de **Connexions**, excepte **Syslog**; els repositoris, els magatzems de secrets i les credencials protegides només els pot canviar un administrador |
| `showAuditLog` | El **Registre d'auditoria** |

Consulta [Rols](../config/roles.html#role-options) per veure les opcions de rol.

---

## Llistes i pàgines de registre

Des de la 7.3.0, les llistes de configuració i les pàgines de cada registre comparteixen un mateix disseny, amb els controls en una fila pròpia sota el títol:

| Part | Com funciona |
|---|---|
| Quadre de cerca | El primer d'aquesta fila a totes les pàgines de configuració i de registre. Una paraula filtra totes les pestanyes alhora: els camps, les files o les línies que coincideixen es mostren sota el nom de la seva pestanya |
| Mida de pàgina | Una taula mostra tantes files com caben a la pantalla fins que es tria una mida de pàgina: 10, 20, 50 o 100 |
| Columnes | Totes les columnes amb nom es poden ordenar, i una cel·la buida mostra `–` |
| Caselles | Les files només en tenen on es pot fer alguna cosa amb les files marcades, i el menú de la fila (⋮) ofereix la mateixa acció |
| Menú de la fila | Etiquetes curtes, com ara **Edita** i **Suprimeix**. Una llista amb una columna **Activat** la té en primer lloc, i ofereix **Activa** o **Desactiva** al menú de cada fila, segons correspongui |

Les llistes amb una columna **Activat** són els proveïdors d'SSO, els directoris LDAP, els runners, les programacions, els canals de
notificació, els servidors syslog, els anuncis, les etiquetes i les versions de l'avís legal.

---

## Sistema

La mateixa instància: la seva configuració, el seu estat de salut i les seves còpies de seguretat.

| Pàgina | Per a què serveix |
|---|---|
| **General** | Les variables d'entorn, en pestanyes de Configuració a Registre. Consulta [Variables d'entorn](../customization/). |
| **Estat** | La salut de la instància i dels sistemes dels quals depèn, a les pestanyes Comprovacions i Informació. Consulta [Monitoratge](../production/monitoring.html). |
| **Còpies de seguretat** | Fer, restaurar i suprimir còpies de seguretat de la base de dades, config.yaml i els formularis. Consulta [Còpies de seguretat](../production/backups.html). |

![Configuració > General, la pestanya Configuració](../assets/screenshots/settings.jpg)

### Còpies de seguretat

La llista de còpies de seguretat, nocturnes i manuals: **Afegeix una còpia de seguretat** en fa una en aquell moment, i el menú d'una fila té **Mostra la còpia de seguretat**, **Restaura** i **Suprimeix**.

![Configuració > Còpies de seguretat](../assets/screenshots/backups.jpg)

### Restaurar

**Restaura** mostra el que conté la còpia de seguretat i després la restaura; **Crea una còpia de seguretat nova abans de restaurar (recomanat)** està marcada per defecte.

![Restaurar una còpia de seguretat](../assets/screenshots/restore.jpg)

---

## Aparença

Com es veu la instància per a tothom, i els missatges que mostra.

| Pàgina | Per a què serveix |
|---|---|
| **Valors predeterminats** | El tema, l'idioma, la vista de formularis, la zona horària i el format de data dels usuaris que no n'han triat cap. Consulta [Valors predeterminats](../appearance/defaults.html). |
| **Nom** | El nom a la pestanya del navegador i a la pàgina d'inici de sessió. Consulta [Nom](../appearance/name.html). |
| **Logotip** | El teu propi logotip a la capçalera. Consulta [Logotip](../appearance/logo.html). |
| **Icona** | La teva pròpia icona a la pestanya del navegador. Consulta [Icona](../appearance/icon.html). |
| **Enllaços** | L'enllaç al Dissenyador, i els teus propis enllaços i menús a la capçalera. Consulta [Enllaços](../appearance/links.html). |
| **Etiquetes** | Etiquetes al costat del logotip, com ara PRODUCTION i EU. Consulta [Etiquetes](../appearance/labels.html). |
| **Anuncis** | Missatges sota la capçalera, cadascun des del seu inici fins al seu final. Consulta [Anuncis](../announcements.html). |

---

## Accés

Qui pot iniciar sessió, i què pot fer un cop dins.

| Pàgina | Per a què serveix |
|---|---|
| **Avís legal** | Condicions que cada usuari accepta una vegada, i qui ha acceptat quina versió. Consulta [Avís legal](../disclaimer.html). |
| **Usuaris** | Els usuaris locals, i els de LDAP i d'inici de sessió únic. Consulta [Usuaris i grups](../users-and-groups.html). |
| **Grups** | Els grups locals, i els de LDAP i d'inici de sessió únic. Consulta [Usuaris i grups](../users-and-groups/local-group.html). |
| **Rols** | Els rols de config.yaml: qui els té i què permeten. Consulta [Rols](../config/roles.html). |
| **LDAP** | Inici de sessió amb un directori LDAP o Active Directory. Consulta [LDAP](../authentication/ldap.html). |
| **SSO** | Inici de sessió únic amb proveïdors d'Entra ID o OpenID Connect. Consulta [Autenticació](../authentication/). |

![Accés > LDAP, el directori principal](../assets/screenshots/ldap.jpg)

---

## Connexions

Els sistemes als quals accedeix AnsibleForms, i amb què hi inicia sessió.

| Pàgina | Per a què serveix |
|---|---|
| **Repositoris** | Els repositoris git d'on vénen els formularis i els playbooks. Consulta [Repositoris git](../repositories/). |
| **Credencials** | Els comptes i els secrets que fan servir els formularis, els playbooks i les connexions. Consulta [Credencials](../credentials.html). |
| **Magatzems de secrets** | HashiCorp Vault i CyberArk, d'on es poden llegir les credencials. Consulta [Magatzems de secrets](../secret-stores/). |
| **Runners** | On s'executen les tasques: contenidors RTE per als playbooks, i AWX i similars per a les plantilles. Consulta [Runners](../runners.html). |
| **SSH** | El parell de claus amb què l'aplicació es connecta a git, i els amfitrions coneguts. Consulta [SSH](../repositories/authentication.html#ssh-with-the-generated-key). |
| **Notificacions** | Servidors SMTP, Slack, Microsoft Teams, Telegram i webhooks. Consulta [Canals de notificació](../notification-channels.html). |
| **Assistent de xat** | El proveïdor d'IA de l'assistent de xat. Consulta [Assistent de xat](../chat/). |
| **MCP** | El servidor MCP per a agents d'IA. Consulta [MCP](../mcp/). |
| **Syslog** | Servidors syslog que reben el registre del servidor, el registre d'auditoria o tots dos. Consulta [Syslog](../production/logs.html#syslog). |

![Connexions > Credencials, la pestanya Connexió d'una credencial](../assets/screenshots/credentials.jpg)

---

## Registres

El que ha passat a la instància.

| Pàgina | Per a què serveix |
|---|---|
| **Registre d'auditoria** | Qui ha canviat què, i si estava permès, filtrat per usuari, acció i resultat. Consulta [Traça d'auditoria](../production/logs.html#audit-trail). |
| **Registre del servidor** | El registre propi del servidor, per resoldre problemes. Consulta [Registres](../production/logs.html). |

### Registre del servidor

Les darreres línies del registre, les més noves a baix, que se segueixen a mesura que s'escriuen. El quadre de cerca les filtra (una expressió
regular), **Neteja** buida la vista, no el registre, i **Baixa** desa el registre complet.

![Registres > Registre del servidor](../assets/screenshots/logs.jpg)

---

## Documentació de l'API

**Documentació de l'API** al menú d'ajuda (el signe d'interrogació de la capçalera) enllaça a la interfície Swagger de l'API REST a `/api/v2/docs`.
Consulta [API](../api/).

![Interfície Swagger](../assets/screenshots/swagger.jpg)
