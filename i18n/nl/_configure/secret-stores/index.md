---
layout: default
title: Secret stores
nav_order: 14
has_children: true
has_toc: false
permalink: /secret-stores/
translated_from: c7e5d9fb5e640896bd51e3fa20d76be092857ce2
---

# Secret stores
{: .no_toc }

Lees referenties uit een secret manager in plaats van ze in AnsibleForms op te slaan
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor beheerders: koppel een secret manager, en laat referenties hun gebruiker en wachtwoord daaruit lezen.

---

## Hoe het werkt

Een **secret store** is een verbinding met een secret manager, toegevoegd onder
**Verbindingen > Secret stores**. Een **referentie** kan dan een store en een plaats daarin noemen
(de *secret reference*). Wanneer een formulier, een playbook of een expressie die referentie gebruikt:

- worden **user** en **password** elke keer uit de store gelezen (binnen de cachetijd van de store);
- blijven **host**, **port** en **database** die van de referentierij. Als de rij er een van
  leeg laat en het geheim hem bevat, wordt de waarde uit het geheim gebruikt.

Formulieren blijven op naam naar de referentie verwijzen, dus een wachtwoord naar een store verplaatsen verandert
niets aan je formulieren.

| Type store | Status |
|---|---|
| HashiCorp Vault (KV v1 en v2, tokenauthenticatie) | beschikbaar |
| Dynamische referenties van HashiCorp Vault (`<mount>/creds/<role>`) | experimenteel |
| CyberArk Central Credential Provider (CCP) | experimenteel |

---

## Een store toevoegen

Vanaf 7.3.0 kan alleen een admin een store toevoegen, wijzigen of verwijderen, omdat het token of de sleutel ervan naar zijn adres wordt gestuurd. Elke store heeft deze velden:

| Veld | Betekenis |
|---|---|
| Naam | Hoe referenties naar de store verwijzen. |
| Type | De secret manager. |
| Referentie | Hoe en waar de store zich aanmeldt: een referentie uit [Verbindingen > Inloggegevens](../credentials.html), in de stap **Referenties**, van het type **HashiCorp Vault** (het token en het adres) of **CyberArk**. Ze bevat de basis-URL, bijv. `https://vault.example.com:8200`, en de TLS-instellingen: certificaatcontrole overslaan, of een CA-bundel in PEM voor een private CA. Ze kan zelf niet uit een secret store lezen. |
| Cache (seconden) | Hoe lang een gelezen geheim wordt hergebruikt. `0` leest het bij elk gebruik. Standaard 60. |
| Extra opties (JSON) | Opties die specifiek zijn voor het type, als JSON-object. |

Tot en met 7.2.0 waren het adres, het token en de TLS-instellingen velden van de store. De upgrade naar 7.3.0 verplaatst ze naar zijn
referentie, met de naam `<store>-token` (of `<store>-appid` voor CyberArk), zie [Adressen in referenties](../credentials/types.html#addresses-in-credentials).

**Verbinding testen** controleert de toegang zonder een geheim te lezen. De pagina **Status** controleert elke store, en waarschuwt 7 dagen
voordat een Vault-token verloopt.

Elke secret manager heeft een eigen pagina:

| Pagina | Wat er aan bod komt |
|---|---|
| [HashiCorp Vault](hashicorp-vault.html) | KV v1 en v2 met tokenauthenticatie, en dynamische databasereferenties |
| [CyberArk](cyberark.html) | De Central Credential Provider (CCP) van de Application Access Manager van CyberArk |

---

## Een store gebruiken

### In een referentie

Kies onder **Verbindingen > Inloggegevens**, in de stap **Opslag** van de referentie, **Geheimenkluis**, kies dan de
**Secret store** en vul de **Referentie** in. De gebruiker en het wachtwoord worden dan uit de store gelezen, niet ingetypt.

### Inline, zonder referentierij

Overal waar een referentienaam wordt geaccepteerd, kun je in plaats daarvan rechtstreeks naar een store verwijzen (`fnCredentials`, `fnRestBasic`,
de `credentials:` van een formulier, de `dbConfig` van een query).

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

Vanaf 7.5.0 noemt een `dbConfig` eerst een [database](../databases.html); een verwijzing als deze is geen database, dus ze wordt nog steeds uit
de store gelezen. Ook een database kan zijn aanmelding uit een store lezen, via een referentie van het type database die er een gebruikt.

Zonder referentierij heeft een databasegeheim minstens een `db_type` en een host nodig, bijvoorbeeld:

```json
{ "username": "forms", "password": "...", "host": "cmdb.example.com", "port": 3306,
  "db_type": "mysql", "database": "cmdb" }
```

Zonder `db_type` is het geheim een gewone referentie (gebruiker, wachtwoord en eventuele andere sleutels), en gaat een query erop uit van `mysql`.

### Sleutelnamen

Een geheim wordt met deze aliassen aan een referentie gekoppeld. Andere sleutels worden doorgegeven.

| Veld van de referentie | Geaccepteerde sleutels in het geheim |
|---|---|
| `user` | `user`, `username`, `login` |
| `password` | `password`, `token`, `api_key`, `apikey`, `secret` |
| `host` | `host`, `address` |
| `port` | `port` |
| `db_name` | `db_name`, `database` |
| `db_type`, `secure` | dezelfde naam (alleen inline geheimen) |

Voor een referentierij worden host, poort en databasenaam uit het geheim alleen gebruikt waar de
rij ze leeg laat.

Een geheim met een andere structuur kan worden omgevormd met een `jq`-expressie, doorgegeven als derde argument van
`fnCredentials`:

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird', '', '.creds | { user: .u, password: .p }')
```

---

## In de configuratie-seed

Stores kunnen ook in de configuratie-seed worden gedeclareerd, net als de andere beheerobjecten:

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

De store meldt zich aan met zijn referentie: een `vault`-referentie bevat het adres van de Vault in `url` en het token als wachtwoord, een `cyberark`-referentie
de AppID en het CCP-adres. Zonder referentie worden de eigen `url` en `token` van de store gebruikt.
Zie [Configuratie-seed](../seed) voor details.

---

## Upgraden vanaf de VAULT_*-variabelen

Vóór 7 was de enige store een HashiCorp Vault die met `VAULT_*`-omgevingsvariabelen werd geconfigureerd, en een referentie
wees ernaar met **Vault path**.

- **De variabelen worden eenmaal geïmporteerd** als een store met de naam `vault`; verwijder ze daarna.
- **Referenties met een `vault_path`** gebruiken nu die store; `vault_path` verdwijnt in 8.
