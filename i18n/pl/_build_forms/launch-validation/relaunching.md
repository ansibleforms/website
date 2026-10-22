---
layout: default
title: Ponowne uruchamianie
parent: Weryfikacja uruchomienia
nav_order: 6
translated_from: 9f52ec39fd40e3d617d9537c5f7d356033bc9d49
---

# Ponowne uruchamianie
{: .no_toc }

Jak weryfikowane jest ponownie uruchomione zadanie
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Zadanie można uruchomić ponownie na dwa sposoby. Sposób sprawdzenia ponownego uruchomienia zależy od tego, który z nich wybrano, i od trybu
weryfikacji uruchomienia.

---

## Dwa rodzaje ponownego uruchomienia

Oba rodzaje różnią się tym, czy wywołujący wysyła nowe wartości:

* **W pierwotnej postaci**: przycisk Uruchom ponownie, `POST /api/v2/job/{id}/relaunch` bez treści lub `relaunch_job` bez
  `values`.
* **Ze zmianami**: te same wywołania z nowymi wartościami, nałożonymi na zapisane wartości pól zadania:

```bash
curl -X POST https://af.example.com/api/v2/job/42/relaunch \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "values": { "vm_size": "large" } }'
```

---

## Jak sprawdzany jest każdy z nich

Tryb weryfikacji uruchomienia decyduje, czy ponowne uruchomienie jest odtwarzane, czy sprawdzane od nowa:

| Ponowne uruchomienie | `off` / `log` | `enforce` |
|---|---|---|
| **W pierwotnej postaci** | odtwarza zapisane extravars zadania, łącznie z hasłami | pełne sprawdzenie na podstawie zapisanych wartości pól |
| **Ze zmianami** | pełne sprawdzenie na zapisanych wartościach z nałożonymi zmianami | pełne sprawdzenie, w ten sam sposób |

Jeden wyjątek w trybie `enforce`: zadanie uruchomione przez harmonogram na poziomie administratora nie ma własnych wartości pól, więc ponowne uruchomienie go w pierwotnej postaci
odtwarza zapisane extravars harmonogramu, dla administratora lub użytkownika z opcją roli `allowScheduledJobs`.

Sprawdzone ponowne uruchomienie (zobacz [Log i enforce](log-and-enforce.html)) rozpoczyna nowe zadanie w imieniu wywołującego.

---

## Pola haseł

Zapisane wartości pól nie zawierają haseł, więc sprawdzone ponowne uruchomienie nie ma żadnego dla **widocznego pola hasła**:

* Ponowne uruchomienie jest odrzucane jako `unsupported`, z listą brakujących `passwordFields`.
* Uruchom formularz ponownie i wprowadź hasło.
* Pole hasła, które zależności formularza **ukrywają**, nie jest potrzebne i nie blokuje ponownego uruchomienia.

W trybie `enforce` dotyczy to także przycisku Uruchom ponownie.

---

## Kto może uruchomić ponownie

Oba rodzaje ponownego uruchomienia wymagają:

* aby formularz pozwalał na ponowne uruchomienie (`allowRelaunch`, domyślnie true);
* opcji roli `allowJobRelaunch`;
* aby użytkownik był **właścicielem zadania**, administratorem lub użytkownikiem z opcją roli `manageAllJobs`.

Widzenie wszystkich zadań (`showAllJobLogs`) nie wystarcza, aby uruchomić ponownie zadanie innego użytkownika. Zatwierdzający widzą zadanie, które czeka na ich
zatwierdzenie, ale też nie mogą go uruchomić ponownie.
