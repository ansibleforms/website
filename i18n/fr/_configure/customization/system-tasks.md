---
layout: default
title: Tâches système
parent: Variables d'environnement
nav_order: 8
translated_from: d1175bbf1e4ddf30ab78994ed53cc74fc975c2e8
---

# Tâches système
{: .no_toc }

Quand s'exécutent les nettoyages, la sauvegarde nocturne et les boucles du hub des runners
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Modifiez-les pour déplacer les [tâches système](../jobs/system-tasks.html) à d'autres heures, ou exécuter les boucles du hub des runners plus ou moins souvent.

---

## Exemple

Sauvegarder à 1 h 00, nettoyer les jobs à 1 h 30, et distribuer les jobs aux runners toutes les 5 secondes. Dans le `.env` du projet compose :

```bash
NIGHTLY_BACKUP_CRON="0 1 * * *"
JOB_CLEANUP_CRON="30 1 * * *"
RUNNER_DISPATCH_SECONDS=5
```

Une variable `_CRON` prend un cron de 5 champs (minute, heure, jour, mois et jour de la semaine) dans le fuseau horaire du serveur,
[`LOG_TZ`](logging.html#env_LOG_TZ). L'onglet **Planification** de chaque tâche, sous **Jobs > Système**, écrit sa variable et l'applique
aussitôt sur chaque nœud, sans redémarrage. Le rechargement du config seed a la sienne,
[`CONFIG_SEED_RELOAD_CRON`](configuration.html#env_CONFIG_SEED_RELOAD_CRON), avec les variables du config seed.

---

## Variables

Toutes les variables de ce groupe, avec leur type, leur valeur par défaut et leur description :

{% include env_vars_table.html group="system-tasks" %}
