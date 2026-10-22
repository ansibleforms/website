---
layout: default
title: Assistant de chat
nav_order: 1
has_children: true
has_toc: false
permalink: /chat/
translated_from: 7c15de43a5f69fd80751b38b0fd379f282ffd84c
---

# Assistant de chat
{: .no_toc }

Remplir et lancer des formulaires au fil d'une conversation
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les administrateurs qui l'activent, et les utilisateurs qui discutent avec lui : remplir et lancer des formulaires au fil d'une conversation.

Un bouton de chat sur chaque page ouvre un
assistant qui trouve le bon formulaire, demande les informations manquantes, propose les choix du formulaire
sous forme de boutons, et affiche un résumé avec un bouton **Lancer**. Un job ne démarre que lorsque l'utilisateur clique dessus.

---

## Comment ça marche

L'assistant communique avec le modèle d'IA via le serveur, qui répond aux demandes du modèle avec le même moteur de formulaires que le navigateur :

```text
the user types           -> AnsibleForms server -> the AI model (Anthropic, OpenAI, ...)
                                   |                  asks for a tool
                                   v
                         catalog | resolve | relaunch preview | job status
                                   |   the same form engine as the browser and the MCP server,
                                   |   as the logged-in user, with their roles
                                   v
the page shows the reply, the choices, and a summary card with a Launch button
the user clicks Launch   -> AnsibleForms resolves the form again and launches exactly that payload, once
```

- **Les appels au modèle partent du serveur**, jamais du navigateur, la clé d'API reste donc sur le serveur
  (voir [Fournisseurs](providers.html)).
- **Le modèle ne peut rien lancer.** Il prépare un résumé à usage unique ; Lancer le revérifie avant l'exécution.
- **L'utilisateur choisit les cibles.** Les choix et les noms obligatoires viennent de l'utilisateur, jamais du modèle.
- **Taper « oui » ou « lance » ne fait rien.** Seul le bouton lance un job.

---

## Dans cette section

Chaque sujet a sa propre page :

| Page | Ce qu'elle couvre |
|---|---|
| [L'activer](switching-it-on.html) | Activer l'assistant et y proposer des formulaires |
| [Fournisseurs](providers.html) | Le modèle de langage derrière l'assistant, et les proxys |
| [Confidentialité et limites](privacy-and-limits.html) | Ce qui sort du réseau, et les limites par utilisateur |
| [Relance et audit](relaunching-and-audit.html) | La relance depuis le chat, la piste d'audit et les limitations |
