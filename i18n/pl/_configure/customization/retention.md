---
layout: default
title: Kopie zapasowe i retencja
parent: Zmienne środowiskowe
nav_order: 3
translated_from: 1cac64b6467ce96bce3aac71718f07d7ecd10d89
---

# Kopie zapasowe i retencja
{: .no_toc }

Polecenia kopii zapasowych oraz jak długo przechowywane są kopie zapasowe, zadania i wpisy audytu
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Zmień je, aby kontrolować, ile historii przechowuje baza danych i ile kopii zapasowych zostaje na dysku.

---

## Przykład

Przechowuj zakończone zadania przez 90 dni, a ślad audytu przez dwa lata. W `.env` projektu compose:

```bash
JOB_RETENTION_DAYS=90
AUDIT_RETENTION_DAYS=730
STORED_JOB_UNUSED_DAYS=180
```

Codzienne zadanie usuwa starsze zakończone zadania o 2:30, a wpisy audytu o 3:30. Działające zadanie albo takie, które czeka na
zatwierdzenie, nigdy nie jest usuwane. Od wersji 7.7.0 `STORED_JOB_UNUSED_DAYS` usuwa także, o 4:00, [zapisane
zadania](../jobs/stored-jobs.html#when-it-is-removed), z których przez tyle dni nie uruchomiono żadnego zadania. Te zmienne
działają bez restartu, gdy zmienia się je na stronie ustawień.

To są godziny domyślne. Od wersji 7.8.0 każde czyszczenie i nocna kopia zapasowa to [proces systemowy](../jobs/system-tasks.html) w
**Zadania > System**, gdzie administrator zmienia, kiedy działa, i widzi jego uruchomienia; zmienne ich godzin są na stronie
[Procesy systemowe](system-tasks.html).

---

## Zmienne

Każda zmienna tej grupy, z typem, wartością domyślną i opisem:

{% include env_vars_table.html group="retention" %}
