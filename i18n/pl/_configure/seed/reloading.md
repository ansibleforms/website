---
layout: default
title: Przeładowanie i start
parent: Config seed
nav_order: 3
translated_from: d6cc2dfaf45589a284b52223737ed04ac4330e67
---

# Przeładowanie i start
{: .no_toc }

Zmiana pliku bez restartu i co się dzieje przy starcie
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Zmiana pliku bez restartu

Seed jest ponownie odczytywany co `CONFIG_SEED_RELOAD_SECONDS` (domyślnie 60, `0` to wyłącza)
i ponownie stosowany, gdy jego zawartość się zmieniła. Zmiana zatwierdzona w gicie trafia więc
automatycznie do działającej instancji: na Kubernetes `ConfigMap` jest ponownie montowany w podzie w ciągu
około minuty, a następne sprawdzenie go wychwytuje. Nie ma rolloutu ani restartu i żaden
hook nie musi niczego wywoływać.

Dla niezmienionego pliku odpytanie oblicza jeden hash i kończy, więc nigdy nie przepisuje wiersza, który już
zastosowało.

Aby zastosować plik od razu, zamiast czekać na następne sprawdzenie, użyj jednego z tych sposobów:

```
POST /api/v2/config-seed/apply     # settings admin ; answers with what it did
kill -HUP 1                        # inside the container, no credentials needed
```

Oba **wymuszają** zastosowanie, nawet gdy plik się nie zmienił. Wymuszone zastosowanie przywraca
zarządzany rekord, który edytowano bezpośrednio w bazie danych, i ponownie klonuje zadeklarowane repozytorium,
którego kopii roboczej brakuje.

{: .note }
> Przeładowanie **nigdy nie jest krytyczne**, w przeciwieństwie do zastosowania przy starcie. Instancja, która już
> obsługuje ruch, zachowuje bieżącą konfigurację, przyczyna trafia do dziennika, a wiersz *Config seed*
> na stronie Stan robi się czerwony i ją podaje. Literówka wypchnięta do gita nie może położyć
> działającej instancji bez żadnego działania operatora.
>
> Ta sama błędna zawartość nie jest też ponawiana przy każdym sprawdzeniu; inaczej jedna zła edycja
> zapisywałaby ten sam błąd w dzienniku w nieskończoność. Popraw plik albo wywołaj endpoint, aby ponowić
> od razu.

---

## Uszkodzony seed nie pozwala wystartować

Nieczytelny plik, nieprawidłowy YAML, nieznane pole, zduplikowana nazwa lub nierozwiązane
`${VARIABLE}` sprawia, że serwer **kończy działanie** zamiast wystartować. Dotyczy to tylko ścieżki **startu**:
zobacz uwagę wyżej, co ten sam plik robi z instancją, która już działa.

Jest to celowe. Kontynuowanie z poprzednią konfiguracją zostawiłoby instancję, której
zachowanie nie odpowiada już manifestowi, który ma ją opisywać, i nic nie
zgłaszałoby tej niezgodności. Przyczyna jest zapisywana na standardowe wyjście błędów i do pliku dziennika, więc
pokazują ją `kubectl logs` i `docker logs`.

Walidacja jest ścisła: nieznane pola są odrzucane, a nie ignorowane, a błąd podaje
niewłaściwy klucz:

```
Config seed failed, refusing to start: Seed file validation failed: /awx/items/0 must NOT have additional properties 'tokenn'
```

---

## Pusta baza danych sama się przygotowuje

Przy włączonym `ALLOW_SCHEMA_CREATION` (domyślnie) baza danych, która **w ogóle nie zawiera tabel
AnsibleForms**, dostaje schemat utworzony przy starcie. Nowe wdrożenie startuje więc
bez potrzeby ręcznego wywoływania endpointu `/schema`.

Warunek wstępny jest celowo ścisły: tworzenie schematu **najpierw usuwa każdą tabelę**, więc
uruchamia się tylko na całkowicie pustej bazie danych. Baza danych, której brakuje
jednej kolumny albo która ma tabele, ale nie ma kont użytkowników, *nie* jest pusta i zostaje nietknięta;
takie przypadki obsługują łatki schematu.
