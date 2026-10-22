---
layout: default
title: Czym jest AnsibleForms
nav_order: 1
translated_from: a331f74d2fa27a41cd4321b636ac9640550cac26
---

# Czym jest AnsibleForms
{: .no_toc }

Formularze samoobsługowe przed Ansible i AWX, i kiedy ich potrzebujesz
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Co robi

AnsibleForms stawia formularz webowy przed playbookiem, workflow albo szablonem lub jobem w AWX, AAP, Ascender, Semaphore, Rundeck
lub Jenkins, dzięki czemu ludzie mogą uruchamiać automatyzację bez wiersza poleceń.

Formularz zbiera dane wejściowe, sprawdza je, przekształca w extravars i uruchamia zadanie. Dane w formularzu mogą pochodzić z baz danych,
API REST, plików i innych pól, a każde uruchomienie jest zapisywane w historii zadań wraz z wynikiem.

---

## Typowe zastosowania

Zespoły używają AnsibleForms, aby przekazać rutynową automatyzację osobom, które jej potrzebują:

* **Żądania samoobsługowe** : maszyna wirtualna, wolumen pamięci masowej, udział sieciowy lub konto użytkownika, wypełniane przez zgłaszającego
* **Operacje pod nadzorem** : akcje z punktami zatwierdzenia, tak aby druga osoba je zaakceptowała, zanim zadanie się uruchomi
* **Wybory oparte na danych** : listy rozwijane wypełniane z CMDB, bazy danych lub API REST, kaskadowo od jednego pola do następnego
* **Zadania cykliczne** : formularze uruchamiane później lub według harmonogramu cron, za każdym razem z tymi samymi sprawdzonymi danymi
* **Automatyzacja dla narzędzi i agentów** : API REST, serwer MCP i asystent czatu uruchamiają te same formularze

---

## AnsibleForms czy ankiety AWX?

AWX, AAP i Ascender mają własne ankiety (surveys). Która opcja pasuje, zależy od tego, czego potrzebują osoby uruchamiające zadania.

**Ankieta** wystarczy, gdy:

* pytania są stałe: tekst, liczby, hasła i wybór ze statycznej listy
* użytkownicy już pracują w AWX, AAP lub Ascender, a jego uprawnienia im odpowiadają
* nie chcesz uruchamiać i utrzymywać kolejnej aplikacji i bazy danych

**AnsibleForms** pomaga, gdy:

* opcje do wyboru pochodzą z innego miejsca: z bazy danych, API REST, pliku lub innego pola (kaskadowe listy rozwijane)
* dane wejściowe wymagają walidacji, struktury (listy, zagnieżdżone obiekty) lub obliczonych wartości, zanim trafią do playbooka
* zadania wymagają punktów zatwierdzenia, harmonogramów lub workflow, który z jednego formularza łączy playbooki, szablony i zatwierdzenia
* użytkownicy w ogóle nie powinni widzieć AWX albo uruchamiasz też playbooki bez AWX

AnsibleForms uruchamia szablony AWX, AAP i Ascender, więc oba narzędzia działają razem: formularze zbierają i przygotowują dane wejściowe, a
AWX nadal uruchamia zadania.

---

## Co dalej

Pozostała część tej sekcji objaśnia poszczególne elementy przed instalacją:

| Strona | Co obejmuje |
|---|---|
| [Jak to działa](how-it-works.html) | Architekturę, kroki uruchomienia i miejsca przechowywania danych |
| [Przegląd interfejsu](gui/) | Zrzuty ekranu każdego widoku, od logowania po strony administracyjne |
| [Pojęcia](concepts.html) | Terminy używane w tej dokumentacji |
| [Wymagania wstępne](prerequisites.html) | Co jest potrzebne przed instalacją |
