---
layout: default
title: Utilisateurs et groupes d'annuaire
parent: Utilisateurs et groupes
nav_order: 4
translated_from: 4798556ab97e1c3567a81681919e13c57d7a5b4f
---

# Utilisateurs et groupes d'annuaire
{: .no_toc }

Les utilisateurs et groupes LDAP, Entra ID et OIDC, tels que vus en dernier
{: .fs-6 .fw-300 }

Un utilisateur LDAP, Entra ID ou OIDC a sa page à `/settings/users/<source>/<name>`, avec `ldap`, `azuread` ou `oidc`
comme source, par exemple `/settings/users/ldap/jdoe`. Elle montre ce qui a été enregistré lors de la dernière connexion de l'utilisateur, en lecture seule,
puisque c'est l'annuaire ou le fournisseur d'identité qui détermine qui est l'utilisateur et quels sont ses groupes.

Ses onglets sont ceux d'un utilisateur local. **Détails** contient l'interrupteur **Autoriser la connexion**, le nom d'utilisateur, l'origine, le nom,
l'e-mail, quand l'utilisateur a été vu la première fois et sa dernière connexion. **Groupes** liste les groupes de la dernière connexion.
**Jetons d'API** liste les jetons d'API de l'utilisateur, et **Révoquer** met fin à l'un d'eux immédiatement.

En haut à droite, **Terminer les sessions** déconnecte l'utilisateur partout, tout de suite. **Oublier** supprime la fiche, qui revient
à sa prochaine connexion ; ses jobs, jobs enregistrés et planifications restent. Un utilisateur bloqué ne peut pas être oublié, car cela
le laisserait entrer à nouveau : le serveur répond `409`, autorisez donc d'abord sa connexion.

Les groupes de cette fiche sont aussi les groupes avec lesquels fonctionne la session de l'utilisateur, lus en direct. Oublier un utilisateur connecté
le laisse sans groupes, et sans les rôles que ces groupes donnent, jusqu'à ce qu'il se reconnecte.

Un groupe d'annuaire a sa page à `/settings/groups/<source>/<name>`, en lecture seule, avec les onglets **Détails**,
**Utilisateurs** (les utilisateurs vus dans ce groupe lors de leur dernière connexion), **Rôles** et **Formulaires**.
