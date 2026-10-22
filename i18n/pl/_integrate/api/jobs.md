---
layout: default
title: Zadania
parent: API REST
nav_order: 2
translated_from: ceba9eb4f9c2acb23646bd60c48cc579fe8ce202
---

# Zadania
{: .no_toc }

Uruchamianie formularza, śledzenie zadania, przerywanie, ponowne uruchamianie lub zatwierdzanie go
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Zadanie to jedno uruchomienie formularza. Uruchom je, podając nazwę formularza i wartości, a potem śledź po jego ID.

---

## Uruchamianie formularza

Wyślij nazwę formularza i jego wartości do `POST /api/v2/job`:

```bash
curl -X POST https://af.example.com/api/v2/job \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{
        "formName": "Create Virtual Machine",
        "extravars": { "vm_name": "test-vm", "datacenter": "dc1" },
        "rawFormData": { "vm_name": "test-vm", "datacenter": "dc1" }
      }'
```

Żądanie przyjmuje te właściwości:

| Właściwość | Znaczenie |
|---|---|
| `formName` | Nazwa formularza do uruchomienia. Wymagana. |
| `extravars` | Dodatkowe zmienne zadania. `payload` jest akceptowany jako inna nazwa tej właściwości. |
| `rawFormData` | Wartości pól formularza, tak jak przechowuje je przeglądarka. [Walidacja przy uruchomieniu](../launch-validation/) sprawdza je i buduje z nich extravars. |
| `credentials` | Poświadczenia przekazywane do zadania, według nazwy. |
| `files` | Pliki przesłane przez pola plików formularza (zobacz [Przesyłanie plików](../launch-validation/file-uploads.html)). |

Odpowiedź zawiera ID nowego zadania:

```json
{ "id": 42 }
```

Aby uruchomić zadanie w trybie szczegółowym (verbose), dodaj `"__verbose__": true` do extravars. Wymaga to opcji roli `allowVerboseMode`,
w przeciwnym razie uruchomienie odpowiada `403`.

---

## Przesyłanie pliku

Formularz z polem pliku wymaga wcześniejszego przesłania pliku. Wyślij go jako część multipart `file` do `POST /api/v2/job/upload`:

```bash
curl -X POST https://af.example.com/api/v2/job/upload \
  -H "Authorization: Bearer <token>" -F "file=@firmware.bin"
```

Odpowiedź opisuje zapisany plik:

```json
{ "fieldname": "file", "originalname": "firmware.bin", "encoding": "7bit", "mimetype": "application/octet-stream",
  "destination": "<UPLOAD_PATH>", "filename": "3f9c...", "path": "<UPLOAD_PATH>/3f9c...", "size": 1048576 }
```

Przekaż ją bez zmian w `files` uruchomienia, pod nazwą pola pliku: `"files": { "firmware": { ... } }`. Serwer
sprawdza ją względem własnego dysku (zobacz [Przesyłanie plików](../launch-validation/file-uploads.html)).

---

## Śledzenie zadania

Odczytaj zadanie po jego ID:

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

Zadanie zawiera swój `status`, swoje `extravars` (także jako `payload`, ten sam obiekt), swoje `subjobs` i swój `output`.
Wynik jest w HTML, z kolorami strony zadania; dodaj `?text=true`, aby uzyskać zwykły tekst, który lepiej pasuje do skryptu lub dziennika:

```bash
curl "https://af.example.com/api/v2/job/42?text=true" -H "Authorization: Bearer <token>"
```

Jego `status` to `running`, dopóki działa, i `approve`, gdy czeka na zatwierdzenie. Zadanie kończy się jednym z tych stanów:

| Stan | Znaczenie |
|---|---|
| `success` | Zadanie zakończyło się bez błędów |
| `failed` | Zadanie zakończyło się błędem |
| `warning` | Zadanie wieloetapowe zakończyło się, ale po drodze nie powiódł się etap z ustawionym `continue` |
| `aborted` | Zadanie zostało przerwane |
| `rejected` | Zatwierdzenie zostało odrzucone, więc to, co na nie czekało, nie zostało uruchomione |
| `abandoned` | Proces śledzący zadanie zatrzymał się (restart, wymiana kontenera) i zadanie zostało porzucone |

Zadanie, które działało na runnerze w chwili porzucenia, może mimo to zakończyć się rzeczywistym wynikiem, jeśli ten runner je ostatecznie dokończy.

---

## Wyszukiwanie zadań

`GET /api/v2/job` zwraca listę zadań, od najnowszych, jako `{ "count": ..., "records": [ ... ] }`. Te parametry zapytania ją zawężają:

| Parametr | Znaczenie |
|---|---|
| `records` | Maksymalna liczba zadań. Domyślnie [`JOBS_LIST_SIZE`](../customization/features.html#env_JOBS_LIST_SIZE) (1000), a najwyżej 5000, chyba że `JOBS_LIST_SIZE` jest większe. |
| `user`, `user_type` | Tylko zadania tego użytkownika. `user_type` ma wartość `local`, gdy zostanie pominięty (`ldap`, `azuread`, `oidc` dla pozostałych). |
| `runner` | Tylko zadania, które działały na tym runnerze |

```bash
curl "https://af.example.com/api/v2/job?records=20&user=automation" -H "Authorization: Bearer <token>"
```

Użytkownik widzi własne zadania oraz zadania czekające na zatwierdzenie, którego może udzielić jedna z jego ról. Administrator lub rola z
opcją `showAllJobLogs` albo `manageAllJobs` widzi wszystkie zadania. Rekord zawiera podsumowanie zadania (`id`, `form`, `status`, `start`, `end`, `user`, `runner`, ...); aby poznać
jego extravars i wynik, odczytaj samo zadanie.

`GET /api/v2/job/approvals` odpowiada liczbą: ile zadań czeka na zatwierdzenie, którego użytkownik może udzielić.

---

## Więcej o zadaniu

Te endpointy odczytują więcej informacji o jednym zadaniu:

| Wywołanie | Co zwraca |
|---|---|
| `GET /api/v2/job/{id}/rawformdata` | Wartości pól, z którymi zadanie zostało uruchomione, tak jak przechowywał je formularz. Obowiązują te same uprawnienia co przy ponownym uruchomieniu: Twoje własne zadanie (albo każde zadanie dla administratora lub roli z `manageAllJobs`), formularz, który pozwala na ponowne uruchomienie, oraz opcja roli `allowJobRelaunch`. |
| `GET /api/v2/job/{id}/events` | Ustrukturyzowane zdarzenia zadania playbooka (od wersji 7.3.0, dla playbooka na RTE w wersji 7.3.0 lub nowszej): każdy play, task, wynik hosta i podsumowanie (recap), z ich `order`, `type`, `play`, `task`, `host`, `duration` i `time` |
| `GET /api/v2/job/{id}/events/{order}` | Jedno z tych zdarzeń z całym jego `result`, tak jak pokazuje je okno **Wynik zadania**; `400`, gdy `order` nie jest liczbą całkowitą, `404`, gdy zadanie nie ma takiego zdarzenia |
| `GET /api/v2/job/{id}/node/{nodeId}` | Jeden węzeł zadania workflow: `{ "node", "job", "extravars", "artifacts" }`, gdzie `job` to ID własnego zadania węzła albo `null`, gdy węzeł się nie uruchomił. |

---

## Inne akcje

Te endpointy działają na istniejącym zadaniu:

| Wywołanie | Akcja |
|---|---|
| `POST /api/v2/job/{id}/abort` | Przerwanie działającego zadania |
| `POST /api/v2/job/{id}/relaunch` | Ponowne uruchomienie zadania, tak jak działało lub ze zmianami (zobacz [Ponowne uruchamianie](../launch-validation/relaunching.html)) |
| `POST /api/v2/job/{id}/approve` | Zatwierdzenie zadania czekającego na zatwierdzenie; Twoje własne zadanie odpowiada `403`, chyba że jego zatwierdzenie ustawia `allowSelf: true` lub jesteś administratorem |
| `POST /api/v2/job/{id}/reject` | Odrzucenie zadania czekającego na zatwierdzenie |
| `GET /api/v2/job/{id}/download` | Pobranie wyniku zadania |
| `DELETE /api/v2/job/{id}` | Usunięcie zadania |

Przerwanie, zatwierdzenie, odrzucenie i usunięcie odpowiadają komunikatem, a ponowne uruchomienie dodatkowo ID nowego zadania:

```json
{ "message": "Job has been relaunched with job id 43", "id": 43 }
```

Dodaj `?verbose=true` do ponownego uruchomienia, aby nowe zadanie działało w trybie szczegółowym, z opcją roli `allowVerboseMode`. Zadanie, które
jest w niewłaściwym stanie dla danej akcji, na przykład przerwanie zadania, które już się zakończyło, odpowiada `409`.
