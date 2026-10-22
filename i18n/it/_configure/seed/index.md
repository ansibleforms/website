---
layout: default
title: Config seed
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
translated_from: 030ff83b1d7c3920600b7e0668b05ab24b949b67
---

# Config seed
{: .no_toc }

Dichiara gli oggetti di amministrazione in un file
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per gli amministratori che fanno provisioning da git: dichiara gli oggetti di amministrazione in un file, così un'istanza si può ricostruire su un database vuoto.

---

## Cosa copre

Imposta `CONFIG_SEED_PATH` su un file YAML, e AnsibleForms lo applica all'avvio. Il file
dichiara oggetti che prima esistevano solo nel database:

| Sezione                 | Cosa dichiara                                                       |
|-------------------------|---------------------------------------------------------------------|
| `runners`               | Dove girano i job: RTE, AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins |
| `secret_stores`         | Archivi di segreti (HashiCorp Vault, ...)                           |
| `credentials`           | Credenziali                                                         |
| `oauth2`                | Provider SSO: Entra ID e OIDC                                       |
| `repositories`          | Repository git                                                      |
| `syslog_servers`        | I server syslog che ricevono il log del server e le voci di audit   |
| `notification_channels` | Server mail, Slack, Teams, Telegram e webhook per le notifiche      |
| `labels`                | Le etichette accanto al logo dell'intestazione, dalla 7.3.0          |
| `ldap`                  | La configurazione LDAP                                              |
| `settings`              | L'URL pubblico, e le impostazioni mail usate quando nessun canale mail è attivo |
| `chat`                  | Il provider del modello dell'assistente chat                        |
| `awx`                   | Deprecata dalla 7, rimossa nella 8: usa `runners` con `type: awx`   |

Un seed scritto prima della 7 continua a funzionare: ogni elemento della sua sezione `awx` viene applicato come runner di tipo `awx`, e il log
avvisa a ogni applicazione. Sposta quegli elementi sotto `runners` con `type: awx` prima di aggiornare alla 8.

Il seed **non** è la stessa cosa di `config.yaml`, che contiene le categorie, i ruoli e le costanti
e ha il proprio `CONFIG_PATH`. I due sono tenuti separati di proposito: il
repository che *contiene* `config.yaml` è uno degli oggetti che il seed dichiara, quindi il seed
non può stare al suo interno.

Utenti e gruppi sono esclusi: arrivano da LDAP o SSO, e il primo admin da `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

---

## In questa sezione

Ogni argomento ha una pagina propria:

| Pagina | Cosa tratta |
|---|---|
| [Esempio](example.html) | Un file di seed completo, sezione per sezione |
| [Oggetti gestiti](managed-objects.html) | Come il seed possiede gli oggetti che elenca, e come tiene fuori i segreti |
| [Ricaricamento e avvio](reloading.html) | Modificare il file senza riavvio, e cosa succede all'avvio |
| [Kubernetes](kubernetes.html) | Fare il provisioning di AnsibleForms da una ConfigMap e da dei Secret |
| [Modifica e audit](environment-and-audit.html) | Bloccare le pagine delle impostazioni, e cosa registra il log di audit |
