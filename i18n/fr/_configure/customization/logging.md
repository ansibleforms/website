---
layout: default
title: Journalisation
parent: Variables d'environnement
nav_order: 7
translated_from: 81439c2c8adc69d31191b0a07cd9e444ff5fb2be
---

# Journalisation
{: .no_toc }

Niveaux de journalisation, fichiers, syslog et couleurs de la console
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Modifiez-les pour régler la quantité de journalisation, l'emplacement des fichiers de journaux, ou afficher les horodatages dans votre propre fuseau horaire.

---

## Exemple

Journaliser davantage dans les fichiers que sur la console, et afficher les horodatages des journaux et des jobs à l'heure d'Amsterdam.
Dans le `.env` du projet compose :

```bash
LOG_LEVEL=info
LOG_CONSOLE_LEVEL=notice
LOG_TZ=Europe/Amsterdam
```

---

## Syslog

Les serveurs syslog ne se configurent plus ici : ajoutez-les dans **Paramètres > Connexions > Syslog**, voir [Journaux](../production/logs.html#syslog).
Les variables `LOG_SYSLOG_*` ci-dessous sont dépréciées depuis la 7. Le premier démarrage qui trouve `LOG_SYSLOG_HOST` défini les importe
une fois comme serveur syslog `syslog`, qui reçoit le journal du serveur, puis les ignore par la suite.

---

## Variables

Toutes les variables de ce groupe, avec leur type, leur valeur par défaut et leur description :

{% include env_vars_table.html group="logging" %}
