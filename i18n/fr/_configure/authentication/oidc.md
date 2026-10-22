---
layout: default
title: OIDC
parent: Authentification
nav_order: 4
translated_from: 5451df911884021544dea5ffbaa7228a7a4435ef
---

# OIDC
{: .no_toc }

Authentification unique avec un fournisseur OpenID Connect comme Keycloak, avec des rôles issus d'un claim de groupes
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Fonctionnement

Avec un fournisseur OIDC activé, la page de connexion affiche un bouton OpenID sous **Se connecter**. Une connexion se déroule alors ainsi :

1. Le bouton envoie le navigateur vers `/api/v2/auth/oidc`, qui le redirige vers le fournisseur (flux authorization code
   avec PKCE).
2. L'utilisateur se connecte chez le fournisseur, qui le redirige vers l'**URL de redirection**.
3. Le serveur échange le code contre des tokens et lit les claims de l'ID token.
4. Le nom d'utilisateur est le claim `preferred_username`, et chaque valeur du claim `groups` qui passe le
   **Filtre de groupe** devient un groupe `oidc/<value>`.

AnsibleForms demande les scopes `openid profile email` ; les scopes ne sont pas configurables. Se déconnecter d'AnsibleForms
envoie aussi le navigateur vers l'endpoint de fin de session du fournisseur, quand celui-ci en publie un.

{: .note }
> OIDC a été testé avec Keycloak. Les autres fournisseurs fonctionnent s'ils remplissent les exigences ci-dessous.

---

## Exigences du fournisseur

Le fournisseur doit proposer la découverte OpenID Connect, et un client confidentiel pour AnsibleForms :

- **Découverte** : AnsibleForms lit `<issuer>/.well-known/openid-configuration`, l'issuer doit donc être joignable depuis
  le serveur AnsibleForms, en HTTPS.
- **Un client confidentiel** avec le flux authorization code, un ID client et un secret client.
- **L'URI de redirection** `https://af.example.com/api/v2/auth/oidc/callback`, c'est-à-dire l'adresse à laquelle les utilisateurs accèdent à
  AnsibleForms suivie de `/api/v2/auth/oidc/callback`. Avec [`BASE_URL`](../customization/server.html#env_BASE_URL)
  `/forms`, elle devient `https://af.example.com/forms/api/v2/auth/oidc/callback`.
- **Un claim `groups` dans l'ID token**, contenant une liste de noms de groupes. Sans lui, l'utilisateur n'a aucun groupe OIDC.
- **Un claim `preferred_username`**, qui devient le nom d'utilisateur.

---

## Exemple Keycloak

Cet exemple utilise un realm `example` sur `https://keycloak.example.com` ; l'issuer est alors
`https://keycloak.example.com/realms/example`. Dans ce realm :

1. Dans **Clients**, créez un client OpenID Connect avec le client ID `ansibleforms`. Activez **Client authentication**,
   gardez **Standard flow**, et mettez **Valid redirect URIs** à `https://af.example.com/api/v2/auth/oidc/callback`.
2. Dans l'onglet **Credentials** du client, copiez le **Client secret**.
3. Dans l'onglet **Client scopes**, ouvrez `ansibleforms-dedicated` et ajoutez un mapper **By configuration > Group Membership**,
   avec **Token Claim Name** `groups`, **Full group path** désactivé et **Add to ID token** activé.

Avec **Full group path** activé, le claim contient des chemins comme `/af-admins`, et le rôle doit alors utiliser `oidc//af-admins`.

---

## Ajouter le fournisseur

Ajoutez le fournisseur dans **Accès > SSO** : un assistant demande ses champs en quatre étapes, avec **Open ID** à l'étape **Type** :

| Étape | Champ | Signification |
|---|---|---|
| Détails | Nom, Description | Un nom unique pour le fournisseur, et une description facultative |
| Type | Fournisseur | **Open ID** ; défini à la création, il ne change plus |
| Identifiants | Identifiant | Un identifiant **Open ID** de [Connexions > Identifiants](../credentials.html), voir plus bas |
| Groupes | Filtre de groupe | Expression régulière ; seules les valeurs du claim `groups` qui correspondent sont conservées. Vide, tous les groupes sont conservés |

L'identifiant contient le client, donc seul un admin peut l'ajouter ou le modifier :

| Champ | Signification |
|---|---|
| Issuer | Obligatoire. L'URL de l'issuer, par ex. `https://keycloak.example.com/realms/example` |
| ID client | L'ID du client chez le fournisseur, par ex. `ansibleforms` |
| Secret client | Le secret client, stocké chiffré ou lu depuis un [coffre de secrets](../secret-stores/) |
| URI de redirection | Telle qu'inscrite, par ex. `https://af.example.com/api/v2/auth/oidc/callback`. Vide : l'URL de l'application et le chemin de callback |

Jusqu'à la 7.2.0, l'issuer, l'ID client, le secret et l'URL de redirection étaient des champs du fournisseur. La mise à jour vers la 7.3.0 les déplace dans un
identifiant nommé `<provider>-sso`, voir [Adresses dans les identifiants](../credentials/types.html#addresses-in-credentials).
Choisissez un identifiant pour chaque nouveau fournisseur : le serveur accepte toujours un fournisseur d'avant la 7.3.0 avec son propre ID client et son propre secret,
qui se connecte avec eux jusqu'à ce qu'un identifiant soit choisi.

Un seul fournisseur OIDC est activé à la fois, celui avec lequel le bouton OpenID connecte. **Activer** dans le menu de ligne d'un autre,
ou son interrupteur **Activé**, désactive les autres du même type ; la colonne **Activé** de la liste montre lequel est utilisé.
Un fournisseur peut aussi passer la page de connexion, voir [Basculer l'authentification unique](./#switching-single-sign-on).

L'enregistrement du fournisseur l'applique immédiatement. Quand l'issuer est injoignable, le serveur journalise
`Failed to initialize OIDC strategy` et les connexions OIDC échouent jusqu'à ce que le fournisseur soit enregistré à nouveau ou que le serveur redémarre.

---

## Correspondance avec les rôles

Dans config.yaml, un groupe OIDC est `oidc/<group>` et un utilisateur est `oidc/<preferred_username>` :

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - oidc/af-admins
  - name: operator
    groups:
      - oidc/af-operators
    users:
      - oidc/jdoe
```

Les valeurs sont comparées exactement, casse comprise. Voir [Rôles](../config/roles.html) pour les options de rôle.

---

## Limites

Les utilisateurs OIDC se connectent chez le fournisseur, donc quelques points fonctionnent différemment des comptes locaux et LDAP :

- Ils n'ont pas de mot de passe dans AnsibleForms, ils ne peuvent donc pas le changer ici ; depuis la 7.2.0, un [jeton d'API](../profile/api-token.html)
  est créé à partir de leur session.
- Gardez le claim `groups` court : n'envoyez que les groupes qui comptent pour AnsibleForms, par exemple avec un client scope
  dédié ou une structure de groupes chez le fournisseur, ou filtrez-les avec le **Filtre de groupe**. Depuis la 7.1.0, le jeton
  de connexion d'AnsibleForms ne transporte plus les groupes ; auparavant, un utilisateur membre d'une centaine de groupes ou plus pouvait ne voir aucun formulaire, voir
  [Formulaires et jobs vides après une authentification unique](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).
