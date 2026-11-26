---
layout: default
title: Config seed
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
translated_from: 45ee9fce4b7686786567d06efd6eceddf3ab4c76
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

Imposta `CONFIG_SEED_PATH` su un file YAML, e AnsibleForms lo applica all'avvio. Il file dichiara oggetti e impostazioni che
altrimenti esistono solo nel database:

| Sezione            | Cosa dichiara                                                                     |
|--------------------|-----------------------------------------------------------------------------------|
| `runners`          | Dove girano i job: RTE, AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins         |
| `secret_stores`    | Archivi di segreti (HashiCorp Vault, ...)                                         |
| `credentials`      | Credenziali                                                                       |
| `databases`        | I database che i moduli interrogano, ognuno con la sua credenziale, dalla 7.5.0    |
| `sso`              | Provider SSO: Entra ID e OIDC (`oauth2` prima della 7.8.0)                        |
| `repositories`     | Repository git, e cosa l'app legge da ognuno                                      |
| `syslog`           | I server syslog che ricevono il log del server e le voci di audit (`syslog_servers` prima della 7.8.0) |
| `notifications`    | Server mail, Slack, Teams, Telegram e webhook (`notification_channels` prima della 7.8.0) |
| `labels`           | Le etichette accanto al logo dell'intestazione, dalla 7.3.0                        |
| `ldap`             | La configurazione LDAP                                                            |
| `settings`         | L'URL pubblico; le sue chiavi mail sono deprecate dalla 7.6.0, a favore di un canale mail |
| `chat_assistant`   | Il provider del modello dell'assistente chat (`chat` prima della 7.8.0)           |
| `users`            | Utenti, locali e di una directory, dalla 7.8.0                                    |
| `groups`           | Gruppi locali e i loro membri, dalla 7.8.0                                        |
| `defaults`         | **Impostazioni > Aspetto > Valori predefiniti**: tema, lingua, fuso orario, dalla 7.8.0 |
| `logo`, `icon`     | Il logo e l'icona del sito, file immagine accanto al seed, dalla 7.8.0            |
| `name`             | Il nome dell'app, dalla 7.8.0                                                     |
| `links`            | I collegamenti dell'intestazione, e se il collegamento del Designer è visibile, dalla 7.8.0 |
| `announcements`    | Gli annunci sotto l'intestazione, dalla 7.8.0                                     |
| `disclaimer`       | Le versioni del disclaimer che gli utenti accettano, dalla 7.8.0                  |
| `mcp`              | Gli interruttori del server MCP, dalla 7.8.0                                      |
| `ssh`              | La chiave privata SSH dell'app e i suoi host conosciuti, dalla 7.8.0              |
| `awx`              | Deprecata dalla 7, rimossa nella 8: usa `runners` con `type: awx`                 |

L'[Esempio](example.html) mostra ogni sezione, e [Oggetti gestiti](managed-objects.html) fino a che punto il seed possiede ciò che ognuna
dichiara: la maggior parte delle sezioni rende i propri oggetti di sola lettura nell'app, alcune si limitano a crearli o modificarli.

Un seed scritto prima della 7 continua a funzionare: ogni elemento della sua sezione `awx` viene applicato come runner di tipo `awx`, e il log
avvisa a ogni applicazione. Sposta quegli elementi sotto `runners` con `type: awx` prima di aggiornare alla 8.

Il seed **non** è la stessa cosa di `config.yaml` (`CONFIG_PATH`), la configurazione di base delle categorie, dei ruoli e delle costanti.
Un repository può contenerli al suo posto, e quel repository è uno degli oggetti che il seed dichiara, quindi il seed non può stare al suo interno.

Il primo admin arriva sempre da `ADMIN_USERNAME` / `ADMIN_PASSWORD`, e gli utenti di LDAP o SSO dalla loro directory all'accesso.
Dalla 7.8.0 le sezioni `users` e `groups` possono aggiungere utenti e gruppi locali, e bloccare un utente di una directory prima che acceda.

---

## Sezioni rinominate

Dalla 7.8.0 quattro sezioni hanno il nome delle chiavi sotto cui un [repository git](../repositories/) contiene gli stessi oggetti,
senza `controller_` (`sso:` per `controller_sso:`):

| Prima della 7.8.0         | Dalla 7.8.0        |
|---------------------------|--------------------|
| `oauth2:`                 | `sso:`             |
| `syslog_servers:`         | `syslog:`          |
| `notification_channels:`  | `notifications:`   |
| `chat:`                   | `chat_assistant:`  |

I loro elementi non cambiano. I vecchi nomi vengono ancora letti, deprecati dalla 7.8.0 e rimossi nella 8: ognuno applicato scrive un
avviso nel log del server, con il nuovo nome. Un seed che dà una sezione con entrambi i nomi viene rifiutato. Rinominale nel file
prima di aggiornare alla 8.

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
