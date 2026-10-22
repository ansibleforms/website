---
layout: default
title: Votre profil
nav_order: 4
description: Votre compte, vos préférences, votre mot de passe, vos autorisations et vos tokens d'API
has_children: true
has_toc: false
permalink: /profile/
translated_from: f2ec61e6df09174e802478963ba70ff7dee51098
---

# Votre profil
{: .no_toc }

Votre compte, vos préférences, votre mot de passe, vos autorisations et vos jetons d'API
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour chaque utilisateur : votre propre compte, vos préférences, votre mot de passe, vos autorisations et vos jetons d'API.

Ouvrez votre profil depuis l'avatar en haut à droite : **Profil**.

---

## Ouvrir une vue

Le menu de gauche liste les vues du profil par ordre alphabétique. Chaque vue a sa propre adresse,
pour que vous puissiez y faire un lien direct :

| Vue | Adresse |
|---|---|
| Compte | `/profile/account` |
| Jetons d'API | `/profile/token` |
| Mot de passe | `/profile/password` |
| Autorisations | `/profile/permissions` |
| Préférences | `/profile/preferences` |

`/profile` seul ouvre la première vue du menu. Les vues que vos rôles n'autorisent pas sont masquées ; leur adresse ouvre plutôt la première
vue. **Jetons d'API** n'est affiché que lorsque l'un de vos rôles a l'option de rôle `allowApiTokens`.

---

## Dans cette section

Chaque sujet est décrit sur sa propre page :

| Page | Contenu |
|---|---|
| [Compte](account.html) | Avec quel compte vous êtes connecté |
| [Préférences](preferences.html) | Langue, thème, fuseau horaire, format de date et notifications de bureau |
| [Mot de passe](password.html) | Changer le mot de passe d'un compte local |
| [Autorisations](permissions.html) | Ce que vos rôles vous permettent de faire |
| [Jetons d'API](api-token.html) | Créer un jeton pour les scripts et les agents IA |
