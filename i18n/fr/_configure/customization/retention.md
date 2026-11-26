---
layout: default
title: Sauvegardes et conservation
parent: Variables d'environnement
nav_order: 3
translated_from: 1cac64b6467ce96bce3aac71718f07d7ecd10d89
---

# Sauvegardes et conservation
{: .no_toc }

Les commandes de sauvegarde, et la durée de conservation des sauvegardes, des jobs et des entrées d'audit
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Modifiez-les pour contrôler la quantité d'historique que conserve la base de données, et le nombre de sauvegardes qui restent sur le disque.

---

## Exemple

Conserver les jobs terminés pendant 90 jours et la piste d'audit pendant deux ans. Dans le `.env` du projet compose :

```bash
JOB_RETENTION_DAYS=90
AUDIT_RETENTION_DAYS=730
STORED_JOB_UNUSED_DAYS=180
```

Une tâche quotidienne supprime les jobs terminés plus anciens que cela à 2 h 30 et les entrées d'audit à 3 h 30. Un job en cours, ou un job qui attend une
approbation, n'est jamais supprimé. Depuis la 7.7.0, `STORED_JOB_UNUSED_DAYS` supprime aussi, à 4 h 00, les [jobs
enregistrés](../jobs/stored-jobs.html#when-it-is-removed) depuis lesquels aucun job n'a été lancé pendant ce nombre de jours. Ces variables
s'appliquent sans redémarrage quand elles sont modifiées sur la page de paramètres.

Ces heures sont les valeurs par défaut. Depuis la 7.8.0, chaque nettoyage, et la sauvegarde nocturne, est une [tâche système](../jobs/system-tasks.html) sous
**Jobs > Système**, où un admin modifie quand elle s'exécute et voit ses exécutions ; les variables de leurs horaires sont dans
[Tâches système](system-tasks.html).

---

## Variables

Toutes les variables de ce groupe, avec leur type, leur valeur par défaut et leur description :

{% include env_vars_table.html group="retention" %}
