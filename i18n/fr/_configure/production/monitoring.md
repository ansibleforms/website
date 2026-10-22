---
layout: default
title: Supervision
parent: Exploitation en production
nav_order: 5
translated_from: b2bf7ba817910d15cd4fe5c5eb5881dba1ebacd5
---

# Supervision
{: .no_toc }

Les sondes de santé pour un répartiteur de charge ou Kubernetes, les métriques Prometheus, et la page Statut
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Sondes de santé

Deux endpoints indiquent à un répartiteur de charge, à un healthcheck de conteneur ou à Kubernetes si un processus peut recevoir du trafic.
Aucun ne nécessite de connexion, et aucun ne renvoie quoi que ce soit sur la configuration :

| Endpoint | Répond | À utiliser pour |
|----------|---------|------------|
| `/api/v2/live` | `200` avec `{"status":"live"}` tant que le processus tourne | Une sonde de vivacité (liveness) : redémarrer le processus quand il ne répond plus |
| `/api/v2/ready` | `200` avec `{"status":"ready"}`, ou `503` avec `{"status":"not ready","reason":"..."}` | Une sonde de disponibilité (readiness) : n'envoyer du trafic qu'aux processus prêts |

Un processus est prêt quand toutes ces conditions sont réunies :

* il n'est pas en cours d'arrêt (`stopping`)
* la base de données répond (`database unreachable`)
* le schéma existe (`schema not provisioned`) et est complet, avec chaque table, colonne et index de cette version
  (`schema not upgraded`) ; cette dernière vérification est mise en cache 30 secondes, si bien qu'une sonde toutes les quelques secondes reste peu coûteuse

Sous un [`BASE_URL`](../customization/server.html#env_BASE_URL), les chemins commencent par celui-ci, par exemple
`/ansibleforms/api/v2/ready`. Un environnement d'exécution (RTE) répond aux mêmes sondes sur `/live` et `/ready`, sans la
vérification de complétude du schéma ; il n'est pas prêt pendant qu'il vide ses jobs à l'arrêt, si bien qu'aucun nouveau job ne lui est envoyé. Un RTE sortant
n'est pas non plus prêt (`not connected to the app`) tant que son socket vers l'application n'est pas ouvert.
Un processus démarré avec `AF_ROLE=worker` n'a pas d'interface web : il ne répond qu'à `/api/v2/version` et `/health` pour le healthcheck
de son conteneur. Voir [Mise à l'échelle](scaling.html) pour les rôles.

---

## Métriques Prometheus

Mettez [`METRICS_TOKEN`](../customization/features.html#env_METRICS_TOKEN) à une longue chaîne aléatoire pour servir des métriques Prometheus.
Un processus qui sert l'application web répond sur `/api/v2/metrics`, un RTE sur `/metrics` :

```yaml
scrape_configs:
  - job_name: ansibleforms
    metrics_path: /api/v2/metrics
    authorization:
      type: Bearer
      credentials: <METRICS_TOKEN>
    static_configs:
      - targets: ['forms01.example.com:8000']
```

Sans `METRICS_TOKEN`, les endpoints répondent `404`, comme s'ils n'existaient pas, et une requête sans le bon en-tête
`Authorization: Bearer <token>` reçoit `401`. Chaque processus rapporte ses propres chiffres, collectez donc chacun d'eux :

| Métrique | Ce qu'elle mesure |
|--------|------------------|
| `af_process_*`, `af_nodejs_*` | Le processus : CPU, mémoire, latence de la boucle d'événements, ramasse-miettes |
| `af_http_requests_total{route,method,status}` | Les requêtes servies |
| `af_http_request_duration_seconds{route}` | Leur durée |
| `af_jobs{status}` | Les jobs en cours (`running`) ou en attente d'approbation (`approve`) en ce moment |
| `af_jobs_ended_24h{status}` | Les jobs terminés au cours des dernières 24 heures, par statut |
| `af_nodes{role,alive}` | Les processus enregistrés dans la base de données, par rôle, vivants ou non |
| `af_login_failures_total`, `af_login_lockouts_total` | Les connexions échouées et les verrouillages de compte |
| `af_rte_running_jobs`, `af_rte_max_jobs` | Sur un RTE : les playbooks qu'il exécute en ce moment, et combien il peut en exécuter à la fois |
| `af_rte_socket_connected` | Sur un RTE en mode socket : `1` tant que son socket vers l'application est ouvert, `0` sinon |

Les chiffres des jobs et des nœuds sont lus dans la base de données à chaque collecte. Quand la base de données ne répond pas, ils sont
omis, et la collecte réussit quand même avec les autres métriques.

---

## La page Statut

La page **Statut**, dans **Paramètres > Système**, montre aux utilisateurs ayant l'option de rôle `showSettings` l'état de l'instance.
Elle ne fait que lire, si bien que l'actualiser n'envoie jamais de mail et ne lance jamais de job. Elle a deux onglets, et le nombre de problèmes s'affiche sur le libellé de l'onglet **Vérifications**.

### Vérifications

Chaque vérification est verte (sain), orange (attention requise) ou rouge (un problème), avec ses détails en dépliant la ligne :

| Vérification | Ce qu'elle examine |
|-------|------------------|
| Connexion à la base de données | La base de données répond |
| Utilisateur de la base de données | Orange quand l'utilisateur a des droits sur toutes les bases, comme `root`, au lieu de `AnsibleForms.*` uniquement |
| Schéma de base de données | Chaque table, colonne et index de cette version existe, et quel patch a échoué sinon |
| Planificateur | Un worker exécute les tâches système, et aucune d'elles n'a cessé d'être planifiée |
| Nœuds | Les processus dans la base de données, orange quand ils exécutent des versions différentes |
| Tâches | Les jobs en cours et les jobs en attente d'approbation, orange quand un job tourne depuis plus de 24 heures |
| Outils de sauvegarde | La commande de dump de [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) existe, et sa version |
| Dernière sauvegarde | Orange quand il n'y en a aucune ou que la plus récente a plus de deux jours, rouge quand elle n'a pas de dump utilisable |
| Verrou du designer | Qui détient le verrou du concepteur, orange quand il est détenu depuis plus de 8 heures |
| Dépôts | Rouge quand un dépôt a échoué ou n'a pas d'arbre de travail sur le disque |
| Seed de configuration | Le fichier de [seed de configuration](../seed/) est lisible et s'analyse, et son dernier rechargement a fonctionné |
| Coffres de secrets | Chaque coffre de secrets répond, orange quand le jeton d'un HashiCorp Vault expire bientôt |
| Runners | Chaque runner répond, orange quand il n'y en a aucun ou aucun RTE par défaut |
| Expressions serveur | Orange quand [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) vaut `legacy` |
| Secrets | Orange quand `ENCRYPTION_SECRET` est la valeur publique par défaut ou que `ACCESS_TOKEN_SECRET` n'est pas défini |
| LDAP | Le serveur LDAP est joignable et son certificat TLS est valide, sans s'y connecter |
| Stockage des tâches | La taille des tables de jobs, orange au-delà de 1 Go quand aucune conservation des jobs n'est définie |
| Dossiers accessibles en écriture | Chaque dossier configuré est accessible en écriture |
| Espace disque | Le disque qui contient les sauvegardes, orange à partir de 85 % d'occupation et rouge à partir de 95 % |

### Informations

Des faits sur l'instance sans verdict, les premières choses que demande un échange avec le support : la version
d'AnsibleForms, l'URL de base, la version et l'hôte de la base de données, la source de configuration, le seed de configuration, les paramètres
de conservation, les méthodes d'authentification, le serveur du [canal mail](../notification-channels.html) actif, le niveau
et le chemin des journaux, le temps de fonctionnement, le fuseau horaire, la version de Node.js et la plateforme.

La page lit `/api/v2/health`, qui nécessite un utilisateur connecté avec `showSettings`. Pour un système de supervision, utilisez plutôt les
sondes et les métriques ci-dessus.
