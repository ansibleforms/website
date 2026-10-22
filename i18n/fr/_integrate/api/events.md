---
layout: default
title: Événements en direct
parent: API REST
nav_order: 4
translated_from: 2dcfc48df93271c0e13e05c67682a3b02e6e7e97
---

# Événements en direct
{: .no_toc }

Être prévenu quand les jobs et les paramètres changent, au lieu d'interroger en boucle
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Le serveur indique à ses clients ce qui change, au moment où cela change. Un script peut écouter aussi, plutôt que de relire un job toutes les quelques secondes.

---

## Le flux

`GET /api/v2/events` est un flux de [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
qui reste ouvert. Tout utilisateur connecté peut l'ouvrir, avec le jeton bearer habituel :

```bash
curl -N https://af.example.com/api/v2/events -H "Authorization: Bearer <token>"
```

Quand quelque chose change, il envoie un événement `changed` avec le nom de ce qui a changé :

```text
event: changed
data: {"name":"jobs"}
```

---

## Noms d'événements

Un événement ne porte qu'un nom, jamais de données, il ne révèle donc rien que l'utilisateur n'ait pas le droit de voir. Ces noms sont envoyés :

| Nom | Ce qui a changé |
|---|---|
| `jobs` | Un job : lancé, son statut ou sa sortie, supprimé |
| `appearance` | Les paramètres qu'affiche l'en-tête : le thème, le nom, une annonce, une variable d'environnement |
| `designer` | Un verrou du concepteur, pris ou libéré |
| `runners` | Un runner (depuis la 7.3.0) : un RTE connecté ou déconnecté, qui a demandé à rejoindre, a été approuvé ou rejeté, ou a changé de mode ou de paramètres |

En recevant un nom, relisez ce que vous affichez via l'API normale (par exemple `GET /api/v2/job/42`), avec vos propres
permissions. Un nom très actif est envoyé au plus une fois par seconde.

---

## Le garder ouvert

Le flux est conçu pour survivre aux proxys et aux répartiteurs de charge, et un client se reconnecte de lui-même :

* À la connexion, le serveur envoie un événement `hello`, et demande au client d'attendre 3 secondes avant de se reconnecter.
* Toutes les 15 secondes, il envoie une ligne de commentaire (`: ping`), pour qu'une connexion inactive ne soit pas fermée. Ignorez les lignes qui commencent par `:`.
* Les événements de chaque nœud d'application atteignent chaque flux, quel que soit le nœud auquel le client est connecté.
* Après une reconnexion, relisez ce que vous affichez : un événement envoyé pendant que le flux était coupé n'est pas renvoyé.

---

## Santé et métriques

Les sondes de liveness et de readiness (`/api/v2/live`, `/api/v2/ready`) et les métriques Prometheus (`/api/v2/metrics`) sont
destinées aux outils de supervision plutôt qu'aux scripts qui agissent en tant qu'utilisateur. Voir [Supervision](../production/monitoring.html).
