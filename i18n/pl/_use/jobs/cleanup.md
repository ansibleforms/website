---
layout: default
title: Czyszczenie
parent: Zadania
nav_order: 6
translated_from: 3ccd056f3993f5aea914db2765e62d0d8f89d366
---

# Czyszczenie
{: .no_toc }

Zadania przerwane przez restart i jak długo przechowywane są zakończone zadania
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Porzucone zadania

Działające zadanie jest śledzone przez proces AnsibleForms, który je uruchomił. Gdy to śledzenie ustaje, zadanie zostaje oznaczone jako
`abandoned`:

* **Przy starcie** zadania, które ten proces śledził przed restartem, oraz zadania sprzed wersji 7, których nie śledzi żaden proces,
  są oznaczane jako porzucone, jeśli nadal mają stan `running` lub są w trakcie przerywania; log pokazuje `Abandoned <n> jobs`. Zadanie, które
  działa na RTE, nie jest ruszane: działa dalej bez procesu, który je uruchomił.
* **Co minutę** [proces systemowy](system-tasks.html) **Zatrzymane węzły** oznacza jako porzucone zadania śledzone przez inny
  proces AnsibleForms (lub RTE), który przestał odpowiadać na 2 minuty; log pokazuje `Abandoned <n> jobs followed by a node that stopped answering`.
* **Co godzinę** proces systemowy **Porzucone zadania** oznacza jako porzucone zadania, które wystartowały ponad dobę temu, nadal
  mają stan `running` i przez dobę nie zapisały żadnego wyniku. Zadanie działające na RTE również tu nie jest ruszane: RTE samo czyści swoje zadania przy restarcie.

Od wersji 7.3.0 zadanie szablonu na AWX, AAP lub Ascender porzucone przez restart lub zatrzymany węzeł jest podejmowane ponownie, jeśli wystartowało
w ciągu ostatnich 24 godzin: jeden proces AnsibleForms je przejmuje, znowu śledzi je na runnerze, a zadanie kończy się tym, co
naprawdę się tam wydarzyło. Zadania na pozostałych runnerach, playbooki, workflowy i zadania wieloetapowe pozostają porzucone.

Porzucony playbook mógł zostać wykonany częściowo. Sprawdź zarządzane hosty, zanim uruchomisz go ponownie; zobacz
[Zadanie ma stan abandoned](../troubleshooting.html#a-job-shows-the-status-abandoned).

---

## Przechowywanie zadań

Zakończone zadania są przechowywane przez tyle dni, ile administrator ustawi w [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS).

Nocny proces systemowy **Czyszczenie zadań** (o 2:30) usuwa zakończone zadania, wraz z ich wynikiem i krokami, które zakończyły się
dawniej niż podana liczba dni. Usuwa tylko zadania o stanie `success`, `failed`, `warning`, `aborted`, `rejected` lub `abandoned`,
więc działające zadania i zadania czekające na zatwierdzenie są zachowywane bez względu na wiek. Wartość domyślna to `90` od wersji
7.6.0 (wcześniej `0`), a `0` zachowuje każde zadanie.

To są godziny domyślne: od wersji 7.8.0 administrator zmienia je na stronie procesu, w **Zadania > System**, i widzi tam każde jego
uruchomienie (zobacz [Procesy systemowe](system-tasks.html)).
