---
layout: default
title: Kopie zapasowe i retencja
parent: Zmienne środowiskowe
nav_order: 3
translated_from: 76f81cfa15eaa98199a3d5963f7adc9a6f8b01dc
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
```

Codzienne zadanie usuwa starsze zakończone zadania o 2:30, a wpisy audytu o 3:30. Działające zadanie albo takie, które czeka na
zatwierdzenie, nigdy nie jest usuwane. Obie zmienne działają bez restartu, gdy zmienia się je na stronie ustawień.

---

## Zmienne

Każda zmienna tej grupy, z typem, wartością domyślną i opisem:

{% include env_vars_table.html group="retention" %}
