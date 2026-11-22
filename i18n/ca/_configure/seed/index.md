---
layout: default
title: Llavor de configuració
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
translated_from: 45ee9fce4b7686786567d06efd6eceddf3ab4c76
---

# Llavor de configuració
{: .no_toc }

Declara els objectes d'administració en un fitxer
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per a administradors que aprovisionen des de git: declara els objectes d'administració en un fitxer, perquè una instància es pugui reconstruir sobre una base de dades buida.

---

## Què cobreix

Posa a `CONFIG_SEED_PATH` un fitxer YAML, i AnsibleForms l'aplica en arrencar. El fitxer declara objectes i ajustos que altrament
només existeixen a la base de dades:

| Secció             | Què declara                                                                       |
|--------------------|-----------------------------------------------------------------------------------|
| `runners`          | On s'executen les tasques: RTE, AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins |
| `secret_stores`    | Magatzems de secrets (HashiCorp Vault, ...)                                       |
| `credentials`      | Credencials                                                                       |
| `databases`        | Les bases de dades que consulten els formularis, cadascuna amb la seva credencial, des de la 7.5.0 |
| `sso`              | Proveïdors SSO: Entra ID i OIDC (`oauth2` abans de la 7.8.0)                      |
| `repositories`     | Repositoris git, i què en llegeix l'aplicació de cadascun                         |
| `syslog`           | Els servidors syslog que reben el registre del servidor i les entrades d'auditoria (`syslog_servers` abans de la 7.8.0) |
| `notifications`    | Servidors de correu, Slack, Teams, Telegram i webhooks (`notification_channels` abans de la 7.8.0) |
| `labels`           | Les etiquetes al costat del logotip de la capçalera, des de la 7.3.0               |
| `ldap`             | La configuració de LDAP                                                           |
| `settings`         | La URL pública; les seves claus de correu són obsoletes des de la 7.6.0, en favor d'un canal de correu |
| `chat_assistant`   | El proveïdor de models de l'assistent de xat (`chat` abans de la 7.8.0)           |
| `users`            | Usuaris, locals i d'un directori, des de la 7.8.0                                 |
| `groups`           | Grups locals i els seus membres, des de la 7.8.0                                  |
| `defaults`         | **Configuració > Aparença > Valors predeterminats**: tema, idioma, zona horària, des de la 7.8.0 |
| `logo`, `icon`     | El logotip i la icona del lloc web, fitxers d'imatge al costat de la llavor, des de la 7.8.0 |
| `name`             | El nom de l'aplicació, des de la 7.8.0                                            |
| `links`            | Els enllaços de la capçalera, i si es mostra l'enllaç del Designer, des de la 7.8.0 |
| `announcements`    | Els anuncis sota la capçalera, des de la 7.8.0                                    |
| `disclaimer`       | Les versions de l'avís legal que accepten els usuaris, des de la 7.8.0            |
| `mcp`              | Els interruptors del servidor MCP, des de la 7.8.0                                |
| `ssh`              | La clau privada SSH de l'aplicació i els seus amfitrions coneguts, des de la 7.8.0 |
| `awx`              | Obsolet des de la 7, eliminat a la 8: fes servir `runners` amb `type: awx`        |

L'[Exemple](example.html) mostra totes les seccions, i [Objectes gestionats](managed-objects.html) fins on és propietària la llavor del que
declara cadascuna: la majoria de seccions fan que els seus objectes siguin només de lectura a l'aplicació, unes poques només els creen o els canvien.

Una llavor escrita abans de la 7 continua funcionant: cada element de la seva secció `awx` s'aplica com un runner de tipus `awx`, i el registre
n'avisa a cada aplicació. Mou aquests elements a `runners` amb `type: awx` abans d'actualitzar a la 8.

La llavor **no** és el mateix que `config.yaml` (`CONFIG_PATH`), la configuració de base de les categories, els rols i les constants. Un
repositori els pot contenir en lloc seu, i aquest repositori és un dels objectes que declara la llavor, de manera que la llavor no pot viure a dins seu.

El primer admin continua venint d'`ADMIN_USERNAME` / `ADMIN_PASSWORD`, i els usuaris de LDAP o SSO del seu directori en iniciar sessió.
Des de la 7.8.0 les seccions `users` i `groups` poden afegir usuaris i grups locals, i bloquejar un usuari d'un directori abans que iniciï sessió.

---

## Seccions reanomenades

Des de la 7.8.0 quatre seccions porten el nom de les claus amb què un [repositori git](../repositories/) desa els mateixos objectes, sense
`controller_` (`sso:` per a `controller_sso:`):

| Abans de la 7.8.0         | Des de la 7.8.0    |
|---------------------------|--------------------|
| `oauth2:`                 | `sso:`             |
| `syslog_servers:`         | `syslog:`          |
| `notification_channels:`  | `notifications:`   |
| `chat:`                   | `chat_assistant:`  |

Els seus elements no canvien. Els noms antics encara es llegeixen, obsolets des de la 7.8.0 i eliminats a la 8: cadascun que s'aplica
registra un avís al registre del servidor, amb el nom nou. Una llavor que dona una mateixa secció amb tots dos noms es rebutja. Reanomena-les
al fitxer abans d'actualitzar a la 8.

---

## En aquesta secció

Cada tema té la seva pròpia pàgina:

| Pàgina | Què hi trobaràs |
|---|---|
| [Exemple](example.html) | Un fitxer de llavor complet, secció per secció |
| [Objectes gestionats](managed-objects.html) | Com la llavor és propietària dels objectes que llista, i com manté els secrets fora |
| [Recàrrega i arrencada](reloading.html) | Canviar el fitxer sense reiniciar, i què passa en arrencar |
| [Kubernetes](kubernetes.html) | Aprovisionar AnsibleForms des d'un ConfigMap i Secrets |
| [Edició i auditoria](environment-and-audit.html) | Bloquejar les pàgines de configuració, i què registra el registre d'auditoria |

