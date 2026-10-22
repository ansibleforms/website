---
layout: default
title: Réponses et erreurs
parent: API REST
nav_order: 3
translated_from: 2687f844abe74f8c0e76c8685a1bd57151edc933
---

# Réponses et erreurs
{: .no_toc }

La forme d'une réponse, et les codes de statut
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Les réponses sont du JSON simple, et le code de statut HTTP indique si un appel a réussi.

---

## Réponses

Un appel réussi renvoie l'objet lui-même, ou une liste avec sa taille :

```json
{ "count": 2, "records": [ { "id": 41 }, { "id": 42 } ] }
```

Une erreur renvoie un message, et des détails quand il y en a :

```json
{ "error": "The form data is not valid", "details": [ ... ] }
```

---

## Codes de statut

Le code de statut indique ce qui n'a pas fonctionné :

| Code | Signification |
|---|---|
| `200` | L'appel a réussi |
| `400` | La requête est mal formée, par exemple un rafraîchissement de jeton sans jeton de rafraîchissement, ou un téléversement sans fichier |
| `401` | Le jeton est absent, erroné ou expiré : connectez-vous ou rafraîchissez-le |
| `403` | Les rôles de l'utilisateur n'autorisent pas l'appel (y compris approuver votre propre job, sauf si son approbation définit `allowSelf: true` ou si vous êtes admin), ou le compte doit d'abord faire quelque chose (voir plus bas) |
| `404` | L'objet n'existe pas |
| `409` | La requête est incomplète (un lancement sans données), ou l'objet n'est pas dans un état qui permet l'action |
| `422` | La [validation au lancement](../launch-validation/) a refusé les valeurs du formulaire ; `details` en donne les raisons |
| `429` | Trop de requêtes vers les endpoints de connexion et de jeton, ou trop d'échecs de connexion (voir [Authentification](authentication.html)) |
| `500` | Le serveur a échoué ; le journal du serveur en donne la raison |

Pour un job, un `409` signifie qu'il n'est pas dans le bon état pour l'action : interrompre un job qui ne tourne pas (ou dont l'interruption a déjà été demandée),
relancer un job encore en cours, ou approuver ou rejeter un job qui n'attend plus d'approbation.

---

## Un 403 avec un code

Certaines réponses `403` portent un `code`, pour quelque chose que l'utilisateur doit faire dans le navigateur avant que tout autre appel fonctionne :

```json
{ "error": "...", "code": "password_change_required" }
```

| Code | Que faire |
|---|---|
| `password_change_required` | L'utilisateur s'est connecté avec le mot de passe par défaut public : changez-le d'abord dans le profil |
| `disclaimer_required` | L'avertissement est activé et l'utilisateur n'a pas encore accepté sa version actuelle : acceptez-le dans le navigateur |

Un jeton d'API de longue durée (voir [Authentification](authentication.html#long-lived-tokens)) n'est jamais bloqué par l'avertissement.
