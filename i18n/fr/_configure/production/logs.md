---
layout: default
title: Journaux
parent: Exploitation en production
nav_order: 3
translated_from: 17d3894c528610d4916fbdcf4beb5bbbacd2b266
---

# Journaux
{: .no_toc }

Les fichiers de journaux, syslog, la piste d'audit, et la durée de conservation des jobs et des entrées d'audit
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Fichiers de journaux

AnsibleForms écrit deux journaux à rotation quotidienne dans [`LOG_PATH`](../customization/logging.html#env_LOG_PATH)
(`%PERSISTENT_FOLDER%/logs`), compresse les jours plus anciens et les conserve pendant [`LOG_RETENTION_DAYS`](../customization/logging.html#env_LOG_RETENTION_DAYS)
(30 par défaut, `0` garde tous les fichiers ; une modification sur la page de paramètres s'applique immédiatement) :

* `ansibleforms.<date>.log` : tout ce qui est au niveau [`LOG_LEVEL`](../customization/logging.html#env_LOG_LEVEL) et au-dessus
* `ansibleforms.errors.<date>.log` : les erreurs uniquement

La console, lue avec `docker logs` ou `kubectl logs`, a son propre niveau,
[`LOG_CONSOLE_LEVEL`](../customization/logging.html#env_LOG_CONSOLE_LEVEL). Les deux valent `notice` par défaut, ce qui convient à la
production ; n'utilisez `info` ou `debug` que pendant un dépannage, et laissez
[`ENABLE_DB_QUERY_LOGGING`](../customization/features.html#env_ENABLE_DB_QUERY_LOGGING) désactivée. Les niveaux peuvent être modifiés sur
les pages de paramètres sans redémarrage, et la page **Journal du serveur** montre le journal aux utilisateurs ayant l'option `showLogs`.

---

## Lignes JSON

Pour un collecteur de journaux comme Loki, ELK ou Splunk, mettez [`LOG_FORMAT`](../customization/logging.html#env_LOG_FORMAT) à `json`. Chaque
ligne, sur la console et dans les fichiers, est alors un objet JSON au lieu de `<time> <level>: <message>` :

```json
{"time":"2026-10-12T08:15:02.113Z","level":"notice","message":"App running on port 8000!","role":"all","host":"forms01"}
```

| Champ | Contenu |
|-------|---------|
| `time` | L'heure, en ISO 8601 UTC |
| `level` | Le niveau de journalisation |
| `message` | Le message |
| `requestId` | La requête à laquelle appartient la ligne, quand elle a été écrite pendant le traitement d'une requête |
| `role` | Le rôle du processus, [`AF_ROLE`](scaling.html), ou `all` quand il n'est pas défini |
| `host` | Le nom d'hôte de la machine ou du conteneur où tourne le processus |

Chaque requête reçoit un id : l'en-tête `X-Request-Id` qu'a envoyé un reverse proxy, ou un nouveau. Il est renvoyé dans l'en-tête
`X-Request-Id` de la réponse et porté par chaque ligne écrite pendant le traitement de la requête (sous la forme `[req <id>]` dans les lignes texte),
si bien qu'une requête peut être suivie à travers le journal et rapprochée de celle du proxy. Une modification sur la page de paramètres s'applique immédiatement.

---

## Syslog

Les serveurs syslog se gèrent dans **Paramètres > Connexions > Syslog**, afin qu'un serveur syslog ou un SIEM reçoive le journal au fil de son écriture.
Vous pouvez ajouter plusieurs serveurs, et chacun a ses propres paramètres :

| Paramètre | Ce qu'il fait |
|---------|--------------|
| Activé | Seuls les serveurs activés reçoivent quelque chose, un serveur peut donc être mis en pause sans être supprimé ; **Activer** et **Désactiver** dans son menu de ligne le basculent aussi |
| Protocole | `udp4` (par défaut), `udp6`, `tcp4`, `tcp6`, `tls4`, `tls6`, `unix` ou `unix-connect` |
| Hôte et port | Le serveur de destination, port `514` par défaut ; un protocole `unix` prend à la place un chemin de socket |
| Reçoit | Le journal du serveur, les entrées d'audit, ou les deux (par défaut pour un nouveau serveur) |
| Niveau | Le niveau le plus bas du journal du serveur qu'il reçoit, `info` par défaut ; les entrées d'audit sont toujours envoyées |
| Type | `BSD` (RFC 3164, par défaut) ou `RFC 5424` |

Une modification s'applique sur chaque nœud sans redémarrage, et la page du serveur a un bouton qui lui envoie un message de test.
Un serveur injoignable n'arrête jamais l'application : l'erreur est écrite sur la console.

Depuis la 7.3.0, les serveurs syslog nécessitent les droits complets sur les paramètres, l'option de rôle [`showSettings`](../config/roles.html#role-options) :
l'accès aux seuls paramètres de connexions ne suffit pas, car un serveur syslog reçoit le journal du serveur et les entrées d'audit.

Les variables `LOG_SYSLOG_*` des versions précédentes sont dépréciées depuis la 7. Le premier démarrage qui trouve
[`LOG_SYSLOG_HOST`](../customization/logging.html#env_LOG_SYSLOG_HOST) définie les importe une fois comme serveur `syslog`,
qui reçoit le journal du serveur comme avant, puis les ignore par la suite. Retirez-les de l'environnement après ce premier
démarrage, et gérez le serveur sur la page de paramètres.

---

## Piste d'audit

La page **Journal d'audit** (dans **Paramètres > Journaux**) enregistre qui a modifié quoi, ce à quoi les fichiers de journaux répondent mal.
Elle enregistre :

* chaque modification faite via l'API (`POST`, `PUT`, `PATCH`, `DELETE`), y compris les tentatives refusées avec 401 ou 403
* les connexions, avec le nom d'utilisateur essayé
* les événements de l'application elle-même, comme les sauvegardes nocturnes, les sauvegardes supprimées, les jobs purgés et les applications du seed de configuration

Chaque entrée a son heure, l'acteur (un utilisateur, ou l'application elle-même pour ses propres tâches), l'adresse IP du client,
l'action, sa cible et son résultat : `success`, `failure` ou `denied`. La page filtre sur l'acteur, l'action et
le résultat, et les utilisateurs ayant l'option de rôle `showSettings` peuvent l'ouvrir.

L'adresse IP est celle que voit AnsibleForms, c'est-à-dire celle du proxy quand il tourne derrière un proxy. Mettez
[`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) au nombre ou aux adresses de vos proxies, et AnsibleForms
enregistre à la place l'adresse du client que le proxy indique dans `X-Forwarded-For` ; voir [Reverse proxy](reverse-proxy.html).

Pour conserver la piste d'audit hors de l'instance, pour un SIEM, ajoutez un serveur syslog qui reçoit les entrées d'audit (voir
[Syslog](#syslog)). Chaque entrée est envoyée au moment où elle se produit, sous la forme d'une ligne `audit {...}` contenant l'entrée en JSON, quel que soit le
niveau du serveur. La copie syslog n'est ni supprimée par la conservation ci-dessous, ni remplacée par une restauration de la base de données.

---

## Conservation

Deux tâches quotidiennes avec un paramètre empêchent la base de données de grossir sans limite :

| Variable | Défaut | S'exécute à | Supprime |
|----------|---------|---------|---------|
| [`AUDIT_RETENTION_DAYS`](../customization/retention.html#env_AUDIT_RETENTION_DAYS) | `365` | 3:30 | Les entrées d'audit plus anciennes que cela |
| [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS) | `0` (tout garder) | 2:30 | Les jobs terminés plus anciens que cela, avec leur sortie |

`0` garde tout pour les deux. Deux autres tâches quotidiennes n'ont pas de paramètre : à 3:00, les refresh tokens stockés de plus de 30 jours et
les révocations de jetons expirées sont supprimés, et à 4:00 les [jobs enregistrés](../jobs/stored-jobs.html) dont l'échéance est passée.
Les heures sont dans le fuseau horaire de [`LOG_TZ`](../customization/logging.html#env_LOG_TZ), et c'est le worker qui exécute ces tâches.

La sortie des jobs est généralement la table qui grossit le plus vite : la page **Statut** indique sa taille
et avertit quand elle dépasse 1 Go sans conservation définie. Les jobs en cours et les jobs en attente d'approbation ne sont jamais supprimés.
Choisissez une conservation des jobs qui corresponde à vos exigences d'audit, et gardez la piste d'audit au moins aussi longtemps.
