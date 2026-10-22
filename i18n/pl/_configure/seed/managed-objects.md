---
layout: default
title: Obiekty zarządzane
parent: Config seed
nav_order: 2
translated_from: dd0ea4d46391bf9b2e5928063cd30e33ac1285f9
---

# Obiekty zarządzane
{: .no_toc }

Jak seed przejmuje obiekty, które wymienia, i jak trzyma sekrety poza plikiem
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Sekcje jednowierszowe: wszystko albo nic

`ldap`, `settings` i `chat` to każda **pojedynczy wiersz**, więc seed musi deklarować wszystkie ich pola; pozostałe sekcje są listami.

Seed, który pomija pole, odmawia startu i podaje to pole:

```
Config seed failed, refusing to start: Seed file validation failed: /settings must have required property 'mail_server'
```

Pustą wartość deklaruj jawnie przez `""` lub `false`. Kilka pól jest opcjonalnych, a pominięte pozostaje bez zmian:

| Sekcja | Pola opcjonalne |
|---|---|
| `ldap` | `description`, `credential` (poświadczenie do bind) i `groupfilter` |
| `chat` | `auth_type`, `api_version`, `request_user`, `ignore_certs` i `extra_headers` |
| `settings` | Brak |

`settings` obejmuje tylko pola poczty i URL; wszystkie pozostałe ustawienia można nadal edytować.

---

## Plik nie zawiera sekretów

Każde `${VARIABLE}` jest zastępowane tą zmienną środowiskową (na Kubernetes z `Secret`), więc plik może być w gicie.

Nieustawiona zmienna to **błąd krytyczny**, więc symbol zastępczy nigdy nie zostanie zapisany jako hasło.

Poświadczenia mogą też używać [magazynu sekretów](../secret-stores) (`secret_store`, `secret_ref`); `vault_path` zniknie w wersji 8.

---

## Obiekty zarządzane

Obiekt, który pochodzi z seeda, jest oznaczony jako **zarządzany**:

- Jest wymuszany przy **każdym** starcie, więc plik pozostaje źródłem prawdy.
- Jest tylko do odczytu: API odpowiada **403**, interfejs wyłącza Edytuj i Usuń, a jego własna strona mówi, że pochodzi z pliku config
  seed i jest tylko do odczytu.
- Tylko seed może ustawić lub usunąć to oznaczenie.

Obiekty utworzone ręcznie **nigdy nie są ruszane**, chyba że seed deklaruje tę samą nazwę. Taki rekord zostaje wtedy **przejęty**:
zadeklarowane pola są wymuszane, a rekord staje się tylko do odczytu. Przejęcie jest zapisywane w dzienniku jako ostrzeżenie i w śladzie audytu.

Stosowanie seeda jest idempotentne: rekordy, które już pasują, zostają bez zmian, więc restart zwykle raportuje `0 updated`.

Zadeklarowane repozytorium, którego kopii roboczej brakuje, jest **klonowane ponownie** przy każdym starcie, więc nieudane pierwsze klonowanie jest
ponawiane. Wiersz *Repozytoria* na stronie Stan pokazuje każde repozytorium bez kopii roboczej.

### Usuwanie obiektu

Usunięcie obiektu z pliku go **zwalnia**: rekord zostaje i znów można go edytować. Usunięcie całej sekcji
działa tak samo.

Dodaj `prune: true` do sekcji listy, aby **usuwać** zarządzane rekordy, których plik już nie deklaruje:

```yaml
credentials:
  prune: true
  items:
    - name: production-db
      # anything else the seed used to manage is deleted
```

`prune` nigdy nie usuwa rekordu utworzonego ręcznie.

### Wyłączanie seeda

Usunięcie `CONFIG_SEED_PATH` **niczego** nie zwalnia: seed nie jest już stosowany, a rekordy, którymi zarządzał, pozostają zarządzane
i tylko do odczytu. Aby znów je edytować, najpierw je zwolnij: skieruj `CONFIG_SEED_PATH` na plik bez nich (pusty plik niczego nie deklaruje
i zwalnia każdy rekord), pozwól mu się zastosować przy starcie lub przeładowaniu, a potem usuń zmienną. Zwolnione rekordy zostają takie, jakie
są, i można je edytować.
