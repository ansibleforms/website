---
layout: default
title: Poświadczenia
parent: Wyrażenia
nav_order: 4
translated_from: bfa50c90495c68300d189f9a0eb38e25df9e7c8e
---

# Poświadczenia
{: .no_toc }

Odczyt zapisanego poświadczenia w wyrażeniu
{: .fs-6 .fw-300 }

---

Odczytaj zapisane poświadczenie po nazwie lub wyrażeniu regularnym, z wartością zapasową:

```javascript
fn.fnCredentials('credentialname_or_regex','fallback_credentialname_or_regex')

// Try to use `fnRestBasic` and `fnRestJwtSecure` if possible, this avoids passwords and tokens going over the network.

// output : a credential object with all properties (user, password, host, port)
```

Najpierw sprawdzana jest dokładna nazwa. Gdy żadne poświadczenie nie ma takiej nazwy, nazwa jest traktowana jako wyrażenie regularne, a potem sprawdzana jest wartość zapasowa.

#### Ograniczenie przez rolę

Gdy jedna z ról użytkownika ma listę `credentials` w `config.yaml`, `fn.fnCredentials` zwraca tylko poświadczenie, na które taka rola
pozwala: wzorce roli są porównywane z nazwą znalezionego poświadczenia (po nazwie, wyrażeniu regularnym lub wartości zapasowej),
a każde inne jest odrzucane. Role bez tej listy go nie ograniczają, a administrator nigdy nie jest ograniczony.

#### Poświadczenia z magazynu sekretów

Poświadczenie, które wskazuje [magazyn sekretów](../secret-stores), pobiera swoje `user` i `password`
z tego magazynu w czasie działania. `fn.fnCredentials('myapp')` działa dalej bez zmian.

Sekret można też odczytać bez wiersza poświadczenia, wszędzie tam, gdzie przyjmowana jest nazwa poświadczenia
(w tym w `fnRestBasic`, `fnRestJwtSecure` i podstawieniach nagłówków w `fnRestAdvanced`):

```javascript
fn.fnCredentials('secret:vault:secret/ontap')   // secret:<store>:<reference>
fn.fnCredentials('vault:secret/ontap')          // the store named `vault`
```

Klucze sekretu są mapowane tak, jak opisano w [Nazwy kluczy](../secret-stores#key-names).
Sekret o innym kształcie przekształca się wyrażeniem `jq` podanym jako trzeci argument:

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird','','.creds | { user: .u, password: .p }')
```
