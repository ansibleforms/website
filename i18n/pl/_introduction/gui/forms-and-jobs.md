---
layout: default
title: Formularze i zadania
parent: Przegląd interfejsu
nav_order: 1
redirect_from:
  - /gui/login.html
  - /gui/the-dashboard.html
  - /gui/a-form.html
  - /gui/form-json-preview.html
  - /gui/running-job.html
  - /gui/job-output.html
  - /gui/job-logs.html
  - /gui/multi-step.html
  - /gui/schedules.html
translated_from: 951f0d014ee94f1c1c52883277a003d7eb67a6ec
---

# Formularze i zadania
{: .no_toc }

Logowanie, pulpit, wypełnianie formularza i śledzenie jego zadań
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Logowanie

Strona uwierzytelniania użytkownika, z obsługą uwierzytelniania lokalnego, LDAP, Entra ID i OIDC.

![Logowanie](../assets/screenshots/login.jpg)

---

## Pulpit

Główny pulpit wyświetla wszystkie dostępne formularze uporządkowane według kategorii.

![Pulpit](../assets/screenshots/dashboard.jpg)

---

## Formularz

Przykładowy formularz z zewnętrznymi źródłami danych i dynamicznymi polami.

![Przykładowy formularz](../assets/screenshots/form.jpg)

---

## Podgląd JSON formularza

Podejrzyj ładunek JSON i dodatkowe zmienne przekazywane do Ansible, zanim uruchomisz zadanie.

![Podgląd JSON formularza](../assets/screenshots/form-json.jpg)

---

## Uruchomione zadanie

Wykonywanie playbooka Ansible w czasie rzeczywistym, z wynikiem na żywo.

![Uruchomione zadanie](../assets/screenshots/run.jpg)

---

## Wynik zadania

Pełny wynik wykonanego playbooka Ansible.

![Wynik zadania](../assets/screenshots/job-output.jpg)

---

## Dziennik zadań

Wszystkie zadania z ich stanem i czasami, filtrowane według stanu w menu po lewej.

![Dziennik zadań](../assets/screenshots/job-log.jpg)

---

## Wiele etapów

Zadanie wieloetapowe, z wynikiem każdego etapu pod zadaniem głównym. Formularze wieloetapowe są przestarzałe od wersji 7:
zamiast nich [workflow](../workflows/) łączy playbooki, szablony i zatwierdzenia.

![Formularz wieloetapowy](../assets/screenshots/multistep.jpg)

---

## Harmonogramy

Planuj uruchamianie formularzy o określonych godzinach lub w określonych odstępach czasu. [Przykłady cron](../faq.html#which-cron-expressions-can-i-use) zawierają typowe
wyrażenia i wyjaśniają, w jakiej strefie czasowej działa harmonogram.

![Harmonogramy](../assets/screenshots/schedules.jpg)
