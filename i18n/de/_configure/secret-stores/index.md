---
layout: default
title: Secret Stores
nav_order: 13
has_children: true
has_toc: false
permalink: /secret-stores/
translated_from: 595f94a84c4e8182b1b79289eb309a814dec1287
---

# Secret Stores
{: .no_toc }

Anmeldedaten aus einem Secret Manager lesen, statt sie in AnsibleForms zu speichern
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Administratoren: Binden Sie einen Secret Manager an, und lassen Sie Anmeldedaten ihren Benutzer und ihr Passwort daraus lesen.

---

## Funktionsweise

Ein **Secret Store** ist eine Verbindung zu einem Secret Manager, angelegt unter
**Verbindungen > Secret Stores**. **Anmeldedaten** können dann einen Store und eine Stelle darin nennen
(die *Secret-Referenz*). Wenn ein Formular, ein Playbook oder ein Ausdruck diese Anmeldedaten verwendet:

- werden **Benutzer** und **Passwort** jedes Mal aus dem Store gelesen (innerhalb der Cache-Zeit des Stores);
- bleiben **Host**, **Port** und **Datenbank** die der Anmeldedaten-Zeile. Lässt die Zeile
  eines davon leer und das Secret enthält es, wird der Wert aus dem Secret verwendet.

Formulare verweisen weiterhin über den Namen auf die Anmeldedaten, daher ändert das Verschieben eines Passworts in einen Store
nichts an Ihren Formularen.

| Store-Typ | Status |
|---|---|
| HashiCorp Vault (KV v1 und v2, Token-Authentifizierung) | verfügbar |
| Dynamische Anmeldedaten von HashiCorp Vault (`<mount>/creds/<role>`) | experimentell |
| CyberArk Central Credential Provider (CCP) | experimentell |

---

## Einen Store hinzufügen

Ab 7.3.0 kann nur ein Admin einen Store hinzufügen, ändern oder löschen, da sein Token oder Schlüssel an seine Adresse gesendet wird. Jeder Store hat diese Felder:

| Feld | Bedeutung |
|---|---|
| Name | Wie Anmeldedaten auf den Store verweisen. |
| Typ | Der Secret Manager. |
| Anmeldeinformation | Wie und wo sich der Store anmeldet: Anmeldedaten aus [Verbindungen > Anmeldedaten](../credentials.html), im Schritt **Anmeldedaten**, vom Typ **HashiCorp Vault** (Token und Adresse) oder **CyberArk**. Sie enthalten die Basis-URL, z. B. `https://vault.example.com:8200`, und die TLS-Einstellungen: Zertifikatsprüfung überspringen oder ein CA-Bundle in PEM für eine private CA. Sie können selbst nicht aus einem Secret Store lesen. |
| Cache (Sekunden) | Wie lange ein gelesenes Secret wiederverwendet wird. `0` liest es bei jeder Verwendung. Standard 60. |
| Zusätzliche Optionen (JSON) | Typspezifische Optionen als JSON-Objekt. |

Bis 7.2.0 waren Adresse, Token und TLS-Einstellungen Felder des Stores. Das Upgrade auf 7.3.0 verschiebt sie in seine
Anmeldedaten namens `<store>-token` (oder `<store>-appid` bei CyberArk), siehe [Adressen in Anmeldedaten](../credentials/types.html#addresses-in-credentials).

**Verbindung testen** prüft den Zugriff, ohne ein Secret zu lesen. Die Seite **Status** prüft jeden Store und warnt 7 Tage
bevor ein Vault-Token abläuft.

Jeder Secret Manager hat eine eigene Seite:

| Seite | Inhalt |
|---|---|
| [HashiCorp Vault](hashicorp-vault.html) | KV v1 und v2 mit Token-Authentifizierung sowie dynamische Datenbank-Anmeldedaten |
| [CyberArk](cyberark.html) | Der Central Credential Provider (CCP) des Application Access Manager von CyberArk |

---

## Einen Store verwenden

### In Anmeldedaten

Wählen Sie unter **Verbindungen > Anmeldedaten** im Schritt **Speicher** der Anmeldedaten **Secret Store**, wählen Sie dann den
**Secret Store** und füllen Sie die **Referenz** aus. Benutzer und Passwort werden dann aus dem Store gelesen, nicht eingegeben.

### Inline, ohne Anmeldedaten-Zeile

Überall, wo ein Name von Anmeldedaten akzeptiert wird, können Sie stattdessen direkt auf einen Store verweisen (`fnCredentials`, `fnRestBasic`,
die `credentials:` eines Formulars, die `dbConfig` einer Abfrage).

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

Ohne Anmeldedaten-Zeile braucht ein Datenbank-Secret mindestens einen `db_type` und einen Host, zum Beispiel:

```json
{ "username": "forms", "password": "...", "host": "cmdb.example.com", "port": 3306,
  "db_type": "mysql", "database": "cmdb" }
```

Ohne `db_type` ist das Secret eine einfache Anmeldung (Benutzer, Passwort und weitere Schlüssel), und eine Abfrage darauf nimmt `mysql` an.

### Schlüsselnamen

Ein Secret wird mit diesen Aliasen auf Anmeldedaten abgebildet. Andere Schlüssel werden durchgereicht.

| Feld der Anmeldedaten | Akzeptierte Schlüssel im Secret |
|---|---|
| `user` | `user`, `username`, `login` |
| `password` | `password`, `token`, `api_key`, `apikey`, `secret` |
| `host` | `host`, `address` |
| `port` | `port` |
| `db_name` | `db_name`, `database` |
| `db_type`, `secure` | gleicher Name (nur bei Inline-Secrets) |

Bei einer Anmeldedaten-Zeile werden Host, Port und Datenbankname aus dem Secret nur verwendet, wo die
Zeile sie leer lässt.

Ein Secret mit einer anderen Struktur lässt sich mit einem `jq`-Ausdruck umformen, der als drittes Argument von
`fnCredentials` übergeben wird:

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird', '', '.creds | { user: .u, password: .p }')
```

---

## Im Config-Seed

Stores lassen sich wie die anderen Admin-Objekte auch im Config-Seed deklarieren:

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

Der Store meldet sich mit seinen Anmeldedaten an: `vault`-Anmeldedaten enthalten die Adresse des Vault in `url` und das Token als Passwort, `cyberark`-Anmeldedaten
die AppID und die Adresse des CCP. Ohne Anmeldedaten werden `url` und `token` des Stores selbst verwendet.
Details finden Sie unter [Config-Seed](../seed).

---

## Upgrade von den VAULT_*-Variablen

Vor 7 war der einzige Store ein HashiCorp Vault, konfiguriert mit
`VAULT_*`-Umgebungsvariablen, und Anmeldedaten verwiesen mit **Vault-Pfad** darauf.

- **Die Variablen werden einmal importiert**, als Store namens `vault`; entfernen Sie sie danach.
- **Anmeldedaten mit einem `vault_path`** verwenden jetzt diesen Store; `vault_path` entfällt in 8.
