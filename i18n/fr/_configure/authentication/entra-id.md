---
layout: default
title: Entra ID
parent: Authentification
nav_order: 3
translated_from: c5dad595f7df36cfd31a902ad0a44c7b5bb02f4e
---

# Entra ID
{: .no_toc }

Authentification unique avec Microsoft Entra ID (Azure AD), avec des rôles issus des groupes Entra ID de l'utilisateur
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Fonctionnement

Avec un fournisseur Entra ID activé, la page de connexion affiche un bouton Entra ID sous **Se connecter**. Une connexion se déroule alors ainsi :

1. Le bouton envoie le navigateur vers `/api/v2/auth/entraid`, qui le redirige vers Microsoft.
2. L'utilisateur se connecte chez Microsoft, qui le redirige vers l'**URL de redirection** avec un code d'autorisation. Le serveur
   échange ce code auprès de Microsoft contre l'ID token et un access token pour Microsoft Graph.
3. Le serveur lit les groupes de l'utilisateur depuis Microsoft Graph (`/v1.0/me/transitiveMemberOf`), si bien que les groupes imbriqués comptent aussi.
4. Les groupes sont filtrés avec le **Filtre de groupe** sur leur nom d'affichage, et chaque groupe conservé est stocké deux fois,
   comme `azuread/<object id>` et comme `azuread/<display name>`.

Le nom d'utilisateur est le claim `upn` du token, par ex. `jdoe@example.com`, ou le claim `preferred_username` quand le token
n'a pas de `upn` ; pour un compte professionnel, les deux contiennent la même valeur.

---

## Inscrire l'application

AnsibleForms a besoin d'une inscription d'application dans le Entra admin center, dans **App registrations > New registration** :

1. Donnez-lui un nom, choisissez **Accounts in this organizational directory only** comme types de comptes pris en charge, et ajoutez un
   URI de redirection de type **Web** : `https://af.example.com/api/v2/auth/entraid/callback`.
2. Dans **Certificates & secrets**, créez un secret client et copiez sa valeur ; elle n'est affichée qu'une seule fois.
3. Dans **API permissions**, ajoutez les permissions Microsoft Graph **déléguées** `User.Read` et `GroupMember.Read.All`,
   et accordez-leur le consentement administrateur.
4. Sur la page **Overview**, notez l'**Application (client) ID** et le **Directory (tenant) ID**.

L'URI de redirection est l'adresse à laquelle les utilisateurs accèdent à AnsibleForms, suivie de `/api/v2/auth/entraid/callback`.
Avec [`BASE_URL`](../customization/server.html#env_BASE_URL) `/forms`, il devient
`https://af.example.com/forms/api/v2/auth/entraid/callback`. Il doit correspondre exactement à l'**URI de redirection** de l'identifiant
du fournisseur.

Jusqu'à la 7.2.0, le chemin était `/api/v2/auth/azureadoauth2/callback`. Il fonctionne toujours depuis la 7.3.0, si bien qu'une inscription existante
n'a pas besoin d'être modifiée ; un identifiant avec une **URI de redirection** vide utilise le nouveau chemin, ajoutez-le donc alors à l'inscription.

AnsibleForms lit les groupes depuis Graph et n'utilise pas de claim de groupes dans le token, donc aucun claim de groupe n'a besoin
d'être configuré sur l'inscription.

---

## Ajouter le fournisseur

Ajoutez le fournisseur dans **Accès > SSO** : un assistant demande ses champs en quatre étapes, avec **Microsoft Entra ID** à l'étape **Type** :

| Étape | Champ | Signification |
|---|---|---|
| Détails | Nom, Description | Un nom unique pour le fournisseur, et une description facultative |
| Type | Fournisseur | **Microsoft Entra ID** ; défini à la création, il ne change plus |
| Identifiants | Identifiant | Un identifiant **Microsoft Entra ID** de [Connexions > Identifiants](../credentials.html), voir plus bas |
| Groupes | Filtre de groupe | Expression régulière ; seuls les groupes dont le nom d'affichage correspond sont conservés. Vide, tous les groupes sont conservés |

L'identifiant contient l'inscription d'application, donc seul un admin peut l'ajouter ou le modifier :

| Champ | Signification |
|---|---|
| ID du tenant | Obligatoire. Le Directory (tenant) ID, un GUID, ou l'un des domaines du tenant. Seuls les utilisateurs de ce tenant peuvent se connecter |
| ID client | L'Application (client) ID |
| Secret client | La valeur du secret client, stockée chiffrée ou lue depuis un [coffre de secrets](../secret-stores/) |
| URI de redirection | Telle qu'inscrite, par ex. `https://af.example.com/api/v2/auth/entraid/callback`. Vide : l'URL de l'application et le chemin de callback |

Un identifiant avec un ID de tenant vide est refusé à l'enregistrement. Les endpoints multi-tenant `common`, `organizations`
et `consumers` sont refusés à l'enregistrement du fournisseur qui référence l'identifiant, car ils laisseraient se connecter les utilisateurs de n'importe quel
tenant Microsoft. À la connexion, le serveur vérifie aussi que le token provient du tenant configuré. Un fournisseur
enregistré auparavant sans ID de tenant ne connecte personne : tant que l'ID de tenant n'est pas renseigné, le serveur journalise
`Could not enable Microsoft Entra ID: set the tenant id to your tenant ('' would let any Microsoft tenant log in)`.

Jusqu'à la 7.2.0, le tenant, l'ID client, le secret et l'URL de redirection étaient des champs du fournisseur. La mise à jour vers la 7.3.0 les déplace dans un
identifiant nommé `<provider>-sso`, voir [Adresses dans les identifiants](../credentials/types.html#addresses-in-credentials).
Choisissez un identifiant pour chaque nouveau fournisseur : le serveur accepte toujours un fournisseur d'avant la 7.3.0 avec son propre ID client et son propre secret,
qui se connecte avec eux jusqu'à ce qu'un identifiant soit choisi.

Un seul fournisseur Entra ID est activé à la fois, celui avec lequel le bouton Entra ID connecte. **Activer** dans le menu de ligne d'un autre,
ou son interrupteur **Activé**, désactive les autres du même type ; la colonne **Activé** de la liste montre lequel est utilisé. Un fournisseur
peut aussi passer la page de connexion, voir [Basculer l'authentification unique](./#switching-single-sign-on). L'enregistrement l'applique immédiatement, sans redémarrage.

---

## Correspondance avec les rôles

Dans config.yaml, un groupe Entra ID est `entraid/<object id>` ou `entraid/<display name>`, et un utilisateur est `entraid/<upn>`.
L'object id est unique dans le tenant, c'est donc le choix le plus sûr ; un nom d'affichage est plus lisible :

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - entraid/0b6c8e1a-2f4d-4c7e-9a3b-5d1e7f2a4c6b
  - name: operator
    groups:
      - entraid/AF-Operators
    users:
      - entraid/jdoe@example.com
```

Jusqu'à la 7.2.0, le préfixe était `azuread/`. Dans un rôle, il correspond toujours aux mêmes membres depuis la 7.3.0 et sera supprimé dans la 8.0 ; l'éditeur
de rôles écrit `entraid/`. Seuls les rôles acceptent `entraid/` : les groupes de l'utilisateur sont stockés comme `azuread/<object id>` et
`azuread/<display name>`, et la page de profil et l'extravar `ansibleforms_user` les affichent ainsi. Un **Filtre de groupe** comme `^AF-` ne garde que les groupes qu'utilisent vos rôles ; voir [Rôles](../config/roles.html). Depuis la 7.1.0,
le jeton de connexion ne transporte plus les groupes, sa taille n'augmente donc plus avec eux. Le filtre reste utile pour
les utilisateurs membres de nombreux groupes : moins de groupes sont comparés aux rôles à chaque connexion, et la
[fiche d'annuaire](../users-and-groups/directory.html) de l'utilisateur ne liste que les groupes qui comptent. Avant la 7.1.0,
un utilisateur membre d'une centaine de groupes ou plus en a besoin pour voir le moindre formulaire, voir
[Formulaires et jobs vides après une authentification unique](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).

---

## Endpoint Microsoft Graph

Le serveur connecte les utilisateurs sur `https://login.microsoftonline.com` et appelle Microsoft Graph sur `https://graph.microsoft.com` par défaut :

| Variable | Ce qu'elle change |
|---|---|
| [`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) | L'autorité de connexion, pour un cloud national comme `https://login.microsoftonline.us` |
| [`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) | L'endpoint Graph depuis lequel les groupes sont lus, comme `https://graph.microsoft.us` |

Les deux prennent une URI de base sans barre oblique finale, et sont nouvelles dans la 7.3.0. `AZURE_AUTHORITY_URI` et `AZURE_GRAPH_URI` sont toujours lues
lorsqu'elles ne sont pas définies, avec un avertissement dans le journal, et seront supprimées dans la 8.0. Le serveur doit pouvoir joindre Graph : une connexion échoue quand les groupes ne peuvent pas être lus.

---

## Limites

Les utilisateurs Entra ID se connectent chez Microsoft, donc quelques points fonctionnent différemment des comptes locaux et LDAP :

- Ils n'ont pas de mot de passe dans AnsibleForms, ils ne peuvent donc pas le changer ici ; un [jeton d'API](../profile/api-token.html) est créé à partir de leur session.
- Les noms d'affichage ne sont pas uniques dans Entra ID : deux groupes portant le même nom correspondent au même rôle. Nommez le groupe par son
  object id dans le rôle, `entraid/<object id>`, pour ne correspondre qu'à ce groupe.
