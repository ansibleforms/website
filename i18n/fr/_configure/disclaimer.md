---
layout: default
title: Avertissement
nav_order: 8
has_children: true
has_toc: false
permalink: /disclaimer.html
translated_from: ad00bcbac9d3c64c103b15d26914eec84174f6b6
---

# Avertissement
{: .no_toc }

Des conditions que chaque utilisateur accepte une fois avant d'utiliser l'application, enregistrées avec qui a accepté quelle version et quand
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les administrateurs : demandez à chaque utilisateur d'accepter des conditions d'utilisation, dans **Paramètres > Accès > Avertissement**, avec l'option de rôle `showSettings`.

Depuis la 7.3.0, la page liste toutes les versions de l'avertissement, et chaque version s'ouvre sur sa propre page avec ses acceptations.
Jusqu'à la 7.2, la page avait à la place trois onglets (**Général**, **Versions** et **Acceptations**) ; la mise à jour conserve toutes les versions.

---

## Dans cette section

| Page | Ce qu'elle couvre |
|---|---|
| [Général](disclaimer/general.html) | La liste des versions, l'ajout d'une version, et l'activation de celle qu'acceptent les utilisateurs |
| [Versions](disclaimer/versions.html) | La page d'une version, et la modification de son texte comme correction ou pour tout le monde à nouveau |
| [Acceptations](disclaimer/acceptances.html) | Qui a accepté quelle version, et redemander à des utilisateurs choisis |


---

## Ce que voient les utilisateurs

Avec une version activée, chaque utilisateur qui se connecte la reçoit dans une boîte de dialogue avant toute chose, admins compris :

1. Il lit son titre et son texte.
2. Il coche la case, puis clique sur **Accepter**. **Refuser**, en rouge, le déconnecte à la place.

Depuis la 7.3.0, la page derrière la boîte de dialogue est floutée jusqu'à sa réponse.

Un utilisateur accepte chaque version une seule fois : on ne lui redemande pas à sa prochaine connexion, seulement quand une nouvelle version arrive, quand
un admin enregistre un texte modifié avec [Redemander à tout le monde](disclaimer/versions.html#changing-the-text), ou quand un admin utilise
[Redemander](disclaimer/acceptances.html#asking-users-again) sur son acceptation.

Tant qu'il n'a pas accepté, l'API répond à chaque appel de sa session avec le statut `403` et le code `disclaimer_required`,
sauf aux appels sous `/api/v2/disclaimer` et `/api/v2/profile`, et aux événements en direct que suit le navigateur.
Un [jeton d'API](profile/api-token.html) n'est jamais sollicité, puisqu'un script n'a personne pour cliquer.

