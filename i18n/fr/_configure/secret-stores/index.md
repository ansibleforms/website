---
layout: default
title: Coffres de secrets
nav_order: 14
has_children: true
has_toc: false
permalink: /secret-stores/
translated_from: c7e5d9fb5e640896bd51e3fa20d76be092857ce2
---

# Coffres de secrets
{: .no_toc }

Lisez les identifiants depuis un gestionnaire de secrets au lieu de les stocker dans AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les administrateurs : connectez un gestionnaire de secrets, et laissez les identifiants y lire leur utilisateur et leur mot de passe.

---

## Fonctionnement

Un **coffre de secrets** est une connexion vers un gestionnaire de secrets, ajoutée dans
**Connexions > Coffres de secrets**. Un **identifiant** peut alors nommer un coffre et un emplacement dans celui-ci
(la *référence du secret*). Quand un formulaire, un playbook ou une expression utilise cet identifiant :

- **l'utilisateur** et **le mot de passe** sont lus depuis le coffre, à chaque fois (dans la limite de la durée de cache du coffre) ;
- **l'hôte**, **le port** et **la base de données** restent ceux de la ligne de l'identifiant. Quand la ligne laisse
  l'un d'eux vide et que le secret le contient, la valeur du secret est utilisée.

Les formulaires continuent de faire référence à l'identifiant par son nom, si bien que déplacer un mot de passe dans un coffre ne change
rien à vos formulaires.

| Type de coffre | Statut |
|---|---|
| HashiCorp Vault (KV v1 et v2, authentification par jeton) | disponible |
| Identifiants dynamiques HashiCorp Vault (`<mount>/creds/<role>`) | expérimental |
| CyberArk Central Credential Provider (CCP) | expérimental |

---

## Ajouter un coffre

Depuis la 7.3.0, seul un admin peut ajouter, modifier ou supprimer un coffre, car son jeton ou sa clé est envoyé à son adresse. Chaque coffre a ces champs :

| Champ | Signification |
|---|---|
| Nom | Comment les identifiants font référence au coffre. |
| Type | Le gestionnaire de secrets. |
| Identifiant | Comment et où le coffre se connecte : un identifiant de [Connexions > Identifiants](../credentials.html), à l'étape **Identifiants**, de type **HashiCorp Vault** (son jeton et son adresse) ou **CyberArk**. Il contient l'URL de base, par ex. `https://vault.example.com:8200`, et les paramètres TLS : ignorer la vérification du certificat, ou un bundle CA en PEM pour une CA privée. Il ne peut pas lui-même lire depuis un coffre de secrets. |
| Cache (secondes) | Combien de temps un secret lu est réutilisé. `0` le lit à chaque utilisation. Par défaut 60. |
| Options supplémentaires (JSON) | Des options propres au type, sous forme d'objet JSON. |

Jusqu'à la 7.2.0, l'adresse, le jeton et les paramètres TLS étaient des champs du coffre. La mise à jour vers la 7.3.0 les déplace dans son
identifiant, nommé `<store>-token` (ou `<store>-appid` pour CyberArk), voir [Adresses dans les identifiants](../credentials/types.html#addresses-in-credentials).

**Tester la connexion** vérifie l'accès sans lire de secret. La page **Statut** vérifie chaque coffre, et avertit 7 jours
avant l'expiration d'un jeton Vault.

Chaque gestionnaire de secrets a sa propre page :

| Page | Ce qu'elle couvre |
|---|---|
| [HashiCorp Vault](hashicorp-vault.html) | KV v1 et v2 avec authentification par jeton, et les identifiants de base de données dynamiques |
| [CyberArk](cyberark.html) | Le Central Credential Provider (CCP) de l'Application Access Manager de CyberArk |

---

## Utiliser un coffre

### Dans un identifiant

Dans **Connexions > Identifiants**, à l'étape **Stockage** de l'identifiant, choisissez **Coffre de secrets**, puis sélectionnez le
**Coffre de secrets** et renseignez la **Référence**. L'utilisateur et le mot de passe sont alors lus depuis le coffre, et non saisis.

### En ligne, sans ligne d'identifiant

Partout où un nom d'identifiant est accepté, vous pouvez à la place référencer directement un coffre (`fnCredentials`, `fnRestBasic`,
les `credentials:` d'un formulaire, le `dbConfig` d'une requête).

```javascript
fn.fnCredentials('secret:vault:secret/myapp/prod')   // secret:<store>:<reference>
fn.fnCredentials('vault:secret/myapp/prod')          // the store named `vault`
```

```yaml
- name: servers
  type: enum
  query: SELECT name FROM servers
  dbConfig: secret:vault:secret/cmdb/db
```

Depuis la 7.5.0, un `dbConfig` nomme d'abord une [base de données](../databases.html) ; une référence comme celle-ci n'est pas une base de données, elle
est donc toujours lue depuis le coffre. Une base de données peut aussi lire son accès depuis un coffre, via un identifiant de type base de données qui en utilise un.

Sans ligne d'identifiant, un secret de base de données nécessite au moins un `db_type` et un hôte, par exemple :

```json
{ "username": "forms", "password": "...", "host": "cmdb.example.com", "port": 3306,
  "db_type": "mysql", "database": "cmdb" }
```

Sans `db_type`, le secret est un identifiant simple (utilisateur, mot de passe et toute autre clé), et une requête sur lui suppose `mysql`.

### Noms des clés

Un secret est associé à un identifiant avec ces alias. Les autres clés sont transmises telles quelles.

| Champ de l'identifiant | Clés acceptées dans le secret |
|---|---|
| `user` | `user`, `username`, `login` |
| `password` | `password`, `token`, `api_key`, `apikey`, `secret` |
| `host` | `host`, `address` |
| `port` | `port` |
| `db_name` | `db_name`, `database` |
| `db_type`, `secure` | même nom (secrets en ligne uniquement) |

Pour une ligne d'identifiant, l'hôte, le port et le nom de la base de données issus du secret ne sont utilisés que là où la
ligne les laisse vides.

Un secret d'une autre structure peut être remodelé avec une expression `jq`, passée en troisième argument de
`fnCredentials` :

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird', '', '.creds | { user: .u, password: .p }')
```

---

## Dans le seed de configuration

Les coffres peuvent aussi être déclarés dans le seed de configuration, comme les autres objets d'administration :

```yaml
secret_stores:
  items:
    - name: vault
      type: vault
      credential: vault-login        # its address and token

credentials:
  items:
    - name: vault-login
      credential_type: vault
      url: https://vault.example.com:8200
      password: ${SEED_VAULT_TOKEN}  # the Vault token
    - name: production-db
      secret_store: vault
      secret_ref: secret/forms/production-db
      host: db.example.com
      port: 3306
      db_type: mysql
      is_database: true
```

Le coffre se connecte avec son identifiant : un identifiant `vault` contient l'adresse du Vault dans `url` et le jeton comme mot de passe, un identifiant `cyberark`
l'AppID et l'adresse du CCP. Sans identifiant, ce sont le `url` et le `token` propres au coffre qui sont utilisés.
Pour les détails, voir [Seed de configuration](../seed).

---

## Mise à jour depuis les variables VAULT_*

Avant la 7, le seul coffre était un HashiCorp Vault configuré avec des variables d'environnement `VAULT_*`,
et un identifiant pointait vers lui avec **Vault path**.

- **Les variables sont importées une fois** comme un coffre nommé `vault` ; retirez-les ensuite.
- **Les identifiants avec un `vault_path`** utilisent désormais ce coffre ; `vault_path` disparaîtra dans la 8.
