---
layout: default
title: Obiekty zarządzane
parent: Config seed
nav_order: 2
translated_from: b007fcc08a96c4035422a238ae335bf4eedd48c5
---

# Obiekty zarządzane
{: .no_toc }

Jak seed przejmuje obiekty, które wymienia, i jak trzyma sekrety poza plikiem
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Sekcje jednowierszowe: wszystko albo nic

`ldap`, `settings` i `chat_assistant` (`chat` przed wersją 7.8.0) to każda **pojedynczy wiersz**, więc seed musi deklarować wszystkie ich pola.

Seed, który pomija pole, odmawia startu i podaje to pole:

```
Config seed failed, refusing to start: Seed file validation failed: /settings must have required property 'url'
```

Pustą wartość deklaruj jawnie przez `""` lub `false`. Kilka pól jest opcjonalnych, a pominięte pozostaje bez zmian:

| Sekcja | Pola opcjonalne |
|---|---|
| `ldap` | `description`, `credential` (poświadczenie do bind) i `groupfilter` |
| `chat_assistant` | `auth_type`, `api_version`, `request_user`, `ignore_certs`, `extra_headers` oraz `credential` od wersji 7.8.0 |
| `settings` | Klucze `mail_*`, przestarzałe od wersji 7.6.0 (zobacz [Przykład](example.html)) |

`settings` obejmuje tylko URL i przestarzałe klucze poczty; wszystkie pozostałe ustawienia można nadal edytować.

---

## Plik nie zawiera sekretów

Każde `${VARIABLE}` jest zastępowane tą zmienną środowiskową (na Kubernetes z `Secret`), więc plik może być w gicie.

Nieustawiona zmienna to **błąd krytyczny**, więc symbol zastępczy nigdy nie zostanie zapisany jako hasło.

Poświadczenia mogą też używać [magazynu sekretów](../secret-stores) (`secret_store`, `secret_ref`); `vault_path` zniknie w wersji 8.

---

## Obiekty zarządzane

Obiekt sekcji listowych (`runners`, `secret_stores`, `credentials`, `databases`, `sso`, `repositories`, `syslog`,
`notifications` i `labels`) lub sekcji jednowierszowej, który pochodzi z seeda, jest oznaczony jako **zarządzany**:

- Jest wymuszany przy **każdym** starcie, więc plik pozostaje źródłem prawdy.
- Jest tylko do odczytu: API odpowiada **403**, interfejs wyłącza Edytuj i Usuń, a jego własna strona mówi, że pochodzi z pliku config
  seed i jest tylko do odczytu.
- Tylko seed może ustawić lub usunąć to oznaczenie.

Obiekty utworzone ręcznie **nigdy nie są ruszane**, chyba że seed deklaruje tę samą nazwę. Taki rekord zostaje wtedy **przejęty**:
zadeklarowane pola są wymuszane, a rekord staje się tylko do odczytu. Przejęcie jest zapisywane w dzienniku jako ostrzeżenie i w śladzie audytu.

Stosowanie seeda jest idempotentne: rekordy, które już pasują, zostają bez zmian, więc restart zwykle raportuje `0 updated`.

Zadeklarowane repozytorium, którego kopii roboczej brakuje, jest **klonowane ponownie** przy każdym starcie, więc nieudane pierwsze klonowanie jest
ponawiane. Wiersz *Repozytoria* na stronie Stan pokazuje każde repozytorium bez kopii roboczej.

Od wersji 7.8.0 [repozytorium git](../repositories/) może przechowywać te same rodzaje obiektów. Obiekt, który przechowuje repozytorium, pozostaje
obiektem repozytorium: element seeda dla niego nie jest stosowany, a dziennik serwera o tym informuje. Repozytorium zadeklarowane przez seed pozostaje obiektem seeda.

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

Usunięcie `CONFIG_SEED_PATH` wyłącza seed: następny start zwalnia każdy rekord i każde pole, którymi seed zarządzał, tak jak zrobiłby to
zastosowany pusty seed. Rekordy zachowują swoje wartości i znów można je edytować, a dziennik serwera i dziennik audytu podają, co zostało zwolnione.

`CONFIG_SEED_PATH`, którego pliku brakuje, niczego nie zwalnia: serwer zamiast tego odmawia startu, bo zamontowany plik może
po prostu się spóźniać.

---

## Ustawienia deklarowane przez seed

Sekcje dodane w wersji 7.8.0 seed przejmuje mniej ściśle niż obiekty zarządzane, na dwa sposoby.

| Sekcje | Jak seed je przejmuje |
|---|---|
| `defaults`, `logo`, `icon`, `name`, `links`, `mcp` | Pole po polu: każde zadeklarowane pole jest tylko do odczytu na swojej stronie, z informacją, a API odmawia jego zmiany (403) |
| `users`, `groups`, `announcements`, `disclaimer`, `ssh` | Tworzone lub zmieniane przy każdym zastosowaniu, nigdy nie blokowane ani usuwane |

Pole `defaults`, `logo`, `icon`, `name`, `links` lub `mcp`, którego seed już nie deklaruje, zostaje zwolnione, a wszystkie są zwalniane,
gdy seed zostaje wyłączony. Logo lub ikony z seeda nie można wgrać ani usunąć w aplikacji. Gdy repozytorium przechowuje tę samą stronę,
seed zachowuje pola, które deklaruje, a repozytorium przechowuje pozostałe.

Użytkownik, grupa, ogłoszenie, wersja zastrzeżenia albo klucz SSH i znane hosty z seeda pozostają edytowalne w aplikacji, a
następne zastosowanie ponownie zapisuje wartości seeda tam, gdzie się różnią. Usunięcie elementu z pliku zostawia go w aplikacji, a `prune` nie usuwa
żadnego z nich.
