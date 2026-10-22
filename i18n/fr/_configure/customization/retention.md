---
layout: default
title: Sauvegardes et conservation
parent: Variables d'environnement
nav_order: 3
translated_from: 76f81cfa15eaa98199a3d5963f7adc9a6f8b01dc
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
```

Une tâche quotidienne supprime les jobs terminés plus anciens que cela à 2 h 30 et les entrées d'audit à 3 h 30. Un job en cours, ou un job qui attend une
approbation, n'est jamais supprimé. Les deux variables s'appliquent sans redémarrage quand elles sont modifiées sur la page de paramètres.

---

## Variables

Toutes les variables de ce groupe, avec leur type, leur valeur par défaut et leur description :

{% include env_vars_table.html group="retention" %}
