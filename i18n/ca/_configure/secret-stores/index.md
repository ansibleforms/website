---
layout: default
title: Magatzems de secrets
nav_order: 13
has_children: true
has_toc: false
permalink: /secret-stores/
translated_from: 595f94a84c4e8182b1b79289eb309a814dec1287
---

# Magatzems de secrets
{: .no_toc }

Llegeix les credencials d'un gestor de secrets en lloc de desar-les a AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per a administradors: connecta un gestor de secrets, i deixa que les credencials en llegeixin l'usuari i la contrasenya.

---

## Com funciona

Un **magatzem de secrets** és una connexió a un gestor de secrets, afegida a
**Connexions > Magatzems de secrets**. Una **credencial** pot llavors nomenar un magatzem i un lloc dins seu
(la *referència del secret*). Quan un formulari, un playbook o una expressió fa servir aquesta credencial:

- l'**usuari** i la **contrasenya** es llegeixen del magatzem, cada vegada (dins del temps de memòria cau del magatzem);
- l'**host**, el **port** i la **base de dades** continuen sent els de la fila de la credencial. Quan la fila en deixa
  un de buit i el secret el porta, es fa servir el valor del secret.

Els formularis continuen referint-se a la credencial pel nom, de manera que moure una contrasenya a un magatzem no canvia
res als teus formularis.

| Tipus de magatzem | Estat |
|---|---|
| HashiCorp Vault (KV v1 i v2, autenticació per token) | disponible |
| Credencials dinàmiques d'HashiCorp Vault (`<mount>/creds/<role>`) | experimental |
| CyberArk Central Credential Provider (CCP) | experimental |

---

## Afegir un magatzem

Des de la 7.3.0 només un admin pot afegir, canviar o suprimir un magatzem, ja que el seu token o la seva clau s'envien a la seva adreça. Tots els magatzems tenen aquests camps:

| Camp | Significat |
|---|---|
| Nom | Com es refereixen les credencials al magatzem. |
| Tipus | El gestor de secrets. |
| Credencial | Com i on inicia sessió el magatzem: una credencial de [Connexions > Credencials](../credentials.html), al pas **Credencials**, de tipus **HashiCorp Vault** (el seu token i la seva adreça) o **CyberArk**. Conté la URL base, p. ex. `https://vault.example.com:8200`, i els ajustos de TLS: ometre la verificació del certificat, o un paquet de CA en PEM per a una CA privada. No pot llegir ella mateixa d'un magatzem de secrets. |
| Memòria cau (segons) | Quant de temps es reutilitza un secret que s'ha llegit. `0` el llegeix a cada ús. Per defecte 60. |
| Opcions addicionals (JSON) | Opcions pròpies del tipus, com a objecte JSON. |

Fins a la 7.2.0 l'adreça, el token i els ajustos de TLS eren camps del magatzem. L'actualització a la 7.3.0 els trasllada a la seva
credencial, anomenada `<store>-token` (o `<store>-appid` per a CyberArk), vegeu [Adreces a les credencials](../credentials/types.html#addresses-in-credentials).

**Prova la connexió** comprova l'accés sense llegir cap secret. La pàgina **Estat** comprova tots els magatzems, i avisa 7 dies
abans que caduqui un token de Vault.

Cada gestor de secrets té la seva pròpia pàgina:

| Pàgina | Què hi trobaràs |
|---|---|
| [HashiCorp Vault](hashicorp-vault.html) | KV v1 i v2 amb autenticació per token, i credencials dinàmiques de base de dades |
| [CyberArk](cyberark.html) | El Central Credential Provider (CCP) de l'Application Access Manager de CyberArk |

---

## Utilitzar un magatzem

### En una credencial

A **Connexions > Credencials**, al pas **Magatzem** de la credencial, tria **Magatzem de secrets**, després tria el
**Magatzem de secrets** i omple la **Referència**. L'usuari i la contrasenya es llegeixen llavors del magatzem, no s'escriuen.

### En línia, sense fila de credencial

A qualsevol lloc on s'accepta un nom de credencial, pots fer referència directament a un magatzem (`fnCredentials`, `fnRestBasic`,
les `credentials:` d'un formulari, el `dbConfig` d'una consulta).

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

Sense fila de credencial, un secret de base de dades necessita com a mínim un `db_type` i un host, per exemple:

```json
{ "username": "forms", "password": "...", "host": "cmdb.example.com", "port": 3306,
  "db_type": "mysql", "database": "cmdb" }
```

Sense `db_type`, el secret és una credencial normal (usuari, contrasenya i qualsevol altra clau), i una consulta sobre ell suposa `mysql`.

### Noms de les claus

Un secret s'assigna a una credencial amb aquests àlies. Les altres claus es passen tal com són.

| Camp de la credencial | Claus acceptades al secret |
|---|---|
| `user` | `user`, `username`, `login` |
| `password` | `password`, `token`, `api_key`, `apikey`, `secret` |
| `host` | `host`, `address` |
| `port` | `port` |
| `db_name` | `db_name`, `database` |
| `db_type`, `secure` | el mateix nom (només secrets en línia) |

Per a una fila de credencial, l'host, el port i el nom de la base de dades del secret només es fan servir on la
fila els deixa buits.

Un secret amb una estructura diferent es pot remodelar amb una expressió `jq`, passada com a tercer argument de
`fnCredentials`:

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird', '', '.creds | { user: .u, password: .p }')
```

---

## A la llavor de configuració

Els magatzems també es poden declarar a la llavor de configuració, com els altres objectes d'administració:

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

El magatzem inicia sessió amb la seva credencial: una de `vault` conté l'adreça del Vault a `url` i el token com a contrasenya, una de `cyberark`
l'AppID i l'adreça del CCP. Sense credencial, es fan servir l'`url` i el `token` propis del magatzem.
Per als detalls, vegeu [Llavor de configuració](../seed).

---

## Actualitzar des de les variables VAULT_*

Abans de la 7 l'únic magatzem era un HashiCorp Vault configurat amb variables d'entorn `VAULT_*`,
i una credencial hi apuntava amb **Vault path**.

- **Les variables s'importen una sola vegada** com un magatzem anomenat `vault`; treu-les després.
- **Les credencials amb un `vault_path`** ara fan servir aquest magatzem; `vault_path` desapareix a la 8.
