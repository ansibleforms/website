---
layout: default
title: Plusieurs RTE
parent: RTE
nav_order: 4
translated_from: 06592303233da78436fcc2765588aec6c88bc045
---

# Plusieurs RTE
{: .no_toc }

Combien de playbooks exécute un RTE, davantage de RTE comme runners ou comme répliques, et ce qui se passe quand l'un s'arrête ou meurt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Plusieurs jobs sur un RTE

Un RTE exécute jusqu'à [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks côte à côte, 10 par
défaut (`0` ne fixe aucune limite). Un job destiné à un RTE plein n'est pas réclamé. En mode socket, l'application ne l'envoie pas tant que le dernier
rapport de santé du RTE ne montre aucun emplacement libre, et un RTE plein ou en cours d'arrêt répond `refused` comme occupé ; en mode base de données, le RTE répond
`503`. Dans les deux cas, l'application écrit une fois `Waiting for a free slot on RTE <name>` dans la sortie et propose à nouveau le job toutes les 10 secondes,
pendant [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) au plus (60 par défaut). Le job échoue alors avec
*the RTE '&lt;name&gt;' stayed busy for 60 minutes (RTE_QUEUE_MINUTES)*. Un job interrompu pendant son attente se termine `aborted` sans jamais
atteindre le RTE.

---

## Plusieurs RTE

L'application ne répartit pas d'elle-même les jobs entre les runners : chaque job va à un seul runner, celui que nomme le formulaire ou celui
par défaut. Davantage de conteneurs RTE aident de deux façons :

* **Comme runners à part entière** : chaque RTE a son propre `RTE_NAME` et rejoint comme runner à part entière : il demande à rejoindre et un admin
  l'approuve, ou il présente un jeton d'adhésion (voir [Enregistrement](../runners/registration.html)). Un formulaire en choisit un avec `runner: <name>`,
  par exemple un RTE avec les collections VMware, ou un dans une autre zone réseau ; les autres tournent sur le RTE par défaut
* **Comme répliques derrière une même adresse** (mode base de données uniquement) : plusieurs conteneurs RTE avec le même `RTE_URL` et le même `RTE_TOKEN`,
  comme les pods derrière un Service Kubernetes, partagent un runner, et l'adresse répartit les appels entre eux. Une réplique pleine répond
  `503`, et l'essai suivant peut tomber sur une autre. L'application suit un job via la base de données, peu importe donc quelle réplique
  répond à ses appels de statut

En mode socket (voir [Modes](modes.html)), un runner détient un socket vers un seul RTE, et un second RTE qui se connecte avec le même
`RTE_NAME` reprend le socket au premier. Donnez à chaque RTE un nom et un runner à lui, et laissez les formulaires choisir entre eux avec
`runner:`.

Chaque RTE en mode base de données écrit un heartbeat dans la base de données toutes les 10 secondes, et celui qui s'enregistre lui-même vérifie sa ligne de runner toutes les
30 secondes. Pour un RTE en mode socket, le nœud d'application qui détient son socket écrit le heartbeat pour lui toutes les 20 secondes, tant que le
socket est ouvert. La page **Statut** liste chaque RTE avec sa version. Le worker supprime un runner qu'un RTE en mode base de données a enregistré
lui-même dès que ce RTE n'a écrit aucun heartbeat pendant 10 minutes, et quand le runner par défaut est une telle ligne dont le RTE s'est arrêté, le prochain RTE
qui vérifie prend le rôle par défaut. Un runner issu du seed de configuration, ajouté à la main ou ayant rejoint via un socket n'est jamais supprimé de cette façon.

---

## Quand un RTE s'arrête ou meurt

**Quand un RTE s'arrête.** Sur `SIGTERM` (`docker stop`, une mise à jour progressive, une réduction d'échelle), le RTE cesse de prendre des jobs : `/ready` répond `503`,
et un nouveau job est refusé comme occupé (`503` en mode base de données), si bien que l'application attend, ou, en mode base de données, l'adresse l'envoie à une autre
réplique. Les playbooks en cours disposent de [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) pour se terminer, 25 par défaut,
puis le RTE s'arrête.

**Quand un RTE meurt.** Un conteneur tué (mémoire épuisée, nœud perdu, fin du délai d'arrêt) emporte ses playbooks avec lui : rien
ne les déplace vers un autre RTE, et rien ne les exécute à nouveau. Leurs jobs sont terminés comme `abandoned`, par le RTE lui-même ou par l'application quand il
revient sous le même id, qu'un conteneur redémarré conserve (`rte-<hostname>-<port>`), ou par le worker, une fois que le heartbeat du RTE
a deux minutes. Vérifiez sur les hôtes gérés ce qu'a fait le playbook avant de le relancer.

**Pendant qu'un RTE est indisponible.** En mode socket, un nouveau job pour lui attend son socket, jusqu'à `RTE_QUEUE_MINUTES` plus une minute, puis
échoue avec *no app node holds a socket to RTE '&lt;name&gt;' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?*.
En mode base de données, il échoue immédiatement avec *the RTE at ... is unreachable*, sauf si une autre réplique répond à son adresse.
