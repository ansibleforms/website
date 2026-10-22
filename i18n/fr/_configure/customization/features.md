---
layout: default
title: Fonctionnalités
parent: Variables d'environnement
nav_order: 4
translated_from: dbd2d865ae9b177e389409777bdfffc8f199f9da
---

# Fonctionnalités
{: .no_toc }

Le concepteur, MCP, le chat, la validation au lancement, la liste des jobs, les métriques, l'API AWX et la journalisation des requêtes
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Modifiez-les pour activer ou désactiver les parties facultatives de l'application.

---

## Exemple

Servir le serveur MCP pour les agents IA et imposer les règles de validation du formulaire à chaque lancement. Dans le `.env` du projet compose :

```bash
ENABLE_MCP=1
LAUNCH_VALIDATION=enforce
```

`ENABLE_MCP` et `ENABLE_CHAT` s'appliquent sans redémarrage : elles sont lues à chaque requête, vous pouvez donc les activer sur la
page de paramètres. Tant que l'une est désactivée, son endpoint (`/api/v2/mcp` ou `/api/v2/chat`) répond `404`.

Lancez d'abord `LAUNCH_VALIDATION=log` pendant un moment : il journalise ce que `enforce` refuserait sans le refuser. Voir [MCP](../mcp/)
et [Journaliser et imposer](../launch-validation/log-and-enforce.html).

---

## Variables

Toutes les variables de ce groupe, avec leur type, leur valeur par défaut et leur description :

{% include env_vars_table.html group="features" %}
