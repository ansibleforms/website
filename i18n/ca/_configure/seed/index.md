---
layout: default
title: Llavor de configuració
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
translated_from: 030ff83b1d7c3920600b7e0668b05ab24b949b67
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

Posa a `CONFIG_SEED_PATH` un fitxer YAML, i AnsibleForms l'aplica en arrencar. El fitxer
declara objectes que abans només existien a la base de dades:

| Secció                  | Què declara                                                         |
|-------------------------|---------------------------------------------------------------------|
| `runners`               | On s'executen les tasques: RTE, AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins |
| `secret_stores`         | Magatzems de secrets (HashiCorp Vault, ...)                         |
| `credentials`           | Credencials                                                         |
| `oauth2`                | Proveïdors SSO: Entra ID i OIDC                                     |
| `repositories`          | Repositoris git                                                     |
| `syslog_servers`        | Els servidors syslog que reben el registre del servidor i les entrades d'auditoria |
| `notification_channels` | Servidors de correu, Slack, Teams, Telegram i webhooks per a les notificacions |
| `labels`                | Les etiquetes al costat del logotip de la capçalera, des de la 7.3.0 |
| `ldap`                  | La configuració de LDAP                                             |
| `settings`              | La URL pública, i els ajustos de correu que es fan servir quan no hi ha cap canal de correu actiu |
| `chat`                  | El proveïdor de models de l'assistent de xat                        |
| `awx`                   | Obsolet des de la 7, eliminat a la 8: fes servir `runners` amb `type: awx` |

Una llavor escrita abans de la 7 continua funcionant: cada element de la seva secció `awx` s'aplica com un runner de tipus `awx`, i el registre
n'avisa a cada aplicació. Mou aquests elements a `runners` amb `type: awx` abans d'actualitzar a la 8.

La llavor **no** és el mateix que `config.yaml`, que conté les categories, els rols i les constants
i té el seu propi `CONFIG_PATH`. Totes dues coses es mantenen separades a propòsit: el
repositori que *conté* `config.yaml` és un dels objectes que declara la llavor, de manera que la llavor
no pot viure a dins seu.

Els usuaris i els grups en queden fora: vénen de LDAP o SSO, i el primer admin d'`ADMIN_USERNAME` / `ADMIN_PASSWORD`.

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

