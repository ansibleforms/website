---
layout: default
title: Jeton d'API
parent: Votre profil
nav_order: 5
translated_from: d3889d55e63b57c6b78525515638d33617daa750
---

# Jeton d'API
{: .no_toc }

Créer un jeton pour les scripts et les agents IA
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Qui peut en créer un

Un jeton de longue durée permet à des scripts d'appeler l'API sans votre mot de passe. Depuis la 7.3.0, il nécessite l'option de rôle `allowApiTokens` :

```yaml
roles:
  - name: automation
    groups:
      - local/automation
    options:
      allowApiTokens: true
      extendedTokenExpiration: true   # also tokens that never expire
```

Jusqu'à la 7.2.0, l'option était seulement `extendedTokenExpiration`. Un rôle d'avant la 7.3.0 qui ne définit que cette option reçoit
`allowApiTokens`, et garde donc ses jetons ; avec les deux, on peut aussi créer un jeton qui n'expire jamais. Voir [Options de rôle](../config/roles.html#role-options).

---

## Créer un jeton

**Nouveau jeton**, sur la ligne de titre de **Profil > Jetons d'API**, ouvre un assistant en trois étapes :

1. **Détails** : un nom, pour reconnaître le jeton dans la liste, et sa durée de validité. Les choix sont 30, 90, 180
   ou 365 jours jusqu'à [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) (90 par défaut), ce
   maximum lui-même, et **N'expire jamais** avec `extendedTokenExpiration`. Choisissez la durée la plus courte dont votre script a besoin.
2. **Confirmer** : un compte local ou LDAP saisit son mot de passe, qui n'est pas stocké dans le jeton. Un compte Microsoft Entra ID ou
   OIDC n'a pas de mot de passe ici : son jeton est créé à partir de sa session, qui doit s'être connectée au plus 10 minutes
   auparavant ; le fournisseur peut donc vous demander de vous reconnecter d'abord.
3. **Copier** : le jeton, affiché **une seule fois**. Copiez-le avec **Copier** et gardez-le aussi précieusement qu'un mot de passe.

Envoyez le jeton dans l'en-tête `Authorization` de chaque appel d'API :

```bash
curl -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/job
```

Un jeton d'API ne peut pas en créer un autre. Le jeton d'un compte SSO porte les rôles de sa dernière connexion : un changement de groupe chez le
fournisseur d'identité ne l'atteint que lorsque vous vous reconnectez et créez un nouveau jeton.

---

## Vos jetons

Les jetons que vous avez créés sont listés avec leur nom et la date de création, d'expiration et de dernière utilisation de chacun ; **Révoquer** dans le menu d'une ligne en met un hors service.
Un admin les voit et les révoque aussi sur votre page sous **Paramètres > Utilisateurs**. Un jeton prend fin à son expiration, ou plus tôt :

- **une révocation**, depuis la liste ;
- **une déconnexion avec le jeton** (`POST /api/v2/auth/logout` avec le jeton dans l'en-tête `Authorization`), qui y met fin avec
  la session dans laquelle il a été créé ;
- **un changement de mot de passe**, qui met fin à tous les jetons et sessions de votre compte créés avant lui, ainsi qu'un blocage de votre compte.

Un jeton qui n'expire jamais prend fin lui aussi dans ces cas. Un script peut aussi demander lui-même un jeton via l'API de connexion et
son paramètre `expiryDays` (`POST /api/v2/auth/login?expiryDays=90`, ou `expiryDays=never`) ; un `expiryDays` plus long est ramené
à `API_TOKEN_MAX_DAYS`.
