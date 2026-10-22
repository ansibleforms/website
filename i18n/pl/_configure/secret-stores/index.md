---
layout: default
title: Magazyny sekretów
nav_order: 13
has_children: true
has_toc: false
permalink: /secret-stores/
translated_from: 595f94a84c4e8182b1b79289eb309a814dec1287
---

# Magazyny sekretów
{: .no_toc }

Odczytuj poświadczenia z menedżera sekretów zamiast przechowywać je w AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla administratorów: podłącz menedżer sekretów i pozwól poświadczeniom odczytywać z niego użytkownika i hasło.

---

## Jak to działa

**Magazyn sekretów** to połączenie z menedżerem sekretów, dodawane w
**Połączenia > Magazyny sekretów**. **Poświadczenie** może wtedy wskazać magazyn i miejsce w nim
(*odwołanie do sekretu*). Gdy formularz, playbook lub wyrażenie używa tego poświadczenia:

- **użytkownik** i **hasło** są odczytywane z magazynu za każdym razem (w granicach czasu pamięci podręcznej magazynu);
- **host**, **port** i **baza danych** pozostają te z wiersza poświadczenia. Gdy wiersz zostawia
  któreś z nich puste, a sekret je zawiera, używana jest wartość z sekretu.

Formularze nadal odwołują się do poświadczenia po nazwie, więc przeniesienie hasła do magazynu niczego
nie zmienia w Twoich formularzach.

| Typ magazynu | Status |
|---|---|
| HashiCorp Vault (KV v1 i v2, uwierzytelnianie tokenem) | dostępny |
| Dynamiczne poświadczenia HashiCorp Vault (`<mount>/creds/<role>`) | eksperymentalny |
| CyberArk Central Credential Provider (CCP) | eksperymentalny |

---

## Dodawanie magazynu

Od wersji 7.3.0 tylko admin może dodać, zmienić lub usunąć magazyn, bo jego token lub klucz jest wysyłany na jego adres. Każdy magazyn ma te pola:

| Pole | Znaczenie |
|---|---|
| Nazwa | Jak poświadczenia odwołują się do magazynu. |
| Typ | Menedżer sekretów. |
| Poświadczenie | Jak i gdzie loguje się magazyn: poświadczenie z [Połączenia > Poświadczenia](../credentials.html), w kroku **Poświadczenia**, typu **HashiCorp Vault** (jego token i adres) lub **CyberArk**. Zawiera bazowy URL, np. `https://vault.example.com:8200`, i ustawienia TLS: pominięcie weryfikacji certyfikatu albo pakiet CA w PEM dla prywatnego CA. Samo nie może odczytywać z magazynu sekretów. |
| Pamięć podręczna (sekundy) | Jak długo odczytany sekret jest ponownie używany. `0` odczytuje go przy każdym użyciu. Domyślnie 60. |
| Dodatkowe opcje (JSON) | Opcje specyficzne dla typu, jako obiekt JSON. |

Do wersji 7.2.0 adres, token i ustawienia TLS były polami magazynu. Aktualizacja do 7.3.0 przenosi je do jego
poświadczenia o nazwie `<store>-token` (lub `<store>-appid` dla CyberArk), zobacz [Adresy w poświadczeniach](../credentials/types.html#addresses-in-credentials).

**Testuj połączenie** sprawdza dostęp bez odczytywania sekretu. Strona **Stan** sprawdza każdy magazyn i ostrzega 7 dni
przed wygaśnięciem tokenu Vault.

Każdy menedżer sekretów ma własną stronę:

| Strona | Czego dotyczy |
|---|---|
| [HashiCorp Vault](hashicorp-vault.html) | KV v1 i v2 z uwierzytelnianiem tokenem oraz dynamiczne poświadczenia bazy danych |
| [CyberArk](cyberark.html) | Central Credential Provider (CCP) z Application Access Manager firmy CyberArk |

---

## Używanie magazynu

### W poświadczeniu

W **Połączenia > Poświadczenia**, w kroku **Magazyn** poświadczenia, wybierz **Magazyn sekretów**, a potem wskaż
**Magazyn sekretów** i wypełnij **Odwołanie**. Użytkownik i hasło są wtedy odczytywane z magazynu, a nie wpisywane.

### Bezpośrednio, bez wiersza poświadczenia

Wszędzie tam, gdzie przyjmowana jest nazwa poświadczenia, możesz zamiast tego odwołać się bezpośrednio do magazynu (`fnCredentials`, `fnRestBasic`,
`credentials:` formularza, `dbConfig` zapytania).

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

Bez wiersza poświadczenia sekret bazy danych potrzebuje co najmniej `db_type` i hosta, na przykład:

```json
{ "username": "forms", "password": "...", "host": "cmdb.example.com", "port": 3306,
  "db_type": "mysql", "database": "cmdb" }
```

Bez `db_type` sekret jest zwykłym poświadczeniem (użytkownik, hasło i dowolne inne klucze), a zapytanie na nim zakłada `mysql`.

### Nazwy kluczy

Sekret jest mapowany na poświadczenie przez te aliasy. Pozostałe klucze są przekazywane dalej.

| Pole poświadczenia | Akceptowane klucze w sekrecie |
|---|---|
| `user` | `user`, `username`, `login` |
| `password` | `password`, `token`, `api_key`, `apikey`, `secret` |
| `host` | `host`, `address` |
| `port` | `port` |
| `db_name` | `db_name`, `database` |
| `db_type`, `secure` | ta sama nazwa (tylko sekrety bezpośrednie) |

Dla wiersza poświadczenia host, port i nazwa bazy danych z sekretu są używane tylko tam, gdzie
wiersz zostawia je puste.

Sekret o innej strukturze można przekształcić wyrażeniem `jq`, przekazanym jako trzeci argument
`fnCredentials`:

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird', '', '.creds | { user: .u, password: .p }')
```

---

## W config seed

Magazyny można też deklarować w config seed, jak pozostałe obiekty administracyjne:

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

Magazyn loguje się swoim poświadczeniem: poświadczenie `vault` zawiera adres Vault w `url` i token jako hasło, poświadczenie `cyberark`
AppID i adres CCP. Bez poświadczenia używane są własne `url` i `token` magazynu.
Szczegóły opisuje strona [Config seed](../seed).

---

## Aktualizacja ze zmiennych VAULT_*

Przed wersją 7 jedynym magazynem był HashiCorp Vault konfigurowany zmiennymi środowiskowymi `VAULT_*`,
a poświadczenie wskazywało na niego przez **Vault path**.

- **Zmienne są importowane jednorazowo** jako magazyn o nazwie `vault`; potem je usuń.
- **Poświadczenia z `vault_path`** używają teraz tego magazynu; `vault_path` zniknie w wersji 8.
