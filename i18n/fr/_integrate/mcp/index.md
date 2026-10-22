---
layout: default
title: Serveur MCP
nav_order: 2
has_children: true
has_toc: false
permalink: /mcp/
translated_from: a5acf44b528914d81ce5c387c685d4fd41a0fdd6
---

# Serveur MCP
{: .no_toc }

Laisser les agents d'IA utiliser vos formulaires via le Model Context Protocol
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les administrateurs et les intégrateurs : laisser les clients MCP lister, remplir et lancer des formulaires en tant que l'utilisateur dont ils détiennent le jeton.

AnsibleForms peut servir un
serveur [Model Context Protocol](https://modelcontextprotocol.io), pour qu'un client MCP, comme
un backend de chat ou un assistant d'IDE, puisse lister les formulaires qu'un utilisateur peut utiliser, déterminer leurs champs,
lancer des jobs et suivre leur progression.

---

## Ce que c'est, et ce que ce n'est pas

Le serveur MCP est une interface technique vers le même parcours de formulaire que celui du navigateur. Il s'exécute
**en tant que l'utilisateur dont il reçoit le jeton** : les mêmes rôles de formulaire, la même visibilité des jobs, les
mêmes vérifications des extravars réservées qu'une soumission depuis le navigateur.

Il n'ajoute aucune politique d'IA à lui. C'est au client MCP de décider si un agent doit demander une confirmation avant un lancement,
quels formulaires il peut utiliser, ou combien de requêtes il peut faire. L'outil de
lancement est marqué comme destructif, un client bien conçu demande donc d'abord une confirmation,
mais le serveur ne l'impose pas.

---

## Dans cette section

Chaque sujet a sa propre page :

| Page | Ce qu'elle couvre |
|---|---|
| [Configuration](setup.html) | Activer le serveur et authentifier le client |
| [Outils](tools.html) | Les outils qu'un agent utilise pour remplir, approuver et relancer des formulaires |
| [Limitations](limitations.html) | Les expressions exécutées sur le serveur, et ce que le serveur MCP ne fait pas |
