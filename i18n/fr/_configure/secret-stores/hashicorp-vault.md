---
layout: default
title: HashiCorp Vault
parent: Coffres de secrets
nav_order: 1
translated_from: 1134189481b234cb2b18edbabd74427e37d2f43c
---

# HashiCorp Vault
{: .no_toc }

Lire et écrire des identifiants dans HashiCorp Vault KV, lire des secrets dynamiques
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Champs du coffre

En plus des [champs communs à tous les coffres](./#adding-a-store), un coffre HashiCorp Vault a ces champs :

| Champ | Signification |
|---|---|
| Identifiant | Un identifiant **HashiCorp Vault** de [Connexions > Identifiants](../credentials.html) : l'adresse du Vault, ses paramètres TLS, et le jeton comme mot de passe, avec un accès en lecture aux chemins qu'utilisent vos identifiants. **Ajouter un identifiant** en crée un de ce type. AnsibleForms ne renouvelle pas le jeton. |
| Namespace | Le namespace Vault Enterprise, envoyé comme `X-Vault-Namespace`. Affiché une fois **Vault Enterprise** activé, à l'étape **Type**. |
| Version KV | `2` (par défaut) ou `1`. |
| Montage par défaut | Utilisé pour une référence sans barre oblique, par ex. `myapp` devient `secret/data/myapp`. |

La référence du secret est le chemin, par ex. `secret/myapp/prod`. Pour KV v2, le segment `/data/`
est inséré quand vous l'omettez.

---

## Écrire des identifiants

Depuis 7.6.0, l'utilisateur et le mot de passe d'un identifiant peuvent être écrits dans le Vault à l'**Enregistrement** (voir [Écrire des identifiants](./#writing-credentials)).

Activez **Autoriser l'écriture** dans les **Options** du coffre, et indiquez où il peut écrire :

| Champ | Signification |
|---|---|
| Autoriser l'écriture | Permet à un identifiant d'écrire son utilisateur et son mot de passe dans ce coffre à l'**Enregistrement**. Désactivé par défaut. |
| Préfixe d'écriture | Le chemin où, ou sous lequel, les identifiants sont écrits, p. ex. `secret/ansibleforms`. Un montage seul, p. ex. `secret`, autorise tout le montage. Requis quand l'écriture est activée. |

Le secret est écrit sous la forme `username` et `password`, en KV v2 ou v1 selon la **Version KV** du coffre. Le jeton a besoin des capacités
read, create et update sous le préfixe ; read vérifie si un secret s'y trouve déjà. Pour KV v2 et le préfixe `secret/ansibleforms` :

```hcl
path "secret/data/ansibleforms/*" {
  capabilities = ["read", "create", "update"]
}
```

Le chemin d'un moteur de secrets dynamiques, p. ex. `database/creds/readonly`, n'est jamais écrit : Vault crée lui-même ces identifiants.

---

## Identifiants de base de données dynamiques

Une référence de la forme `<mount>/creds/<role>`, par ex. `database/creds/readonly`, lit depuis un
moteur de secrets dynamiques comme le moteur database de Vault. Vault crée alors un nouveau compte de base de données
à chaque lecture, valable pendant la durée du bail.

- Un compte est réutilisé pendant 80 % de son bail, et non la durée de cache ; avec un cache à `0`, chaque requête en lit un nouveau.
- Vault ne renvoie qu'un utilisateur et un mot de passe : mettez le reste de la connexion dans la ligne de l'identifiant.
- Le bail n'est jamais révoqué de façon anticipée ; le compte expire quand Vault met fin au bail.
