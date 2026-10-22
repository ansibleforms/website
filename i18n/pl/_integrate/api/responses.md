---
layout: default
title: Odpowiedzi i błędy
parent: API REST
nav_order: 3
translated_from: 2687f844abe74f8c0e76c8685a1bd57151edc933
---

# Odpowiedzi i błędy
{: .no_toc }

Struktura odpowiedzi i kody stanu
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Odpowiedzi są zwykłym JSON-em, a kod stanu HTTP informuje, czy wywołanie się powiodło.

---

## Odpowiedzi

Udane wywołanie zwraca sam obiekt lub listę wraz z jej rozmiarem:

```json
{ "count": 2, "records": [ { "id": 41 }, { "id": 42 } ] }
```

Błąd zwraca komunikat oraz szczegóły, jeśli są:

```json
{ "error": "The form data is not valid", "details": [ ... ] }
```

---

## Kody stanu

Kod stanu mówi, co poszło nie tak:

| Kod | Znaczenie |
|---|---|
| `200` | Wywołanie się powiodło |
| `400` | Żądanie jest nieprawidłowe, na przykład odświeżenie tokenu bez tokenu odświeżania lub przesłanie bez pliku |
| `401` | Brak tokenu, token jest błędny lub wygasł: zaloguj się albo go odśwież |
| `403` | Role użytkownika nie pozwalają na to wywołanie (łącznie z zatwierdzaniem własnego zadania, chyba że jego zatwierdzenie ustawia `allowSelf: true` lub jesteś administratorem) albo konto musi najpierw coś zrobić (zobacz niżej) |
| `404` | Obiekt nie istnieje |
| `409` | Żądanie jest niekompletne (uruchomienie bez danych) albo obiekt nie jest w stanie, który pozwala na tę akcję |
| `422` | [Walidacja przy uruchomieniu](../launch-validation/) odrzuciła wartości formularza; `details` podaje powody |
| `429` | Zbyt wiele żądań do endpointów logowania i tokenów albo zbyt wiele nieudanych logowań (zobacz [Uwierzytelnianie](authentication.html)) |
| `500` | Błąd serwera; przyczyna jest w dzienniku serwera |

W przypadku zadania `409` oznacza, że jest ono w niewłaściwym stanie dla danej akcji: przerwanie zadania, które nie działa (lub którego przerwanie już zlecono),
ponowne uruchomienie zadania, które wciąż działa, albo zatwierdzenie lub odrzucenie zadania, które już nie czeka na zatwierdzenie.

---

## 403 z kodem

Niektóre odpowiedzi `403` zawierają `code`, oznaczający coś, co użytkownik musi zrobić w przeglądarce, zanim zadziała jakiekolwiek inne wywołanie:

```json
{ "error": "...", "code": "password_change_required" }
```

| Kod | Co zrobić |
|---|---|
| `password_change_required` | Użytkownik zalogował się publicznym hasłem domyślnym: najpierw zmień je w profilu |
| `disclaimer_required` | Zastrzeżenie jest włączone, a użytkownik nie zaakceptował jeszcze jego bieżącej wersji: zaakceptuj je w przeglądarce |

Długoterminowy token API (zobacz [Uwierzytelnianie](authentication.html#long-lived-tokens)) nigdy nie jest blokowany przez zastrzeżenie.
