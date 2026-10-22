---
layout: default
title: Authentification
parent: API REST
nav_order: 1
translated_from: 58596f571c415f814cc79306f4f882b3078e962e
---

# Authentification
{: .no_toc }

Se connecter, rafraîchir le jeton, ou utiliser un jeton de longue durée
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Chaque appel a besoin d'un jeton d'accès dans l'en-tête `Authorization`. On obtient un jeton en se connectant, et on le garde valide avec
le jeton de rafraîchissement.

---

## Se connecter

Connectez-vous en authentification basique, avec le nom et le mot de passe de l'utilisateur :

```bash
curl -X POST https://af.example.com/api/v2/auth/login -u admin:<password>
```

La réponse contient deux jetons, le jeton d'accès et le jeton de rafraîchissement :

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## Appeler l'API

Envoyez le jeton d'accès comme jeton bearer à chaque appel :

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

---

## Rafraîchir le jeton

Le jeton d'accès expire (`ACCESS_TOKEN_EXPIRATION`, 30 minutes par défaut). Obtenez-en un nouveau avec le jeton de rafraîchissement,
sans le mot de passe :

```bash
curl -X POST https://af.example.com/api/v2/token \
  -H "Content-Type: application/json" -d '{ "refreshtoken": "<refreshtoken>" }'
```

La réponse contient une nouvelle paire, sous la même forme que la connexion. Un jeton de rafraîchissement ne sert qu'une fois : gardez le nouveau pour le prochain rafraîchissement.

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## Jetons de longue durée

Un script qui tourne sans surveillance peut utiliser un jeton qui dure plus longtemps. Depuis la 7.3.0, il faut l'option de rôle `allowApiTokens` :

* Créez-en un sous [Profil > Jetons d'API](../profile/api-token.html).
* Ou connectez-vous avec le paramètre de requête `expiryDays`, pour un jeton valable ce nombre de jours :

```bash
curl -X POST "https://af.example.com/api/v2/auth/login?expiryDays=90" -u automation:<password>
```

`expiryDays` n'est lu que dans l'URL, jamais dans le corps. Pour un utilisateur dont les rôles n'ont pas `allowApiTokens`, il est ignoré,
et la connexion renvoie un jeton de durée habituelle. `expiryDays=never` nécessite aussi `extendedTokenExpiration`. Ajoutez le paramètre de requête `name`
(`?expiryDays=90&name=nightly-backup`) pour nommer le jeton dans la liste des jetons de l'utilisateur.

Un jeton de longue durée vit au plus [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) jours, 90 par
défaut : un `expiryDays` plus long est ramené à cette valeur, sauf s'il vaut `never`. Le rafraîchir renvoie un jeton ordinaire, reconnectez-vous donc quand il expire.

### Jetons de l'utilisateur connecté

La vue **Jetons d'API** du profil utilise ces endpoints, qui fonctionnent pour tout compte, SSO compris, puisqu'ils n'ont besoin d'aucun mot de passe :

| Appel | Ce qu'il fait |
|---|---|
| `GET /api/v2/profile/tokens` | Liste vos jetons d'API, avec leur `sid`, leur `name`, leur création, leur expiration et leur dernière utilisation |
| `POST /api/v2/profile/tokens` | Crée un jeton à partir de votre session ; le corps contient `expiryDays` (un nombre, ou `never`) et un `name` facultatif |
| `DELETE /api/v2/profile/tokens/{sid}` | Révoque l'un de vos jetons |

`POST` répond `403` quand il est appelé avec un jeton d'API (un jeton ne peut pas en créer un autre), sans `allowApiTokens`, ou quand la
session s'est connectée il y a plus de 10 minutes (code `sign_in_again`) : reconnectez-vous d'abord. Une durée de vie au-delà du maximum répond `400`.

---

## Quand un jeton prend fin plus tôt

Un jeton, de longue durée ou non, cesse de fonctionner avant son expiration quand l'une de ces situations se produit :

* **Une déconnexion de sa session** : `POST /api/v2/auth/logout` avec le jeton met fin aux jetons de cette connexion, et à eux seuls. Une
  déconnexion dans le navigateur ne met pas fin au jeton d'un script.
* **Un changement de mot de passe** : l'utilisateur change son mot de passe, ou un admin le définit. Tout jeton émis auparavant est refusé.
* **L'utilisateur est supprimé ou bloqué** : supprimer un utilisateur local, ou bloquer un utilisateur, met fin à tous ses jetons. Un admin peut aussi
  mettre fin aux sessions d'un utilisateur LDAP ou SSO.

Un jeton refusé répond `401`. Reconnectez-vous, avec le nouveau mot de passe s'il a changé.

---

## Scripts qui se connectent à chaque exécution

Les endpoints de connexion et de jeton sont protégés contre les afflux de requêtes et la devinette de mots de passe, un script qui se connecte à chaque exécution
doit donc connaître ces limites :

| Limite | Par défaut | Ce qui se passe |
|---|---|---|
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | 120 requêtes par minute depuis une même adresse | La connexion, la déconnexion, le rafraîchissement, les endpoints SSO, `PUT /api/v2/profile` (changement de mot de passe) et `POST` ou `DELETE /api/v2/profile/tokens` répondent `429` |
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | 5 échecs de connexion d'affilée | Le compte est verrouillé pendant [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) (15), chaque connexion répond `429` |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | 30 échecs de connexion depuis une même adresse | Chaque connexion depuis cette adresse répond `429` jusqu'à la fin de la fenêtre |

Un `429` porte un en-tête `Retry-After` avec le nombre de secondes à attendre : arrêtez-vous et attendez, ne réessayez pas tout de suite. Un compte verrouillé
refuse même le bon mot de passe jusqu'à la fin du verrouillage, un script avec un mauvais mot de passe verrouille donc son utilisateur pour tout le monde.
Un mauvais mot de passe actuel lors d'un changement de mot de passe (`PUT /api/v2/profile`) compte aussi comme un échec de connexion, et un compte verrouillé
ne peut pas changer son mot de passe. Une connexion réussie remet à zéro le compteur du compte, tout comme un admin qui définit le mot de passe.

Pour rester à l'écart de ces limites, connectez-vous une fois et réutilisez le jeton, ou utilisez un jeton de longue durée, au lieu de vous connecter à
chaque appel. Derrière un reverse proxy, définissez [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) pour que le serveur voie
l'adresse du client, sinon tous les clients comptent comme un seul.
