---
layout: default
title: HashiCorp Vault
parent: Magazyny sekretów
nav_order: 1
translated_from: 33cbbea1ca86bf474182d220bd6824af81aa752f
---

# HashiCorp Vault
{: .no_toc }

Odczytuj poświadczenia z HashiCorp Vault, z KV v1 lub v2 albo z silnika sekretów dynamicznych
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

## Dynamiczne poświadczenia bazy danych

Odwołanie w postaci `<mount>/creds/<role>`, np. `database/creds/readonly`, odczytuje z
silnika sekretów dynamicznych, takiego jak silnik bazy danych Vault. Vault tworzy wtedy nowe konto bazy danych
przy każdym odczycie, ważne przez czas dzierżawy (lease).

- Konto jest ponownie używane przez 80% swojej dzierżawy, a nie przez czas pamięci podręcznej; przy pamięci podręcznej `0` każde zapytanie odczytuje nowe.
- Vault zwraca tylko użytkownika i hasło: resztę połączenia umieść w wierszu poświadczenia.
- Dzierżawa nigdy nie jest unieważniana przedwcześnie; konto wygasa, gdy Vault kończy dzierżawę.
