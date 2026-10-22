---
layout: default
title: Utilisateurs et groupes
nav_order: 15
has_children: true
has_toc: false
permalink: /users-and-groups.html
translated_from: 8ed4dc089c64e091636c29884af1cd1002eb40aa
---

# Utilisateurs et groupes
{: .no_toc }

Les utilisateurs et groupes locaux, ceux de LDAP et de l'authentification unique à côté, et le blocage d'une connexion
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les administrateurs : gérez qui peut se connecter dans **Paramètres > Accès > Utilisateurs** et **Groupes**, avec l'option de rôle `showSettings`.

L'admin intégré, l'ordre de connexion et la correspondance des rôles des comptes locaux se trouvent sur [Comptes locaux](authentication/local.html).

---

## Dans cette section

| Page | Ce qu'elle couvre |
|---|---|
| [Un utilisateur local](users-and-groups/local-user.html) | Ajouter un utilisateur local, et les onglets de sa page |
| [Plusieurs groupes](users-and-groups/several-groups.html) | Un utilisateur local dans plusieurs groupes, et ses rôles |
| [Un groupe local](users-and-groups/local-group.html) | La page d'un groupe local et ses onglets |
| [Utilisateurs et groupes d'annuaire](users-and-groups/directory.html) | Les utilisateurs et groupes LDAP, Entra ID et OIDC, tels que vus en dernier |
| [Bloquer une connexion](users-and-groups/blocking-a-sign-in.html) | Autoriser la connexion : bloquer un utilisateur sans rien supprimer |


---

## Les listes

Les listes **Utilisateurs** et **Groupes** montrent les utilisateurs et groupes locaux et, à côté, ceux de LDAP et de l'authentification unique.

Un utilisateur ou un groupe LDAP, Entra ID ou OIDC est listé dès qu'il s'est connecté (ou a été vu lors d'une connexion), ou dès qu'un rôle le nomme.
La colonne **Origine** indique d'où vient chacun : Local, LDAP, Microsoft Entra ID ou OIDC. Depuis la 7.3.0, la liste **Utilisateurs** a aussi
une colonne **Dernière connexion**, qui indique quand chaque utilisateur s'est connecté pour la dernière fois.

Une ligne ouvre la page de son utilisateur ou de son groupe. **Ajouter un utilisateur** et **Ajouter un groupe** en créent un local.

---

## Comptes qui donnent le rôle admin

Le rôle admin de config.yaml nomme des groupes et des utilisateurs locaux, si bien que seul un admin peut modifier les comptes et les groupes qu'il nomme.

Un utilisateur avec `showSettings` mais sans le rôle admin ne peut pas modifier, bloquer, changer de groupe, définir le mot de passe ni supprimer un
compte local que nomme le rôle admin (directement ou via l'un de ses groupes). Il ne peut pas non plus créer, renommer ou supprimer un groupe
que nomme le rôle admin, ni y placer un utilisateur. Il en va de même pour un utilisateur LDAP ou SSO qui correspond au rôle admin : le bloquer,
terminer ses sessions, l'oublier et révoquer ses jetons d'API reviennent à un admin. Le serveur répond à une telle requête par `403`.

