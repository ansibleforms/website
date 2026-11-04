---
layout: default
title: HashiCorp Vault
parent: Magazyny sekretów
nav_order: 1
translated_from: 1134189481b234cb2b18edbabd74427e37d2f43c
---

# HashiCorp Vault
{: .no_toc }

Odczytuj i zapisuj poświadczenia w HashiCorp Vault KV, odczytuj sekrety dynamiczne
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Pola magazynu

Oprócz [pól, które ma każdy magazyn](./#adding-a-store), magazyn HashiCorp Vault ma te pola:

| Pole | Znaczenie |
|---|---|
| Poświadczenie | Poświadczenie **HashiCorp Vault** z [Połączenia > Poświadczenia](../credentials.html): adres Vault, jego ustawienia TLS i token jako hasło, z prawem odczytu ścieżek, których używają Twoje poświadczenia. **Dodaj poświadczenie** tworzy poświadczenie tego typu. AnsibleForms nie odnawia tokenu. |
| Przestrzeń nazw | Przestrzeń nazw Vault Enterprise, wysyłana jako `X-Vault-Namespace`. Widoczna po włączeniu **Vault Enterprise** w kroku **Typ**. |
| Wersja KV | `2` (domyślnie) lub `1`. |
| Domyślny punkt montowania | Używany dla odwołania bez ukośnika, np. `myapp` staje się `secret/data/myapp`. |

Odwołanie do sekretu to ścieżka, np. `secret/myapp/prod`. Dla KV v2 segment `/data/`
jest wstawiany, gdy go pominiesz.

---

## Zapisywanie poświadczeń

Od 7.6.0 użytkownika i hasło poświadczenia można zapisać w Vault przy **Zapisie** (zob. [Zapisywanie poświadczeń](./#writing-credentials)).

Włącz **Zezwól na zapis** w **Opcjach** magazynu i wskaż, gdzie może zapisywać:

| Pole | Znaczenie |
|---|---|
| Zezwól na zapis | Pozwala poświadczeniu zapisać użytkownika i hasło w tym magazynie przy **Zapisie**. Domyślnie wyłączone. |
| Prefiks zapisu | Ścieżka, w której lub pod którą zapisywane są poświadczenia, np. `secret/ansibleforms`. Sam punkt montowania, np. `secret`, zezwala na cały punkt montowania. Wymagany przy włączonym zapisie. |

Sekret jest zapisywany jako `username` i `password`, w KV v2 lub v1 zgodnie z **Wersją KV** magazynu. Token potrzebuje uprawnień
read, create i update pod prefiksem; read sprawdza, czy sekret już tam jest. Dla KV v2 i prefiksu `secret/ansibleforms`:

```hcl
path "secret/data/ansibleforms/*" {
  capabilities = ["read", "create", "update"]
}
```

Ścieżka silnika sekretów dynamicznych, np. `database/creds/readonly`, nigdy nie jest zapisywana: te poświadczenia tworzy sam Vault.

---

## Dynamiczne poświadczenia bazy danych

Odwołanie w postaci `<mount>/creds/<role>`, np. `database/creds/readonly`, odczytuje z
silnika sekretów dynamicznych, takiego jak silnik bazy danych Vault. Vault tworzy wtedy nowe konto bazy danych
przy każdym odczycie, ważne przez czas dzierżawy (lease).

- Konto jest ponownie używane przez 80% swojej dzierżawy, a nie przez czas pamięci podręcznej; przy pamięci podręcznej `0` każde zapytanie odczytuje nowe.
- Vault zwraca tylko użytkownika i hasło: resztę połączenia umieść w wierszu poświadczenia.
- Dzierżawa nigdy nie jest unieważniana przedwcześnie; konto wygasa, gdy Vault kończy dzierżawę.
