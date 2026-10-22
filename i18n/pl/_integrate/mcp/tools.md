---
layout: default
title: Narzędzia
parent: Serwer MCP
nav_order: 2
translated_from: a8c4d7ff425720a098c720cc1ade3629094bdb40
---

# Narzędzia
{: .no_toc }

Narzędzia, których agent używa do wypełniania, zatwierdzania i ponownego uruchamiania formularzy
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Serwer MCP oferuje do 15 narzędzi. Sześć jest oferowanych każdemu użytkownikowi; pozostałe zależą od opcji ról użytkownika, więc użytkownik
bez danej opcji w ogóle nie dostaje jej narzędzi:

| Narzędzie | Co robi | Oferowane przy |
|---|---|---|
| `list_forms` | Formularze, z których użytkownik może korzystać: nazwa, opis, kategorie i `enableForChat` (czy asystent czatu go oferuje). | zawsze |
| `get_form` | Pełna definicja jednego formularza. Każde pole zawiera też `dynamic` (obliczane z wyrażenia lub zapytania) i `dependsOn` (pola, które odczytuje). | zawsze |
| `resolve_field` | Oblicza formularz dla dotychczas wypełnionych wartości. Zobacz niżej. | zawsze |
| `launch_job` | Uruchamia formularz z podanymi wartościami, dokładnie tak jak wysłanie z przeglądarki. Zwraca id zadania. | zawsze |
| `relaunch_job` | Uruchamia zadanie ponownie ze zmienionymi niektórymi polami. Zobacz niżej. | zawsze |
| `get_job` | Stan i wynik zadania (`tail` ogranicza wynik do ostatnich wierszy). | zawsze |
| `plan_job` | Uruchamia formularz raz, później, jako użytkownik: to, co robi **Uruchom później (jednorazowo)** w formularzu. | `allowPlannedJobs` |
| `create_schedule` | Tworzy harmonogram, cykliczny (`cron`) lub jednorazowy (`run_at`), jak na stronie **Harmonogramy**. | `allowScheduledJobs` |
| `list_schedules` | Harmonogramy, które użytkownik może widzieć: wszystkie przy `allowScheduledJobs`, w przeciwnym razie zaplanowane przez niego uruchomienia. | `allowPlannedJobs` lub `allowScheduledJobs` |
| `get_schedule` | Jeden harmonogram, z jego extra vars (te wyglądające na sekrety są maskowane) i wynikiem ostatniego uruchomienia. | `allowPlannedJobs` lub `allowScheduledJobs` |
| `delete_schedule` | Anuluje zaplanowane uruchomienie lub usuwa harmonogram, który użytkownik może widzieć. | `allowPlannedJobs` lub `allowScheduledJobs` |
| `list_stored_jobs` | [Zapisane zadania](../jobs/stored-jobs.html), które użytkownik może widzieć, bez ich wartości. | `allowStoredJobs` |
| `get_stored_job` | Jedno zapisane zadanie z jego wartościami, według `id` albo według `form` i `name` spośród własnych zadań użytkownika. | `allowStoredJobs` |
| `store_job` | Zapisuje wartości formularza pod nazwą, tak jak robi to **Zapisz** w formularzu. | `allowStoredJobs` |
| `delete_stored_job` | Usuwa zapisane zadanie, które użytkownik może widzieć. | `allowStoredJobs` |

`launch_job`, `relaunch_job` i `plan_job` przyjmują `verbose: true`, aby uruchomić zadanie w trybie szczegółowym, co wymaga
opcji roli `allowVerboseMode`. Przy [`MCP_READ_ONLY`](setup.html#limiting-what-agents-can-do) narzędzia, które uruchamiają, planują lub
zmieniają (`launch_job`, `relaunch_job`, `plan_job`, `create_schedule`, `delete_schedule`, `store_job` i `delete_stored_job`),
nie są oferowane.

Nie ma narzędzia do uruchamiania dowolnego wyrażenia, zapytania, playbooka ani extravars. Wyrażenia
i zapytania działają zawsze tylko tak, jak definiuje je formularz.

[Asystent czatu](../chat) również korzysta z tych narzędzi, z przyciskiem **Uruchom** zamiast `launch_job`.

---

## Wypełnianie formularza

Wywołaj `resolve_field` z nazwą formularza i dotychczasowymi wartościami, a potem ponownie po każdej odpowiedzi. Przechodzi ono przez
pola w kolejności zależności i dla każdego podaje:

- `status`: `resolved`, `waiting` (z `waitingFor`), `hidden` lub `error` (pole wraca do swojej wartości domyślnej);
- `value`, `default` oraz, dla pól wyboru, `options` (najwyżej `maxOptions`, domyślnie 200);
- `needsInput`: wymagane pole bez wartości lub pole wyboru wciąż na `__auto__`;
- `validationErrors`: reguły, które wartość narusza, jako `[{type, description}]`, z komunikatem przeglądarki.

Dla całego formularza `missing` i `invalid` wymieniają, co jeszcze trzeba poprawić; `launch_job` go odrzuca, dopóki `complete` nie ma wartości true.

Walidacja to własny kod przeglądarki, wspólny z [walidacją przy uruchomieniu](../launch-validation). Pola ukryte nie są
walidowane, a puste pole opcjonalne jest prawidłowe.

---

## Harmonogramy i zaplanowane uruchomienia

`plan_job` przyjmuje te same `form`, `values` i `expectedPayloadHash` co `launch_job`, wraz z `name` dla uruchomienia i `run_at`, czyli
czasem ISO 8601 z przesunięciem lub `Z` (`2026-10-15T22:00:00+02:00`); czas bez strefy jest odrzucany. Wartości są rozwiązywane
i walidowane od razu, a następnie sprawdzane ponownie w chwili uruchomienia, tak jak w przypadku [zaplanowanego uruchomienia](../jobs/schedules.html#planned-runs) w
przeglądarce. Odpowiedź podaje czas uruchomienia w UTC i według zegara aplikacji.

`create_schedule` przyjmuje `form`, `name`, albo `cron` (pięć pól, na przykład `0 22 * * 1-5`), albo `run_at`, oraz
`extraVars`, które otrzyma zadanie. Taki harmonogram działa jako `Schedule Service`, bez walidacji formularza; aby uruchomić formularz raz jako
użytkownik, użyj `plan_job`. Nazwy harmonogramów są unikalne.

---

## Zapisane zadania

Zapisane zadanie to wartości formularza zapisane pod nazwą; narzędzia działają na tych samych zapisanych zadaniach co przeglądarka.

`list_stored_jobs` wyświetla własne zapisane zadania użytkownika albo zadania wszystkich dla użytkownika z `showSettings`, z ich nazwą, opisem,
formularzem, datą utworzenia i wygaśnięcia. Zadanie oznaczone jako `usable` (własne zadanie użytkownika, z formularza, który może on uruchomić) można przekazać jako `storedJob`
(`{ "id": 7 }` lub `{ "name": "..." }` spośród własnych zadań użytkownika z tego formularza) do `resolve_field`, `launch_job` lub `plan_job`: jego
wartości są punktem wyjścia, a `values` są nakładane na nie. Pola haseł nie są zapisywane, więc podaj je w `values`.
`launch_job` i `plan_job` z zapisanego zadania wymagają `expectedPayloadHash`, który zwróciło dla niego `resolve_field`, a
`resolve_field` odrzuca `storedJob` razem z `subform`.

`store_job` przyjmuje `form`, `name` unikalną wśród zapisanych zadań użytkownika z tego formularza, `values` oraz opcjonalnie
`description` i `expires_at` (ISO 8601 z przesunięciem lub `Z`). Odpowiedź mówi, które pola haseł zostały pominięte.

---

## Przekazywanie wartości

Przekaż `field`, aby rozwiązać tylko to pole i to, od czego zależy. Dla wiersza listy lub kroku kreatora przekaż `subform` (i
opcjonalnie `parent`, wartości formularza nadrzędnego).

Wysyłaj wartości tak, jak przechowuje je przeglądarka. Pole wyboru przyjmuje też częściowy rekord lub jego wartość `valueColumn`
(`"vol1"`), a tablicę, gdy jest `multiple`. Pola obliczane ignorują wysłane wartości, chyba że są `editable`.

---

## Zatwierdzanie dokładnego ładunku

Gdy formularz jest kompletny, `resolve_field` zwraca też to, co wyśle `launch_job`:

- `modeledExtravars`: extravars po zastosowaniu `model`, `valueColumn` i `output`,
  z zamaskowanymi polami haseł;
- `credentials`: poświadczenia AnsibleForms, których użyje zadanie (nazwy, nie sekrety);
- `payloadHash`: skrót SHA-256 nazwy formularza, rzeczywistych extravars i poświadczeń.

Pokaż `modeledExtravars` operatorowi i przekaż zatwierdzony przez niego `payloadHash` do
`launch_job` jako `expectedPayloadHash`. Uruchomienie ponownie rozwiązuje formularz i jest odrzucane,
gdy ładunek się różni, na przykład dlatego, że zapytanie odpowiada teraz inaczej.
`ansibleforms_user`, `__jobid__` i `__verbose__` są dodawane przy uruchomieniu i nie wchodzą do skrótu.

`launch_job` sprawdza tylko ładunek. Edycja formularza, która nie zmienia ładunku, nie powoduje odrzucenia uruchomienia.
Każda odpowiedź `resolve_field` zawiera też `formFingerprint`, skrót SHA-256 definicji formularza: aby odrzucić
uruchomienie po jakiejkolwiek edycji formularza, porównaj go samodzielnie przed wywołaniem `launch_job`, tak jak robi to przycisk
**Uruchom** asystenta czatu.

---

## Ponowne uruchamianie ze zmianami

`relaunch_job` przyjmuje `id` zadania i `values`: tylko pola do zmiany, jako surowe wartości.
`values` jest nakładane na wartości, z którymi zadanie zostało pierwotnie uruchomione, a wynik jest
rozwiązywany i walidowany dokładnie tak jak przez `launch_job`, łącznie z wierszami list, a następnie uruchamiany jako
nowe zadanie przez Ciebie (`ansibleforms_user` to Ty, a nie pierwotny zgłaszający). Pliki przesłane w
pierwotnym zadaniu są używane ponownie.

Bez `values` jest to ponowne uruchomienie **tak, jak zadanie działało**: jego zapisane extravars są odtwarzane na
serwerze, łącznie z hasłami (podgląd je maskuje). Jeśli jednak formularz podlega walidacji przy uruchomieniu
`enforce`, ponowne uruchomienie przechodzi tę samą kontrolę co ponowne uruchomienie ze
zmianami.

**Hasła nigdy nie są zapisywane razem z wartościami pól**, więc ponowne uruchomienie, które przechodzi
kontrolę, jest odrzucane, gdy formularz pokazuje pole hasła, na najwyższym poziomie lub w wierszu listy
(`unsupported`, z `passwordFields`). Pole hasła ukryte przez swoje zależności nie
blokuje ponownego uruchomienia. Zobacz [Walidacja przy uruchomieniu](../launch-validation).

Najpierw wywołaj je z `preview: true`: zwraca `modeledExtravars` (z zamaskowanymi hasłami),
`credentials` i `payloadHash` bez uruchamiania. Potwierdź je z użytkownikiem, a potem wywołaj
ponownie z `expectedPayloadHash`. Obowiązują te same uprawnienia co przy ponownym uruchomieniu w przeglądarce:
formularz musi pozwalać na ponowne uruchomienie, a Twoje role potrzebują opcji `allowJobRelaunch`.
Zadania bez zapisanych danych formularza (uruchomionego, zanim istniało ponowne uruchamianie) ani formularza typu kreator nie można
uruchomić ponownie ze zmianami.

API REST oferuje to samo przez `POST /api/v2/job/{id}/relaunch` z treścią
`{ "values": { ... } }`; bez treści odtwarza zadanie tak, jak działało.

---

## Błędy

Odrzucone wywołanie to błąd narzędzia, którego ustrukturyzowana zawartość zawiera `code` i szczegóły:

| Kod | Kiedy |
|---|---|
| `form_incomplete` | `launch_job` lub `relaunch_job` na niekompletnym formularzu, z `missing`, `invalid`, `waiting`, `validationErrors` i `rowErrors` |
| `payload_mismatch` | ładunek różni się od `expectedPayloadHash`, z oboma skrótami |
| `access_denied` | role użytkownika nie dają dostępu do formularza, zadania, harmonogramu lub zapisanego zadania albo do trybu szczegółowego, lub serwer jest w trybie tylko do odczytu |
| `not_found` | nie ma takiego formularza, podformularza ani zadania |
| `unsupported` | formularz typu kreator, sam podformularz, pole pliku lub `relaunch_job`, które wymagałoby widocznego pola hasła |
| `no_form_data` | `relaunch_job` ze zmianami dla zadania, które nie zapisało wartości formularza, na przykład uruchomionego przez harmonogram; zamiast tego uruchom je ponownie bez zmian |
| `invalid_request` | żądanie, które serwer odrzuca jako nieprawidłowe |
| `internal_error` | wszystko inne |
