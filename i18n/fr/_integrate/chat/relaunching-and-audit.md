---
layout: default
title: Relance et audit
parent: Assistant de chat
nav_order: 4
translated_from: b7d416fbf35e98de81e41ee53ba0d2ff9040fea0
---

# Relance et audit
{: .no_toc }

La relance depuis le chat, la piste d'audit et les limitations
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Relance

Une demande comme « Relance le job 1234 » (l'utilisateur doit taper l'ID du job) prépare un aperçu de relance
selon les mêmes règles que le `relaunch_job` du serveur MCP, y compris la règle des mots de passe de la
[validation au lancement](../launch-validation), et affiche un résumé **Relancer** ; le bouton
la lance une fois. « Relance le job 1234 avec le serveur web02 » ne change que ce champ.

---

## Audit

Chaque lancement depuis le chat est enregistré comme **chat.launch** avec l'utilisateur, le job, le formulaire,
le fournisseur, et le hash du contenu du résumé qui a été approuvé. Les changements des paramètres du chat sont
enregistrés comme tout autre changement de paramètres.

---

## Limitations

L'assistant de chat ne fait pas encore tout ce que fait un navigateur :

- **Les formulaires assistant (wizard)** ne peuvent pas participer (`enableForChat` y est refusé), pas plus que
  les champs que l'assistant ne remplit pas : les mots de passe et les téléversements de fichiers.
- Les réponses arrivent d'un seul bloc ; le streaming n'est pas encore pris en charge.
- Le modèle peut mal comprendre une demande. La carte de résumé montre exactement ce qui sera envoyé ;
  relisez-la avant de cliquer sur **Lancer**.
