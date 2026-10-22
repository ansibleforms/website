---
layout: default
title: API REST
nav_order: 3
has_children: true
has_toc: false
permalink: /api/
translated_from: e14092fbd301073c7ed9be6839530efae43d4c6b
---

# API REST
{: .no_toc }

Uruchamiaj formularze i zarządzaj AnsibleForms ze skryptów
{: .fs-6 .fw-300 }

---

Dla programistów i inżynierów automatyzacji: uruchamiaj formularze i zarządzaj AnsibleForms ze skryptów.

Wszystko, co robi interfejs webowy, przechodzi przez API REST, więc skrypty i inne narzędzia mogą robić to samo.

---

## Przegląd

API jest udostępniane pod `/api/v2` na serwerze AnsibleForms:

* **Pełna dokumentacja** : te strony opisują to, czego skrypty używają najczęściej. Każdy endpoint jest opisany i można go wypróbować na
  wbudowanej stronie Swagger serwera, `https://<your server>/api/v2/docs`.
* **Uprawnienia** : wywołanie działa jako użytkownik, którego token zawiera, z rolami tego użytkownika, tak jak w przeglądarce.
* **Walidacja przy uruchomieniu** : zadania uruchamiane przez API mogą być sprawdzane tak samo jak uruchomienia z przeglądarki
  (zobacz [Walidacja przy uruchomieniu](../launch-validation/)).
* **Limity żądań** : ograniczone są tylko endpointy logowania, wylogowania, odświeżania tokenu i jednokrotnego logowania, zmiana hasła
  (`PUT /api/v2/profile`) oraz endpointy tokenów API (`POST` i `DELETE /api/v2/profile/tokens`) (zobacz
  [Uwierzytelnianie](authentication.html)). Pozostałe wywołania nie mają limitu (z wyjątkiem [asystenta czatu](../chat/), który ma własne
  limity), więc skrypt powinien sam dbać o tempo, na przykład gdy śledzi zadanie.

---

## W tej sekcji

Każdy temat ma własną stronę:

| Strona | Co obejmuje |
|---|---|
| [Uwierzytelnianie](authentication.html) | Logowanie, odświeżanie tokenu lub używanie tokenu długoterminowego |
| [Zadania](jobs.html) | Uruchamianie formularza, śledzenie zadania, przerywanie, ponowne uruchamianie lub zatwierdzanie go |
| [Odpowiedzi i błędy](responses.html) | Struktura odpowiedzi i kody stanu |
| [Zdarzenia na żywo](events.html) | Informacje o zmianach zadań i ustawień zamiast odpytywania |
