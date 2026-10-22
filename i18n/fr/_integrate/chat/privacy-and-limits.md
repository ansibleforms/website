---
layout: default
title: Confidentialité et limites
parent: Assistant de chat
nav_order: 3
translated_from: d29279a71f7aaa5553602f5a463132c842600690
---

# Confidentialité et limites
{: .no_toc }

Ce qui sort du réseau, et les limites par utilisateur
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Ce qui sort du réseau

Pour les formulaires qui participent, ceci est envoyé au fournisseur :

- les noms et descriptions des formulaires, les libellés des champs, les textes d'aide, les choix et les valeurs en cours
  de saisie ;
- la conversation.

Ceci n'est jamais envoyé au fournisseur, à la page ni au journal :

- les mots de passe (l'utilisateur les saisit dans le navigateur), les identifiants stockés et la clé d'API ;
- la sortie d'un job, et ses extravars stockées (l'assistant ne lit que le statut d'un job, et seulement
  quand **Laisser l'assistant suivre ses jobs** est activé dans les paramètres).

Tout ce qui se trouve sous une clé qui ressemble à un secret (`password`, `secret`, `token`, `api_key`, ...)
est masqué avant que le modèle ou la page ne le voie.

Pour garder les données des formulaires en interne, utilisez votre propre tenant (Azure OpenAI) ou un modèle local (Ollama), pas une API publique.

---

## Limites

Les limites suivantes se règlent sur la page des paramètres :

- **Messages par conversation** (20) : après quoi l'utilisateur doit commencer une nouvelle conversation.
- **Tours d'outils par message** (6) : combien de fois le modèle peut appeler un outil avant de répondre.
- **Délai d'attente** (60 s) : par appel au fournisseur.

Les limites suivantes sont fixes : un message à la fois par conversation, au plus 4000 caractères par message, 60 messages par
utilisateur et par heure, et 5 conversations par utilisateur. Une conversation est supprimée après 2 heures sans message.

Une carte de résumé avec un bouton **Lancer** ne sert qu'une fois, et expire au bout de 15 minutes : Lancer répond alors que le
résumé a expiré, et l'utilisateur en demande un nouveau à l'assistant. Les conversations et les résumés sont gardés en mémoire, donc après
un redémarrage l'utilisateur doit commencer une nouvelle conversation.
